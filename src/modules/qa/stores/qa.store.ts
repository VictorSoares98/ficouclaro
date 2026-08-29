import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { qaService, type Duvida } from '@/modules/qa/services/qa.service';
import { realtimeManager } from '@/core/supabase/realtime.manager';
import { useAsyncOperation } from '@/core/composables/useAsyncOperation';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { generateVoterHash } from '@/modules/qa/utils/hash';
import { useAuthStore } from '@/stores/auth.store';

export const useQaStore = defineStore('qa', () => {
  const questions = ref<Duvida[]>([]);
  const { isLoading, error, execute } = useAsyncOperation();
  const authStore = useAuthStore();

  const currentSessionId = ref<string | null>(null);

  // Cache local para os upvotes que este usuário já deu
  const myUpvotes = ref<Set<string>>(new Set());

  // Getter ordenado: Dúvidas respondidas vão para o fim, depois ordenado por votos.
  const sortedQuestions = computed(() => {
    return [...questions.value].sort((a, b) => {
      if (a.foi_respondida && !b.foi_respondida) return 1;
      if (!a.foi_respondida && b.foi_respondida) return -1;

      if (a.votos === b.votos) {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return b.votos - a.votos;
    });
  });

  async function subscribeToSession(sessionId: string) {
    if (currentSessionId.value === sessionId) return;
    currentSessionId.value = sessionId;

    return execute(async () => {
      questions.value = await qaService.fetchQuestions(sessionId);

      const channel = realtimeManager.getChannel(`room-${sessionId}`);

      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'duvidas',
          filter: `sessao_id=eq.${sessionId}`,
        },
        (payload: RealtimePostgresChangesPayload<Duvida>) => {
          if (payload.eventType === 'INSERT') {
            questions.value.push(payload.new);
          }
        },
      );

      channel.on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'duvidas',
          filter: `sessao_id=eq.${sessionId}`,
        },
        (payload: RealtimePostgresChangesPayload<Duvida>) => {
          if (payload.eventType === 'UPDATE') {
            const index = questions.value.findIndex((q) => q.id === payload.new.id);
            if (index !== -1) {
              questions.value[index] = payload.new;
            }
          }
        },
      );

      realtimeManager.subscribe(`qa-${sessionId}`);
    }, 'Erro ao carregar dúvidas.');
  }

  function unsubscribeFromSession(sessionId: string) {
    if (currentSessionId.value !== sessionId) return;
    currentSessionId.value = null;

    realtimeManager.releaseChannel(`room-${sessionId}`);
    questions.value = [];
    myUpvotes.value.clear();
  }

  async function submitQuestion(sessionId: string, texto: string) {
    return execute(async () => {
      await qaService.submitQuestion(sessionId, texto);
    }, 'Erro ao enviar pergunta.');
  }

  async function upvoteQuestion(questionId: string) {
    if (myUpvotes.value.has(questionId)) return;

    const userId = authStore.user?.auth.id;
    if (!userId) return;

    try {
      const hash = await generateVoterHash(`${userId}-${questionId}`);
      await qaService.upvoteQuestion(questionId, hash);
      myUpvotes.value.add(questionId);
    } catch (e) {
      console.error('Erro ao votar:', e);
    }
  }

  async function markAsAnswered(questionId: string) {
    return execute(async () => {
      await qaService.markAsAnswered(questionId);
    }, 'Erro ao marcar como respondida.');
  }

  return {
    questions,
    sortedQuestions,
    myUpvotes,
    isLoading,
    error,
    subscribeToSession,
    unsubscribeFromSession,
    submitQuestion,
    upvoteQuestion,
    markAsAnswered,
  };
});
