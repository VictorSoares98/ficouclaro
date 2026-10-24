import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authService } from '@/modules/auth/services/auth.service';
import { useAsyncOperation } from '@/core/composables/useAsyncOperation';
import type { AppUser, OAuthMetadata } from '@/core/types/auth.types';
import type {
  User as SupabaseUser,
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
} from '@supabase/supabase-js';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AppUser | null>(null);

  // Flag para prevenção de FOUC (Flash of Unauthenticated Content)
  const isReady = ref(false);
  const isLocked = ref(false);
  const { isLoading, error, execute } = useAsyncOperation();

  const isAuthenticated = computed(() => !!user.value);
  const isProfessor = computed(() => user.value?.perfil.papel === 'professor');
  const isAluno = computed(() => user.value?.perfil.papel === 'aluno');

  const isOAuthUser = computed(() => {
    if (!user.value) return false;
    const provider = user.value.auth.app_metadata?.provider;
    if (provider && provider !== 'email') return true;
    const providers = user.value.auth.app_metadata?.providers;
    return Boolean(providers && providers.length > 0 && !providers.includes('email'));
  });

  /**
   * Carrega a sessão pela primeira vez quando o app inicia.
   */
  async function loadInitialSession() {
    await execute(async () => {
      user.value = await authService.getSessionUser();
      if (user.value && typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.removeItem('ficouclaro_guest_session');
      }
    }, 'Erro ao carregar sessão.');
    isReady.value = true;
  }

  /**
   * Usado principalmente pelo listener de AuthStateChange no App.vue
   * para recarregar silenciosamente o usuário caso mude em outra aba.
   */
  async function reloadProfile(authUser: SupabaseUser, throwError = false) {
    try {
      const perfil = await authService.getProfile(authUser.id);
      user.value = { auth: authUser, perfil };
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.removeItem('ficouclaro_guest_session');
      }
    } catch (e) {
      console.error('Falha ao recarregar perfil no listener:', e);
      user.value = null;
      if (throwError) {
        throw e;
      }
    }
  }

  function clearUser() {
    user.value = null;
    isLocked.value = false;
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.removeItem('ficouclaro_guest_session');
    }
  }

  async function signOut() {
    try {
      await authService.signOut();
    } catch (error) {
      console.warn(
        '[AuthStore] Erro ao encerrar sessão remotamente, limpando estado local:',
        error,
      );
    } finally {
      clearUser();
    }
  }

  function lockSession() {
    if (isAuthenticated.value) {
      isLocked.value = true;
    }
  }

  function unlockSession() {
    isLocked.value = false;
  }

  async function unlockWithPassword(password: string): Promise<boolean> {
    const userEmail = user.value?.auth.email;
    if (!userEmail) return false;

    try {
      const data = await execute(async () => {
        return await authService.signIn({
          email: userEmail,
          password,
        });
      }, 'Senha incorreta.');

      if (data?.user) {
        unlockSession();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async function unlockWithGoogle() {
    unlockSession();
    await loginWithGoogle();
  }

  async function deleteAccount() {
    return execute(async () => {
      await authService.deleteAccount();
      clearUser();
    }, 'Erro ao excluir conta.');
  }

  async function login(credentials: SignInWithPasswordCredentials) {
    return execute(async () => {
      const data = await authService.signIn(credentials);
      if (data.user) {
        await reloadProfile(data.user, true);
      }
    }, 'Erro ao fazer login. Verifique suas credenciais.');
  }

  async function loginWithGoogle(metadata?: OAuthMetadata) {
    return execute(async () => {
      await authService.signInWithOAuth('google', metadata);
    }, 'Erro ao inicializar login com Google.');
  }

  async function register(credentials: SignUpWithPasswordCredentials) {
    return execute(async () => {
      const data = await authService.signUp(credentials);
      if (data.user) {
        await reloadProfile(data.user, true);
      }
    }, 'Erro ao criar conta.');
  }

  return {
    user,
    isReady,
    isLocked,
    isLoading,
    error,
    isAuthenticated,
    isProfessor,
    isAluno,
    isOAuthUser,
    loadInitialSession,
    reloadProfile,
    clearUser,
    signOut,
    lockSession,
    unlockSession,
    unlockWithPassword,
    unlockWithGoogle,
    login,
    loginWithGoogle,
    register,
    deleteAccount,
  };
});
