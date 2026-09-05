<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import BaseSurfaceCard from '@/core/components/BaseSurfaceCard.vue';
import { getAvatarUrl } from '@/core/services/api/avatar.service';
import { getRandomAdvice } from '@/core/services/api/quotes.service';
import { useAsyncOperation } from '@/core/composables/useAsyncOperation';

defineProps<{
  topic?: string | null;
}>();

const nickname = ref('');
const currentAdvice = ref<string>('');

const { isLoading: isFetchingAdvice, execute: fetchAdvice } = useAsyncOperation();

const avatarUrl = computed(() => {
  if (!nickname.value) return getAvatarUrl('Aluno');
  return getAvatarUrl(nickname.value);
});

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
      <h3 class="tw-text-lg tw-font-bold tw-text-primary">Crie seu Avatar</h3>
      <p class="text-muted tw-text-sm tw-text-center">
        Enquanto a aula não começa, digite um apelido para gerar seu robô único!
      </p>

      <div
        class="tw-w-32 tw-h-32 tw-rounded-full tw-overflow-hidden tw-bg-slate-100 dark:tw-bg-slate-800 tw-flex tw-items-center tw-justify-center tw-shadow-inner"
      >
        <q-img
          :src="avatarUrl"
          class="tw-w-full tw-h-full"
          spinner-color="primary"
          transition="fade"
        />
      </div>

      <q-input
        v-model="nickname"
        outlined
        dense
        placeholder="Seu apelido..."
        class="tw-w-full tw-max-w-xs"
        color="primary"
        debounce="300"
      >
        <template v-slot:prepend>
          <q-icon name="smart_toy" />
        </template>
      </q-input>

      <!-- Advice Slip API Section -->
      <div
        class="tw-w-full tw-max-w-sm tw-mt-4 tw-p-4 tw-bg-white/50 dark:tw-bg-black/20 tw-rounded-lg tw-border tw-border-slate-200 dark:tw-border-slate-700"
      >
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
        <p v-else class="tw-text-sm tw-italic tw-text-center">"{{ currentAdvice || '...' }}"</p>
      </div>
    </BaseSurfaceCard>
  </div>
</template>
