<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Platform, QInput } from 'quasar';
import { Haptics, NotificationType } from '@capacitor/haptics';
import { useAuthStore } from '@/stores/auth.store';
import { biometricService } from '@/core/services/biometric.service';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

// Estados de entrada e formulário
const password = ref('');
const isPwdVisible = ref(false);
const isCheckingBiometry = ref(false);
const isCapsLockOn = ref(false);
const isShaking = ref(false);
const passwordInputRef = ref<QInput | null>(null);

// Relógio em tempo real estilo Lockscreen de SO
const now = ref(new Date());
let timerId: ReturnType<typeof setInterval> | null = null;

const formattedTime = computed(() => {
  return now.value.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
});

const formattedDate = computed(() => {
  const formatted = now.value.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
});

// Identificação e Metadados do Usuário
const userName = computed(() => {
  return authStore.user?.perfil.nome_completo || authStore.user?.auth.email || 'Usuário';
});

const userEmail = computed(() => {
  return authStore.user?.auth.email || '';
});

const userAvatar = computed(() => {
  return authStore.user?.perfil.url_avatar || null;
});

const userRoleLabel = computed(() => {
  if (authStore.isProfessor) return 'Docente';
  if (authStore.isAluno) return 'Aluno';
  return 'Usuário';
});

const userRoleIcon = computed(() => {
  if (authStore.isProfessor) return 'school';
  if (authStore.isAluno) return 'local_library';
  return 'person';
});

const userInitials = computed(() => {
  const name = authStore.user?.perfil.nome_completo?.trim();
  if (!name) return 'FC';
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1 && parts[0]) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  const first = parts[0]?.[0] ?? '';
  const last = parts[parts.length - 1]?.[0] ?? '';
  return `${first}${last}`.toUpperCase();
});

// Acessibilidade: Detecção de Caps Lock
function handleKeyModifier(event: KeyboardEvent) {
  if (typeof event.getModifierState === 'function') {
    isCapsLockOn.value = event.getModifierState('CapsLock');
  }
}

// Micro-animações e Feedback Tátil (Haptics)
async function triggerShake() {
  isShaking.value = true;
  if (Platform.is.capacitor) {
    try {
      await Haptics.notification({ type: NotificationType.Error });
    } catch {
      // Ignora erro em ambientes sem suporte a vibração
    }
  }
  setTimeout(() => {
    isShaking.value = false;
  }, 500);
}

function handlePostUnlockRedirect() {
  if (route.path === '/lock') {
    const target = authStore.isProfessor ? '/disciplinas' : authStore.isAluno ? '/hub' : '/';
    void router.push(target);
  }
}

// Fluxos de Desbloqueio
async function unlockWithBiometry() {
  if (!Platform.is.capacitor || !biometricService.isBiometricsEnabled()) return;

  isCheckingBiometry.value = true;
  const success = await biometricService.authenticate();
  if (success) {
    authStore.unlockSession();
    handlePostUnlockRedirect();
  } else {
    await triggerShake();
  }
  isCheckingBiometry.value = false;
}

async function unlockWithPassword() {
  if (!password.value) return;

  const success = await authStore.unlockWithPassword(password.value);
  if (success) {
    password.value = '';
    isCapsLockOn.value = false;
    handlePostUnlockRedirect();
  } else {
    await triggerShake();
    await nextTick();
    passwordInputRef.value?.focus();
  }
}

async function unlockWithGoogle() {
  try {
    await authStore.unlockWithGoogle();
  } catch {
    await triggerShake();
  }
}

async function logout() {
  try {
    await authStore.signOut();
  } finally {
    void router.replace('/login');
  }
}

onMounted(() => {
  timerId = setInterval(() => {
    now.value = new Date();
  }, 1000);

  if (Platform.is.capacitor && biometricService.isBiometricsEnabled()) {
    void unlockWithBiometry();
  } else if (!authStore.isOAuthUser) {
    setTimeout(() => {
      passwordInputRef.value?.focus();
    }, 200);
  }
});

onUnmounted(() => {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
});
</script>

<template>
  <div
    class="tw-fixed tw-inset-0 tw-z-[9999] tw-backdrop-blur-xl tw-bg-black/80 tw-flex tw-flex-col tw-items-center tw-justify-between md:tw-justify-center tw-p-4 sm:tw-p-6 tw-overflow-y-auto"
    role="dialog"
    aria-modal="true"
    aria-label="Tela de Bloqueio de Sessão"
  >
    <!-- Header com Relógio e Data em Tempo Real -->
    <header
      class="tw-w-full tw-max-w-md tw-text-center tw-pt-6 md:tw-pt-0 tw-mb-4 md:tw-mb-6 tw-text-white"
    >
      <div
        class="tw-text-5xl sm:tw-text-6xl tw-font-extralight tw-tracking-tight tw-drop-shadow-md"
      >
        {{ formattedTime }}
      </div>
      <div class="tw-text-xs sm:tw-text-sm tw-font-medium tw-opacity-80 tw-mt-1.5 tw-tracking-wide">
        {{ formattedDate }}
      </div>
    </header>

    <!-- Card Principal de Desbloqueio (Superfície Quasar com Suporte Dark/Light) -->
    <q-card
      flat
      bordered
      class="tw-w-full tw-max-w-md tw-rounded-3xl tw-p-6 sm:tw-p-8 tw-shadow-2xl tw-relative tw-transition-transform"
      :class="{ 'shake-animation': isShaking }"
    >
      <!-- Identificação do Usuário -->
      <div class="tw-flex tw-flex-col tw-items-center tw-text-center tw-mb-6">
        <div class="tw-relative tw-mb-3">
          <q-avatar size="84px" class="tw-shadow-lg tw-ring-4 tw-ring-primary/20">
            <img v-if="userAvatar" :src="userAvatar" alt="Avatar do usuário" />
            <div
              v-else
              class="tw-w-full tw-h-full tw-bg-primary tw-text-white tw-flex tw-items-center tw-justify-center tw-font-bold tw-text-2xl"
            >
              {{ userInitials }}
            </div>
          </q-avatar>

          <!-- Ícone indicador de bloqueio sobreposto -->
          <div
            class="tw-absolute -tw-bottom-1 -tw-right-1 tw-w-7 tw-h-7 tw-rounded-full tw-bg-amber-500 tw-text-white tw-flex tw-items-center tw-justify-center tw-shadow-md"
            title="Sessão pausada por inatividade"
          >
            <q-icon name="lock" size="14px" />
          </div>
        </div>

        <h1 class="tw-text-lg sm:tw-text-xl tw-font-bold tw-tracking-tight tw-m-0">
          {{ userName }}
        </h1>

        <div class="tw-flex tw-items-center tw-gap-2 tw-mt-1.5">
          <q-chip
            dense
            outline
            color="primary"
            :icon="userRoleIcon"
            :label="userRoleLabel"
            class="tw-text-xs tw-font-medium tw-m-0"
          />
          <span
            v-if="userEmail && userName !== userEmail"
            class="tw-text-xs tw-opacity-60 tw-truncate tw-max-w-[180px]"
          >
            {{ userEmail }}
          </span>
        </div>
      </div>

      <!-- Formulário de Desbloqueio -->
      <div class="tw-space-y-4">
        <!-- Usuário exclusivo OAuth (Google): Solução de Re-autenticação sem Senha -->
        <template v-if="authStore.isOAuthUser">
          <div
            class="tw-p-3 tw-rounded-xl tw-bg-primary/5 tw-border tw-border-primary/10 tw-text-xs tw-opacity-80 tw-text-center"
          >
            Sua conta utiliza autenticação Google. Revalide seu acesso para continuar.
          </div>

          <q-btn
            unelevated
            class="tw-w-full tw-h-11 tw-rounded-xl tw-text-sm tw-font-semibold tw-shadow-sm tw-border tw-border-gray-200 dark:tw-border-gray-700"
            icon="img:/icons/google.svg"
            label="Desbloquear com Google"
            no-caps
            :loading="authStore.isLoading"
            @click="unlockWithGoogle"
          />

          <!-- Botão de Biometria Nativa como opção complementar -->
          <q-btn
            v-if="Platform.is.capacitor && biometricService.isBiometricsEnabled()"
            outline
            color="primary"
            icon="fingerprint"
            label="Usar Biometria"
            class="tw-w-full tw-h-11 tw-rounded-xl tw-font-semibold"
            no-caps
            :loading="isCheckingBiometry"
            @click="unlockWithBiometry"
          />
        </template>

        <!-- Usuário com Senha Convencional ou Provedor Misto -->
        <template v-else>
          <!-- Input de Senha -->
          <div>
            <q-input
              ref="passwordInputRef"
              v-model="password"
              :type="isPwdVisible ? 'text' : 'password'"
              label="Senha de acesso"
              outlined
              dense
              class="tw-w-full"
              :disable="authStore.isLoading"
              autocomplete="current-password"
              @keydown="handleKeyModifier"
              @keyup="handleKeyModifier"
              @keyup.enter="unlockWithPassword"
            >
              <template #prepend>
                <q-icon name="key" class="tw-opacity-60" />
              </template>
              <template #append>
                <q-icon
                  :name="isPwdVisible ? 'visibility_off' : 'visibility'"
                  class="tw-cursor-pointer tw-opacity-70 hover:tw-opacity-100"
                  @click="isPwdVisible = !isPwdVisible"
                  :title="isPwdVisible ? 'Ocultar senha' : 'Ver senha'"
                />
              </template>
            </q-input>

            <!-- Alerta de Caps Lock Ativado -->
            <transition name="q-transition--fade">
              <div
                v-if="isCapsLockOn"
                class="tw-flex tw-items-center tw-gap-1.5 tw-text-xs tw-text-amber-500 tw-mt-1.5 tw-font-medium"
                role="alert"
              >
                <q-icon name="keyboard_capslock" size="15px" />
                <span>Caps Lock ativado</span>
              </div>
            </transition>
          </div>

          <!-- Botão Desbloquear com Senha -->
          <q-btn
            unelevated
            color="primary"
            label="Desbloquear Sessão"
            icon="lock_open"
            class="tw-w-full tw-h-11 tw-rounded-xl tw-font-semibold tw-shadow-sm"
            no-caps
            :loading="authStore.isLoading"
            :disable="!password"
            @click="unlockWithPassword"
          />

          <!-- Botão de Biometria (Capacitor Nativo) -->
          <q-btn
            v-if="Platform.is.capacitor && biometricService.isBiometricsEnabled()"
            outline
            color="primary"
            icon="fingerprint"
            label="Usar Biometria"
            class="tw-w-full tw-h-11 tw-rounded-xl tw-font-semibold"
            no-caps
            :loading="isCheckingBiometry"
            @click="unlockWithBiometry"
          />

          <!-- Alternativa Social Google -->
          <div class="tw-flex tw-items-center tw-my-1">
            <div class="tw-flex-1 tw-h-px tw-bg-gray-200 dark:tw-bg-gray-700"></div>
            <span class="tw-px-2 tw-text-[11px] tw-font-medium tw-opacity-60">ou</span>
            <div class="tw-flex-1 tw-h-px tw-bg-gray-200 dark:tw-bg-gray-700"></div>
          </div>

          <q-btn
            outline
            icon="img:/icons/google.svg"
            label="Entrar com Google"
            class="tw-w-full tw-h-11 tw-rounded-xl tw-font-medium"
            no-caps
            :loading="authStore.isLoading"
            @click="unlockWithGoogle"
          />
        </template>
      </div>

      <!-- Rodapé do Card: Sair da Conta -->
      <div
        class="tw-mt-6 tw-pt-4 tw-border-t tw-border-gray-100 dark:tw-border-gray-800 tw-flex tw-justify-center"
      >
        <q-btn
          flat
          dense
          no-caps
          color="negative"
          icon="logout"
          label="Sair desta conta"
          class="tw-text-xs tw-opacity-80 hover:tw-opacity-100"
          @click="logout"
        />
      </div>
    </q-card>

    <!-- Espaçador inferior no mobile para manter ergonomia na Thumb Zone -->
    <div class="tw-h-4 md:tw-hidden"></div>
  </div>
</template>

<style scoped>
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20%,
  60% {
    transform: translateX(-8px);
  }
  40%,
  80% {
    transform: translateX(8px);
  }
}

.shake-animation {
  animation: shake 0.45s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}
</style>
