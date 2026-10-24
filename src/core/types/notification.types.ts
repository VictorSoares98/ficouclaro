export type TipoNotificacao =
  | 'aula_iniciada'
  | 'aula_encerrada'
  | 'nova_duvida'
  | 'duvida_respondida'
  | 'enquete_aberta'
  | 'sistema';

// Anti-corruption layer: Tipos locais planos para evitar limite de recursão profunda (TS2589) no Pinia
export type NotificationData =
  string | number | boolean | null | Record<string, unknown> | unknown[];

export interface AppNotification {
  id: string;
  usuario_id: string;
  titulo: string;
  mensagem: string;
  tipo: TipoNotificacao;
  link?: string | null;
  lida: boolean;
  dados_extras?: NotificationData;
  created_at: string;
}

export interface DispositivoUsuario {
  id: string;
  usuario_id: string;
  endpoint: string;
  p256dh?: string | null;
  auth_key?: string | null;
  user_agent?: string | null;
  plataforma: 'web' | 'android' | 'ios';
  ativo: boolean;
  created_at: string;
  updated_at: string;
}
