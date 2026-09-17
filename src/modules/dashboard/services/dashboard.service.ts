import { supabaseClient } from '@/core/supabase/client';
import type { Database } from '@/core/types/database.types';

export type SessionInsights =
  Database['public']['Functions']['get_course_insights']['Returns'][number];

export class DashboardService {
  /**
   * Busca os insights de todas as sessões de uma disciplina,
   * utilizando a view vw_course_insights.
   */
  async getCourseInsights(cursoId: string): Promise<SessionInsights[]> {
    const { data, error } = await supabaseClient.rpc('get_course_insights', {
      p_disciplina_id: cursoId,
    });

    if (error) {
      throw new Error(error.message);
    }

    // Tipagem inferida automaticamente pelo Supabase; ordenação cronológica
    const sessions = data || [];

    // Retorna uma cópia do array ordenada, prevenindo mutações diretas
    return [...sessions].sort((a, b) => {
      const dateA = a.iniciada_em ? new Date(a.iniciada_em).getTime() : 0;
      const dateB = b.iniciada_em ? new Date(b.iniciada_em).getTime() : 0;
      return dateA - dateB;
    });
  }
}

export const dashboardService = new DashboardService();
