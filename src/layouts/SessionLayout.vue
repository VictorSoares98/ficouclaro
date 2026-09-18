<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import AppHeader from './components/AppHeader.vue';

const authStore = useAuthStore();
const subtitle = computed(() =>
  authStore.user?.perfil.papel === 'professor' ? 'Área do Professor' : 'Área do Aluno',
);
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <AppHeader :subtitle="subtitle" show-profile-menu />

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
