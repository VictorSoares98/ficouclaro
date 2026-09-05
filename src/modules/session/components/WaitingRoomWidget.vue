<script setup lang="ts">
import { ref, computed } from 'vue';
import BaseSurfaceCard from '@/core/components/BaseSurfaceCard.vue';
import { getAvatarUrl } from '@/core/services/api/avatar.service';

defineProps<{
  topic?: string | null;
}>();

const nickname = ref('');

const avatarUrl = computed(() => {
  if (!nickname.value) return getAvatarUrl('Aluno');
  return getAvatarUrl(nickname.value);
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

    <!-- Mashup Nível 4: DiceBear Avatar -->
    <BaseSurfaceCard variant="glass" class="tw-p-6 tw-flex tw-flex-col tw-items-center tw-gap-4">
      <h3 class="tw-text-lg tw-font-bold tw-text-primary">Crie seu Avatar</h3>
      <p class="text-muted tw-text-sm">
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
    </BaseSurfaceCard>
  </div>
</template>
