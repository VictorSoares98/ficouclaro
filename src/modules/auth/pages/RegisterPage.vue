<script setup lang="ts">
import { ref } from 'vue';
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
  <AuthFormContainer
    title="Criar Conta"
    subtitle="Junte-se à revolução do aprendizado síncrono."
    :isLoading="authStore.isLoading"
  >
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
        reactive-rules
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
        reactive-rules
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
          reactive-rules
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
        reactive-rules
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

      <q-checkbox v-model="acceptTerms" color="primary" class="tw-w-full tw-mt-2 tw-mb-2">
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

      <q-btn
        type="submit"
        color="primary"
        class="tw-w-full tw-h-14 tw-rounded-xl tw-text-lg tw-font-bold tw-shadow-md"
        :loading="authStore.isLoading"
        :disable="!acceptTerms"
        unelevated
        label="Cadastrar"
      />
    </q-form>

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
