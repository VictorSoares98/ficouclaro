<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { supabaseClient } from '@/core/supabase/client';
import { useAuthStore } from '@/stores/auth.store';
import { useThemeStore } from '@/stores/theme.store';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

const authStore = useAuthStore();
const themeStore = useThemeStore();

// Inicialização síncrona do tema antes de montar o DOM para prevenir FOUC visual
themeStore.initTheme();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let authListener: any = null;

onMounted(() => {
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
  authListener = data;
});

onUnmounted(() => {
  // Limpeza de memória obrigatória (Observability rule)
  if (authListener) {
    authListener.subscription.unsubscribe();
  }
});
</script>

<template>
  <router-view />
</template>
