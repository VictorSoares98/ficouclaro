<script setup lang="ts">
import { useAuthStore } from '../stores/auth.store';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import ThemeSwitcher from '../components/ThemeSwitcher.vue';

const authStore = useAuthStore();
const router = useRouter();
const $q = useQuasar();

async function handleLogout() {
  try {
    await authStore.signOut();
    $q.notify({ color: 'positive', message: 'Sessão encerrada com sucesso!' });
    await router.push('/');
  } catch (error) {
    const err = error as Error;
    $q.notify({ color: 'negative', message: 'Erro ao sair: ' + err.message });
  }
}
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="tw-bg-primary tw-text-white">
      <q-toolbar>
        <q-toolbar-title class="tw-font-bold">
          Ficou Claro? <span class="tw-text-sm tw-font-normal tw-opacity-80">| Área do Aluno</span>
        </q-toolbar-title>
        <ThemeSwitcher />
        <q-btn flat round dense icon="logout" @click="handleLogout" aria-label="Sair" class="tw-ml-2" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
