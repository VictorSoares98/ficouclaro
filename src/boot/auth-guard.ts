import { defineBoot } from '#q-app';
import { useAuthStore } from '../stores/auth.store';
import { ROUTE_ROLES } from '../router/route-meta';

export default defineBoot(({ router, store }) => {
  const authStore = useAuthStore(store);

  // FOUC Prevention & Initial Session Load
  router.beforeResolve(async () => {
    if (!authStore.isReady) {
      await authStore.loadInitialSession();
    }
  });

  router.beforeEach((to) => {
    // Extrai o contexto raiz da rota. Ex: '/aluno/dashboard' -> '/aluno'
    const rootPath = `/${to.path.split('/')[1]}`;

    const requiredRoles = ROUTE_ROLES[rootPath];

    // Rota Pública
    if (!requiredRoles) {
      // Se já estiver logado e tentar ir para login/register, manda pro dashboard
      if (authStore.isAuthenticated && (to.path === '/login' || to.path === '/register')) {
        const userRole = authStore.user?.perfil.papel;
        return userRole ? `/${userRole}` : '/';
      }
      return true; // Permitido acesso público
    }

    // Rota Protegida, mas sem login
    if (!authStore.isAuthenticated) {
      return '/login';
    }

    // Rota Protegida com login (Checagem RBAC)
    const userRole = authStore.user?.perfil.papel;
    if (userRole && !requiredRoles.includes(userRole)) {
      // Usuário logado tenta acessar área de outro papel
      return `/${userRole}`;
    }

    // Passou por tudo, acesso concedido
    return true;
  });
});
