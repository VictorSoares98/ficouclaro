import { defineStore } from 'pinia';
import { ref } from 'vue';
import { sessionService, type Sessao } from '../services/session.service';
import { realtimeManager } from '../../../core/supabase/realtime.manager';
import { useAsyncOperation } from '../../../core/composables/useAsyncOperation';
import type { RealtimePostgresUpdatePayload } from '@supabase/supabase-js';

export const useSessionStore = defineStore('session', () => {
  const currentSession = ref<Sessao | null>(null);
  const { isLoading, error, execute } = useAsyncOperation();

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
            currentSession.value.status = payload.new.status;
            currentSession.value.iniciada_em = payload.new.iniciada_em;
            currentSession.value.encerrada_em = payload.new.encerrada_em;
          }
        },
      );
      realtimeManager.subscribe(`session-${sessionId}`);
    }, 'Erro ao entrar na sessão.');
  }

  function leaveSession() {
    if (currentSession.value) {
      realtimeManager.releaseChannel(`session-${currentSession.value.id}`);
      currentSession.value = null;
    }
  }

  async function createSession(professorId: string, disciplinaId: string, topico?: string) {
    return execute(async () => {
      return await sessionService.createSession(professorId, disciplinaId, topico);
    }, 'Erro ao criar sessão.');
  }

  async function startSession() {
    if (!currentSession.value) throw new Error('Nenhuma sessão carregada');

    return execute(async () => {
      const updated = await sessionService.startSession(currentSession.value!.id);
      currentSession.value!.status = updated.status;
      currentSession.value!.iniciada_em = updated.iniciada_em;
    }, 'Erro ao iniciar aula.');
  }

  async function endSession() {
    if (!currentSession.value) throw new Error('Nenhuma sessão carregada');

    return execute(async () => {
      const updated = await sessionService.endSession(currentSession.value!.id);
      currentSession.value!.status = updated.status;
      currentSession.value!.encerrada_em = updated.encerrada_em;
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
