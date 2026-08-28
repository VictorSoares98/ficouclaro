import { supabaseClient } from '@/core/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface SessionInsights {
  sessao_id: string;
  disciplina_id: string;
  topico: string | null;
  iniciada_em: string | null;
  status: 'aguardando' | 'ativa' | 'encerrada';
  media_estrelas: number;
  total_avaliacoes: number;
  total_duvidas: number;
  total_sinais: number;
  total_enquetes: number;
}

export class DashboardService {
  /**
   * Busca os insights de todas as sessões de uma disciplina,
   * utilizando a view vw_course_insights.
   */
  async getCourseInsights(cursoId: string): Promise<SessionInsights[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = supabaseClient as SupabaseClient<any, 'public', any>;
    const { data, error } = await client
      .from('vw_course_insights')
      .select('*')
      .eq('disciplina_id', cursoId)
      .order('iniciada_em', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}

export const dashboardService = new DashboardService();
