import { defineBoot } from '#q-app';
import { useAuthStore } from '@/stores/auth.store';
import { ROUTE_ROLES } from '@/router/route-meta';

export default defineBoot(({ router, store }) => {
  const authStore = useAuthStore(store);

  router.beforeEach(async (to) => {
    // FOUC Prevention & Initial Session Load:
    // DEVE rodar antes de qualquer checagem de RBAC
    if (!authStore.isReady) {
      await authStore.loadInitialSession();
    }

    // Extrai o contexto raiz da rota. Ex: '/aluno/dashboard' -> '/aluno'
    const rootPath = `/${to.path.split('/')[1]}`;

    const requiredRoles = ROUTE_ROLES[rootPath];

    // Rota Pública
    if (!requiredRoles) {
      // Se já estiver logado e tentar ir para rotas iniciais/públicas, manda pro dashboard correspondente
      if (
        authStore.isAuthenticated &&
        (to.path === '/' || to.path === '/login' || to.path === '/register')
      ) {
        const userRole = authStore.user?.perfil.papel;
        if (userRole === 'professor') return '/disciplinas';
        if (userRole === 'aluno') return '/hub';
        return '/';
      }
      return true; // Permitido acesso público
    }

    // Rota Protegida, mas sem login
    if (!authStore.isAuthenticated) {
      return { path: '/login', query: { redirect: to.fullPath } };
    }

    // Rota Protegida com login (Checagem RBAC)
    const userRole = authStore.user?.perfil.papel;
    if (userRole && !requiredRoles.includes(userRole)) {
      // Usuário logado tenta acessar área de outro papel
      if (userRole === 'professor') return '/disciplinas';
      if (userRole === 'aluno') return '/hub';
      return '/';
    }

    // Passou por tudo, acesso concedido
    return true;
  });
});
