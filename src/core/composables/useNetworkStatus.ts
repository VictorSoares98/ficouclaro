import { ref, onMounted, onUnmounted, readonly } from 'vue';

export function useNetworkStatus() {
  // Inicializa de forma segura verificando se estamos em um ambiente de browser
  const isOnline = ref<boolean>(typeof window !== 'undefined' ? navigator.onLine : true);

  function updateStatus() {
    if (typeof window !== 'undefined') {
      isOnline.value = navigator.onLine;
    }
  }

  onMounted(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', updateStatus);
      window.addEventListener('offline', updateStatus);
    }
  });

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    }
  });

  return {
    isOnline: readonly(isOnline),
  };
}
