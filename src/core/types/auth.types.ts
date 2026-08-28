import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { Database } from './database.types';

export type PapelUsuario = Database['public']['Enums']['papel_usuario'];
export type Perfil = Database['public']['Tables']['usuarios']['Row'];

export interface AppUser {
  auth: SupabaseUser;
  perfil: Perfil;
}
