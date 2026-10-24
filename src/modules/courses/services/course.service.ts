import { supabaseClient as supabase } from '@/core/supabase/client';
import type { Database } from '@/core/types/database.types';

export type Disciplina = Database['public']['Tables']['disciplinas']['Row'];
export type Matricula = Database['public']['Tables']['matriculas']['Row'];

export class CourseService {
  /**
   * Busca disciplinas criadas pelo professor (se for professor) ou matriculadas (se for aluno)
   */
  async getMyCourses(userId: string, isProfessor: boolean): Promise<Disciplina[]> {
    if (isProfessor) {
      const { data, error } = await supabase
        .from('disciplinas')
        .select('*')
        .eq('professor_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return data;
    } else {
      // É aluno, busca as matrículas com inner join (usando sintaxe do PostgREST)
      const { data, error } = await supabase
        .from('matriculas')
        .select('disciplinas(*)')
        .eq('aluno_id', userId);

      if (error) throw new Error(error.message);

      // Mapeia o resultado para extrair o array de disciplinas
      const courses = data
        .map((d) => d.disciplinas)
        .filter((d): d is Disciplina => d !== null && !Array.isArray(d));
      return courses;
    }
  }

  async createCourse(
    professorId: string,
    payload: {
      nome: string;
      descricao?: string;
      curso?: string;
      semestre?: string;
      turma?: string;
      horario?: string;
      dia_semana?: string;
      sala?: string;
      bloco?: string;
      icone?: string;
    },
  ): Promise<Disciplina> {
    const MAX_RETRIES = 3;
    let attempts = 0;

    while (attempts < MAX_RETRIES) {
      const { data, error } = await supabase
        .from('disciplinas')
        .insert({
          professor_id: professorId,
          nome: payload.nome,
          descricao: payload.descricao || null,
          curso: payload.curso || null,
          semestre: payload.semestre || null,
          turma: payload.turma || null,
          horario: payload.horario || null,
          dia_semana: payload.dia_semana || null,
          sala: payload.sala || null,
          bloco: payload.bloco || null,
          icone: payload.icone || null,
        })
        .select()
        .single();

      if (error) {
        // Se o erro for Violação de Unique Constraint (23505) em codigo_convite
        if (error.code === '23505') {
          attempts++;
          continue;
        }
        throw new Error(error.message);
      }
      return data;
    }

    throw new Error('Não foi possível gerar um código de convite único. Tente novamente.');
  }

  async updateCourse(
    courseId: string,
    payload: {
      nome: string;
      descricao?: string;
      curso?: string;
      semestre?: string;
      turma?: string;
      horario?: string;
      dia_semana?: string;
      sala?: string;
      bloco?: string;
      icone?: string;
    },
  ): Promise<Disciplina> {
    const { data, error } = await supabase
      .from('disciplinas')
      .update({
        nome: payload.nome,
        descricao: payload.descricao || null,
        curso: payload.curso || null,
        semestre: payload.semestre || null,
        turma: payload.turma || null,
        horario: payload.horario || null,
        dia_semana: payload.dia_semana || null,
        sala: payload.sala || null,
        bloco: payload.bloco || null,
        icone: payload.icone || null,
      })
      .eq('id', courseId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async deleteCourse(courseId: string): Promise<void> {
    const { error } = await supabase.from('disciplinas').delete().eq('id', courseId);
    if (error) {
      throw new Error(error.message);
    }
  }

  async enrollByCode(alunoId: string, codigoConvite: string): Promise<Matricula> {
    // Busca o curso pelo código ignorando case sensitivity (hexcode no banco é minúsculo)
    const { data: curso, error: courseError } = await supabase
      .from('disciplinas')
      .select('id')
      .eq('codigo_convite', codigoConvite.toLowerCase())
      .single();

    if (courseError || !curso) {
      throw new Error('Código de convite inválido ou disciplina não encontrada.');
    }

    // Tenta matricular
    const { data, error } = await supabase
      .from('matriculas')
      .insert({
        disciplina_id: curso.id,
        aluno_id: alunoId,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('Você já está matriculado nesta disciplina.');
      }
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Busca os metadados públicos de uma disciplina através do código de convite.
   * Funciona tanto para visitantes não autenticados quanto para alunos autenticados.
   */
  async getCourseDetailsByInviteCode(
    codigoConvite: string,
  ): Promise<ClassroomInviteDetails | null> {
    const code = codigoConvite.trim().toLowerCase();
    const { data, error } = await (
      supabase as unknown as {
        rpc: (
          fn: string,
          args: Record<string, unknown>,
        ) => Promise<{ data: ClassroomInviteDetails[] | null; error: Error | null }>;
      }
    ).rpc('obter_detalhes_convite', {
      p_codigo: code,
    });

    if (error) {
      console.warn('Erro ao obter detalhes do convite:', error.message);
      return null;
    }

    if (data && Array.isArray(data) && data.length > 0) {
      return data[0] || null;
    }

    return null;
  }
}

export interface ClassroomInviteDetails {
  disciplina_id: string;
  nome: string;
  descricao: string | null;
  curso: string | null;
  semestre: string | null;
  turma: string | null;
  sala: string | null;
  bloco: string | null;
  icone: string | null;
  codigo_convite: string;
  professor_nome: string;
  professor_avatar: string | null;
  sessao_ativa_id: string | null;
}

export const courseService = new CourseService();
