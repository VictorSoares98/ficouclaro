import { defineStore } from 'pinia';
import { ref } from 'vue';
import { sessionService, type Sessao } from '../services/session.service';
import { realtimeManager } from '../../../core/supabase/realtime.manager';
import type { RealtimePostgresUpdatePayload } from '@supabase/supabase-js';

export const useSessionStore = defineStore('session', () => {
  const currentSession = ref<Sessao | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Carrega a sessão e assina o canal Realtime para escutar mudanças (ex: professor inicia ou encerra)
   */
  async function joinSession(sessionId: string) {
    isLoading.value = true;
    error.value = null;
    try {
      currentSession.value = await sessionService.getSessionById(sessionId);

      // Assinar as mudanças dessa sessão específica
      const channel = realtimeManager.getChannel(`session-${sessionId}`);
      channel
        .on(
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
        )
        .subscribe();
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Erro ao entrar na sessão.';
      throw err instanceof Error ? err : new Error(error.value);
    } finally {
      isLoading.value = false;
    }
  }

  function leaveSession() {
    if (currentSession.value) {
      realtimeManager.releaseChannel(`session-${currentSession.value.id}`);
      currentSession.value = null;
    }
  }

  async function createSession(professorId: string, disciplinaId: string, topico?: string) {
    try {
      const novaSessao = await sessionService.createSession(professorId, disciplinaId, topico);
      await joinSession(novaSessao.id); // Já assina o canal
      return novaSessao;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Erro ao criar sessão.';
      throw err instanceof Error ? err : new Error(error.value);
    }
  }

  async function startSession() {
    if (!currentSession.value) throw new Error('Nenhuma sessão carregada');
    try {
      await sessionService.startSession(currentSession.value.id);
      // Não precisa atualizar `currentSession.value` manualmente pois o Realtime fará isso
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Erro ao iniciar aula.';
      throw err instanceof Error ? err : new Error(error.value);
    }
  }

  async function endSession() {
    if (!currentSession.value) throw new Error('Nenhuma sessão carregada');
    try {
      await sessionService.endSession(currentSession.value.id);
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Erro ao encerrar sessão.';
      throw err instanceof Error ? err : new Error(error.value);
    }
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
  };
});
