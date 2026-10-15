import { supabaseClient as supabase } from '@/core/supabase/client';
import type {
  StudyGroupPublic,
  StudyGroupDetail,
  StudyGroupMember,
  StudyGroupType,
} from '../types/study-group.types';

export interface CreateStudyGroupDTO {
  nome: string;
  descricao?: string;
  tipo: StudyGroupType;
  disciplina_id?: string | null;
  instituicao: string;
  campus?: string;
  predio_bloco?: string;
  sala?: string;
  lat: number;
  lng: number;
  dia_semana?: string;
  horario?: string;
  vagas?: number;
}

export class StudyGroupService {
  /**
   * Busca todos os grupos de estudo ativos a partir da view pública segura.
   * Não requer autenticação (acesso aberto para o mapa).
   */
  async getPublicStudyGroups(): Promise<StudyGroupPublic[]> {
    const { data, error } = await supabase
      .from('view_grupos_estudo_publicos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[StudyGroupService] Erro ao carregar grupos públicos:', error);
      throw new Error(error.message);
    }

    return (data as unknown as StudyGroupPublic[]) || [];
  }

  /**
   * Obtém detalhes restritos de um grupo de estudo (para membros ou criador autenticado).
   */
  async getStudyGroupDetail(id: string): Promise<StudyGroupDetail | null> {
    const { data, error } = await supabase
      .from('grupos_estudo')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('[StudyGroupService] Erro ao carregar detalhes do grupo:', error);
      throw new Error(error.message);
    }

    return (data as unknown as StudyGroupDetail) || null;
  }

  /**
   * Cria um novo grupo de estudo. O criador é automaticamente vinculado como monitor via trigger.
   */
  async createStudyGroup(
    criadorId: string,
    dto: CreateStudyGroupDTO,
  ): Promise<StudyGroupDetail> {
    const localNome = dto.sala
      ? `${dto.instituicao} - ${dto.sala}`
      : dto.campus || dto.instituicao;

    const { data, error } = await supabase
      .from('grupos_estudo')
      .insert({
        criador_id: criadorId,
        nome: dto.nome,
        descricao: dto.descricao || null,
        tipo: dto.tipo,
        disciplina_id: dto.disciplina_id || null,
        instituicao: dto.instituicao,
        campus: dto.campus || null,
        predio_bloco: dto.predio_bloco || null,
        sala: dto.sala || null,
        latitude: dto.lat,
        longitude: dto.lng,
        local_nome: localNome,
        dia_semana: dto.dia_semana || null,
        horario: dto.horario || null,
        horario_encontros: dto.horario ? `${dto.dia_semana || ''} ${dto.horario}`.trim() : null,
        capacidade_maxima: dto.vagas || 10,
      })
      .select()
      .single();

    if (error) {
      console.error('[StudyGroupService] Erro ao criar grupo de estudo:', error);
      throw new Error(error.message);
    }

    return data as unknown as StudyGroupDetail;
  }

  /**
   * Busca membros de um grupo específico (requer autenticação e vínculo).
   */
  async getGroupMembers(grupoId: string): Promise<StudyGroupMember[]> {
    const { data, error } = await supabase
      .from('grupos_membros')
      .select('*, usuario:usuarios(nome_completo, url_avatar)')
      .eq('grupo_id', grupoId)
      .order('joined_at', { ascending: false });

    if (error) {
      console.error('[StudyGroupService] Erro ao buscar membros do grupo:', error);
      throw new Error(error.message);
    }

    return (data as unknown as StudyGroupMember[]) || [];
  }

  /**
   * Permite que um aluno entre no grupo de estudo através do ID do grupo.
   */
  async joinGroup(grupoId: string, usuarioId: string): Promise<void> {
    const { error } = await supabase
      .from('grupos_membros')
      .insert({
        grupo_id: grupoId,
        usuario_id: usuarioId,
        papel: 'membro',
      });

    if (error) {
      console.error('[StudyGroupService] Erro ao entrar no grupo:', error);
      throw new Error(error.message);
    }
  }

  /**
   * Permite que um membro saia do grupo de estudo.
   */
  async leaveGroup(grupoId: string, usuarioId: string): Promise<void> {
    const { error } = await supabase
      .from('grupos_membros')
      .delete()
      .match({ grupo_id: grupoId, usuario_id: usuarioId });

    if (error) {
      console.error('[StudyGroupService] Erro ao sair do grupo:', error);
      throw new Error(error.message);
    }
  }
}

export const studyGroupService = new StudyGroupService();
