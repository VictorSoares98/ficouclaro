import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  dashboardService,
  type SessionInsights,
} from '@/modules/dashboard/services/dashboard.service';
import { useAsyncOperation } from '@/core/composables/useAsyncOperation';

export const useDashboardStore = defineStore('dashboard', () => {
  const insights = ref<SessionInsights[]>([]);
  const currentCourseId = ref<string | null>(null);
  const { isLoading, error, execute } = useAsyncOperation();

  async function loadCourseInsights(cursoId: string) {
    // Evita recarregar se for o mesmo curso, a menos que seja forçado
    if (currentCourseId.value === cursoId && insights.value.length > 0) return;

    currentCourseId.value = cursoId;
    return execute(async () => {
      insights.value = await dashboardService.getCourseInsights(cursoId);
    }, 'Erro ao carregar insights do curso.');
  }

  function forceReload() {
    if (currentCourseId.value) {
      const id = currentCourseId.value;
      currentCourseId.value = null; // força limpeza do cache visual
      return loadCourseInsights(id);
    }
  }

  // Agregações Globais
  const globalAverageRating = computed(() => {
    const validSessions = insights.value.filter((s) => s.total_avaliacoes > 0);
    if (validSessions.length === 0) return 0;
    const sum = validSessions.reduce((acc, curr) => acc + curr.media_estrelas, 0);
    return Number((sum / validSessions.length).toFixed(1));
  });

  const totalQuestions = computed(() => {
    return insights.value.reduce((acc, curr) => acc + curr.total_duvidas, 0);
  });

  const totalPaceSignals = computed(() => {
    return insights.value.reduce((acc, curr) => acc + curr.total_sinais, 0);
  });

  // Sessão com pior avaliação (que tenha ao menos 1 avaliação)
  const lowestRatedSession = computed(() => {
    const valid = insights.value.filter((s) => s.total_avaliacoes > 0);
    if (valid.length === 0) return null;
    return valid.reduce((prev, curr) => (curr.media_estrelas < prev.media_estrelas ? curr : prev));
  });

  return {
    insights,
    isLoading,
    error,
    currentCourseId,
    loadCourseInsights,
    forceReload,
    globalAverageRating,
    totalQuestions,
    totalPaceSignals,
    lowestRatedSession,
  };
});
