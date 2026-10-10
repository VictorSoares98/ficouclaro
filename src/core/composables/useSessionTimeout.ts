import { onMounted, onUnmounted, watch } from 'vue';
import { App as CapacitorApp } from '@capacitor/app';
import type { PluginListenerHandle } from '@capacitor/core';
import { useAuthStore } from '@/stores/auth.store';
import { Platform } from 'quasar';

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutos
const BACKGROUND_TOLERANCE_MS = 3 * 60 * 1000; // 3 minutos

export function useSessionTimeout() {
  const authStore = useAuthStore();

  let inactivityTimer: number | null = null;
  let lastPauseTime: number | null = null;
  let isListening = false;

  const resetTimer = () => {
    if (inactivityTimer) {
      window.clearTimeout(inactivityTimer);
    }

    if (authStore.isAuthenticated && !authStore.isLocked) {
      inactivityTimer = window.setTimeout(() => {
        authStore.lockSession();
      }, INACTIVITY_TIMEOUT_MS);
    }
  };

  // Throttle events to avoid performance issues (executa no máximo 1x por segundo)
  let throttleTimer: number | null = null;
  const handleActivity = () => {
    if (throttleTimer) return;
    throttleTimer = window.setTimeout(() => {
      resetTimer();
      throttleTimer = null;
    }, 1000);
  };

  const handlePause = () => {
    lastPauseTime = Date.now();
  };

  const handleResume = () => {
    if (lastPauseTime && authStore.isAuthenticated && !authStore.isLocked) {
      const timeInBackground = Date.now() - lastPauseTime;
      if (timeInBackground >= BACKGROUND_TOLERANCE_MS) {
        authStore.lockSession();
      } else {
        resetTimer();
      }
    }
    lastPauseTime = null;
  };

  // Se o usuário logar/deslogar, resetamos o timer correspondente
  watch(
    () => authStore.isAuthenticated,
    (isAuth) => {
      if (isAuth) resetTimer();
      else if (inactivityTimer) window.clearTimeout(inactivityTimer);
    },
  );

  onMounted(() => {
    if (isListening) return;
    isListening = true;

    // Web DOM Events para inatividade
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    // Capacitor App Events para background/foreground
    let pauseListener: PluginListenerHandle;
    let resumeListener: PluginListenerHandle;

    if (Platform.is.capacitor) {
      void CapacitorApp.addListener('pause', handlePause).then((h) => (pauseListener = h));
      void CapacitorApp.addListener('resume', handleResume).then((h) => (resumeListener = h));
    }

    resetTimer();

    // Limpeza ao desmontar
    onUnmounted(() => {
      if (inactivityTimer) window.clearTimeout(inactivityTimer);
      if (throttleTimer) window.clearTimeout(throttleTimer);

      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);

      if (pauseListener) void pauseListener.remove();
      if (resumeListener) void resumeListener.remove();
    });
  });
}
