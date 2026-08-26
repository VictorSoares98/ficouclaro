import { supabaseClient } from '../../../core/supabase/client';
import type { AppUser, Perfil } from '../../../core/types/auth.types';
import type {
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
} from '@supabase/supabase-js';

class AuthService {
  async signIn(credentials: SignInWithPasswordCredentials) {
    const { data, error } = await supabaseClient.auth.signInWithPassword(credentials);
    if (error) throw error;
    return data;
  }

  async signUp(credentials: SignUpWithPasswordCredentials) {
    const { data, error } = await supabaseClient.auth.signUp(credentials);
    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
  }

  /**
   * Busca os metadados da tabela pública de perfis associada ao Auth
   */
  async getProfile(userId: string): Promise<Perfil> {
    const { data, error } = await supabaseClient
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data as unknown as Perfil;
  }

  /**
   * Tenta resgatar a sessão atual armazenada localmente e enriquece com o perfil
   */
  async getSessionUser(): Promise<AppUser | null> {
    const {
      data: { session },
      error,
    } = await supabaseClient.auth.getSession();
    if (error || !session) return null;

    try {
      const perfil = await this.getProfile(session.user.id);
      return {
        auth: session.user,
        perfil,
      };
    } catch (e) {
      console.error('🔥 [AuthService] Falha ao buscar perfil vinculado à sessão', e);
      return null;
    }
  }
}

export const authService = new AuthService();
