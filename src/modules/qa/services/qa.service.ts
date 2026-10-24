import { supabaseClient } from '@/core/supabase/client';
import type { Database } from '@/core/types/database.types';

export type Duvida = Database['public']['Tables']['duvidas']['Row'] & {
  usuarios?: { nome_completo: string | null } | null;
};

export class QaService {
  async fetchQuestions(sessionId: string): Promise<Duvida[]> {
    const { data, error } = await supabaseClient
      .from('duvidas')
      .select('*, usuarios(nome_completo)')
      .eq('sessao_id', sessionId)
      .order('votos', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    return (data as unknown as Duvida[]) || [];
  }

  async fetchQuestionById(questionId: string): Promise<Duvida | null> {
    const { data, error } = await supabaseClient
      .from('duvidas')
      .select('*, usuarios(nome_completo)')
      .eq('id', questionId)
      .single();

    if (error) return null;
    return data as unknown as Duvida;
  }

  async submitQuestion(sessionId: string, texto: string, autorId?: string | null): Promise<Duvida> {
    const { data, error } = await supabaseClient
      .from('duvidas')
      .insert({
        sessao_id: sessionId,
        texto: texto,
        ...(autorId ? { autor_id: autorId } : {}),
      })
      .select('*, usuarios(nome_completo)')
      .single();

    if (error) throw new Error(error.message);
    return data as unknown as Duvida;
  }

  async upvoteQuestion(questionId: string): Promise<void> {
    const { error } = await supabaseClient.rpc('submit_qa_upvote', {
      p_duvida_id: questionId,
    });

    if (error) {
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
