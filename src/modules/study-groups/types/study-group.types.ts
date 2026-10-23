import type L from 'leaflet';

export type StudyGroupType = 'estudo' | 'reforco' | 'monitoria' | 'projeto' | 'outro';
export type StudyGroupStatus = 'ativo' | 'inativo';
export type MeetingStatus = 'concluido' | 'pendente' | 'cancelado';

export interface StudyGroupPublic {
  id: string;
  nome: string;
  slug?: string | null;
  descricao: string | null;
  tipo: StudyGroupType;
  disciplina_id: string | null;
  instituicao: string;
  campus: string | null;
  predio_bloco?: string | null;
  sala?: string | null;
  local_especifico?: string | null;
  cidade?: string | null;
  estado?: string | null;
  pais?: string | null;
  place_id?: string | null;
  lat: number;
  lng: number;
  dia_reuniao?: string | null;
  horario_reuniao?: string | null;
  dia_semana?: string | null;
  horario?: string | null;
  vagas: number | null;
  codigo_convite?: string;
  categoria_universidade?: 'publica' | 'privada' | null;
  status_academico?: 'letivo' | 'ferias' | 'greve' | null;
  status: StudyGroupStatus;
  created_at: string;
  criador_nome?: string | null;
  criador_avatar?: string | null;
  total_membros: number;
}

export interface StudyGroupDetail extends StudyGroupPublic {
  criador_id: string;
  predio_bloco: string | null;
  sala: string | null;
  local_especifico: string | null;
  endereco_completo?: string | null;
  codigo_convite: string;
  updated_at: string;
}

export interface StudyGroupMember {
  id: string;
  grupo_id: string;
  usuario_id: string;
  is_monitor: boolean;
  created_at: string;
  usuario?: {
    nome_completo: string | null;
    url_avatar: string | null;
  };
}

export interface MeetingRecord {
  id: string;
  grupo_id: string;
  registrado_por: string;
  data_referencia: string;
  topico: string | null;
  participantes: number;
  duracao_minutos: number;
  duvidas_resolvidas: number;
  observacoes: string | null;
  status: MeetingStatus;
  motivo_cancelamento: string | null;
  client_uuid: string | null;
  created_at: string;
}

export interface StudyGroupMarker extends L.Marker {
  studyGroupId?: string;
}

export interface StudyGroupFilterState {
  search: string;
  type: 'all' | StudyGroupType;
}
