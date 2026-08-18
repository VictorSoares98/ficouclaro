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

  router.beforeEach((to, from, next) => {
    // Extrai o contexto raiz da rota. Ex: '/aluno/dashboard' -> '/aluno'
    const rootPath = `/${to.path.split('/')[1]}`;
    
    const requiredRoles = ROUTE_ROLES[rootPath];

    // Rota Pública
    if (!requiredRoles) {
      // Se já estiver logado e tentar ir para login/register, manda pro dashboard
      if (authStore.isAuthenticated && (to.path === '/login' || to.path === '/register')) {
        const userRole = authStore.user?.perfil.papel;
        return next(userRole ? `/${userRole}` : '/');
      }
      return next(); // Permitido acesso público
    }

    // Rota Protegida, mas sem login
    if (!authStore.isAuthenticated) {
      return next('/login');
    }

    // Rota Protegida com login (Checagem RBAC)
    const userRole = authStore.user?.perfil.papel;
    if (userRole && !requiredRoles.includes(userRole)) {
      // Usuário logado tenta acessar área de outro papel
      return next(`/${userRole}`);
    }

    // Passou por tudo, acesso concedido
    next();
  });
});
