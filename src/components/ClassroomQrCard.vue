<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { QrcodeSvg } from 'qrcode.vue';
import {
  getClassroomJoinUrl,
  copyClassroomLink,
  copyInviteCode,
  shareClassroomLink,
} from '@/modules/courses/utils/invite.utils';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const props = withDefaults(
  defineProps<{
    code: string;
    title?: string;
    subtitle?: string;
    url?: string;
    size?: number;
    showClose?: boolean;
    allowPresentationMode?: boolean;
    allowDownload?: boolean;
  }>(),
  {
    title: 'Acesso à Aula',
    subtitle: 'Aponte a câmera do celular para ingressar diretamente ou utilize o código abaixo.',
    size: 220,
    showClose: false,
    allowPresentationMode: true,
    allowDownload: true,
  },
);

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const $q = useQuasar();
const qrContainerRef = ref<HTMLDivElement | null>(null);
const isFullscreenPresentation = ref(false);

const computedUrl = computed(() => {
  return props.url || getClassroomJoinUrl(props.code);
});

const uppercaseCode = computed(() => props.code.trim().toUpperCase());

const presentationQrSize = computed(() => {
  if ($q.screen.height < 520) return 170; // Modo paisagem em celulares
  if ($q.screen.height < 680) return 220; // Telas baixas ou projetores 4:3
  if ($q.screen.lt.sm) return 210; // Smartphones em modo retrato
  if ($q.screen.lt.md) return 280; // Tablets
  return 360; // Desktops e projetores de sala de aula
});

async function handleCopyCode() {
  await copyInviteCode(uppercaseCode.value, props.title);
}

async function handleCopy() {
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    // Fallback silencioso no navegador
  }
  await copyClassroomLink(computedUrl.value, props.title);
}

async function handleShare() {
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    // Fallback silencioso no navegador
  }
  await shareClassroomLink({
    title: `${props.title} - Ficou Claro?`,
    text: `Acesse a matéria de ${props.title} pelo link ou utilize o código ${props.code.toUpperCase()}:`,
    url: computedUrl.value,
  });
}

async function downloadQrImage() {
  try {
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch {
    // Fallback silencioso
  }

  try {
    const svgElement = qrContainerRef.value?.querySelector('svg');
    if (!svgElement) {
      $q.notify({
        type: 'warning',
        message: 'Elemento QR Code não localizado para download.',
        position: 'top',
      });
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = 3; // Alta resolução (print quality)
      const canvasSize = props.size * scale;
      canvas.width = canvasSize;
      canvas.height = canvasSize;

      const context = canvas.getContext('2d');
      if (!context) return;

      // Fundo branco sólido para garantir contraste ótico em impressões
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `qrcode-${props.code.toUpperCase()}.png`;
      downloadLink.href = pngUrl;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(blobURL);

      $q.notify({
        type: 'positive',
        message: 'QR Code exportado com sucesso em alta resolução!',
        position: 'top',
      });
    };
    image.src = blobURL;
  } catch (error) {
    console.error('[ClassroomQrCard] Falha ao exportar imagem do QR Code:', error);
    $q.notify({
      type: 'negative',
      message: 'Não foi possível exportar a imagem do QR Code.',
      position: 'top',
    });
  }
}
</script>

<template>
  <q-card
    flat
    bordered
    class="fc-classroom-qr-card tw-rounded-3xl tw-p-5 sm:tw-p-6 tw-text-center tw-relative tw-overflow-hidden tw-w-full"
  >
    <!-- Topo: Título, Subtítulo e Fechar -->
    <header class="tw-flex tw-items-center tw-justify-between tw-mb-4">
      <div class="tw-text-left tw-flex-1 tw-min-w-0 tw-pr-2">
        <div class="tw-flex tw-items-center tw-gap-2">
          <q-icon name="qr_code_2" size="22px" color="primary" />
          <h2
            class="tw-text-base sm:tw-text-lg tw-font-bold tw-font-space-grotesk tw-m-0 tw-truncate"
          >
            {{ title }}
          </h2>
        </div>
        <p v-if="subtitle" class="text-muted tw-text-xs tw-mt-0.5 tw-mb-0 tw-line-clamp-2">
          {{ subtitle }}
        </p>
      </div>

      <div class="tw-flex tw-items-center tw-gap-1">
        <q-btn
          v-if="allowPresentationMode"
          flat
          round
          dense
          icon="fullscreen"
          color="primary"
          class="tw-rounded-xl"
          aria-label="Abrir modo projeção em tela cheia para datashow"
          @click="isFullscreenPresentation = true"
        >
          <q-tooltip anchor="top middle" self="bottom middle">Modo Telão (Datashow)</q-tooltip>
        </q-btn>

        <q-btn
          v-if="showClose"
          flat
          round
          dense
          icon="close"
          class="tw-rounded-xl text-muted"
          aria-label="Fechar janela"
          @click="emit('close')"
        />
      </div>
    </header>

    <!-- Moldura Futurista do QR Code (Alto Contraste Ótico) -->
    <div class="tw-my-2 tw-flex tw-justify-center">
      <div
        class="tw-relative tw-p-3.5 sm:tw-p-4 tw-rounded-3xl tw-bg-white tw-border tw-border-slate-200/90 tw-shadow-sm tw-transition-transform hover:tw-scale-[1.01]"
      >
        <!-- Cantoneiras de Design System inspiradas no Scanner -->
        <div
          class="tw-absolute -tw-top-1 -tw-left-1 tw-w-4 tw-h-4 tw-border-t-2 tw-border-l-2 tw-border-primary tw-rounded-tl-lg"
        ></div>
        <div
          class="tw-absolute -tw-top-1 -tw-right-1 tw-w-4 tw-h-4 tw-border-t-2 tw-border-r-2 tw-border-primary tw-rounded-tr-lg"
        ></div>
        <div
          class="tw-absolute -tw-bottom-1 -tw-left-1 tw-w-4 tw-h-4 tw-border-b-2 tw-border-l-2 tw-border-primary tw-rounded-bl-lg"
        ></div>
        <div
          class="tw-absolute -tw-bottom-1 -tw-right-1 tw-w-4 tw-h-4 tw-border-b-2 tw-border-r-2 tw-border-primary tw-rounded-br-lg"
        ></div>

        <div ref="qrContainerRef" class="tw-flex tw-items-center tw-justify-center">
          <QrcodeSvg
            :value="computedUrl"
            :size="size"
            level="H"
            :margin="2"
            background="#ffffff"
            foreground="#000000"
            class="tw-block tw-mx-auto tw-max-w-full tw-h-auto"
          />
        </div>
      </div>
    </div>

    <!-- Código de Convite Geek Mono (com clique para cópia em UPPERCASE) -->
    <div class="tw-mt-4 tw-flex tw-justify-center">
      <div
        class="tw-inline-flex tw-items-center tw-justify-center tw-gap-2.5 tw-px-4 tw-py-2 tw-rounded-2xl tw-bg-primary/10 hover:tw-bg-primary/20 tw-border tw-border-primary/25 tw-cursor-pointer tw-transition-all tw-group"
        title="Clique para copiar o código da turma"
        @click="handleCopyCode"
      >
        <span
          class="tw-text-2xl sm:tw-text-3xl tw-font-black tw-tracking-widest tw-text-primary tw-uppercase tw-font-mono tw-select-all"
        >
          {{ uppercaseCode }}
        </span>
        <q-btn
          flat
          round
          dense
          size="sm"
          color="primary"
          icon="content_copy"
          class="tw-rounded-lg"
          aria-label="Copiar código da turma"
          @click.stop="handleCopyCode"
        >
          <q-tooltip anchor="top middle" self="bottom middle"
            >Copiar Código ({{ uppercaseCode }})</q-tooltip
          >
        </q-btn>
      </div>
    </div>

    <!-- Pílula de Link Direto -->
    <div
      class="tw-mt-3 tw-p-2.5 fc-badge-button tw-rounded-xl tw-text-xs text-muted tw-select-all tw-break-all tw-font-mono"
    >
      {{ computedUrl }}
    </div>

    <!-- Ações de Compartilhamento na Thumb Zone (≥ 44px) -->
    <footer
      class="tw-flex tw-flex-col sm:tw-flex-row tw-items-center tw-justify-center tw-gap-2.5 tw-mt-5"
    >
      <q-btn
        unelevated
        no-caps
        color="primary"
        icon="content_copy"
        label="Copiar Link"
        class="tw-rounded-2xl tw-px-5 tw-h-11 tw-font-bold tw-w-full sm:tw-w-auto tw-flex-1 tw-shadow-sm hover:tw-scale-[1.01] tw-transition-transform"
        aria-label="Copiar link direto da aula"
        @click="handleCopy"
      />

      <q-btn
        outline
        no-caps
        color="primary"
        icon="share"
        label="Compartilhar"
        class="tw-rounded-2xl tw-px-4 tw-h-11 tw-font-bold tw-w-full sm:tw-w-auto tw-flex-1"
        aria-label="Compartilhar link da aula via aplicativo"
        @click="handleShare"
      />

      <q-btn
        v-if="allowDownload"
        flat
        no-caps
        color="secondary"
        icon="download"
        class="tw-rounded-2xl tw-h-11 tw-px-3.5 hover:tw-bg-secondary-soft"
        aria-label="Baixar imagem em PNG do QR Code"
        @click="downloadQrImage"
      >
        <q-tooltip anchor="top middle" self="bottom middle">Baixar PNG em Alta Resolução</q-tooltip>
      </q-btn>
    </footer>

    <!-- Diálogo de Apresentação em Tela Cheia (Modo Datashow / Projetor) -->
    <q-dialog
      v-model="isFullscreenPresentation"
      maximized
      transition-show="fade"
      transition-hide="fade"
    >
      <div
        class="fc-presentation-container tw-w-full tw-min-h-full tw-h-full tw-bg-slate-950 tw-text-white tw-flex tw-flex-col tw-justify-between tw-overflow-y-auto tw-select-none tw-p-4 sm:tw-p-8 lg:tw-p-10"
        style="
          padding-top: max(16px, env(safe-area-inset-top));
          padding-bottom: max(16px, env(safe-area-inset-bottom));
          padding-left: max(16px, env(safe-area-inset-left));
          padding-right: max(16px, env(safe-area-inset-right));
        "
      >
        <!-- Topo da Apresentação -->
        <header class="tw-flex tw-items-center tw-justify-between tw-gap-3 tw-mb-2">
          <div class="tw-flex tw-items-center tw-gap-2.5 sm:tw-gap-3 tw-min-w-0">
            <div
              class="tw-w-9 tw-h-9 sm:tw-w-10 sm:tw-h-10 tw-rounded-2xl tw-bg-primary/20 text-primary tw-flex tw-items-center tw-justify-center tw-shrink-0"
            >
              <q-icon name="cast_for_education" size="22px" />
            </div>
            <div class="tw-min-w-0 tw-flex-1">
              <h1
                class="tw-text-base sm:tw-text-xl md:tw-text-2xl tw-font-black tw-font-space-grotesk tw-m-0 tw-truncate"
              >
                {{ title }}
              </h1>
              <span
                class="tw-text-[11px] sm:tw-text-xs tw-text-slate-400 tw-font-medium tw-block tw-truncate"
              >
                Escaneie com a câmera ou digite o código
              </span>
            </div>
          </div>

          <q-btn
            flat
            round
            dense
            icon="fullscreen_exit"
            color="white"
            size="md"
            class="tw-bg-white/10 hover:tw-bg-white/20 tw-rounded-2xl tw-shrink-0"
            aria-label="Sair do modo telão"
            @click="isFullscreenPresentation = false"
          >
            <q-tooltip anchor="bottom middle" self="top middle">Fechar modo telão</q-tooltip>
          </q-btn>
        </header>

        <!-- Centro da Apresentação: Layout Adaptativo (Coluna em Retrato / Linha em Paisagem Compacta) -->
        <main
          class="fc-presentation-main tw-flex tw-flex-col landscape:sm:tw-flex-row tw-items-center tw-justify-center tw-my-auto tw-py-2 sm:tw-py-4 tw-gap-4 sm:tw-gap-8 lg:tw-gap-12"
        >
          <!-- Moldura Hi-Tech do QR Code -->
          <div
            class="tw-relative tw-p-3 sm:tw-p-5 sm:tw-p-6 tw-rounded-3xl tw-bg-white tw-shadow-2xl tw-border-4 tw-border-primary/40 tw-animate-pulse-slow tw-shrink-0"
          >
            <QrcodeSvg
              :value="computedUrl"
              :size="presentationQrSize"
              level="H"
              :margin="2"
              background="#ffffff"
              foreground="#000000"
              class="tw-block tw-mx-auto tw-max-w-full tw-h-auto"
            />
          </div>

          <!-- Bloco de Informações: PIN Gigante + Link Direto -->
          <div
            class="tw-flex tw-flex-col tw-items-center landscape:sm:tw-items-start tw-text-center landscape:sm:tw-text-left tw-max-w-xl"
          >
            <span
              class="tw-text-xs sm:tw-text-sm tw-font-bold tw-text-primary tw-uppercase tw-tracking-wider tw-mb-1"
            >
              Código de Acesso à Sala
            </span>

            <!-- Código Gigante para Leitura do Fundo da Sala (UPPERCASE e Cópia Interativa) -->
            <div
              class="tw-inline-flex tw-items-center tw-justify-center tw-gap-3 sm:tw-gap-5 tw-px-4 sm:tw-px-8 tw-py-1.5 sm:tw-py-3 tw-rounded-3xl tw-bg-primary/15 hover:tw-bg-primary/25 tw-border-2 tw-border-primary/40 tw-cursor-pointer tw-transition-all tw-group tw-shadow-lg"
              title="Clique para copiar o código"
              @click="handleCopyCode"
            >
              <span
                class="tw-text-3xl xs:tw-text-4xl sm:tw-text-6xl md:tw-text-7xl lg:tw-text-8xl tw-font-black tw-tracking-wider sm:tw-tracking-widest tw-text-primary tw-font-mono tw-uppercase tw-drop-shadow-lg group-hover:tw-scale-[1.02] tw-transition-transform"
              >
                {{ uppercaseCode }}
              </span>
              <q-btn
                flat
                round
                dense
                color="primary"
                size="md"
                icon="content_copy"
                class="tw-rounded-2xl tw-bg-primary/20 group-hover:tw-bg-primary/30"
                aria-label="Copiar código da turma"
                @click.stop="handleCopyCode"
              >
                <q-tooltip anchor="top middle" self="bottom middle"
                  >Copiar Código ({{ uppercaseCode }})</q-tooltip
                >
              </q-btn>
            </div>

            <!-- Link Direto Clicável -->
            <div
              class="tw-mt-3.5 tw-text-xs sm:tw-text-sm md:tw-text-base tw-text-slate-300 tw-font-medium tw-cursor-pointer hover:tw-text-white tw-transition-colors tw-break-all"
              title="Clique para copiar o link da aula"
              @click="handleCopy"
            >
              Link direto:
              <span class="tw-text-white tw-font-mono tw-underline tw-decoration-dotted">{{
                computedUrl
              }}</span>
            </div>
          </div>
        </main>

        <!-- Rodapé da Apresentação com Safe Area e Quebra Limpa -->
        <footer
          class="tw-flex tw-flex-col sm:tw-flex-row tw-items-center tw-justify-between tw-gap-2.5 tw-pt-2 tw-text-xs tw-text-slate-400 tw-border-t tw-border-white/10"
        >
          <div class="tw-text-center sm:tw-text-left">
            <span>{{
              $q.platform.has.touch
                ? 'Toque no X superior para fechar'
                : 'Pressione ESC para fechar'
            }}</span>
          </div>
          <div class="tw-flex tw-items-center tw-gap-2">
            <q-btn
              flat
              no-caps
              dense
              color="white"
              icon="link"
              label="Copiar Link"
              class="tw-px-3 tw-py-1 tw-rounded-xl hover:tw-bg-white/10"
              @click="handleCopy"
            />
            <q-btn
              flat
              no-caps
              dense
              color="white"
              icon="download"
              label="Exportar Imagem"
              class="tw-px-3 tw-py-1 tw-rounded-xl hover:tw-bg-white/10"
              @click="downloadQrImage"
            />
          </div>
        </footer>
      </div>
    </q-dialog>
  </q-card>
</template>

<style scoped>
@keyframes pulse-slow {
  0%,
  100% {
    box-shadow: 0 0 25px rgba(25, 118, 210, 0.25);
  }
  50% {
    box-shadow: 0 0 45px rgba(25, 118, 210, 0.45);
  }
}

.tw-animate-pulse-slow {
  animation: pulse-slow 3s ease-in-out infinite;
}

@media (orientation: landscape) and (max-height: 600px) {
  .fc-presentation-main {
    flex-direction: row !important;
    gap: 1.5rem !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tw-animate-pulse-slow {
    animation: none !important;
  }
}
</style>
