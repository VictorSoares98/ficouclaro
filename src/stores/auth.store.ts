import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authService } from '../modules/auth/services/auth.service';
import type { AppUser } from '../core/types/auth.types';
import type {
  User as SupabaseUser,
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
} from '@supabase/supabase-js';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AppUser | null>(null);

  // Flag para prevenção de FOUC (Flash of Unauthenticated Content)
  const isReady = ref(false);
  const isLoading = ref(false);

  const isAuthenticated = computed(() => !!user.value);
  const isProfessor = computed(() => user.value?.perfil.papel === 'professor');
  const isAluno = computed(() => user.value?.perfil.papel === 'aluno');

  /**
   * Carrega a sessão pela primeira vez quando o app inicia.
   */
  async function loadInitialSession() {
    isLoading.value = true;
    try {
      user.value = await authService.getSessionUser();
    } finally {
      isReady.value = true;
      isLoading.value = false;
    }
  }

  /**
   * Usado principalmente pelo listener de AuthStateChange no App.vue
   * para recarregar silenciosamente o usuário caso mude em outra aba.
   */
  async function reloadProfile(authUser: SupabaseUser) {
    try {
      const perfil = await authService.getProfile(authUser.id);
      user.value = { auth: authUser, perfil };
    } catch (e) {
      console.error('Falha ao recarregar perfil no listener:', e);
      user.value = null;
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
    isLoading.value = true;
    try {
      await authService.deleteAccount();
      clearUser();
    } finally {
      isLoading.value = false;
    }
  }

  async function login(credentials: SignInWithPasswordCredentials) {
    isLoading.value = true;
    try {
      const data = await authService.signIn(credentials);
      if (data.user) {
        await reloadProfile(data.user);
      }
    } finally {
      isLoading.value = false;
    }
  }

  async function register(credentials: SignUpWithPasswordCredentials) {
    isLoading.value = true;
    try {
      const data = await authService.signUp(credentials);
      if (data.user) {
        await reloadProfile(data.user);
      }
    } finally {
      isLoading.value = false;
    }
  }

  return {
    user,
    isReady,
    isLoading,
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
