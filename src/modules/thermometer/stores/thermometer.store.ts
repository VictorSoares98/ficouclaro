import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  thermometerService,
  type SinalRitmo,
} from '@/modules/thermometer/services/thermometer.service';
import { realtimeManager } from '@/core/supabase/realtime.manager';
import { useAsyncOperation } from '@/core/composables/useAsyncOperation';
import type { RealtimePostgresInsertPayload } from '@supabase/supabase-js';

export const useThermometerStore = defineStore('thermometer', () => {
  // === ESTADO DO ALUNO ===
  const lastSignalSent = ref<SinalRitmo | null>(null);
  const isCooldown = ref(false);

  // === ESTADO DO PROFESSOR ===
  const signalCounts = ref<Record<SinalRitmo, number>>({
    muito_rapido: 0,
    boiando: 0,
    tudo_certo: 0,
    muito_devagar: 0,
  });

  const { isLoading: isConnecting, execute } = useAsyncOperation();
  const currentSessionId = ref<string | null>(null);

  let cooldownTimer: number | null = null;
  const COOLDOWN_MS = 10000; // 10 segundos de Throttle para poupar DB

  /**
   * [ALUNO] Envia um sinal para a aula ativa.
   * Possui throttle visual e real. O botão fica "marcado", mas a request não sai se estiver em cooldown.
   */
  async function sendSignal(sessionId: string, sinal: SinalRitmo) {
    lastSignalSent.value = sinal;

    if (isCooldown.value) {
      // Ignora silenciosamente. Proteção efetiva contra spam no DB (Supabase Free Tier)
      return;
    }

    isCooldown.value = true;
    try {
      await thermometerService.sendPaceSignal(sessionId, sinal);
    } catch (error) {
      console.error('Erro ao enviar sinal de ritmo', error);
      // Fallback opcional: reverter `lastSignalSent`
    } finally {
      cooldownTimer = window.setTimeout(() => {
        isCooldown.value = false;
      }, COOLDOWN_MS);
    }
  }

  /**
   * [ALUNO] Limpeza de memória
   */
  function clearStudentState() {
    if (cooldownTimer) clearTimeout(cooldownTimer);
    lastSignalSent.value = null;
    isCooldown.value = false;
  }

  /**
   * [PROFESSOR] Puxa histórico e assina o Realtime para incrementos vivos.
   * Evita SELECTs contínuos pesados.
   */
  async function subscribeToSession(sessionId: string) {
    if (currentSessionId.value === sessionId) return;
    currentSessionId.value = sessionId;

    await execute(async () => {
      // Snapshot inicial
      signalCounts.value = await thermometerService.getInitialCounts(sessionId);

      // Escuta novos inserts na tabela sinais_ritmo apenas para esta sessão
      const channel = realtimeManager.getChannel(`thermometer-${sessionId}`);
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sinais_ritmo',
          filter: `sessao_id=eq.${sessionId}`,
        },
        (payload: RealtimePostgresInsertPayload<{ sinal: SinalRitmo }>) => {
          const novoSinal = payload.new.sinal;
          if (signalCounts.value[novoSinal] !== undefined) {
            // Reatividade incrementa diretamente a UI do Quasar/Vue
            signalCounts.value[novoSinal]++;
          }
        },
      );
      realtimeManager.subscribe(`thermometer-${sessionId}`);
    }, 'Erro ao conectar termômetro');
  }

  /**
   * [PROFESSOR] Desconecta o Realtime
   */
  function unsubscribeFromSession(sessionId: string) {
    if (currentSessionId.value !== sessionId) return;
    currentSessionId.value = null;

    realtimeManager.releaseChannel(`thermometer-${sessionId}`);
    signalCounts.value = {
      muito_rapido: 0,
      boiando: 0,
      tudo_certo: 0,
      muito_devagar: 0,
    };
  }

  return {
    lastSignalSent,
    isCooldown,
    isConnecting,
    signalCounts,
    sendSignal,
    clearStudentState,
    subscribeToSession,
    unsubscribeFromSession,
  };
});
