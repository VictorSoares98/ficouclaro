<script setup lang="ts">
import { onMounted } from 'vue';
import { useFlashReviewStore } from '@/modules/flash-review/stores/flashReview.store';

const props = defineProps<{
  sessionId: string;
}>();

const flashReviewStore = useFlashReviewStore();

onMounted(() => {
  void flashReviewStore.loadSessionReviews(props.sessionId);
});
</script>

<template>
  <div class="tw-h-full tw-flex tw-flex-col">
    <!-- Header / Resumo -->
    <div
      class="tw-bg-white dark:tw-bg-dark tw-rounded-2xl tw-p-6 tw-shadow-sm tw-mb-4 tw-text-center"
    >
      <div class="tw-text-lg tw-font-medium text-muted">Média da Aula</div>
      <div class="tw-text-5xl tw-font-bold tw-text-primary tw-my-2">
        {{ flashReviewStore.averageRating.toFixed(1) }}
      </div>
      <q-rating
        :model-value="flashReviewStore.averageRating"
        size="2em"
        color="warning"
        readonly
        icon="star_border"
        icon-selected="star"
        icon-half="star_half"
      />
      <div class="tw-text-sm text-hint tw-mt-2">
        baseado em {{ flashReviewStore.sessionReviews.length }} avaliações
      </div>
    </div>

    <!-- Lista de Comentários -->
    <div class="tw-flex-1 tw-overflow-y-auto">
      <div v-if="flashReviewStore.isLoading" class="tw-flex tw-justify-center tw-p-8">
        <q-spinner color="primary" size="3em" />
      </div>

      <div
        v-else-if="flashReviewStore.sessionReviews.length === 0"
        class="tw-text-center text-hint tw-p-8"
      >
        Nenhuma avaliação recebida ainda.
      </div>

      <div v-else class="tw-space-y-4">
        <q-card
          v-for="review in flashReviewStore.sessionReviews.filter((r) => r.comentario)"
          :key="review.id"
          flat
          bordered
          class="tw-rounded-xl"
        >
          <q-card-section>
            <div class="tw-flex tw-justify-between tw-items-start tw-mb-2">
              <q-rating :model-value="review.nota" size="1.2em" color="warning" readonly />
              <span class="tw-text-xs text-hint">
                {{ new Date(review.created_at).toLocaleTimeString() }}
              </span>
            </div>
            <div class="tw-text-sm">
              {{ review.comentario }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>
