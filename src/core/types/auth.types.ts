import type { User as SupabaseUser } from '@supabase/supabase-js';

export type PapelUsuario = 'aluno' | 'professor';

export interface Perfil {
  id: string;
  papel: PapelUsuario;
  nome_completo: string | null;
  url_avatar: string | null;
  created_at: string;
}

export interface AppUser {
  auth: SupabaseUser;
  perfil: Perfil;
}
