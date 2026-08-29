import { supabaseClient } from '@/core/supabase/client';
import type { Database } from '@/core/types/database.types';

export type SinalRitmo = Database['public']['Enums']['sinal_ritmo'];

export class ThermometerService {
  /**
   * Envia o sinal do aluno para a sessão atual.
   * Totalmente anônimo (não há restrição de user_id na tabela para esse envio).
   */
  async sendPaceSignal(sessionId: string, sinal: SinalRitmo): Promise<void> {
    const { error } = await supabaseClient.from('sinais_ritmo').insert({
      sessao_id: sessionId,
      sinal: sinal,
    });

    if (error) throw error;
  }

  /**
   * Puxa a contagem agregada atual de sinais para uma sessão.
   * Ideal para carregar o histórico de uma aula em andamento antes de assinar o Realtime.
   */
  async getInitialCounts(sessionId: string): Promise<Record<SinalRitmo, number>> {
    const { data, error } = await supabaseClient
      .rpc('get_thermometer_stats', { p_sessao_id: sessionId });

    if (error) throw error;

    if (data && Array.isArray(data) && data.length > 0) {
      const stats = data[0];
      if (stats) {
        return {
          muito_rapido: Number(stats.muito_rapido || 0),
          boiando: Number(stats.boiando || 0),
          tudo_certo: Number(stats.tudo_certo || 0),
          muito_devagar: Number(stats.muito_devagar || 0),
        };
      }
    }

    return {
      muito_rapido: 0,
      boiando: 0,
      tudo_certo: 0,
      muito_devagar: 0,
    };
  }
}

export const thermometerService = new ThermometerService();
