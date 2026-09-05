import { ref } from 'vue';
import { Notify } from 'quasar';

export function useAsyncOperation() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const execute = async <T>(
    operation: () => Promise<T>,
    fallbackErrorMsg = 'Ocorreu um erro na operação.',
    showNotify = true,
  ): Promise<T> => {
    isLoading.value = true;
    error.value = null;
    try {
      return await operation();
    } catch (err: unknown) {
      let msg = err instanceof Error ? err.message : fallbackErrorMsg;
      const lower = msg.toLowerCase();

      // Trata erros de rede / bloqueio de Wi-Fi corporativo ou de faculdade
      if (
        lower.includes('failed to fetch') ||
        lower.includes('networkerror') ||
        lower.includes('network request failed') ||
        lower.includes('load failed')
      ) {
        msg = 'Sem conexão com o servidor. Se estiver no Wi-Fi da faculdade, autentique na rede ou use o 4G/5G.';
      }

      error.value = msg;
      if (showNotify) {
        Notify.create({
          type: 'negative',
          message: error.value,
          position: 'bottom-right',
          timeout: 4000,
        });
      }
      throw new Error(msg, { cause: err });
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    error,
    execute,
  };
}
