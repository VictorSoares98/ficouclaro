import { defineStore } from 'pinia';
import { ref } from 'vue';
import { sessionService, type Sessao } from '@/modules/session/services/session.service';
import { realtimeManager } from '@/core/supabase/realtime.manager';
import { useAsyncOperation } from '@/core/composables/useAsyncOperation';
import type { RealtimePostgresUpdatePayload } from '@supabase/supabase-js';

export const useSessionStore = defineStore('session', () => {
  const currentSession = ref<Sessao | null>(null);
  const { isLoading, error, execute } = useAsyncOperation();
  const hasSubscribed = ref(false);

  /**
   * Carrega a sessão e assina o canal Realtime para escutar mudanças (ex: professor inicia ou encerra)
   */
  async function joinSession(sessionId: string) {
    if (currentSession.value?.id === sessionId) {
      return; // Proteção contra double-subscribe (ex: createSession + onMounted)
    }

    if (currentSession.value) {
      leaveSession(); // Limpa a anterior se estiver trocando de sala
    }

    return execute(async () => {
      currentSession.value = await sessionService.getSessionById(sessionId);

      // Assinar as mudanças dessa sessão específica
      if (!hasSubscribed.value) {
        hasSubscribed.value = true;
        const channel = realtimeManager.getChannel(`session-${sessionId}`);
        channel.on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'sessoes',
            filter: `id=eq.${sessionId}`,
          },
          (payload: RealtimePostgresUpdatePayload<Sessao>) => {
            // Atualizar estado local quando o BD mudar
            if (currentSession.value) {
              currentSession.value = payload.new;
            }
          },
        );
        realtimeManager.subscribe(`session-${sessionId}`);
      }
    }, 'Erro ao entrar na sessão.');
  }

  function leaveSession() {
    if (currentSession.value) {
      if (hasSubscribed.value) {
        realtimeManager.releaseChannel(`session-${currentSession.value.id}`);
        hasSubscribed.value = false;
      }
      currentSession.value = null;
    }
  }

  async function createSession(professorId: string, disciplinaId: string, topico?: string) {
    return execute(async () => {
      return await sessionService.createSession(professorId, disciplinaId, topico);
    }, 'Erro ao criar sessão.');
  }

  async function startSession() {
    const session = currentSession.value;
    if (!session) throw new Error('Nenhuma sessão carregada');

    return execute(async () => {
      const updated = await sessionService.startSession(session.id);
      if (currentSession.value) {
        currentSession.value = updated;
      }
    }, 'Erro ao iniciar aula.');
  }

  async function endSession() {
    const session = currentSession.value;
    if (!session) throw new Error('Nenhuma sessão carregada');

    return execute(async () => {
      const updated = await sessionService.endSession(session.id);
      if (currentSession.value) {
        currentSession.value = updated;
      }
    }, 'Erro ao encerrar sessão.');
  }

  async function getActiveSession(courseId: string): Promise<string> {
    return execute(async () => {
      return await sessionService.getActiveSessionByCourse(courseId);
    }, 'Erro ao buscar aula ativa.');
  }

  return {
    currentSession,
    isLoading,
    error,
    joinSession,
    leaveSession,
    createSession,
    startSession,
    endSession,
    getActiveSession,
  };
});
