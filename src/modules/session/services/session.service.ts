import { supabaseClient as supabase } from '../../../core/supabase/client';
import type { Database } from '../../../core/types/database.types';

export type StatusSessao = Database['public']['Enums']['status_sessao'];
export type Sessao = Database['public']['Tables']['sessoes']['Row'];

export class SessionService {
  /**
   * Cria uma nova sessão (aula) para uma disciplina.
   * A sessão inicia com o status 'aguardando'.
   */
  async createSession(professorId: string, disciplinaId: string, topico?: string): Promise<Sessao> {
    const { data, error } = await supabase
      .from('sessoes')
      .insert({
        professor_id: professorId,
        disciplina_id: disciplinaId,
        topico: topico || null,
        status: 'aguardando',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Inicia efetivamente a aula (muda status para 'ativa')
   */
  async startSession(sessionId: string): Promise<Sessao> {
    const { data, error } = await supabase
      .from('sessoes')
      .update({
        status: 'ativa',
        iniciada_em: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Encerra a aula (muda status para 'encerrada')
   */
  async endSession(sessionId: string): Promise<Sessao> {
    const { data, error } = await supabase
      .from('sessoes')
      .update({
        status: 'encerrada',
        encerrada_em: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Busca uma sessão específica pelo ID
   */
  async getSessionById(sessionId: string): Promise<Sessao> {
    const { data, error } = await supabase.from('sessoes').select('*').eq('id', sessionId).single();

    if (error) throw error;
    return data;
  }

  /**
   * Busca a sessão mais recente de uma disciplina que não esteja encerrada.
   * Retorna o ID da sessão ou lança um erro se não encontrar.
   */
  async getActiveSessionByCourse(courseId: string): Promise<string> {
    const { data, error } = await supabase
      .from('sessoes')
      .select('id')
      .eq('disciplina_id', courseId)
      .in('status', ['aguardando', 'ativa'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      throw new Error('Não há nenhuma aula ativa no momento para esta disciplina.');
    }

    return data.id;
  }
}

export const sessionService = new SessionService();
