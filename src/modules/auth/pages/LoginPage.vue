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
    title="Entrar"
    subtitle="Insira suas credenciais para acessar a plataforma."
    :isLoading="authStore.isLoading"
  >
    <div class="tw-space-y-6">
      <!-- Botão Premium de Biometria -->
      <div
        v-if="isBiometricAvailable"
        class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-mb-2"
      >
        <div class="tw-relative tw-group tw-cursor-pointer" @click="onBiometricLogin">
          <!-- Efeito Glow / Pulse de fundo -->
          <div
            class="tw-absolute -tw-inset-2 tw-bg-gradient-to-r tw-from-primary tw-to-secondary tw-rounded-full tw-blur-md tw-opacity-40 group-hover:tw-opacity-75 tw-transition tw-duration-500 tw-animate-pulse"
          ></div>
          <!-- Botão Circular -->
          <q-btn
            round
            size="24px"
            color="primary"
            text-color="white"
            icon="fingerprint"
            class="tw-relative tw-shadow-2xl hover:tw-scale-110 tw-transition-transform tw-duration-300"
            @click.stop="onBiometricLogin"
            :loading="authStore.isLoading"
          />
        </div>
        <p
          class="tw-mt-4 tw-text-xs tw-font-semibold tw-text-gray-500 dark:tw-text-gray-400 tw-tracking-widest tw-uppercase"
        >
          Desbloqueio Rápido
        </p>
      </div>

      <div class="tw-space-y-3">
        <!-- Login Google mantido com estilo limpo -->
        <q-btn
          class="tw-w-full tw-h-14 tw-rounded-xl tw-text-base sm:tw-text-lg tw-font-bold tw-shadow-md tw-bg-white hover:tw-bg-gray-50 dark:tw-bg-dark-page dark:hover:tw-bg-dark"
          text-color="grey-9"
          icon="img:https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
          label="Continuar com Google"
          unelevated
          no-wrap
          @click="authStore.loginWithGoogle()"
          :loading="authStore.isLoading"
        />
      </div>

      <p class="tw-text-xs tw-text-center text-muted tw-mt-2">
        Ao continuar, você concorda com nossos
        <router-link to="/termos" class="tw-text-primary hover:tw-underline">Termos</router-link> e
        <router-link to="/privacidade" class="tw-text-primary hover:tw-underline"
          >Privacidade</router-link
        >.
      </p>

      <div class="tw-flex tw-items-center">
        <div class="tw-flex-1 tw-h-px tw-bg-gray-300"></div>
        <span class="tw-px-4 text-muted tw-font-medium">ou</span>
        <div class="tw-flex-1 tw-h-px tw-bg-gray-300"></div>
      </div>

      <q-form @submit.prevent="onSubmit" class="tw-space-y-6">
        <q-input
          v-model="email"
          type="email"
          label="E-mail"
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
          class="tw-text-lg"
        />

        <q-input
          v-model="password"
          :type="isPasswordVisible ? 'text' : 'password'"
          label="Senha"
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
          class="tw-text-lg"
        >
          <template v-slot:append>
            <q-btn
              round
              dense
              flat
              :icon="isPasswordVisible ? 'visibility_off' : 'visibility'"
              :aria-label="isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'"
              @click="isPasswordVisible = !isPasswordVisible"
            />
          </template>
        </q-input>

        <q-btn
          type="submit"
          color="primary"
          class="tw-w-full tw-h-14 tw-rounded-xl tw-text-lg tw-font-bold tw-shadow-md"
          :loading="authStore.isLoading"
          unelevated
          label="Entrar"
        />
      </q-form>
    </div>

    <template #footer>
      <p class="text-muted">
        Não tem uma conta?
        <router-link to="/register" class="tw-text-primary tw-font-semibold hover:tw-underline">
          Cadastre-se
        </router-link>
      </p>
    </template>
  </AuthFormContainer>
</template>
