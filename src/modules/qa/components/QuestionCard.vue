<script setup lang="ts">
import type { Duvida } from '@/modules/qa/services/qa.service';
import { useAuthStore } from '@/stores/auth.store';
import { computed } from 'vue';
import BaseIconButton from '@/core/components/BaseIconButton.vue';
import BaseSurfaceCard from '@/core/components/BaseSurfaceCard.vue';

const props = defineProps<{
  question: Duvida;
  hasUpvoted: boolean;
}>();

const emit = defineEmits<{
  (e: 'upvote', id: string): void;
  (e: 'mark-answered', id: string): void;
}>();

const authStore = useAuthStore();
const isProfessor = computed(() => authStore.user?.perfil.papel === 'professor');

function handleUpvote() {
  if (!props.hasUpvoted && !isProfessor.value) {
    emit('upvote', props.question.id);
  }
}

function handleAnswered() {
  if (isProfessor.value && !props.question.foi_respondida) {
    emit('mark-answered', props.question.id);
  }
}
</script>

<template>
  <BaseSurfaceCard
    variant="flat"
    class="tw-p-4 tw-w-full"
    :class="{ 'tw-opacity-60': question.foi_respondida }"
  >
    <div class="tw-flex tw-gap-3">
      <!-- Votos -->
      <div class="tw-flex tw-flex-col tw-items-center tw-justify-start tw-w-12">
        <BaseIconButton
          :icon="hasUpvoted ? 'thumb_up' : 'thumb_up_off_alt'"
          :color="hasUpvoted ? 'primary' : 'grey'"
          :disable="isProfessor || question.foi_respondida || hasUpvoted"
          ariaLabel="Votar nesta dúvida"
          @click="handleUpvote"
        />
        <span class="tw-font-bold tw-text-lg" :class="{ 'tw-text-primary': hasUpvoted }">
          {{ question.votos }}
        </span>
      </div>

      <!-- Conteúdo -->
      <div class="tw-flex-1 tw-flex tw-flex-col tw-justify-center">
        <p class="tw-text-sm tw-m-0 tw-leading-relaxed tw-whitespace-pre-wrap">
          {{ question.texto }}
        </p>
      </div>

      <!-- Actions Professor & Status -->
      <div class="tw-flex tw-flex-col tw-items-end tw-justify-between">
        <q-badge v-if="question.foi_respondida" color="positive" class="tw-mb-2">
          Respondida
        </q-badge>

        <BaseIconButton
          v-if="isProfessor && !question.foi_respondida"
          icon="check_circle"
          color="positive"
          title="Marcar como respondida"
          ariaLabel="Marcar dúvida como respondida"
          @click="handleAnswered"
        />
      </div>
    </div>
  </BaseSurfaceCard>
</template>
