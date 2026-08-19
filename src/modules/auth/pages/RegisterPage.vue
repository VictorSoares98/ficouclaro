<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from '../../../stores/auth.store';
import type { PapelUsuario } from '../../../core/types/auth.types';

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();

const fullName = ref('');
const email = ref('');
const password = ref('');
const role = ref<PapelUsuario>('aluno');

const roleOptions: { label: string; value: PapelUsuario }[] = [
  { label: 'Sou Aluno', value: 'aluno' },
  { label: 'Sou Professor', value: 'professor' },
];

async function onSubmit() {
  try {
    await authStore.register({
      email: email.value,
      password: password.value,
      options: {
        data: {
          nome_completo: fullName.value,
          papel: role.value,
        },
      },
    });

    $q.notify({
      type: 'positive',
      message: 'Conta criada com sucesso!',
      position: 'top',
    });

    void router.push(`/${role.value}`);
  } catch (error) {
    const err = error as Error;
    $q.notify({
      type: 'negative',
      message: err.message || 'Erro ao criar conta',
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
          Criar Conta
        </h2>
        <p class="tw-opacity-70">
          Junte-se à revolução do aprendizado síncrono.
        </p>
      </div>

      <q-form @submit.prevent="onSubmit" class="tw-space-y-6">
        <div class="tw-flex tw-justify-center tw-mb-6">
          <q-btn-toggle
            v-model="role"
            spread
            class="tw-w-full tw-shadow-sm"
            no-caps
            rounded
            unelevated
            toggle-color="primary"
            color="white"
            text-color="grey-8"
            :options="roleOptions"
          />
        </div>

        <q-input
          v-model="fullName"
          type="text"
          label="Nome Completo"
          outlined
          lazy-rules
          :rules="[(val) => !!val || 'O nome é obrigatório']"
          autocomplete="name"
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
          color="primary"
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
          autocomplete="new-password"
          color="primary"
        />

        <q-btn
          type="submit"
          color="primary"
          class="tw-w-full tw-h-14 tw-rounded-xl tw-text-lg tw-font-bold tw-shadow-md"
          :loading="authStore.isLoading"
          unelevated
          label="Cadastrar"
        />
      </q-form>

      <div class="tw-mt-8 tw-text-center">
        <p class="tw-opacity-70">
          Já possui uma conta?
          <router-link to="/login" class="tw-text-primary tw-font-semibold hover:tw-underline">
            Faça login
          </router-link>
        </p>
      </div>
    </q-card>
  </q-page>
</template>
