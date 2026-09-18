import { ref, readonly, getCurrentInstance, onMounted } from 'vue';

// Estado global compartilhado
const isOnline = ref<boolean>(typeof window !== 'undefined' ? navigator.onLine : true);
let listenersAttached = false;

function updateStatus() {
  if (typeof window !== 'undefined') {
    isOnline.value = navigator.onLine;
  }
}

function attachListeners() {
  if (typeof window !== 'undefined' && !listenersAttached) {
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    listenersAttached = true;
  }
}

export function useNetworkStatus() {
  const instance = getCurrentInstance();

  if (instance) {
    onMounted(attachListeners);
  } else {
    // Quando inicializado fora de um componente (ex: Pinia store dentro do boot auth-guard)
    attachListeners();
  }

  return {
    isOnline: readonly(isOnline),
  };
}
