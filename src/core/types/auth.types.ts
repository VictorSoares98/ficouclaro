import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { Database } from '@/core/types/database.types';

export type PapelUsuario = Database['public']['Enums']['papel_usuario'];
export type Perfil = Pick<
  Database['public']['Tables']['usuarios']['Row'],
  'id' | 'papel' | 'nome_completo' | 'url_avatar' | 'termos_aceitos_em' | 'versao_termos'
>;

export interface AppUser {
  auth: SupabaseUser;
  perfil: Perfil;
}
