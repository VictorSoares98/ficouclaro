import { supabaseClient as supabase } from '../../../core/supabase/client';

export interface Disciplina {
  id: string;
  professor_id: string;
  nome: string;
  descricao: string | null;
  codigo_convite: string;
  created_at: string;
}

export interface Matricula {
  id: string;
  disciplina_id: string;
  aluno_id: string;
  created_at: string;
}

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

      if (error) throw error;
      return data as unknown as Disciplina[];
    } else {
      // É aluno, busca as matrículas com inner join (usando sintaxe do PostgREST)
      const { data, error } = await supabase
        .from('matriculas')
        .select('disciplinas(*)')
        .eq('aluno_id', userId);

      if (error) throw error;

      // Mapeia o resultado para extrair o array de disciplinas
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const courses = (data as any[]).map((d) => d.disciplinas).filter(Boolean);
      return courses;
    }
  }

  async createCourse(professorId: string, nome: string, descricao?: string): Promise<Disciplina> {
    const { data, error } = await supabase
      .from('disciplinas')
      .insert({
        professor_id: professorId,
        nome,
        descricao: descricao || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data as unknown as Disciplina;
  }

  async enrollByCode(alunoId: string, codigoConvite: string): Promise<Matricula> {
    // Busca o curso pelo código
    const { data: curso, error: courseError } = await supabase
      .from('disciplinas')
      .select('id')
      .eq('codigo_convite', codigoConvite)
      .single();

    if (courseError || !curso) {
      throw new Error('Código de convite inválido ou disciplina não encontrada.');
    }

    // Tenta matricular
    const { data, error } = await supabase
      .from('matriculas')
      .insert({
        disciplina_id: (curso as unknown as { id: string }).id,
        aluno_id: alunoId,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('Você já está matriculado nesta disciplina.');
      }
      throw error;
    }

    return data as unknown as Matricula;
  }
}

export const courseService = new CourseService();
