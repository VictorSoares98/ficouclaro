import { supabaseClient } from '@/core/supabase/client';
import type { Database } from '@/core/types/database.types';

type AvaliacaoInsert = Database['public']['Tables']['avaliacoes_rapidas']['Insert'];
type Avaliacao = Database['public']['Tables']['avaliacoes_rapidas']['Row'];

export class FlashReviewService {
  /**
   * Envia a avaliação anônima do aluno para uma sessão encerrada.
   */
  async submitReview(review: Omit<AvaliacaoInsert, 'hash_eleitor' | 'created_at'>): Promise<void> {
    const { error } = await supabaseClient.rpc('submit_flash_review', {
      p_sessao_id: review.sessao_id,
      p_nota: review.nota,
      p_comentario: review.comentario || null,
    });

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
