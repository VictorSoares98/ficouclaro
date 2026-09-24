<script setup lang="ts">
import { useQuasar } from 'quasar';
import AppHeader from './components/AppHeader.vue';
import AppFooter from './components/AppFooter.vue';

const $q = useQuasar();
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <AppHeader show-branding-menu />

    <q-page-container>
      <router-view />
    </q-page-container>

    <AppFooter v-if="$q.screen.gt.sm" />
  </q-layout>
</template>
