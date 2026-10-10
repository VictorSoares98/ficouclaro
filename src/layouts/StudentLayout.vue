<script setup lang="ts">
import { useQuasar } from 'quasar';
import AppHeader from './components/AppHeader.vue';
import AppFooter from './components/AppFooter.vue';
import MobileNavBottom from './components/MobileNavBottom.vue';

const $q = useQuasar();
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <AppHeader subtitle="Área do Aluno" show-profile-menu />

    <q-page-container>
      <router-view />
    </q-page-container>

    <AppFooter v-if="$q.screen.gt.sm" />
    <MobileNavBottom v-if="$q.screen.lt.md" />
  </q-layout>
</template>
