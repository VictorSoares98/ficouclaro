import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { pollService } from '@/modules/poll/services/poll.service';
import type { Database, Json } from '@/core/types/database.types';
import { useAsyncOperation } from '@/core/composables/useAsyncOperation';
import { realtimeManager } from '@/core/supabase/realtime.manager';
import type {
  RealtimePostgresInsertPayload,
  RealtimePostgresUpdatePayload,
} from '@supabase/supabase-js';
import { useAuthStore } from '@/stores/auth.store';

// Anti-corruption layer: Tipos locais planos para evitar limite de recursão (TS2589) no Pinia
export interface Resposta {
  id: string;
  created_at: string;
  enquete_id: string;
  sessao_id: string;
  resposta: Json;
}

export interface BaseEnquete {
  id: string;
  created_at: string;
  pergunta: string;
  status: 'rascunho' | 'ativa' | 'encerrada';
  sessao_id: string;
  encerrada_em: string | null;
}

export interface EnqueteMultiplaEscolha extends BaseEnquete {
  tipo: 'multipla_escolha';
  opcoes: string[];
}

export interface EnqueteNuvemPalavras extends BaseEnquete {
  tipo: 'nuvem_palavras';
  opcoes: null;
}

export interface EnqueteEscalaClareza extends BaseEnquete {
  tipo: 'escala_clareza';
  opcoes: null;
}

export interface EnqueteRanking extends BaseEnquete {
  tipo: 'ranking';
  opcoes: string[];
}

export type Enquete =
  EnqueteMultiplaEscolha | EnqueteNuvemPalavras | EnqueteEscalaClareza | EnqueteRanking;

export type EnqueteInsertRow = Database['public']['Tables']['enquetes']['Insert'];

export const usePollStore = defineStore('poll', () => {
  const authStore = useAuthStore();
  const activePolls = ref<Enquete[]>([]);
  const pastPolls = ref<Enquete[]>([]);
  const pollResults = ref<Record<string, Resposta[]>>({});

  const getStorageKey = () => `ficouclaro_polls_${authStore.user?.auth.id || 'anonymous'}`;
  const myResponses = ref<string[]>([]);

  // Atualiza as respostas locais sempre que o usuário mudar
  watch(
    () => authStore.user?.auth.id,
    (newId) => {
      if (newId) {
        myResponses.value = JSON.parse(localStorage.getItem(getStorageKey()) || '[]');
      } else {
        myResponses.value = [];
      }
    },
    { immediate: true },
  );

  const { isLoading, error, execute } = useAsyncOperation();

  const currentSessionId = ref<string | null>(null);

  function markAsResponded(pollId: string) {
    if (!myResponses.value.includes(pollId)) {
      myResponses.value = [...myResponses.value, pollId];
      localStorage.setItem(getStorageKey(), JSON.stringify(myResponses.value));
    }
  }

  function hasResponded(pollId: string): boolean {
    return myResponses.value.includes(pollId);
  }

  async function loadActivePolls(sessionId: string): Promise<void> {
    await execute(async (): Promise<void> => {
      activePolls.value = (await pollService.getActivePollsForSession(
        sessionId,
      )) as unknown as Enquete[];
    }, 'Erro ao carregar enquetes ativas');
  }

  async function loadAllPolls(sessionId: string): Promise<void> {
    await execute(async (): Promise<void> => {
      const all = (await pollService.getAllPollsForSession(sessionId)) as unknown as Enquete[];

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
      const newPoll = (await pollService.createPoll(enquete)) as unknown as Enquete;
      pastPolls.value = [newPoll, ...pastPolls.value];
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
          const updatedPoll: Enquete = { ...poll, status: 'ativa' };
          activePolls.value = [...activePolls.value, updatedPoll];
          pastPolls.value = pastPolls.value.filter((_, i) => i !== pollIndex);
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
          const updatedPoll: Enquete = { ...poll, status: 'encerrada' };
          pastPolls.value = [updatedPoll, ...pastPolls.value];
          activePolls.value = activePolls.value.filter((_, i) => i !== pollIndex);
        }
      }
    }, 'Erro ao encerrar enquete');
  }

  async function submitResponse(pollId: string, respostaData: Json): Promise<void> {
    await execute(async (): Promise<void> => {
      if (hasResponded(pollId)) {
        throw new Error('Você já respondeu a esta enquete.');
      }

      const userId = authStore.user?.auth.id;
      if (!userId) throw new Error('Usuário não autenticado.');
      if (!currentSessionId.value) throw new Error('Sessão não definida.');

      await pollService.submitResponse({
        enquete_id: pollId,
        sessao_id: currentSessionId.value,
        resposta: respostaData,
      });

      markAsResponded(pollId);
    }, 'Erro ao enviar resposta');
  }

  // --- REALTIME SUBSCRIPTIONS ---

  // Buffer de respostas (Throttle protection)
  let responseBuffer: Resposta[] = [];
  let bufferTimeout: number | null = null;

  function flushBuffer() {
    if (responseBuffer.length === 0) return;

    // Agrupa e commita as respostas recriando os dicionários sem mutar in-place
    const newResults = { ...pollResults.value };

    responseBuffer.forEach((resp) => {
      const id = resp.enquete_id;
      newResults[id] = [...(newResults[id] || []), resp];
    });

    pollResults.value = newResults;

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
          activePolls.value = [payload.new, ...activePolls.value];
        } else if (isProfessor) {
          pastPolls.value = [payload.new, ...pastPolls.value];
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
            pastPolls.value = [updatedPoll, ...pastPolls.value];
          }
        }
        // Adiciona nas ativas se ativou
        else if (updatedPoll.status === 'ativa') {
          if (!activePolls.value.find((p) => p.id === updatedPoll.id)) {
            activePolls.value = [updatedPoll, ...activePolls.value];
          }
          if (isProfessor) {
            pastPolls.value = pastPolls.value.filter((p) => p.id !== updatedPoll.id);
          }
        }
      },
    );

    // Escutar por respostas (só interessa ao professor)
    if (isProfessor) {
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'respostas_enquete',
          filter: `sessao_id=eq.${sessionId}`,
        },
        (payload: RealtimePostgresInsertPayload<Resposta>) => {
          responseBuffer.push(payload.new);

          if (!bufferTimeout) {
            bufferTimeout = window.setTimeout(flushBuffer, 500); // 500ms debounce buffer
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
