<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import AppHeader from './components/AppHeader.vue';
import AppFooter from './components/AppFooter.vue';

const $q = useQuasar();
const route = useRoute();
const isAuthPage = computed(() => route.path === '/login' || route.path === '/register');
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <AppHeader v-if="!isAuthPage" show-branding-menu />

    <q-page-container :class="{ '!tw-p-0': isAuthPage }">
      <router-view />
    </q-page-container>

    <AppFooter v-if="$q.screen.gt.sm && !isAuthPage" />
  </q-layout>
</template>
