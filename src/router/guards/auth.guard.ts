import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from '../../stores/auth.store';

/**
 * Middleware para barrar acessos não autorizados.
 * Não faz requisições pesadas (depende da flag `isReady` bloqueante no router).
 */
export function authGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const authStore = useAuthStore();

  // Podemos configurar 'requiresAuth: true' no meta das rotas secretas
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  // Para rotas de login/registro onde o usuário logado não deveria entrar
  const guestOnly = to.matched.some((record) => record.meta.guestOnly);

  if (requiresAuth && !authStore.isAuthenticated) {
    // Tenta acessar área restrita sem login -> Joga pro Index/Login
    next({ path: '/' });
  } else if (guestOnly && authStore.isAuthenticated) {
    // Tenta acessar login mas já está logado -> Joga pro Dashboard
    next({ path: '/dashboard' });
  } else {
    next();
  }
}
