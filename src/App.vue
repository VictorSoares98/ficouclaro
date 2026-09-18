<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { supabaseClient } from '@/core/supabase/client';
import { useAuthStore } from '@/stores/auth.store';
import { useThemeStore } from '@/stores/theme.store';
import type { AuthChangeEvent, Session, Subscription } from '@supabase/supabase-js';
import { useQuasar } from 'quasar';

const authStore = useAuthStore();
const themeStore = useThemeStore();
const $q = useQuasar();

import { useNetworkStatus } from '@/core/composables/useNetworkStatus';

const { isOnline } = useNetworkStatus();

// Inicialização síncrona do tema antes de montar o DOM para prevenir FOUC visual
themeStore.initTheme();
let authListener: Subscription | null = null;

onMounted(() => {
  // Catch nativo do Vite: Se o usuário tentar baixar um chunk antigo que o Cloudflare já apagou, recarregamos silenciosamente.
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    $q.notify({
      type: 'warning',
      icon: 'cloud_sync',
      message: 'Sincronizando com a nuvem...',
      position: 'top',
      timeout: 1000,
      onDismiss: () => window.location.reload(),
    });
  });

  // Configura o listener global para expiração ou login em outras abas
  const { data } = supabaseClient.auth.onAuthStateChange(
    async (event: AuthChangeEvent, session: Session | null) => {
      if (event === 'SIGNED_OUT' || !session) {
        authStore.clearUser();
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await authStore.reloadProfile(session.user);
      }
    },
  );
  authListener = data.subscription;
});

onUnmounted(() => {
  // Limpeza de memória obrigatória (Observability rule)
  if (authListener) {
    authListener.unsubscribe();
  }
});
</script>

<template>
  <q-banner
    v-if="!isOnline"
    inline-actions
    class="text-white bg-negative z-max fixed-top text-center shadow-4"
  >
    <strong>Sem conexão com a internet</strong>. O aplicativo pode não funcionar corretamente.
  </q-banner>
  <router-view v-slot="{ Component }">
    <transition name="q-transition--fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>
