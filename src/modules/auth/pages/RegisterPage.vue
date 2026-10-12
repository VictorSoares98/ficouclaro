<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from '@/stores/auth.store';
import type { PapelUsuario } from '@/core/types/auth.types';
import AuthFormContainer from '@/modules/auth/components/AuthFormContainer.vue';
import PasswordStrengthMeter from '@/modules/auth/components/PasswordStrengthMeter.vue';

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();

const fullName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const isPasswordVisible = ref(false);
const role = ref<PapelUsuario>('aluno');
const acceptTerms = ref(false);

const googleButtonLabel = computed(() =>
  role.value === 'professor'
    ? 'Cadastrar como Professor com Google'
    : 'Cadastrar como Aluno com Google',
);

onMounted(() => {
  const saved = localStorage.getItem('ficouclaro_register_draft');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      if (data.fullName) fullName.value = data.fullName;
      if (data.email) email.value = data.email;
      if (data.role) role.value = data.role;
    } catch {
      localStorage.removeItem('ficouclaro_register_draft');
    }
  }
});

watch([fullName, email, role], () => {
  localStorage.setItem(
    'ficouclaro_register_draft',
    JSON.stringify({
      fullName: fullName.value,
      email: email.value,
      role: role.value,
    }),
  );
});

const roleOptions: { label: string; value: PapelUsuario }[] = [
  { label: 'Sou Aluno', value: 'aluno' },
  { label: 'Sou Professor', value: 'professor' },
];

async function onSubmit() {
  if (password.value !== confirmPassword.value) {
    $q.notify({
      type: 'negative',
      message: 'As senhas não coincidem',
      position: 'top',
    });
    return;
  }

  try {
    await authStore.register({
      email: email.value,
      password: password.value,
      options: {
        data: {
          nome_completo: fullName.value,
          papel: role.value,
          termos_aceitos_em: new Date().toISOString(),
          versao_termos: '1.0.0', // Versão atual da Política de Privacidade
        },
      },
    });

    // Registra a credencial no gerenciador nativo do dispositivo após criar a conta
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

    $q.notify({
      type: 'positive',
      message: 'Conta criada com sucesso!',
      position: 'top',
    });

    localStorage.removeItem('ficouclaro_register_draft');

    if (role.value === 'professor') {
      void router.push('/disciplinas');
    } else {
      void router.push('/hub');
    }
  } catch {
    // O erro já é tratado e notificado globalmente pelo authStore (useAsyncOperation)
    // Este catch serve apenas para interromper o fluxo e evitar o redirecionamento indevido
  }
}

async function onGoogleLogin() {
  if (!acceptTerms.value) {
    $q.notify({
      type: 'warning',
      message:
        'Você deve aceitar os Termos de Uso e a Política de Privacidade antes de continuar com o Google.',
      position: 'top',
    });
    return;
  }
  await authStore.loginWithGoogle({
    papel: role.value,
    termos_aceitos_em: new Date().toISOString(),
    versao_termos: '1.0.0',
  });
}
</script>

<template>
  <AuthFormContainer
    title="Criar Conta"
    subtitle="Junte-se à revolução do aprendizado síncrono."
    :isLoading="authStore.isLoading"
  >
    <div class="tw-space-y-6">
      <!-- 1. Seleção de Papel no Topo (Role-First) -->
      <div class="tw-flex tw-justify-center">
        <q-btn-toggle
          v-model="role"
          spread
          class="tw-w-full tw-shadow-sm tw-rounded-xl"
          no-caps
          unelevated
          toggle-color="primary"
          color="white"
          text-color="grey-8"
          :options="roleOptions"
        />
      </div>

      <!-- 2. Aceite dos Termos de Uso e Privacidade (LGPD) -->
      <q-checkbox v-model="acceptTerms" color="primary" class="tw-w-full">
        Li e concordo com os
        <router-link
          to="/termos"
          @click.stop
          class="tw-text-primary tw-font-semibold hover:tw-underline"
          >Termos de Uso</router-link
        >
        e a
        <router-link
          to="/privacidade"
          @click.stop
          class="tw-text-primary tw-font-semibold hover:tw-underline"
          >Política de Privacidade</router-link
        >.
      </q-checkbox>

      <!-- 3. Botão de Cadastro Social com Papel Contextualizado -->
      <q-btn
        class="tw-w-full tw-h-12 tw-rounded-xl tw-text-base tw-font-bold tw-shadow-md tw-bg-white hover:tw-bg-gray-50 dark:tw-bg-dark-page dark:hover:tw-bg-dark"
        text-color="grey-9"
        icon="img:https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
        :label="googleButtonLabel"
        unelevated
        no-wrap
        @click="onGoogleLogin"
        :loading="authStore.isLoading"
      />

      <!-- 4. Divisor -->
      <div class="tw-flex tw-items-center">
        <div class="tw-flex-1 tw-h-px tw-bg-gray-300"></div>
        <span class="tw-px-4 text-muted tw-font-medium">ou cadastre-se com e-mail</span>
        <div class="tw-flex-1 tw-h-px tw-bg-gray-300"></div>
      </div>

      <!-- 5. Formulário de Cadastro Tradicional -->
      <q-form @submit.prevent="onSubmit" class="tw-space-y-6">
        <q-input
          v-model="fullName"
          type="text"
          label="Nome Completo"
          outlined
          lazy-rules
          :rules="[(val) => !!val || 'O nome é obrigatório']"
          autocomplete="name"
          name="name"
          enterkeyhint="next"
          color="primary"
        />

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
          autocomplete="email"
          name="email"
          enterkeyhint="next"
          color="primary"
        />

        <div>
          <q-input
            v-model="password"
            :type="isPasswordVisible ? 'text' : 'password'"
            label="Senha"
            outlined
            lazy-rules
            :rules="[
              (val) => !!val || 'A senha é obrigatória',
              (val) =>
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/.test(val) ||
                'A senha não atende aos requisitos mínimos de segurança',
            ]"
            autocomplete="new-password"
            name="password"
            enterkeyhint="next"
            color="primary"
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

          <PasswordStrengthMeter :password="password" />
        </div>

        <q-input
          v-model="confirmPassword"
          :type="isPasswordVisible ? 'text' : 'password'"
          label="Confirmar Senha"
          outlined
          lazy-rules
          :rules="[
            (val) => !!val || 'A confirmação é obrigatória',
            (val) => val === password || 'As senhas não coincidem',
          ]"
          autocomplete="new-password"
          enterkeyhint="done"
          color="primary"
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
          class="tw-w-full tw-h-12 tw-rounded-xl tw-text-base tw-font-bold tw-shadow-md"
          :loading="authStore.isLoading"
          :disable="!acceptTerms"
          unelevated
          label="Cadastrar com E-mail"
        />
      </q-form>
    </div>

    <template #footer>
      <p class="text-muted">
        Já possui uma conta?
        <router-link to="/login" class="tw-text-primary tw-font-semibold hover:tw-underline">
          Faça login
        </router-link>
      </p>
    </template>
  </AuthFormContainer>
</template>
