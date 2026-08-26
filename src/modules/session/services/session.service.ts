import { supabaseClient as supabase } from '../../../core/supabase/client';

export type StatusSessao = 'aguardando' | 'ativa' | 'encerrada';

export interface Sessao {
  id: string;
  disciplina_id: string;
  professor_id: string;
  topico: string | null;
  status: StatusSessao;
  iniciada_em: string | null;
  encerrada_em: string | null;
  created_at: string;
}

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
    return data as unknown as Sessao;
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
    return data as unknown as Sessao;
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
    return data as unknown as Sessao;
  }

  /**
   * Busca uma sessão específica pelo ID
   */
  async getSessionById(sessionId: string): Promise<Sessao> {
    const { data, error } = await supabase.from('sessoes').select('*').eq('id', sessionId).single();

    if (error) throw error;
    return data as unknown as Sessao;
  }
}

export const sessionService = new SessionService();
