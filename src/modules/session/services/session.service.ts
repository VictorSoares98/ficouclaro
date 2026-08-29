import { supabaseClient as supabase } from '@/core/supabase/client';
import type { Database } from '@/core/types/database.types';

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

    if (error) throw new Error(error.message);
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

    if (error) throw new Error(error.message);
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

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Busca uma sessão específica pelo ID
   */
  async getSessionById(sessionId: string): Promise<Sessao> {
    const { data, error } = await supabase.from('sessoes').select('*').eq('id', sessionId).single();

    if (error) throw new Error(error.message);
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

  /**
   * Busca o status atual da sessão mais recente para uma lista de cursos.
   * Retorna um mapa { [courseId]: StatusSessao }
   */
  async getActiveSessionsForCourses(courseIds: string[]): Promise<Record<string, StatusSessao>> {
    if (courseIds.length === 0) return {};

    const { data, error } = await supabase
      .from('sessoes')
      .select('disciplina_id, status')
      .in('disciplina_id', courseIds)
      .in('status', ['aguardando', 'ativa'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar status em lote:', error);
      return {};
    }

    const statusMap: Record<string, StatusSessao> = {};
    // Como está ordenado decrescente, o primeiro que aparecer de cada disciplina é o mais recente
    data?.forEach((sessao) => {
      if (!statusMap[sessao.disciplina_id]) {
        statusMap[sessao.disciplina_id] = sessao.status;
      }
    });

    return statusMap;
  }
}

export const sessionService = new SessionService();
