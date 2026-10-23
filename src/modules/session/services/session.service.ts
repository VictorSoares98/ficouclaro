import { supabaseClient as supabase } from '@/core/supabase/client';
import type { Database } from '@/core/types/database.types';

export type StatusSessao = Database['public']['Enums']['status_sessao'];
export type Sessao = Database['public']['Tables']['sessoes']['Row'];

export interface CourseSessionInfo {
  id: string;
  status: StatusSessao;
  topico: string | null;
}

export class SessionService {
  /**
   * Cria uma nova sessão (aula) para uma disciplina.
   * A sessão inicia com o status 'aguardando'.
   */
  async createSession(professorId: string, disciplinaId: string, topico?: string): Promise<Sessao> {
    // 1. Verifica se já existe uma sessão em 'aguardando' ou 'ativa' para esta disciplina (idempotência)
    const { data: existingSession, error: checkError } = await supabase
      .from('sessoes')
      .select('*')
      .eq('disciplina_id', disciplinaId)
      .in('status', ['aguardando', 'ativa'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (checkError) {
      console.warn('Erro ao verificar sessão existente:', checkError.message);
    }

    if (existingSession) {
      if (topico && existingSession.status === 'aguardando' && existingSession.topico !== topico) {
        const { data: updated } = await supabase
          .from('sessoes')
          .update({ topico })
          .eq('id', existingSession.id)
          .select()
          .single();
        if (updated) return updated;
      }
      return existingSession;
    }

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
   * Busca as sessões ativas ('aguardando' ou 'ativa') para uma lista de cursos.
   * Retorna um mapa { [courseId]: CourseSessionInfo }
   */
  async getActiveSessionsForCourses(
    courseIds: string[],
  ): Promise<Record<string, CourseSessionInfo>> {
    if (courseIds.length === 0) return {};

    const { data, error } = await supabase
      .from('sessoes')
      .select('id, disciplina_id, status, topico')
      .in('disciplina_id', courseIds)
      .in('status', ['aguardando', 'ativa'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar status em lote:', error);
      return {};
    }

    const sessionMap: Record<string, CourseSessionInfo> = {};
    // Como está ordenado decrescente, o primeiro que aparecer de cada disciplina é a sessão ativa mais recente
    data?.forEach((sessao) => {
      if (!sessionMap[sessao.disciplina_id]) {
        sessionMap[sessao.disciplina_id] = {
          id: sessao.id,
          status: sessao.status,
          topico: sessao.topico,
        };
      }
    });

    return sessionMap;
  }
}

export const sessionService = new SessionService();
