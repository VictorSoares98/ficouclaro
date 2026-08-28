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

      if (error) throw error;
      return data;
    } else {
      // É aluno, busca as matrículas com inner join (usando sintaxe do PostgREST)
      const { data, error } = await supabase
        .from('matriculas')
        .select('disciplinas(*)')
        .eq('aluno_id', userId);

      if (error) throw error;

      // Mapeia o resultado para extrair o array de disciplinas
      const courses = data
        .map((d) => d.disciplinas)
        .filter((d): d is Disciplina => d !== null && !Array.isArray(d));
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
    return data;
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
        disciplina_id: curso.id,
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

    return data;
  }
}

export const courseService = new CourseService();
