import { defineStore } from 'pinia';
import { ref } from 'vue';
import { pollService } from '@/modules/poll/services/poll.service';
import type { Database, Json } from '@/core/types/database.types';
import { useAsyncOperation } from '@/core/composables/useAsyncOperation';
import { realtimeManager } from '@/core/supabase/realtime.manager';
import type {
  RealtimePostgresInsertPayload,
  RealtimePostgresUpdatePayload,
} from '@supabase/supabase-js';

// Anti-corruption layer: Tipos locais planos para evitar limite de recursão (TS2589) no Pinia
export interface Resposta {
  id: string;
  created_at: string;
  enquete_id: string;
  resposta: Json;
}

export interface Enquete {
  id: string;
  created_at: string;
  pergunta: string;
  tipo: 'multipla_escolha' | 'nuvem_palavras' | 'escala_clareza' | 'ranking';
  opcoes: unknown;
  status: 'rascunho' | 'ativa' | 'encerrada';
  sessao_id: string;
  encerrada_em: string | null;
}

export type EnqueteInsertRow = Database['public']['Tables']['enquetes']['Insert'];

export const usePollStore = defineStore('poll', () => {
  const activePolls = ref<Enquete[]>([]);
  const pastPolls = ref<Enquete[]>([]);
  const pollResults = ref<Record<string, Resposta[]>>({});

  // Controle de votos locais (para o aluno)
  const myResponses = ref<string[]>(JSON.parse(localStorage.getItem('ficouclaro_polls') || '[]'));

  const { isLoading, error, execute } = useAsyncOperation();

  const currentSessionId = ref<string | null>(null);

  function markAsResponded(pollId: string) {
    if (!myResponses.value.includes(pollId)) {
      myResponses.value.push(pollId);
      localStorage.setItem('ficouclaro_polls', JSON.stringify(myResponses.value));
    }
  }

  function hasResponded(pollId: string): boolean {
    return myResponses.value.includes(pollId);
  }

  async function loadActivePolls(sessionId: string): Promise<void> {
    await execute(async (): Promise<void> => {
      activePolls.value = await pollService.getActivePollsForSession(sessionId);
    }, 'Erro ao carregar enquetes ativas');
  }

  async function loadAllPolls(sessionId: string): Promise<void> {
    await execute(async (): Promise<void> => {
      const all: Enquete[] = await pollService.getAllPollsForSession(sessionId);

      const active: Enquete[] = [];
      const past: Enquete[] = [];

      for (const p of all) {
        if (p.status === 'ativa') {
          active.push(p);
        } else if (p.status === 'encerrada' || p.status === 'rascunho') {
          past.push(p);
        }
      }

      activePolls.value = active;
      pastPolls.value = past;
    }, 'Erro ao carregar enquetes');
  }

  async function loadResultsForPoll(pollId: string): Promise<void> {
    await execute(async (): Promise<void> => {
      const results = await pollService.getPollResults(pollId);
      pollResults.value[pollId] = results;
    }, 'Erro ao carregar resultados');
  }

  async function createPoll(enquete: EnqueteInsertRow): Promise<void> {
    await execute(async (): Promise<void> => {
      const newPoll: Enquete = await pollService.createPoll(enquete);
      const currentPast = pastPolls.value;
      currentPast.unshift(newPoll);
    }, 'Erro ao criar enquete');
  }

  async function activatePoll(pollId: string): Promise<void> {
    await execute(async (): Promise<void> => {
      await pollService.activatePoll(pollId);
      // Movendo localmente se o real-time demorar (Otimismo)
      const pollIndex = pastPolls.value.findIndex((p) => p.id === pollId);
      if (pollIndex !== -1) {
        const poll = pastPolls.value[pollIndex];
        if (poll) {
          poll.status = 'ativa';
          const currentActive = activePolls.value;
          currentActive.push(poll);

          const currentPast = pastPolls.value;
          currentPast.splice(pollIndex, 1);
        }
      }
    }, 'Erro ao ativar enquete');
  }

  async function closePoll(pollId: string): Promise<void> {
    await execute(async (): Promise<void> => {
      await pollService.closePoll(pollId);
      // Movendo localmente
      const pollIndex = activePolls.value.findIndex((p) => p.id === pollId);
      if (pollIndex !== -1) {
        const poll = activePolls.value[pollIndex];
        if (poll) {
          poll.status = 'encerrada';
          const currentPast = pastPolls.value;
          currentPast.unshift(poll);

          const currentActive = activePolls.value;
          currentActive.splice(pollIndex, 1);
        }
      }
    }, 'Erro ao encerrar enquete');
  }

  async function submitResponse(pollId: string, respostaData: Json): Promise<void> {
    await execute(async (): Promise<void> => {
      if (hasResponded(pollId)) {
        throw new Error('Você já respondeu a esta enquete.');
      }
      await pollService.submitResponse({ enquete_id: pollId, resposta: respostaData });
      markAsResponded(pollId);
    }, 'Erro ao enviar resposta');
  }

  // --- REALTIME SUBSCRIPTIONS ---

  // Buffer de respostas (Throttle protection)
  let responseBuffer: Resposta[] = [];
  let bufferTimeout: number | null = null;

  function flushBuffer() {
    if (responseBuffer.length === 0) return;

    // Agrupa e commita as respostas de uma vez no ref
    responseBuffer.forEach((resp) => {
      const id = resp.enquete_id;
      if (!pollResults.value[id]) {
        pollResults.value[id] = [];
      }
      pollResults.value[id]?.push(resp);
    });

    // Força a reatividade do objeto inteiro para o Vue notar
    pollResults.value = { ...pollResults.value };

    responseBuffer = [];
    bufferTimeout = null;
  }

  function subscribeToSessionPolls(sessionId: string, isProfessor = false) {
    if (currentSessionId.value === sessionId) return;
    currentSessionId.value = sessionId;

    const channelName = `poll-${sessionId}`;
    const channel = realtimeManager.getChannel(channelName);

    // Escutar por novas enquetes ou alterações de status
    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'enquetes', filter: `sessao_id=eq.${sessionId}` },
      (payload: RealtimePostgresInsertPayload<Enquete>) => {
        if (payload.new.status === 'ativa') {
          activePolls.value.unshift(payload.new);
        } else if (isProfessor) {
          pastPolls.value.unshift(payload.new);
        }
      },
    );

    channel.on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'enquetes', filter: `sessao_id=eq.${sessionId}` },
      (payload: RealtimePostgresUpdatePayload<Enquete>) => {
        const updatedPoll = payload.new;

        // Remove das ativas se encerrou
        if (updatedPoll.status === 'encerrada') {
          activePolls.value = activePolls.value.filter((p) => p.id !== updatedPoll.id);
          if (isProfessor && !pastPolls.value.find((p) => p.id === updatedPoll.id)) {
            pastPolls.value.unshift(updatedPoll);
          }
        }
        // Adiciona nas ativas se ativou
        else if (updatedPoll.status === 'ativa') {
          if (!activePolls.value.find((p) => p.id === updatedPoll.id)) {
            activePolls.value.unshift(updatedPoll);
          }
          if (isProfessor) {
            pastPolls.value = pastPolls.value.filter((p) => p.id !== updatedPoll.id);
          }
        }
      },
    );

    // Escutar por respostas (só interessa ao professor)
    if (isProfessor) {
      // Como o filter do supabase só aceita =eq em colunas simples e não temos array_contains,
      // a regra ideal seria filtrar por enquete_id. Como não sabemos quais enquetes podem receber respostas,
      // vamos escutar todas e filtrar no código.
      // O Supabase não permite filtrar por multiplos IDs em OR.
      // Solução pragmática: escutar todas as respostas e descartar as que não pertencem a essa sessão
      // (Isso será tratado pelo fato de que o canal de session não tem como filtrar tabela filha sem trigger)

      // Wait, a better approach for responses is to use a specific channel per poll? No, limits.
      // We can listen to all respostas_enquete and the RLS or client checks if it belongs to our poll.
      channel.on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'respostas_enquete' },
        (payload: RealtimePostgresInsertPayload<Resposta>) => {
          // Verifica se a resposta pertence a alguma enquete (ativa ou não) que conhecemos
          const belongsToUs =
            activePolls.value.some((p) => p.id === payload.new.enquete_id) ||
            pastPolls.value.some((p) => p.id === payload.new.enquete_id);

          if (belongsToUs) {
            responseBuffer.push(payload.new);

            if (!bufferTimeout) {
              bufferTimeout = window.setTimeout(flushBuffer, 500); // 500ms debounce buffer
            }
          }
        },
      );
    }

    realtimeManager.subscribe(channelName);
  }

  function unsubscribeFromSessionPolls(sessionId: string) {
    if (currentSessionId.value !== sessionId) return;
    currentSessionId.value = null;

    realtimeManager.releaseChannel(`poll-${sessionId}`);
    activePolls.value = [];
    pastPolls.value = [];
    pollResults.value = {};
    if (bufferTimeout) {
      clearTimeout(bufferTimeout);
      bufferTimeout = null;
    }
    responseBuffer = [];
  }

  return {
    activePolls,
    pastPolls,
    pollResults,
    isLoading,
    error,
    myResponses,
    hasResponded,
    loadActivePolls,
    loadAllPolls,
    loadResultsForPoll,
    createPoll,
    activatePoll,
    closePoll,
    submitResponse,
    subscribeToSessionPolls,
    unsubscribeFromSessionPolls,
  };
});
