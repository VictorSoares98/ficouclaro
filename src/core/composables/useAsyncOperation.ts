import { ref } from 'vue';
import { Notify } from 'quasar';
import { useNetworkStatus } from '@/core/composables/useNetworkStatus';
import { i18n } from '@/boot/i18n';

export function useAsyncOperation() {
  const { isOnline } = useNetworkStatus();
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
        !isOnline.value ||
        lower.includes('failed to fetch') ||
        lower.includes('networkerror') ||
        lower.includes('network request failed') ||
        lower.includes('load failed')
      ) {
        msg = i18n.global.t('errors.network.offline');
      } else if (lower.includes('invalid login credentials')) {
        msg = i18n.global.t('errors.auth.invalid_credentials');
      } else if (lower.includes('user already registered')) {
        msg = i18n.global.t('errors.auth.user_already_registered');
      } else if (lower.includes('password should be at least')) {
        msg = i18n.global.t('errors.auth.weak_password');
      } else if (lower.includes('email not confirmed')) {
        msg = i18n.global.t('errors.auth.email_not_confirmed');
      } else if (lower.includes('jwt expired')) {
        msg = i18n.global.t('errors.auth.jwt_expired');
      } else if (lower.includes('duplicate key value violates unique constraint')) {
        msg = i18n.global.t('errors.database.unique_violation');
      } else if (lower.includes('new password should be different')) {
        msg = i18n.global.t('errors.auth.same_password');
      } else if (lower.includes('rate limit')) {
        msg = i18n.global.t('errors.network.rate_limit');
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
