import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  sessionService,
  type Sessao,
  type CourseSessionInfo,
} from '@/modules/session/services/session.service';
import { realtimeManager } from '@/core/supabase/realtime.manager';
import { useAsyncOperation } from '@/core/composables/useAsyncOperation';
import type {
  RealtimePostgresInsertPayload,
  RealtimePostgresUpdatePayload,
} from '@supabase/supabase-js';

export const useSessionStore = defineStore('session', () => {
  const currentSession = ref<Sessao | null>(null);
  const coursesSessions = ref<Record<string, CourseSessionInfo | null>>({});
  const { isLoading, error, execute } = useAsyncOperation();
  const hasSubscribed = ref(false);
  const isCoursesSubscribed = ref(false);

  function getCoursesMap(): Record<string, CourseSessionInfo | null> {
    if (!coursesSessions.value) {
      coursesSessions.value = {};
    }
    return coursesSessions.value;
  }

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
      const sessao = await sessionService.createSession(professorId, disciplinaId, topico);
      getCoursesMap()[disciplinaId] = {
        id: sessao.id,
        status: sessao.status,
        topico: sessao.topico,
      };
      return sessao;
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
      if (updated.disciplina_id) {
        getCoursesMap()[updated.disciplina_id] = {
          id: updated.id,
          status: updated.status,
          topico: updated.topico,
        };
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
      if (updated.disciplina_id) {
        getCoursesMap()[updated.disciplina_id] = null;
      }
    }, 'Erro ao encerrar sessão.');
  }

  async function getActiveSession(courseId: string): Promise<string> {
    return execute(async () => {
      return await sessionService.getActiveSessionByCourse(courseId);
    }, 'Erro ao buscar aula ativa.');
  }

  /**
   * Busca e sincroniza o estado ativo inicial de uma lista de disciplinas
   */
  async function fetchCoursesSessions(courseIds: string[]) {
    if (courseIds.length === 0) return;
    try {
      const activeMap = await sessionService.getActiveSessionsForCourses(courseIds);
      const map = getCoursesMap();
      courseIds.forEach((id) => {
        map[id] = activeMap[id] || null;
      });
    } catch (err: unknown) {
      console.warn('Erro ao carregar status das turmas:', err);
    }
  }

  /**
   * Assina o canal Realtime para escutar mudanças de status em todas as sessões em tempo real
   */
  function subscribeToCoursesSessions() {
    const channelName = 'courses-sessions-live';
    const channel = realtimeManager.getChannel(channelName);

    if (!isCoursesSubscribed.value) {
      isCoursesSubscribed.value = true;

      channel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'sessoes',
          },
          (payload: RealtimePostgresInsertPayload<Sessao>) => {
            const newSessao = payload.new;
            if (
              newSessao?.disciplina_id &&
              (newSessao.status === 'aguardando' || newSessao.status === 'ativa')
            ) {
              getCoursesMap()[newSessao.disciplina_id] = {
                id: newSessao.id,
                status: newSessao.status,
                topico: newSessao.topico,
              };
            }
          },
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'sessoes',
          },
          (payload: RealtimePostgresUpdatePayload<Sessao>) => {
            const updated = payload.new;
            if (updated?.disciplina_id) {
              const map = getCoursesMap();
              if (updated.status === 'encerrada') {
                if (map[updated.disciplina_id]?.id === updated.id) {
                  map[updated.disciplina_id] = null;
                }
              } else {
                map[updated.disciplina_id] = {
                  id: updated.id,
                  status: updated.status,
                  topico: updated.topico,
                };
              }
            }
          },
        );

      realtimeManager.subscribe(channelName);
    }
  }

  /**
   * Libera a assinatura do canal Realtime de sessões
   */
  function unsubscribeCoursesSessions() {
    const channelName = 'courses-sessions-live';
    realtimeManager.releaseChannel(channelName);
    isCoursesSubscribed.value = false;
  }

  return {
    currentSession,
    coursesSessions,
    isLoading,
    error,
    joinSession,
    leaveSession,
    createSession,
    startSession,
    endSession,
    getActiveSession,
    fetchCoursesSessions,
    subscribeToCoursesSessions,
    unsubscribeCoursesSessions,
  };
});
