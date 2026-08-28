import { supabaseClient } from '../../../core/supabase/client';

export type SinalRitmo = 'muito_rapido' | 'boiando' | 'tudo_certo' | 'muito_devagar';

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
    const counts: Record<SinalRitmo, number> = {
      muito_rapido: 0,
      boiando: 0,
      tudo_certo: 0,
      muito_devagar: 0,
    };

    const { data, error } = await supabaseClient
      .from('sinais_ritmo')
      .select('sinal')
      .eq('sessao_id', sessionId);

    if (error) throw error;

    if (data) {
      const rows = data as unknown as Array<{ sinal: string }>;
      for (const row of rows) {
        const sinal = row.sinal as SinalRitmo;
        if (counts[sinal] !== undefined) {
          counts[sinal]++;
        }
      }
    }

    return counts;
  }
}

export const thermometerService = new ThermometerService();
