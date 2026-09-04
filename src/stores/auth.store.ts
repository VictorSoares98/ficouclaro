import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authService } from '@/modules/auth/services/auth.service';
import { useAsyncOperation } from '@/core/composables/useAsyncOperation';
import type { AppUser } from '@/core/types/auth.types';
import type {
  User as SupabaseUser,
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
} from '@supabase/supabase-js';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AppUser | null>(null);

  // Flag para prevenção de FOUC (Flash of Unauthenticated Content)
  const isReady = ref(false);
  const { isLoading, error, execute } = useAsyncOperation();

  const isAuthenticated = computed(() => !!user.value);
  const isProfessor = computed(() => user.value?.perfil.papel === 'professor');
  const isAluno = computed(() => user.value?.perfil.papel === 'aluno');

  /**
   * Carrega a sessão pela primeira vez quando o app inicia.
   */
  async function loadInitialSession() {
    await execute(async () => {
      user.value = await authService.getSessionUser();
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
  }

  async function signOut() {
    await authService.signOut();
    clearUser();
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
    isLoading,
    error,
    isAuthenticated,
    isProfessor,
    isAluno,
    loadInitialSession,
    reloadProfile,
    clearUser,
    signOut,
    login,
    register,
    deleteAccount,
  };
});
