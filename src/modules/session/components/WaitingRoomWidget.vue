<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import { useSessionPresence } from '@/modules/session/composables/useSessionPresence';
import BaseSurfaceCard from '@/core/components/BaseSurfaceCard.vue';
import Fluent3dIcon from '@/core/components/Fluent3dIcon.vue';
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

// Identificador persistente ou efêmero do usuário para Presença Realtime
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

const currentAdvice = ref<string>('');
const { isLoading: isFetchingAdvice, execute: fetchAdvice } = useAsyncOperation();

// Presença em tempo real (aluno/visitante)
const { participants, isConnected, trackUser } = useSessionPresence(props.sessionId, false);

// Outros colegas conectados na sala (excluindo a si mesmo e o professor)
const otherParticipants = computed(() => {
  return participants.value.filter(
    (p) => p.userId !== currentUserId.value && p.role !== 'professor',
  );
});

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

const loadNewAdvice = async () => {
  try {
    currentAdvice.value = await fetchAdvice(getRandomAdvice, 'Erro ao carregar dica.');
  } catch {
    // Erro já tratado por useAsyncOperation
  }
};

function getFloatClass(index: number): string {
  const mod = index % 3;
  if (mod === 0) return 'fc-float-1';
  if (mod === 1) return 'fc-float-2';
  return 'fc-float-3';
}

onMounted(() => {
  void loadNewAdvice();
  void syncMyPresence();
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
    class="tw-space-y-6 tw-w-full tw-max-w-2xl tw-mx-auto tw-pb-[env(safe-area-inset-bottom,20px)]"
  >
    <!-- Card Heróico: Status da Sala de Espera -->
    <q-card
      flat
      bordered
      class="tw-rounded-3xl tw-p-6 sm:tw-p-8 tw-relative tw-overflow-hidden tw-shadow-sm"
    >
      <!-- Radar Sutil em Segundo Plano -->
      <div
        class="tw-absolute -tw-right-12 -tw-top-12 tw-w-48 tw-h-48 tw-rounded-full tw-border-2 tw-border-primary/15 tw-animate-ping tw-pointer-events-none"
      ></div>

      <div
        class="tw-relative tw-z-10 tw-flex tw-flex-col sm:tw-flex-row tw-items-center tw-justify-between tw-gap-5"
      >
        <div class="tw-flex tw-items-center tw-gap-4 tw-text-center sm:tw-text-left">
          <Fluent3dIcon name="graduation-cap" :size="56" floating class="tw-shrink-0" />
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
                {{ isConnected ? 'Conectado à sala de aula' : 'Sincronizando...' }}
              </span>
            </div>
            <h2 class="tw-text-xl sm:tw-text-2xl tw-font-bold tw-font-space-grotesk tw-m-0">
              Aguardando o professor
            </h2>
            <p class="text-muted tw-text-xs sm:tw-text-sm tw-mt-1 tw-mb-0">
              A aula sobre
              <strong class="tw-text-primary">{{ topic || 'Sem Tópico' }}</strong> começará a
              qualquer momento.
            </p>
          </div>
        </div>

        <div
          class="tw-inline-flex tw-items-center tw-gap-2 tw-px-3.5 tw-py-1.5 tw-rounded-full bg-primary-soft text-primary tw-text-xs tw-font-bold tw-shrink-0"
        >
          <q-icon name="schedule" size="18px" />
          <span>Sala Aberta</span>
        </div>
      </div>

      <!-- Colegas Conectados em Tempo Real -->
      <div class="tw-mt-6 tw-pt-5 tw-border-t tw-border-border">
        <div class="tw-flex tw-items-center tw-justify-between tw-gap-2 tw-mb-3">
          <div class="tw-flex tw-items-center tw-gap-2">
            <q-icon name="groups" size="18px" color="primary" />
            <span class="tw-text-xs sm:tw-text-sm tw-font-bold">
              {{
                otherParticipants.length > 0
                  ? `Você e mais ${otherParticipants.length} colega(s) já estão aguardando`
                  : 'Você é o primeiro a chegar! Convide seus colegas.'
              }}
            </span>
          </div>
        </div>

        <!-- Mini Avatares dos Colegas em Espera -->
        <div
          v-if="otherParticipants.length > 0"
          class="tw-flex tw-flex-wrap tw-items-center tw-gap-2 tw-pt-1"
        >
          <div
            v-for="(peer, pIdx) in otherParticipants.slice(0, 8)"
            :key="peer.userId"
            class="fc-floating-pill tw-flex tw-items-center tw-gap-2 tw-p-1.5 tw-pr-3 tw-rounded-full tw-border tw-border-border bg-grey-2 dark:bg-dark hover:tw-scale-105 tw-transition-all"
            :class="getFloatClass(pIdx)"
          >
            <div
              class="tw-w-7 tw-h-7 tw-rounded-full tw-overflow-hidden bg-primary-soft tw-ring-1 tw-ring-primary/20 tw-shrink-0"
            >
              <q-img
                v-if="peer.avatar"
                :src="peer.avatar"
                class="tw-w-full tw-h-full"
                spinner-color="primary"
              />
              <q-icon v-else name="person" size="16px" color="primary" />
            </div>
            <span class="tw-text-xs tw-font-medium tw-truncate tw-max-w-[100px]">
              {{ peer.name }}
            </span>
            <q-tooltip
              >{{ peer.name }} ({{ peer.role === 'visitante' ? 'Convidado' : 'Aluno' }})</q-tooltip
            >
          </div>

          <div
            v-if="otherParticipants.length > 8"
            class="tw-px-3 tw-py-1 tw-rounded-full bg-primary-soft text-primary tw-text-xs tw-font-bold"
          >
            +{{ otherParticipants.length - 8 }} outros
          </div>
        </div>
      </div>
    </q-card>

    <!-- Mashup Nível 4: DiceBear Avatar Customizer -->
    <BaseSurfaceCard
      variant="glass"
      class="tw-p-6 sm:tw-p-8 tw-rounded-3xl tw-flex tw-flex-col tw-items-center tw-gap-4"
    >
      <div class="tw-flex tw-items-center tw-justify-between tw-w-full">
        <div class="tw-flex tw-items-center tw-gap-2">
          <Fluent3dIcon name="student" :size="24" />
          <h3 class="tw-text-base sm:tw-text-lg tw-font-bold tw-font-space-grotesk tw-m-0">
            Seu Avatar na Turma
          </h3>
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
        Personalize seu personagem acadêmico! O professor e os colegas verão suas escolhas ao vivo.
      </p>

      <!-- Avatar Display com Moldura Flutuante e Fallback -->
      <div class="tw-relative fc-float-1 tw-my-2">
        <div
          class="tw-w-32 tw-h-32 tw-rounded-full tw-overflow-hidden bg-grey-2 dark:bg-dark tw-flex tw-items-center tw-justify-center tw-shadow-inner tw-ring-4 tw-ring-primary/20 tw-transition-all"
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
          size="sm"
          icon="casino"
          class="tw-absolute tw-bottom-0 tw-right-0 tw-shadow-md"
          title="Sorteio rápido"
          @click="rollRandomNickname"
        />
      </div>

      <!-- Seletor de Estilos de Avatar (Chips Horizontais) -->
      <div class="tw-flex tw-flex-wrap tw-justify-center tw-gap-1.5 tw-w-full tw-max-w-md tw-my-1">
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
      <div class="tw-w-full tw-max-w-xs">
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
        <span class="tw-text-[11px] text-muted tw-block tw-text-center tw-mt-1">
          Pressione
          <kbd
            class="tw-px-1.5 tw-py-0.5 tw-bg-grey-3 dark:bg-dark tw-rounded tw-text-[10px] tw-font-mono"
            >Enter</kbd
          >
          para atualizar e sincronizar
        </span>
      </div>

      <!-- Advice Slip Section (Conselho do Dia) -->
      <q-card flat bordered class="tw-w-full tw-max-w-md tw-mt-2 tw-p-4 tw-rounded-2xl">
        <div class="tw-flex tw-justify-between tw-items-center tw-mb-2">
          <div class="tw-flex tw-items-center tw-gap-2">
            <Fluent3dIcon name="bulb" :size="24" />
            <span class="tw-text-xs tw-font-bold tw-uppercase text-muted"
              >Dica Inspiradora do Dia</span
            >
          </div>
          <q-btn
            icon="refresh"
            flat
            round
            dense
            size="sm"
            color="primary"
            :loading="isFetchingAdvice"
            title="Sortear nova dica"
            @click="loadNewAdvice"
          />
        </div>

        <div v-if="isFetchingAdvice" class="tw-space-y-2 tw-py-1">
          <q-skeleton type="text" width="100%" />
          <q-skeleton type="text" width="75%" />
        </div>
        <p v-else class="text-body2 tw-italic tw-text-center tw-m-0 tw-leading-relaxed">
          "{{
            currentAdvice ||
            'O aprendizado é o único investimento com retorno garantido para a vida toda.'
          }}"
        </p>
      </q-card>
    </BaseSurfaceCard>
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

/* Acessibilidade: respeita preferências de redução de movimento */
@media (prefers-reduced-motion: reduce) {
  .fc-float-1,
  .fc-float-2,
  .fc-float-3 {
    animation: none !important;
  }
}
</style>
