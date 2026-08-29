import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { flashReviewService } from '@/modules/flash-review/services/flashReview.service';
import type { Database } from '@/core/types/database.types';
import { useAsyncOperation } from '@/core/composables/useAsyncOperation';
import type { Ref, ComputedRef } from 'vue';

// ACL (Anti-Corruption Layer)
export interface AvaliacaoRapida {
  id: string;
  sessao_id: string;
  nota: number;
  comentario: string | null;
  created_at: string;
}

export type AvaliacaoInsertRow = Database['public']['Tables']['avaliacoes_rapidas']['Insert'];

export interface FlashReviewStore {
  sessionReviews: Ref<AvaliacaoRapida[]>;
  isLoading: Ref<boolean>;
  error: Ref<string | null>;
  averageRating: ComputedRef<number>;
  hasReviewedSession: (sessionId: string) => boolean;
  submitReview: (review: AvaliacaoInsertRow) => Promise<void>;
  loadSessionReviews: (sessionId: string) => Promise<void>;
  markAsSkipped: (sessionId: string) => void;
}

export const useFlashReviewStore = defineStore('flashReview', (): FlashReviewStore => {
  const sessionReviews = ref<AvaliacaoRapida[]>([]);
  const { isLoading, error, execute } = useAsyncOperation();

  // Guarda IDs das sessões já avaliadas no LocalStorage para evitar reabertura infinita/voto duplo
  const reviewedSessions = ref<string[]>(
    JSON.parse(localStorage.getItem('ficouclaro_reviews') || '[]'),
  );

  const averageRating = computed(() => {
    if (sessionReviews.value.length === 0) return 0;
    const sum = sessionReviews.value.reduce((acc, curr) => acc + curr.nota, 0);
    return sum / sessionReviews.value.length;
  });

  function saveReviewedToStorage() {
    localStorage.setItem('ficouclaro_reviews', JSON.stringify(reviewedSessions.value));
  }

  function hasReviewedSession(sessionId: string): boolean {
    return reviewedSessions.value.includes(sessionId);
  }

  function markAsSkipped(sessionId: string) {
    if (!reviewedSessions.value.includes(sessionId)) {
      reviewedSessions.value.push(sessionId);
      saveReviewedToStorage();
    }
  }

  async function submitReview(review: AvaliacaoInsertRow): Promise<void> {
    await execute(async (): Promise<void> => {
      await flashReviewService.submitReview(review);
      if (!reviewedSessions.value.includes(review.sessao_id)) {
        reviewedSessions.value.push(review.sessao_id);
        saveReviewedToStorage();
      }
    }, 'Erro ao enviar avaliação');
  }

  async function loadSessionReviews(sessionId: string): Promise<void> {
    await execute(async (): Promise<void> => {
      const data = await flashReviewService.getReviewsForSession(sessionId);

      const parsed: AvaliacaoRapida[] = [];
      for (const d of data) {
        parsed.push({
          id: d.id,
          sessao_id: d.sessao_id,
          nota: d.nota,
          comentario: d.comentario,
          created_at: d.created_at,
        });
      }

      sessionReviews.value = parsed;
    }, 'Erro ao carregar avaliações');
  }

  return {
    sessionReviews,
    isLoading,
    error,
    averageRating,
    hasReviewedSession,
    submitReview,
    loadSessionReviews,
    markAsSkipped,
  };
});
