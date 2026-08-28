import { ref } from 'vue';

export function useAsyncOperation() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const execute = async <T>(
    operation: () => Promise<T>,
    fallbackErrorMsg = 'Ocorreu um erro na operação.',
  ): Promise<T> => {
    isLoading.value = true;
    error.value = null;
    try {
      return await operation();
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : fallbackErrorMsg;
      throw err instanceof Error ? err : new Error(error.value);
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
