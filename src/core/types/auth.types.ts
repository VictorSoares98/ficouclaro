import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { Database } from './database.types';

export type PapelUsuario = Database['public']['Enums']['papel_usuario'];
export type Perfil = Pick<
  Database['public']['Tables']['usuarios']['Row'],
  'id' | 'papel' | 'nome_completo' | 'url_avatar'
>;

export interface AppUser {
  auth: SupabaseUser;
  perfil: Perfil;
}
