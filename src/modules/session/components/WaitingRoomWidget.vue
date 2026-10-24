<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import { useSessionPresence } from '@/modules/session/composables/useSessionPresence';
import BaseSurfaceCard from '@/core/components/BaseSurfaceCard.vue';
import Fluent3dIcon from '@/core/components/Fluent3dIcon.vue';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import {
  getAvatarUrl,
  getFallbackAvatarDataUri,
  getRandomAcademicNickname,
  getRandomAvatarStyle,
  AVATAR_STYLES,
  type AvatarStyle,
} from '@/core/services/api/avatar.service';
import { getRandomAdvice } from '@/core/services/api/quotes.service';
import { useAsyncOperation } from '@/core/composables/useAsyncOperation';

const props = withDefaults(
  defineProps<{
    topic?: string | null;
    sessionId?: string;
    isGuest?: boolean;
    guestName?: string | undefined;
  }>(),
  {
    topic: 'Sem Tópico',
    sessionId: '',
    isGuest: false,
    guestName: '',
  },
);

const authStore = useAuthStore();

// Identificador estável do usuário para Presença Realtime
const currentUserId = computed(() => {
  if (authStore.user?.auth.id) return authStore.user.auth.id;
  if (typeof window !== 'undefined' && window.sessionStorage) {
    let stored = sessionStorage.getItem('ficouclaro_presence_uid');
    if (!stored) {
      stored = `guest_${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem('ficouclaro_presence_uid', stored);
    }
    return stored;
  }
  return 'student-guest';
});

// Nome inicial a partir do convidado, perfil autenticado ou gerado
const initialName = computed(() => {
  if (props.guestName?.trim()) return props.guestName.trim();
  if (authStore.user?.perfil?.nome_completo) return authStore.user.perfil.nome_completo;
  return getRandomAcademicNickname();
});

// Rascunho de digitação
const inputNickname = ref(initialName.value);
// Semente confirmada utilizada para avatar e presença
const appliedNickname = ref(initialName.value);
// Estilo visual selecionado
const selectedStyle = ref<AvatarStyle>('bottts');
// Animação de rotação do botão de dados da sorte
const isRolling = ref(false);

// Controle de abas de bem-estar: Dica Inspiradora ou Modo Zen
const focusTab = ref<'advice' | 'zen'>('advice');
const currentAdvice = ref<string>('');
const { isLoading: isFetchingAdvice, execute: fetchAdvice } = useAsyncOperation();

// Presença em tempo real e acenos (aluno/visitante)
const { participants, isConnected, lastWave, sendWave, trackUser } = useSessionPresence(
  props.sessionId,
  false,
);

// Outros colegas conectados na sala (excluindo a si mesmo e o professor)
const otherParticipants = computed(() => {
  return participants.value.filter(
    (p) => p.userId !== currentUserId.value && p.role !== 'professor',
  );
});

// Mensagem flutuante de aceno temporário
const waveBannerText = ref('');
const isWaving = ref(false);
let waveTimeout: ReturnType<typeof setTimeout> | null = null;

// Ciclo de respiração guiada (Modo Zen 4-4-4)
const breathPhase = ref<'inspire' | 'hold' | 'expire'>('inspire');
let breathInterval: ReturnType<typeof setInterval> | null = null;

// URL principal do DiceBear
const avatarUrl = computed(() => {
  return getAvatarUrl(appliedNickname.value, selectedStyle.value);
});

// Fallback determinístico offline
const fallbackAvatarUrl = computed(() => {
  return getFallbackAvatarDataUri(appliedNickname.value);
});

// Sincroniza presença no canal Supabase Realtime
async function syncMyPresence() {
  if (!props.sessionId) return;
  await trackUser({
    userId: currentUserId.value,
    name: appliedNickname.value,
    avatar: avatarUrl.value,
    role: props.isGuest ? 'visitante' : 'aluno',
  });
}

function applyNickname() {
  const clean = inputNickname.value.trim();
  if (clean && clean !== appliedNickname.value) {
    appliedNickname.value = clean;
    void syncMyPresence();
  } else if (!clean && appliedNickname.value !== initialName.value) {
    appliedNickname.value = initialName.value;
    inputNickname.value = initialName.value;
    void syncMyPresence();
  }
}

function rollRandomNickname() {
  isRolling.value = true;
  void Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});

  const picked = getRandomAcademicNickname();
  const nextStyle = getRandomAvatarStyle(selectedStyle.value);

  inputNickname.value = picked;
  appliedNickname.value = picked;
  selectedStyle.value = nextStyle;

  void syncMyPresence();

  setTimeout(() => {
    isRolling.value = false;
  }, 500);
}

function selectStyle(styleId: AvatarStyle) {
  selectedStyle.value = styleId;
  void syncMyPresence();
}

async function handleWave() {
  if (isWaving.value) return;
  isWaving.value = true;
  try {
    void Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
    await sendWave(appliedNickname.value, currentUserId.value);
    waveBannerText.value = 'Você acenou para a turma! 👋';
    if (waveTimeout) clearTimeout(waveTimeout);
    waveTimeout = setTimeout(() => {
      waveBannerText.value = '';
    }, 3500);
  } finally {
    setTimeout(() => {
      isWaving.value = false;
    }, 800);
  }
}

const loadNewAdvice = async () => {
  try {
    currentAdvice.value = await fetchAdvice(getRandomAdvice, 'Erro ao carregar dica.');
  } catch {
    // Erro tratado por useAsyncOperation
  }
};

function getFloatClass(index: number): string {
  const mod = index % 3;
  if (mod === 0) return 'fc-float-1';
  if (mod === 1) return 'fc-float-2';
  return 'fc-float-3';
}

function startZenBreathing() {
  if (breathInterval) clearInterval(breathInterval);
  breathPhase.value = 'inspire';
  breathInterval = setInterval(() => {
    if (breathPhase.value === 'inspire') {
      breathPhase.value = 'hold';
    } else if (breathPhase.value === 'hold') {
      breathPhase.value = 'expire';
    } else {
      breathPhase.value = 'inspire';
    }
  }, 4000);
}

watch(
  () => focusTab.value,
  (newTab) => {
    if (newTab === 'zen') {
      startZenBreathing();
    } else if (breathInterval) {
      clearInterval(breathInterval);
    }
  },
);

watch(
  () => lastWave.value,
  (newWave) => {
    if (newWave && newWave.senderId !== currentUserId.value) {
      waveBannerText.value = `${newWave.senderName} acenou para a sala! 👋`;
      void Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
      if (waveTimeout) clearTimeout(waveTimeout);
      waveTimeout = setTimeout(() => {
        waveBannerText.value = '';
      }, 3500);
    }
  },
);

onMounted(() => {
  void loadNewAdvice();
  void syncMyPresence();
});

onUnmounted(() => {
  if (waveTimeout) clearTimeout(waveTimeout);
  if (breathInterval) clearInterval(breathInterval);
});

watch(
  () => props.sessionId,
  (newId) => {
    if (newId) {
      void syncMyPresence();
    }
  },
);
</script>

<template>
  <div
    class="fc-student-waiting-room tw-w-full tw-max-w-5xl tw-mx-auto tw-pb-[env(safe-area-inset-bottom,24px)] tw-space-y-6"
  >
    <!-- Card Heróico: Status da Sala de Espera do Aluno -->
    <q-card
      flat
      bordered
      class="tw-rounded-3xl tw-p-6 sm:tw-p-8 tw-relative tw-overflow-hidden tw-shadow-sm"
    >
      <!-- Radar Sutil em Segundo Plano -->
      <div
        class="tw-absolute -tw-right-12 -tw-top-12 tw-w-52 tw-h-52 tw-rounded-full tw-border-2 tw-border-primary/15 tw-animate-ping tw-pointer-events-none"
      ></div>

      <div
        class="tw-relative tw-z-10 tw-flex tw-flex-col sm:tw-flex-row sm:tw-items-center sm:tw-justify-between tw-gap-5"
      >
        <div class="tw-flex tw-items-center tw-gap-4 tw-text-center sm:tw-text-left">
          <Fluent3dIcon name="student" :size="56" floating class="tw-shrink-0" />
          <div>
            <div
              class="tw-flex tw-items-center tw-justify-center sm:tw-justify-start tw-gap-2 tw-mb-1.5"
            >
              <span class="tw-relative tw-flex tw-h-2.5 tw-w-2.5">
                <span
                  class="tw-animate-ping tw-absolute tw-inline-flex tw-h-full tw-w-full tw-rounded-full tw-bg-positive tw-opacity-75"
                ></span>
                <span
                  class="tw-relative tw-inline-flex tw-rounded-full tw-h-2.5 tw-w-2.5 tw-bg-positive"
                ></span>
              </span>
              <span class="tw-text-xs tw-font-bold tw-uppercase text-positive tw-tracking-wider">
                {{
                  isConnected
                    ? 'Conectado à sala de aula ao vivo'
                    : 'Sincronizando com o professor...'
                }}
              </span>
            </div>
            <h1
              class="tw-text-xl sm:tw-text-2xl lg:tw-text-3xl tw-font-black tw-font-space-grotesk tw-tracking-tight tw-m-0"
            >
              Aguardando o Início da Aula
            </h1>
            <p class="text-muted tw-text-xs sm:tw-text-sm tw-mt-1 tw-mb-0">
              A sessão sobre
              <strong class="tw-text-primary">{{ topic || 'Sem Tópico Definido' }}</strong> começará
              a qualquer instante.
            </p>
          </div>
        </div>

        <div
          class="tw-inline-flex tw-items-center tw-gap-2 tw-px-3.5 tw-py-1.5 tw-rounded-full bg-primary-soft text-primary tw-text-xs tw-font-bold tw-shrink-0"
        >
          <q-icon name="schedule" size="18px" />
          <span>Em Stand-by</span>
        </div>
      </div>
    </q-card>

    <!-- Bento Grid do Aluno: 2 Colunas em Desktop/Tablet, 1 Coluna em Mobile -->
    <div class="tw-grid tw-grid-cols-1 lg:tw-grid-cols-12 tw-gap-6 tw-items-stretch">
      <!-- Coluna Esquerda: Mural da Turma + Cartão de Foco / Bem-Estar (7 Colunas) -->
      <div class="lg:tw-col-span-7 tw-flex tw-flex-col tw-gap-6">
        <!-- Mural "Quem Já Chegou" -->
        <q-card
          flat
          bordered
          class="tw-p-5 sm:tw-p-6 tw-rounded-3xl tw-flex tw-flex-col tw-h-full tw-shadow-sm"
        >
          <header class="tw-flex tw-items-center tw-justify-between tw-gap-2 tw-mb-4">
            <div class="tw-flex tw-items-center tw-gap-2.5">
              <Fluent3dIcon name="school" :size="24" />
              <h2 class="tw-text-base sm:tw-text-lg tw-font-bold tw-font-space-grotesk tw-m-0">
                Quem Já Chegou
              </h2>
            </div>

            <div class="tw-flex tw-items-center tw-gap-2">
              <!-- Botão de Aceno Efêmero para a Sala -->
              <q-btn
                unelevated
                color="primary"
                size="sm"
                class="tw-rounded-xl tw-font-bold tw-px-3 tw-transition-all"
                :class="{ 'tw-scale-95': isWaving }"
                :loading="isWaving"
                title="Acenar para a turma"
                @click="handleWave"
              >
                <span>Acenar 👋</span>
                <q-tooltip>Mandar um aceno animado para os colegas</q-tooltip>
              </q-btn>

              <span
                class="tw-px-3 tw-py-1 tw-rounded-full bg-primary-soft text-primary tw-text-xs tw-font-extrabold"
              >
                {{ otherParticipants.length + 1 }} na sala
              </span>
            </div>
          </header>

          <!-- Toast Flutuante de Aceno -->
          <Transition name="fade">
            <div
              v-if="waveBannerText"
              class="tw-mb-3 tw-p-2.5 tw-rounded-2xl tw-bg-primary text-white tw-text-xs tw-font-bold tw-flex tw-items-center tw-justify-center tw-gap-2 tw-shadow-md tw-animate-bounce"
            >
              <span>{{ waveBannerText }}</span>
            </div>
          </Transition>

          <!-- Lista de Colegas Conectados -->
          <div
            v-if="otherParticipants.length > 0"
            class="tw-flex-1 tw-min-h-[160px] tw-p-1 tw-overflow-y-auto tw-no-scrollbar"
          >
            <TransitionGroup
              name="fc-pill"
              tag="div"
              class="tw-flex tw-flex-wrap tw-items-center tw-justify-center sm:tw-justify-start tw-gap-2.5"
            >
              <q-card
                v-for="(peer, pIdx) in otherParticipants"
                :key="peer.userId"
                flat
                bordered
                class="fc-floating-pill tw-p-2 tw-pr-3.5 tw-rounded-2xl tw-flex tw-items-center tw-gap-2.5 tw-shadow-sm hover:tw-scale-105 tw-transition-all"
                :class="getFloatClass(pIdx)"
              >
                <div
                  class="tw-relative tw-w-9 tw-h-9 tw-rounded-xl tw-overflow-hidden bg-primary-soft tw-ring-1 tw-ring-primary/20 tw-shrink-0"
                >
                  <q-img
                    v-if="peer.avatar"
                    :src="peer.avatar"
                    class="tw-w-full tw-h-full"
                    spinner-color="primary"
                  />
                  <q-icon v-else name="person" size="20px" color="primary" />

                  <!-- Ponto Verde Vivo de Presença -->
                  <span
                    class="tw-absolute tw-bottom-0 tw-right-0 tw-w-2.5 tw-h-2.5 tw-rounded-full tw-bg-positive tw-ring-2 tw-ring-white"
                  ></span>
                </div>

                <div class="tw-text-left">
                  <div
                    class="tw-text-xs tw-font-bold tw-truncate tw-max-w-[120px]"
                    :title="peer.name"
                  >
                    {{ peer.name }}
                  </div>
                  <span class="tw-text-[10px] text-muted tw-block tw-leading-tight">
                    {{ peer.role === 'visitante' ? 'Convidado' : 'Colega' }}
                  </span>
                </div>
                <q-tooltip
                  >{{ peer.name }} ({{
                    peer.role === 'visitante' ? 'Convidado' : 'Colega'
                  }})</q-tooltip
                >
              </q-card>
            </TransitionGroup>
          </div>

          <!-- Estado Vazio: Primeiro Estudante na Sala -->
          <div
            v-else
            class="tw-flex-1 tw-min-h-[160px] tw-rounded-2xl tw-border-2 tw-border-dashed tw-border-border tw-flex tw-flex-col tw-items-center tw-justify-center tw-p-6 tw-text-center"
          >
            <Fluent3dIcon name="backpack" :size="40" floating class="tw-mb-2" />
            <div class="tw-text-sm tw-font-bold tw-font-space-grotesk">
              Você é o primeiro a chegar!
            </div>
            <p class="text-muted tw-text-xs tw-mt-1 tw-mb-0 tw-max-w-xs">
              Seus colegas de turma aparecerão aqui automaticamente assim que entrarem na sala.
            </p>
          </div>
        </q-card>

        <!-- Card de Foco & Bem-Estar: Dica Inspiradora / Modo Zen -->
        <q-card flat bordered class="tw-p-5 sm:tw-p-6 tw-rounded-3xl tw-shadow-sm">
          <div class="tw-flex tw-items-center tw-justify-between tw-mb-4">
            <div class="tw-flex tw-items-center tw-gap-2">
              <Fluent3dIcon :name="focusTab === 'advice' ? 'bulb' : 'memo'" :size="24" />
              <span class="tw-text-xs sm:tw-text-sm tw-font-bold tw-uppercase text-muted">
                {{ focusTab === 'advice' ? 'Aquecimento Cognitivo' : 'Respiração Guiada (4-4-4)' }}
              </span>
            </div>

            <!-- Alternador de Modos -->
            <q-btn-toggle
              v-model="focusTab"
              dense
              rounded
              unelevated
              size="xs"
              color="grey-4"
              text-color="grey-8"
              toggle-color="primary"
              toggle-text-color="white"
              :options="[
                { label: 'Dica do Dia', value: 'advice' },
                { label: 'Modo Zen', value: 'zen' },
              ]"
            />
          </div>

          <!-- Vista 1: Dica Inspiradora -->
          <div
            v-if="focusTab === 'advice'"
            class="tw-flex tw-flex-col tw-items-center tw-text-center"
          >
            <div v-if="isFetchingAdvice" class="tw-w-full tw-space-y-2 tw-py-2">
              <q-skeleton type="text" width="100%" />
              <q-skeleton type="text" width="75%" class="tw-mx-auto" />
            </div>
            <p v-else class="text-body2 tw-italic tw-leading-relaxed tw-my-2">
              "{{
                currentAdvice ||
                'O aprendizado é o único investimento com retorno garantido para a vida toda.'
              }}"
            </p>
            <q-btn
              flat
              dense
              no-caps
              size="sm"
              color="primary"
              icon="refresh"
              label="Sortear Nova Dica"
              :loading="isFetchingAdvice"
              class="tw-mt-2"
              @click="loadNewAdvice"
            />
          </div>

          <!-- Vista 2: Modo Zen (Respiração 4-4-4) -->
          <div v-else class="tw-flex tw-flex-col tw-items-center tw-text-center tw-py-3">
            <div
              class="tw-relative tw-w-28 tw-h-28 tw-flex tw-items-center tw-justify-center tw-my-2"
            >
              <div
                class="tw-absolute tw-inset-0 tw-rounded-full tw-bg-primary/20 tw-transition-transform tw-duration-1000"
                :class="{
                  'tw-scale-125 tw-bg-primary/30': breathPhase === 'inspire',
                  'tw-scale-110 tw-bg-secondary/30': breathPhase === 'hold',
                  'tw-scale-75 tw-bg-primary/10': breathPhase === 'expire',
                }"
              ></div>
              <div
                class="tw-relative tw-z-10 tw-text-xs tw-font-bold tw-text-primary tw-font-mono tw-uppercase"
              >
                {{
                  breathPhase === 'inspire'
                    ? 'Inspire'
                    : breathPhase === 'hold'
                      ? 'Segure'
                      : 'Expire'
                }}
              </div>
            </div>
            <span class="tw-text-xs text-muted">
              {{
                breathPhase === 'inspire'
                  ? 'Inspire o ar lentamente pelo nariz...'
                  : breathPhase === 'hold'
                    ? 'Segure o ar e mantenha a atenção plena...'
                    : 'Solte o ar suavemente pela boca...'
              }}
            </span>
          </div>
        </q-card>
      </div>

      <!-- Coluna Direita: Estúdio de Avatar & Apelido Acadêmico (5 Colunas) -->
      <div class="lg:tw-col-span-5 tw-flex tw-flex-col">
        <BaseSurfaceCard
          variant="glass"
          class="tw-p-6 sm:tw-p-8 tw-rounded-3xl tw-flex tw-flex-col tw-items-center tw-gap-4 tw-h-full tw-shadow-sm"
        >
          <div class="tw-flex tw-items-center tw-justify-between tw-w-full">
            <div class="tw-flex tw-items-center tw-gap-2">
              <Fluent3dIcon name="student" :size="24" />
              <h2 class="tw-text-base sm:tw-text-lg tw-font-bold tw-font-space-grotesk tw-m-0">
                Seu Personagem
              </h2>
            </div>
            <q-btn
              flat
              dense
              round
              size="sm"
              color="primary"
              icon="casino"
              :class="{ 'tw-animate-spin': isRolling }"
              title="Sortear apelido e avatar da sorte"
              @click="rollRandomNickname"
            >
              <q-tooltip anchor="top middle" self="bottom middle">Dados da sorte</q-tooltip>
            </q-btn>
          </div>

          <p class="text-muted tw-text-xs sm:tw-text-sm tw-text-center tw-m-0">
            Personalize seu avatar! O professor e os colegas verão suas escolhas em tempo real.
          </p>

          <!-- Avatar Display com Moldura Flutuante e Anel Iluminado -->
          <div class="tw-relative fc-float-1 tw-my-2">
            <div
              class="tw-w-36 tw-h-36 tw-rounded-full tw-overflow-hidden bg-grey-2 dark:bg-dark tw-flex tw-items-center tw-justify-center tw-shadow-inner tw-ring-4 tw-ring-primary/25 tw-transition-all"
            >
              <q-img
                :src="avatarUrl"
                :error-src="fallbackAvatarUrl"
                class="tw-w-full tw-h-full"
                spinner-color="primary"
                transition="fade"
              />
            </div>

            <!-- Botão rápido de dados flutuante -->
            <q-btn
              round
              dense
              color="primary"
              size="md"
              icon="casino"
              class="tw-absolute tw-bottom-0 tw-right-0 tw-shadow-lg hover:tw-scale-110 tw-transition-transform"
              title="Sorteio rápido"
              @click="rollRandomNickname"
            />
          </div>

          <!-- Seletor de Estilos de Avatar (Chips Horizontais) -->
          <div class="tw-flex tw-flex-wrap tw-justify-center tw-gap-1.5 tw-w-full tw-my-1">
            <q-btn
              v-for="st in AVATAR_STYLES"
              :key="st.id"
              dense
              rounded
              size="xs"
              class="tw-px-2.5 tw-py-1 tw-text-[11px] tw-font-medium tw-transition-all"
              :color="selectedStyle === st.id ? 'primary' : 'grey-7'"
              :outline="selectedStyle !== st.id"
              :icon="st.icon"
              :label="st.label"
              @click="selectStyle(st.id)"
            >
              <q-tooltip>{{ st.description }}</q-tooltip>
            </q-btn>
          </div>

          <!-- Campo de Apelido (Aplica no Enter, Blur ou Botão) -->
          <div class="tw-w-full tw-max-w-xs tw-mt-2">
            <q-input
              v-model="inputNickname"
              outlined
              dense
              placeholder="Digite seu apelido acadêmico..."
              class="tw-w-full"
              color="primary"
              @keyup.enter="applyNickname"
              @blur="applyNickname"
            >
              <template v-slot:prepend>
                <q-icon name="badge" size="18px" />
              </template>
              <template v-slot:append>
                <q-btn
                  flat
                  dense
                  round
                  size="xs"
                  color="primary"
                  icon="auto_fix_high"
                  title="Confirmar apelido e sincronizar presença"
                  @click="applyNickname"
                >
                  <q-tooltip>Confirmar (ou pressione Enter)</q-tooltip>
                </q-btn>
              </template>
            </q-input>
            <span class="tw-text-[11px] text-muted tw-block tw-text-center tw-mt-1.5">
              Pressione
              <kbd
                class="tw-px-1.5 tw-py-0.5 tw-bg-grey-3 dark:bg-dark tw-rounded tw-text-[10px] tw-font-mono"
                >Enter</kbd
              >
              para atualizar ao vivo
            </span>
          </div>
        </BaseSurfaceCard>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Animações Orgânicas Flutuantes */
@keyframes fcFloatA {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-5px) rotate(0.8deg);
  }
}

@keyframes fcFloatB {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-7px) rotate(-1deg);
  }
}

@keyframes fcFloatC {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-4px) rotate(0.5deg);
  }
}

.fc-float-1 {
  animation: fcFloatA 4.5s ease-in-out infinite;
}

.fc-float-2 {
  animation: fcFloatB 5.2s ease-in-out infinite;
}

.fc-float-3 {
  animation: fcFloatC 6s ease-in-out infinite;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Transições do Mural */
.fc-pill-enter-active,
.fc-pill-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fc-pill-enter-from,
.fc-pill-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(10px);
}

/* Acessibilidade: respeita preferências de redução de movimento */
@media (prefers-reduced-motion: reduce) {
  .fc-float-1,
  .fc-float-2,
  .fc-float-3 {
    animation: none !important;
  }
}
</style>
