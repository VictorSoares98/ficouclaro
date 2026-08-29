import { supabaseClient } from '@/core/supabase/client';

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
    // @ts-expect-error - RPC 'get_course_insights' pendente de regen no database.types.ts (Task HIGH-04)
    const { data, error } = await supabaseClient.rpc('get_course_insights', {
      p_disciplina_id: cursoId,
    });

    if (error) {
      throw new Error(error.message);
    }

    // Cast seguro para a interface base e ordenação cronológica
    const sessions = (data as unknown as SessionInsights[]) || [];

    return sessions.sort((a, b) => {
      const dateA = a.iniciada_em ? new Date(a.iniciada_em).getTime() : 0;
      const dateB = b.iniciada_em ? new Date(b.iniciada_em).getTime() : 0;
      return dateA - dateB;
    });
  }
}

export const dashboardService = new DashboardService();
