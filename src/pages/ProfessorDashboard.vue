<script setup lang="ts">
import { useAuthStore } from '../stores/auth.store';

const authStore = useAuthStore();
</script>

<template>
  <q-page class="tw-p-6 tw-flex tw-flex-col tw-items-center tw-justify-center">
    <div class="tw-text-center tw-max-w-md">
      <q-icon name="school" size="4rem" color="primary" class="tw-mb-4" />
      <h1 class="tw-text-3xl tw-font-bold tw-text-gray-900 dark:tw-text-white tw-mb-2">
        Bem-vindo, {{ authStore.user?.perfil.nome_completo || 'Professor' }}!
      </h1>
      <p class="tw-text-gray-600 dark:tw-text-gray-400 tw-text-lg">
        Este é o seu painel de controle. Em breve você poderá criar turmas, iniciar sessões ao vivo
        e acompanhar o termômetro de ritmo da sua sala.
      </p>
    </div>
  </q-page>
</template>
