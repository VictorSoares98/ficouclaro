<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import BaseSurfaceCard from '@/core/components/BaseSurfaceCard.vue';
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

defineProps<{
  topic?: string | null;
}>();

// Rascunho de digitação (não dispara requisições a cada letra digitada)
const inputNickname = ref('');
// Semente confirmada (utilizada para gerar a imagem)
const appliedNickname = ref('Aluno');
// Estilo visual selecionado
const selectedStyle = ref<AvatarStyle>('bottts');
// Animação de rotação do botão de dados da sorte
const isRolling = ref(false);

const currentAdvice = ref<string>('');
const { isLoading: isFetchingAdvice, execute: fetchAdvice } = useAsyncOperation();

// URL principal do DiceBear
const avatarUrl = computed(() => {
  return getAvatarUrl(appliedNickname.value, selectedStyle.value);
});

// Fallback determinístico offline (garante que a imagem nunca quebre na tela)
const fallbackAvatarUrl = computed(() => {
  return getFallbackAvatarDataUri(appliedNickname.value);
});

/**
 * Aplica o apelido digitado apenas quando o usuário conclui (Enter, Blur ou botão de confirmação)
 */
function applyNickname() {
  const clean = inputNickname.value.trim();
  if (clean && clean !== appliedNickname.value) {
    appliedNickname.value = clean;
  } else if (!clean && appliedNickname.value !== 'Aluno') {
    appliedNickname.value = 'Aluno';
  }
}

/**
 * Sorteia um apelido acadêmico divertido e alterna o estilo do avatar com animação
 */
function rollRandomNickname() {
  isRolling.value = true;
  const picked = getRandomAcademicNickname();
  const nextStyle = getRandomAvatarStyle(selectedStyle.value);

  inputNickname.value = picked;
  appliedNickname.value = picked;
  selectedStyle.value = nextStyle;

  setTimeout(() => {
    isRolling.value = false;
  }, 500);
}

function selectStyle(styleId: AvatarStyle) {
  selectedStyle.value = styleId;
}

const loadNewAdvice = async () => {
  try {
    currentAdvice.value = await fetchAdvice(getRandomAdvice, 'Erro ao carregar dica.');
  } catch {
    // Erro já é notificado pelo useAsyncOperation (ADR-005)
  }
};

onMounted(() => {
  void loadNewAdvice();
});
</script>

<template>
  <div class="tw-space-y-6 tw-w-full">
    <!-- Status Original -->
    <div class="tw-space-y-2">
      <q-icon name="hourglass_empty" size="4rem" color="primary" class="tw-animate-pulse" />
      <h2 class="tw-text-2xl tw-font-bold tw-text-primary">Aguardando o professor</h2>
      <p class="text-muted">
        A aula de <strong>{{ topic || 'Sem Tópico' }}</strong> logo vai começar.
      </p>
    </div>

    <!-- Mashup Nível 4: DiceBear Avatar + Advice Slip -->
    <BaseSurfaceCard variant="glass" class="tw-p-6 tw-flex tw-flex-col tw-items-center tw-gap-4">
      <div class="tw-flex tw-items-center tw-justify-between tw-w-full">
        <h3 class="tw-text-lg tw-font-bold tw-text-primary tw-m-0">Crie seu Avatar</h3>
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
        Personalize seu personagem acadêmico enquanto aguarda o início da aula!
      </p>

      <!-- Avatar Display com Moldura e Fallback Gracioso -->
      <div class="tw-relative">
        <div
          class="tw-w-32 tw-h-32 tw-rounded-full tw-overflow-hidden bg-grey-2 dark:bg-grey-9 tw-flex tw-items-center tw-justify-center tw-shadow-inner tw-ring-4 tw-ring-primary/20 tw-transition-all"
        >
          <q-img
            :src="avatarUrl"
            :error-src="fallbackAvatarUrl"
            class="tw-w-full tw-h-full"
            spinner-color="primary"
            transition="fade"
          />
        </div>

        <!-- Botão rápido de dados da sorte flutuante -->
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
              title="Confirmar apelido e gerar avatar"
              @click="applyNickname"
            >
              <q-tooltip>Confirmar (ou pressione Enter)</q-tooltip>
            </q-btn>
          </template>
        </q-input>
        <span class="tw-text-[10px] text-muted tw-block tw-text-center tw-mt-1">
          Pressione
          <kbd class="tw-px-1 tw-py-0.5 tw-bg-grey-3 dark:tw-bg-grey-8 tw-rounded tw-text-[9px]"
            >Enter</kbd
          >
          para atualizar o avatar
        </span>
      </div>

      <!-- Advice Slip API Section -->
      <BaseSurfaceCard variant="flat" class="tw-w-full tw-max-w-sm tw-mt-4 tw-p-4">
        <div class="tw-flex tw-justify-between tw-items-center tw-mb-2">
          <span class="tw-text-xs tw-font-bold tw-uppercase text-muted">Conselho do Dia</span>
          <q-btn
            icon="refresh"
            flat
            round
            dense
            size="sm"
            color="primary"
            :loading="isFetchingAdvice"
            @click="loadNewAdvice"
          />
        </div>

        <div v-if="isFetchingAdvice" class="tw-space-y-2">
          <q-skeleton type="text" width="100%" />
          <q-skeleton type="text" width="80%" />
        </div>
        <p v-else class="text-body2 tw-italic tw-text-center">"{{ currentAdvice || '...' }}"</p>
      </BaseSurfaceCard>
    </BaseSurfaceCard>
  </div>
</template>
