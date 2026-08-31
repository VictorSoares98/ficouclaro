<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from '@/stores/auth.store';
import AuthFormContainer from '@/modules/auth/components/AuthFormContainer.vue';

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const isPasswordVisible = ref(false);

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
  <AuthFormContainer
    title="Entrar"
    subtitle="Insira suas credenciais para acessar a plataforma."
    :isLoading="authStore.isLoading"
  >
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
        autocomplete="email"
        name="email"
        enterkeyhint="next"
        color="primary"
        class="tw-text-lg"
      />

      <q-input
        v-model="password"
        type="password"
        label="Senha"
        outlined
        reactive-rules
        :rules="[
          (val) => !!val || 'A senha é obrigatória',
          (val) => val.length >= 6 || 'A senha deve ter no mínimo 6 caracteres',
        ]"
        autocomplete="current-password"
        name="password"
        enterkeyhint="done"
        color="primary"
        class="tw-text-lg"
      >
        <template v-slot:append>
          <q-icon
            :name="isPasswordVisible ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
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
