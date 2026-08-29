import { supabaseClient } from '@/core/supabase/client';
import type { Database } from '@/core/types/database.types';

type AvaliacaoInsert = Database['public']['Tables']['avaliacoes_rapidas']['Insert'];
type Avaliacao = Database['public']['Tables']['avaliacoes_rapidas']['Row'];

export class FlashReviewService {
  /**
   * Envia a avaliação anônima do aluno para uma sessão encerrada.
   */
  async submitReview(review: AvaliacaoInsert): Promise<void> {
    const { error } = await supabaseClient.from('avaliacoes_rapidas').insert(review);

    if (error) {
      if (error.code === '23505') {
        throw new Error('Você já avaliou esta sessão.');
      }
      throw new Error(error.message);
    }
  }

  /**
   * Obtém as avaliações de uma sessão para o professor visualizar.
   */
  async getReviewsForSession(sessionId: string): Promise<Avaliacao[]> {
    const { data, error } = await supabaseClient
      .from('avaliacoes_rapidas')
      .select('*')
      .eq('sessao_id', sessionId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }
    return data || [];
  }
}

export const flashReviewService = new FlashReviewService();
