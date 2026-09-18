<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from '@/stores/auth.store';
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

onMounted(async () => {
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

async function onSubmit() {
  try {
    await authStore.login({ email: email.value, password: password.value });

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

    if (papel === 'professor') {
      void router.push('/disciplinas');
    } else if (papel === 'aluno') {
      void router.push('/hub');
    } else {
      void router.push('/');
    }
  } catch {
    // O erro já é tratado e notificado globalmente pelo authStore (useAsyncOperation)
    // Este catch serve apenas para interromper o fluxo e evitar o redirecionamento indevido
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
      <q-btn
        class="tw-w-full tw-h-14 tw-rounded-xl tw-text-base sm:tw-text-lg tw-font-bold tw-shadow-md tw-bg-white hover:tw-bg-gray-50"
        text-color="grey-9"
        icon="img:https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
        label="Continuar com Google"
        unelevated
        no-wrap
        @click="authStore.loginWithGoogle()"
        :loading="authStore.isLoading"
      />
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
          reactive-rules
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
          reactive-rules
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
