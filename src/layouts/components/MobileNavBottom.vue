<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();
</script>

<template>
  <!-- MobileNavBottom: Exibido apenas em viewports lt-md (<1024px) -->
  <q-footer
    bordered
    class="tw-bg-white dark:tw-bg-dark-page tw-text-gray-600 dark:tw-text-gray-400 lt-md"
  >
    <q-tabs
      no-caps
      active-color="primary"
      indicator-color="transparent"
      class="tw-text-xs"
      align="justify"
    >
      <q-route-tab v-if="!authStore.isAuthenticated" to="/" icon="home" label="Início" exact />
      <q-route-tab
        v-if="authStore.user?.perfil.papel === 'aluno'"
        to="/hub"
        icon="hub"
        label="Hub"
      />
      <q-route-tab
        v-if="authStore.user?.perfil.papel === 'professor'"
        to="/dashboard"
        icon="dashboard"
        label="Painel"
      />
      <q-route-tab
        v-if="authStore.user?.perfil.papel === 'professor'"
        to="/disciplinas"
        icon="library_books"
        label="Turmas"
      />
      <q-route-tab
        v-if="authStore.isAuthenticated"
        to="/privacidade-seguranca"
        icon="person"
        label="Perfil"
      />
    </q-tabs>
  </q-footer>
</template>
