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
  local_especifico?: string;
  cidade?: string;
  estado?: string;
  pais?: string;
  place_id?: string;
  lat: number;
  lng: number;
  dia_reuniao?: string;
  horario_reuniao?: string;
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
        local_especifico: dto.local_especifico || null,
        cidade: dto.cidade || null,
        estado: dto.estado || null,
        pais: dto.pais || 'Brasil',
        place_id: dto.place_id || null,
        lat: dto.lat,
        lng: dto.lng,
        dia_reuniao: dto.dia_reuniao || dto.dia_semana || null,
        horario_reuniao: dto.horario_reuniao || dto.horario || null,
        vagas: dto.vagas || 10,
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
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[StudyGroupService] Erro ao buscar membros do grupo:', error);
      throw new Error(error.message);
    }

    return (data as unknown as StudyGroupMember[]) || [];
  }

  /**
   * Permite que um aluno entre no grupo de estudo através da RPC atômica (padrão link_member_to_pocket).
   */
  async joinGroup(grupoId: string): Promise<void> {
    const { error } = await supabase.rpc('link_member_to_study_group', {
      p_grupo_id: grupoId,
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
