<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { App as CapacitorApp } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { Platform } from 'quasar';
import AnimatedSplash from '@/components/AnimatedSplash.vue';
import { supabaseClient } from '@/core/supabase/client';
import { useAuthStore } from '@/stores/auth.store';
import { useThemeStore } from '@/stores/theme.store';
import { useAccessibilityStore } from '@/stores/accessibility.store';
import type { AuthChangeEvent, Session, Subscription } from '@supabase/supabase-js';
import { useQuasar } from 'quasar';
import { useNetworkStatus } from '@/core/composables/useNetworkStatus';
import LibrasWidget from '@/components/LibrasWidget.vue';
import LockScreen from '@/components/LockScreen.vue';
import { useSessionTimeout } from '@/core/composables/useSessionTimeout';

const authStore = useAuthStore();
const themeStore = useThemeStore();
const accessibilityStore = useAccessibilityStore();
const router = useRouter();
const $q = useQuasar();

const { isOnline } = useNetworkStatus();

// Ativa temporizadores de inatividade e background (Padrão 3)
useSessionTimeout();

// Inicialização síncrona do tema antes de montar o DOM para prevenir FOUC visual
themeStore.initTheme();
accessibilityStore.initAccessibility();
let authListener: Subscription | null = null;

const splashRef = ref<InstanceType<typeof AnimatedSplash> | null>(null);
const showVueSplash = ref(true);

onMounted(async () => {
  // 1. Handoff: Esconde o nativo brutalmente. O Vue Splash já está desenhado por trás.
  if (Platform.is.capacitor) {
    try {
      await SplashScreen.hide();
    } catch (e) {
      console.warn('Erro ao ocultar splash nativo', e);
    }
  }

  // 2. Aguarda um curto período de apreciação (estilo Netflix/iFood)
  setTimeout(() => {
    // 3. Inicia animação de saída (zoom out + fade)
    splashRef.value?.hide();

    // 4. Remove o componente do DOM após o término da animação
    setTimeout(() => {
      showVueSplash.value = false;
    }, 700);
  }, 1000);

  // Listener do Capacitor para abertura de QR Code e Deep Links (Universal Links + Custom Schemes)
  void CapacitorApp.addListener('appUrlOpen', (event) => {
    try {
      // Caso seja Universal Link HTTP/HTTPS (ex: https://ficouclaro.pages.dev/#/hub?join=XYZ)
      if (event.url.startsWith('http')) {
        const slug = event.url.split('#').pop();
        if (slug && slug !== '/') {
          void router.push(slug);
        }
      } else {
        // Fallback para Custom Schemes (ex: ficouclaro://hub?join=XYZ)
        const path = event.url
          .replace(/^ficouclaro:\/\//, '/')
          .replace(/^com\.ficouclaro\.app:\/\//, '/');
        if (path && path !== '/') {
          void router.push(path);
        }
      }
    } catch (e) {
      console.error('Erro ao processar Deep Link:', e);
    }
  });

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
  void CapacitorApp.removeAllListeners();
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

  <!-- SPLASH ANIMADO SOBREPOSTO A TUDO -->
  <AnimatedSplash v-if="showVueSplash" ref="splashRef" />
  
  <LibrasWidget />
  <LockScreen v-if="authStore.isLocked" />

  <router-view v-slot="{ Component }">
    <transition name="q-transition--fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>
