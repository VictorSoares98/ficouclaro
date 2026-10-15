<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import AppHeader from './components/AppHeader.vue';
import AppFooter from './components/AppFooter.vue';

const $q = useQuasar();
const route = useRoute();
const isImmersivePage = computed(
  () => route.path === '/login' || route.path === '/register' || route.path === '/mapa',
);
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <AppHeader v-if="!isImmersivePage" show-branding-menu />

    <q-page-container :class="{ '!tw-p-0': isImmersivePage }">
      <router-view />
    </q-page-container>

    <AppFooter v-if="$q.screen.gt.sm && !isImmersivePage" />
  </q-layout>
</template>
