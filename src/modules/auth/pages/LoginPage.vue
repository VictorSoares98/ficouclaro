<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from '@/stores/auth.store';
import { biometricService } from '@/core/services/biometric.service';
import AuthFormContainer from '@/modules/auth/components/AuthFormContainer.vue';

interface PasswordCredentialExt {
  id?: string;
  password?: string;
}

interface CredentialRequestOptionsWithPassword extends CredentialRequestOptions {
  password?: boolean;
}

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const isPasswordVisible = ref(false);
const isBiometricAvailable = ref(false);

onMounted(async () => {
  // Verifica se o dispositivo possui suporte a biometria/digital
  const bioStatus = await biometricService.checkAvailability();
  isBiometricAvailable.value = bioStatus.isAvailable;

  // Dispara o modal nativo do sistema (Google Password Manager / Samsung Pass / iCloud) ao carregar a página
  if (typeof window !== 'undefined' && 'credentials' in navigator && navigator.credentials.get) {
    try {
      const cred = (await navigator.credentials.get({
        password: true,
      } as CredentialRequestOptionsWithPassword)) as PasswordCredentialExt | null;

      if (cred && cred.id && cred.password) {
        email.value = cred.id;
        password.value = cred.password;
      }
    } catch (err) {
      console.debug('[CredentialManager] Nenhuma credencial selecionada:', err);
    }
  }
});

async function onBiometricLogin() {
  const success = await biometricService.authenticate('Escaneie sua digital para entrar');
  if (!success) return;

  try {
    const creds = await biometricService.getCredentials();
    if (creds && creds.username && creds.password) {
      email.value = creds.username;
      password.value = creds.password;
      await onSubmit();
    } else {
      throw new Error('No credentials');
    }
  } catch {
    $q.notify({
      type: 'warning',
      message: 'Nenhuma digital vinculada. Faça login com e-mail e senha para ativar.',
      position: 'top',
    });
  }
}

async function onSubmit() {
  try {
    await authStore.login({ email: email.value, password: password.value });

    // Se o dispositivo suporta biometria mas o usuário ainda não ativou, sugere ativar
    // Transformamos o dialog num bloqueio usando Promise para ele não ser engolido pelo router.push
    if (isBiometricAvailable.value && !biometricService.isBiometricsEnabled()) {
      await new Promise<void>((resolve) => {
        $q.dialog({
          title: 'Ativar Biometria',
          message:
            'Deseja ativar o acesso rápido por digital/biometria? Sua credencial fica armazenada apenas no chip de segurança do seu próprio aparelho, não sendo enviada ou guardada em nossos servidores.',
          ok: { label: 'Ativar Biometria', color: 'primary', unelevated: true },
          cancel: { label: 'Agora não', flat: true, color: 'grey-7' },
        })
          .onOk(() => {
            void biometricService.saveCredentials(email.value, password.value);
            $q.notify({
              type: 'positive',
              message: 'Biometria ativada com sucesso!',
              position: 'top',
            });
            resolve();
          })
          .onCancel(() => resolve())
          .onDismiss(() => resolve());
      });
    }

    // Registra a credencial no gerenciador nativo do dispositivo após login bem-sucedido
    if (
      typeof window !== 'undefined' &&
      'credentials' in navigator &&
      (window as unknown as Record<string, unknown>).PasswordCredential
    ) {
      try {
        const PasswordCred = (
          window as unknown as {
            PasswordCredential: new (data: { id: string; password: string }) => Credential;
          }
        ).PasswordCredential;
        const cred = new PasswordCred({
          id: email.value,
          password: password.value,
        });
        await navigator.credentials.store(cred);
      } catch (err) {
        console.debug('[CredentialManager] Erro ao salvar credencial:', err);
      }
    }

    const papel = authStore.user?.perfil.papel;

    $q.notify({
      type: 'positive',
      message: 'Bem-vindo de volta!',
      position: 'top',
    });

    const redirect = router.currentRoute.value.query.redirect as string;

    if (redirect) {
      void router.push(redirect);
    } else if (papel === 'professor') {
      void router.push('/disciplinas');
    } else if (papel === 'aluno') {
      void router.push('/hub');
    } else {
      void router.push('/');
    }
  } catch {
    // O erro já é tratado e notificado globalmente pelo authStore (useAsyncOperation)
  }
}
</script>

<template>
  <AuthFormContainer
    title="Bem-vindo(a)"
    subtitle="Acesse sua conta para continuar sua jornada no Ficou Claro?"
    :isLoading="authStore.isLoading"
  >
    <div class="tw-space-y-3.5">
      <!-- Desbloqueio Biométrico Compacto -->
      <div v-if="isBiometricAvailable">
        <q-btn
          outline
          color="primary"
          class="tw-w-full tw-h-10 tw-rounded-xl tw-text-xs sm:tw-text-sm tw-font-semibold tw-border-primary/40 hover:tw-bg-primary/5"
          icon="fingerprint"
          label="Desbloquear com Biometria"
          @click.stop="onBiometricLogin"
          :loading="authStore.isLoading"
          no-caps
        />
      </div>

      <div>
        <!-- Login Google Compacto -->
        <q-btn
          class="tw-w-full tw-h-10 sm:tw-h-11 tw-rounded-xl tw-text-xs sm:tw-text-sm tw-font-bold tw-shadow-sm tw-bg-white hover:tw-bg-gray-50 dark:tw-bg-dark-page dark:hover:tw-bg-dark tw-border tw-border-gray-200 dark:tw-border-gray-800"
          text-color="grey-9"
          icon="img:https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
          label="Entrar com Google"
          unelevated
          no-wrap
          @click="authStore.loginWithGoogle()"
          :loading="authStore.isLoading"
        />
      </div>

      <p class="tw-text-[11px] tw-text-center text-muted tw-mt-1">
        Ao continuar, você concorda com nossos
        <router-link to="/termos" class="tw-text-primary hover:tw-underline">Termos</router-link> e
        <router-link to="/privacidade" class="tw-text-primary hover:tw-underline"
          >Privacidade</router-link
        >.
      </p>

      <div class="tw-flex tw-items-center tw-my-1.5">
        <div class="tw-flex-1 tw-h-px tw-bg-gray-300 dark:tw-bg-gray-700"></div>
        <span class="tw-px-3 text-muted tw-text-xs tw-font-medium">ou com e-mail</span>
        <div class="tw-flex-1 tw-h-px tw-bg-gray-300 dark:tw-bg-gray-700"></div>
      </div>

      <q-form @submit.prevent="onSubmit" class="tw-space-y-3">
        <div>
          <label class="tw-text-muted tw-text-xs tw-font-bold tw-mb-1 tw-block">E-mail de Acesso</label>
          <q-input
            v-model="email"
            type="email"
            placeholder="seu.email@faculdade.edu"
            dense
            outlined
            lazy-rules
            :rules="[
              (val) => !!val || 'O e-mail é obrigatório',
              (val) => /.+@.+\..+/.test(val) || 'E-mail inválido',
            ]"
            id="email"
            autocomplete="email"
            name="email"
            enterkeyhint="next"
            color="primary"
          />
        </div>

        <div>
          <label class="tw-text-muted tw-text-xs tw-font-bold tw-mb-1 tw-block">Senha</label>
          <q-input
            v-model="password"
            :type="isPasswordVisible ? 'text' : 'password'"
            placeholder="Sua senha secreta"
            dense
            outlined
            lazy-rules
            :rules="[
              (val) => !!val || 'A senha é obrigatória',
              (val) => val.length >= 6 || 'A senha deve ter no mínimo 6 caracteres',
            ]"
            id="password"
            autocomplete="current-password"
            name="password"
            enterkeyhint="done"
            color="primary"
          >
            <template v-slot:append>
              <q-btn
                round
                dense
                flat
                size="sm"
                :icon="isPasswordVisible ? 'visibility_off' : 'visibility'"
                :aria-label="isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'"
                @click="isPasswordVisible = !isPasswordVisible"
              />
            </template>
          </q-input>
        </div>

        <q-btn
          type="submit"
          color="primary"
          class="tw-w-full tw-h-10 sm:tw-h-11 tw-rounded-xl tw-text-sm sm:tw-text-base tw-font-bold tw-shadow-md tw-mt-1"
          :loading="authStore.isLoading"
          unelevated
          label="Entrar na Plataforma"
        />
      </q-form>
    </div>
  </AuthFormContainer>
</template>
