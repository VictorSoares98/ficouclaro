import { defineRouter } from '#q-app';
import routes from '@/router/routes';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter((/* { store, ssrContext } */) => {
  const createHistory = import.meta.env.QUASAR_SERVER
    ? createMemoryHistory
    : import.meta.env.QUASAR_VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(import.meta.env.QUASAR_VUE_ROUTER_BASE),
  });

  Router.onError((error, to) => {
    // Quando o app é atualizado no Cloudflare, chunks antigos somem.
    // Se o usuário clicar num link com o app aberto, esse erro ocorre (MIME text/html ou failed to fetch).
    // Solução: Recarregar a página para puxar o novo index.html com os novos hashes.
    const isChunkLoadFailed =
      error.message.includes('dynamically imported module') ||
      error.message.includes('Failed to fetch');

    if (isChunkLoadFailed) {
      console.warn('[Router] Chunk desatualizado detectado. Forçando reload...');
      window.location.href = to.fullPath;
    }
  });

  return Router;
});
