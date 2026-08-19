<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from '../../../stores/auth.store';

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');

async function onSubmit() {
  try {
    await authStore.login({ email: email.value, password: password.value });

    const papel = authStore.user?.perfil.papel;

    $q.notify({
      type: 'positive',
      message: 'Bem-vindo de volta!',
      position: 'top',
    });

    if (papel) {
      void router.push(`/${papel}`);
    } else {
      void router.push('/');
    }
  } catch (error) {
    const err = error as Error;
    $q.notify({
      type: 'negative',
      message: err.message || 'Erro ao realizar login',
      position: 'top',
    });
  }
}
</script>

<template>
  <q-page
    class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-p-4"
  >
    <q-card
      class="tw-w-full tw-max-w-md tw-rounded-2xl tw-shadow-xl tw-p-8"
    >
      <div class="tw-text-center tw-mb-8">
        <h2 class="tw-text-3xl tw-font-extrabold tw-mb-2">
          Entrar
        </h2>
        <p class="tw-opacity-70">
          Insira suas credenciais para acessar a plataforma.
        </p>
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
          autocomplete="email"
          color="primary"
          class="tw-text-lg"
        />

        <q-input
          v-model="password"
          type="password"
          label="Senha"
          outlined
          lazy-rules
          :rules="[
            (val) => !!val || 'A senha é obrigatória',
            (val) => val.length >= 6 || 'A senha deve ter no mínimo 6 caracteres',
          ]"
          autocomplete="current-password"
          color="primary"
          class="tw-text-lg"
        />

        <q-btn
          type="submit"
          color="primary"
          class="tw-w-full tw-h-14 tw-rounded-xl tw-text-lg tw-font-bold tw-shadow-md"
          :loading="authStore.isLoading"
          unelevated
          label="Entrar"
        />
      </q-form>

      <div class="tw-mt-8 tw-text-center">
        <p class="tw-opacity-70">
          Não tem uma conta?
          <router-link to="/register" class="tw-text-primary tw-font-semibold hover:tw-underline">
            Cadastre-se
          </router-link>
        </p>
      </div>
    </q-card>
  </q-page>
</template>
