import { supabaseClient } from '@/core/supabase/client';
import type { Database } from '@/core/types/database.types';

export type Duvida = Database['public']['Tables']['duvidas']['Row'];

export class QaService {
  async fetchQuestions(sessionId: string): Promise<Duvida[]> {
    const { data, error } = await supabaseClient
      .from('duvidas')
      .select('*')
      .eq('sessao_id', sessionId)
      .order('votos', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async submitQuestion(sessionId: string, texto: string): Promise<Duvida> {
    const { data, error } = await supabaseClient
      .from('duvidas')
      .insert({
        sessao_id: sessionId,
        texto: texto,
        votos: 0,
        foi_respondida: false,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async upvoteQuestion(questionId: string, voterHash: string): Promise<void> {
    const { error } = await supabaseClient.from('votos_duvida').insert({
      duvida_id: questionId,
      hash_eleitor: voterHash,
    });

    if (error) {
      // Se o erro for de duplicação, o unique constraint de (duvida_id, hash_eleitor) vai estourar
      // 23505 = unique_violation
      if (error.code !== '23505') {
        throw new Error(error.message);
      }
    }
  }

  async markAsAnswered(questionId: string): Promise<void> {
    const { error } = await supabaseClient
      .from('duvidas')
      .update({ foi_respondida: true })
      .eq('id', questionId);

    if (error) throw new Error(error.message);
  }
}

export const qaService = new QaService();
