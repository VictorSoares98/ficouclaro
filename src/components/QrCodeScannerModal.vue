<script setup lang="ts">
import { ref, watch, onUnmounted, nextTick } from 'vue';
import { useQuasar } from 'quasar';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { soundService } from '@/core/services/sound.service';
import { qrScannerService } from '@/core/services/qrScanner.service';
import type { ClassroomInviteDetails } from '@/modules/courses/services/course.service';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'detected', payload: { code: string; details: ClassroomInviteDetails | null }): void;
}>();

const $q = useQuasar();

const videoRef = ref<HTMLVideoElement | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);

const isLoading = ref(true);
const isScanning = ref(false);
const hasPermissionError = ref(false);
const permissionErrorMessage = ref('');
const isTorchOn = ref(false);
const canTorch = ref(false);
const accessibilityStatus = ref('Iniciando leitor de QR Code...');

let mediaStream: MediaStream | null = null;
let animationFrameId: number | null = null;
let isProcessing = false;

async function startCamera() {
  isLoading.value = true;
  hasPermissionError.value = false;
  permissionErrorMessage.value = '';
  isProcessing = false;

  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    hasPermissionError.value = true;
    permissionErrorMessage.value =
      'Seu dispositivo ou navegador não possui suporte a acesso direto à câmera.';
    accessibilityStatus.value = 'Acesso à câmera não suportado neste dispositivo.';
    isLoading.value = false;
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    });

    mediaStream = stream;
    await nextTick();

    if (videoRef.value) {
      videoRef.value.srcObject = stream;
      videoRef.value.setAttribute('playsinline', 'true');
      await videoRef.value.play();

      // Checa suporte à lanterna (torch)
      const track = stream.getVideoTracks()[0];
      if (track && typeof track.getCapabilities === 'function') {
        const capabilities = track.getCapabilities() as { torch?: boolean };
        canTorch.value = Boolean(capabilities.torch);
      }

      isScanning.value = true;
      isLoading.value = false;
      accessibilityStatus.value = 'Câmera traseira ativa. Aponte para o QR Code projetado.';
      startDetectionLoop();
    }
  } catch (err: unknown) {
    isLoading.value = false;
    hasPermissionError.value = true;
    accessibilityStatus.value = 'Permissão de acesso à câmera negada ou indisponível.';

    if (
      err instanceof DOMException &&
      (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')
    ) {
      permissionErrorMessage.value =
        'Acesso à câmera não autorizado. Permita a câmera nas configurações do navegador ou envie uma foto com o QR Code.';
    } else {
      permissionErrorMessage.value =
        'Não foi possível iniciar a câmera do dispositivo. Verifique se outro aplicativo está utilizando-a.';
    }
  }
}

function stopCamera() {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => {
      try {
        track.stop();
      } catch {
        // Ignora erro ao parar faixa
      }
    });
    mediaStream = null;
  }

  if (videoRef.value) {
    videoRef.value.srcObject = null;
  }

  isScanning.value = false;
  isTorchOn.value = false;
  canTorch.value = false;
  isProcessing = false;
}

async function toggleTorch() {
  if (!mediaStream || !canTorch.value) return;
  const track = mediaStream.getVideoTracks()[0];
  if (!track) return;

  try {
    const nextState = !isTorchOn.value;
    await track.applyConstraints({
      advanced: [{ torch: nextState } as unknown as MediaTrackConstraintSet],
    });
    isTorchOn.value = nextState;
  } catch (e) {
    console.warn('[QrCodeScannerModal] Falha ao alternar lanterna:', e);
  }
}

function startDetectionLoop() {
  if (!qrScannerService.hasBarcodeDetectorSupport() || !window.BarcodeDetector) {
    // Se o navegador não tem BarcodeDetector nativo, mantemos a câmera aberta
    // e o usuário pode utilizar o botão de envio de imagem/foto
    return;
  }

  const detector = new window.BarcodeDetector({ formats: ['qr_code'] });

  const scanFrame = () => {
    if (!isScanning.value || isProcessing) return;

    void (async () => {
      if (videoRef.value && videoRef.value.readyState === videoRef.value.HAVE_ENOUGH_DATA) {
        try {
          const barcodes = await detector.detect(videoRef.value);
          if (barcodes.length > 0 && barcodes[0]) {
            const rawValue = barcodes[0].rawValue;
            if (rawValue) {
              await handleBarcodeFound(rawValue);
              return;
            }
          }
        } catch {
          // Ignora erros de frame individual
        }
      }

      if (isScanning.value && !isProcessing) {
        animationFrameId = requestAnimationFrame(scanFrame);
      }
    })();
  };

  animationFrameId = requestAnimationFrame(scanFrame);
}

async function handleBarcodeFound(rawText: string) {
  isProcessing = true;
  accessibilityStatus.value = 'Código detectado com sucesso. Validando turma...';
  stopCamera();

  // Feedback Multissensorial de Sucesso
  try {
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch {
    // Haptics web fallback silencioso
  }
  soundService.playNotificationChime();

  const code = qrScannerService.extractInviteCode(rawText);
  if (!code) {
    $q.notify({
      type: 'warning',
      message: 'QR Code lido, mas não contém um código de convite válido.',
      position: 'top',
    });
    isProcessing = false;
    void startCamera();
    return;
  }

  $q.loading.show({ message: 'Verificando dados da turma...' });
  const details = await qrScannerService.verifyInviteCode(code);
  $q.loading.hide();

  emit('update:modelValue', false);
  emit('detected', { code, details });
}

function handleTriggerFileInput() {
  fileInputRef.value?.click();
}

async function handleFileSelected(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  try {
    $q.loading.show({ message: 'Processando imagem do QR Code...' });
    const rawValue = await qrScannerService.detectFromImageFile(file);
    $q.loading.hide();

    if (rawValue) {
      await handleBarcodeFound(rawValue);
    } else {
      $q.notify({
        type: 'warning',
        message: 'Nenhum QR Code detectado na imagem selecionada. Tente com uma foto mais nítida.',
        position: 'top',
      });
    }
  } catch (err: unknown) {
    $q.loading.hide();
    $q.notify({
      type: 'negative',
      message: err instanceof Error ? err.message : 'Falha ao processar arquivo de imagem.',
      position: 'top',
    });
  } finally {
    target.value = '';
  }
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      void nextTick(() => {
        void startCamera();
      });
    } else {
      stopCamera();
    }
  },
  { immediate: true },
);

onUnmounted(() => {
  stopCamera();
});
</script>

<template>
  <q-dialog
    :model-value="modelValue"
    persistent
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
    @hide="stopCamera"
  >
    <div
      class="tw-relative tw-w-full tw-h-full tw-bg-black tw-flex tw-flex-col tw-justify-between tw-select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Leitor de QR Code da Aula"
    >
      <!-- Região Acessível para Leitores de Tela -->
      <div class="tw-sr-only" aria-live="polite">{{ accessibilityStatus }}</div>

      <!-- Barra Superior Transparente com Controles -->
      <header
        class="tw-relative tw-z-20 tw-w-full tw-p-4 tw-flex tw-items-center tw-justify-between tw-bg-gradient-to-b tw-from-black/85 tw-to-transparent"
        style="padding-top: calc(env(safe-area-inset-top, 0px) + 16px)"
      >
        <div class="tw-flex tw-items-center tw-gap-2">
          <q-btn
            flat
            round
            dense
            icon="arrow_back"
            color="white"
            class="tw-bg-white/10 tw-backdrop-blur-md"
            aria-label="Fechar leitor de QR Code"
            @click="emit('update:modelValue', false)"
          />
          <span class="tw-text-white tw-font-bold tw-text-sm sm:tw-text-base tw-font-space-grotesk">
            Escanear QR Code da Aula
          </span>
        </div>

        <div class="tw-flex tw-items-center tw-gap-2">
          <!-- Botão de Lanterna / Tocha -->
          <q-btn
            v-if="canTorch"
            flat
            round
            dense
            :icon="isTorchOn ? 'flash_on' : 'flash_off'"
            :color="isTorchOn ? 'warning' : 'white'"
            class="tw-bg-white/10 tw-backdrop-blur-md"
            aria-label="Alternar lanterna"
            @click="toggleTorch"
          />

          <!-- Botão de Upload da Galeria -->
          <q-btn
            flat
            round
            dense
            icon="photo_library"
            color="white"
            class="tw-bg-white/10 tw-backdrop-blur-md"
            aria-label="Carregar imagem com QR Code da galeria"
            @click="handleTriggerFileInput"
          >
            <q-tooltip>Carregar print/foto da galeria</q-tooltip>
          </q-btn>
        </div>
      </header>

      <!-- Viewport de Câmera Centralizado -->
      <main
        class="tw-relative tw-flex-1 tw-w-full tw-overflow-hidden tw-flex tw-items-center tw-justify-center"
      >
        <!-- Elemento de Vídeo Real -->
        <video
          ref="videoRef"
          autoplay
          playsinline
          muted
          class="tw-absolute tw-inset-0 tw-w-full tw-h-full tw-object-cover"
        ></video>

        <!-- Estado de Carregamento da Câmera -->
        <div v-if="isLoading" class="tw-relative tw-z-10 tw-text-center tw-p-6 tw-text-white">
          <q-spinner-dots color="primary" size="48px" />
          <p class="tw-text-sm tw-font-semibold tw-mt-3 tw-text-white/80">
            Iniciando câmera traseira...
          </p>
        </div>

        <!-- Estado de Erro de Permissão Gracioso -->
        <div
          v-else-if="hasPermissionError"
          class="tw-relative tw-z-10 tw-max-w-md tw-mx-4 tw-p-6 tw-rounded-3xl tw-bg-slate-900/90 tw-backdrop-blur-lg tw-border tw-border-slate-800 tw-text-center tw-text-white tw-space-y-4"
        >
          <div
            class="tw-w-14 tw-h-14 tw-rounded-2xl tw-bg-amber-500/20 text-warning tw-flex tw-items-center tw-justify-center tw-mx-auto"
          >
            <q-icon name="videocam_off" size="32px" />
          </div>

          <h2 class="tw-text-base sm:tw-text-lg tw-font-bold tw-font-space-grotesk tw-m-0">
            Acesso à Câmera Bloqueado
          </h2>

          <p class="tw-text-xs tw-text-slate-300 tw-m-0 tw-leading-relaxed">
            {{ permissionErrorMessage }}
          </p>

          <div class="tw-flex tw-flex-col sm:tw-flex-row tw-gap-2.5 tw-pt-2">
            <q-btn
              unelevated
              no-caps
              color="primary"
              icon="photo_library"
              label="Enviar Foto do QR Code"
              class="tw-rounded-xl tw-font-bold tw-flex-1"
              @click="handleTriggerFileInput"
            />
            <q-btn
              flat
              no-caps
              color="white"
              label="Tentar Novamente"
              class="tw-rounded-xl tw-bg-white/10"
              @click="startCamera"
            />
          </div>
        </div>

        <!-- Mira Visual de Scanner Responsiva com Cantoneiras High-Tech -->
        <div
          v-else
          class="tw-relative tw-z-10 tw-flex tw-flex-col tw-items-center tw-justify-center tw-px-4"
        >
          <!-- Moldura do Scanner com Cantos Brilhantes e Proporção Otimizada -->
          <div
            class="fc-scanner-viewfinder tw-relative tw-w-64 tw-h-64 sm:tw-w-72 sm:tw-h-72 md:tw-w-80 md:tw-h-80 tw-rounded-3xl tw-border tw-border-white/20 tw-overflow-hidden tw-shadow-2xl"
          >
            <!-- Cantoneiras de Foco Visual com Glow -->
            <div
              class="tw-absolute tw-top-0 tw-left-0 tw-w-8 tw-h-8 tw-border-t-4 tw-border-l-4 tw-border-primary tw-rounded-tl-2xl tw-drop-shadow-[0_0_8px_var(--q-primary)]"
            ></div>
            <div
              class="tw-absolute tw-top-0 tw-right-0 tw-w-8 tw-h-8 tw-border-t-4 tw-border-r-4 tw-border-primary tw-rounded-tr-2xl tw-drop-shadow-[0_0_8px_var(--q-primary)]"
            ></div>
            <div
              class="tw-absolute tw-bottom-0 tw-left-0 tw-w-8 tw-h-8 tw-border-b-4 tw-border-l-4 tw-border-primary tw-rounded-bl-2xl tw-drop-shadow-[0_0_8px_var(--q-primary)]"
            ></div>
            <div
              class="tw-absolute tw-bottom-0 tw-right-0 tw-w-8 tw-h-8 tw-border-b-4 tw-border-r-4 tw-border-primary tw-rounded-br-2xl tw-drop-shadow-[0_0_8px_var(--q-primary)]"
            ></div>

            <!-- Linha Laser Animada de Leitura com Efeito Luminescente -->
            <div
              class="fc-scanner-laser tw-absolute tw-left-0 tw-right-0 tw-h-1 tw-bg-primary"
            ></div>
          </div>

          <p
            class="tw-text-white tw-text-xs sm:tw-text-sm tw-font-semibold tw-mt-5 tw-px-4 tw-text-center tw-drop-shadow-md"
          >
            Aponte a câmera para o QR Code projetado pelo professor
          </p>
        </div>

        <!-- Input Oculto de Arquivo para Fallback de Galeria -->
        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          class="tw-hidden"
          @change="handleFileSelected"
        />
      </main>

      <!-- Barra Inferior Transparente com Instruções e Alternativa -->
      <footer
        class="tw-relative tw-z-20 tw-w-full tw-p-5 tw-flex tw-flex-col tw-items-center tw-justify-center tw-gap-3 tw-bg-gradient-to-t tw-from-black/80 tw-to-transparent"
        style="padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 20px)"
      >
        <q-btn
          flat
          no-caps
          color="white"
          icon="keyboard"
          label="Prefere digitar o PIN manualmente?"
          class="tw-text-xs tw-font-semibold tw-text-white/80 hover:tw-text-white"
          @click="emit('update:modelValue', false)"
        />
      </footer>
    </div>
  </q-dialog>
</template>

<style scoped>
.fc-scanner-laser {
  animation: fc-laser 2.2s ease-in-out infinite;
  box-shadow:
    0 0 10px var(--q-primary),
    0 0 20px var(--q-primary);
  background: linear-gradient(90deg, transparent 0%, var(--q-primary) 50%, transparent 100%);
}

@keyframes fc-laser {
  0% {
    top: 5%;
    opacity: 0.8;
  }
  50% {
    top: 92%;
    opacity: 1;
  }
  100% {
    top: 5%;
    opacity: 0.8;
  }
}

@media (prefers-reduced-motion: reduce) {
  .fc-scanner-laser {
    animation: none !important;
    top: 50% !important;
    opacity: 0.4 !important;
  }
}
</style>
