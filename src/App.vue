<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { supabaseClient } from '@/core/supabase/client';
import { useAuthStore } from '@/stores/auth.store';
import { useThemeStore } from '@/stores/theme.store';
import type { AuthChangeEvent, Session, Subscription } from '@supabase/supabase-js';

const authStore = useAuthStore();
const themeStore = useThemeStore();

const isOffline = ref(!navigator.onLine);

function updateOnlineStatus() {
  isOffline.value = !navigator.onLine;
}

// Inicialização síncrona do tema antes de montar o DOM para prevenir FOUC visual
themeStore.initTheme();
let authListener: Subscription | null = null;

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);

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
  window.removeEventListener('online', updateOnlineStatus);
  window.removeEventListener('offline', updateOnlineStatus);

  // Limpeza de memória obrigatória (Observability rule)
  if (authListener) {
    authListener.unsubscribe();
  }
});
</script>

<template>
  <q-banner
    v-if="isOffline"
    inline-actions
    class="text-white bg-negative z-max fixed-top text-center shadow-4"
  >
    <strong>Sem conexão com a internet</strong>. O aplicativo pode não funcionar corretamente.
  </q-banner>
  <router-view />
</template>
