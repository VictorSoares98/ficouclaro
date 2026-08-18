<script setup lang="ts">
import { useThemeStore } from '../stores/theme.store';
import { computed } from 'vue';

const themeStore = useThemeStore();
const isDark = computed(() => themeStore.activeTheme === 'ocean');

function toggleTheme() {
  themeStore.setTheme(isDark.value ? 'light' : 'ocean');
}
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-header
      class="tw-bg-primary tw-text-white tw-transition-colors tw-duration-300"
      elevated
    >
      <q-toolbar class="tw-h-16">
        <q-toolbar-title class="tw-font-bold tw-tracking-tight tw-text-white tw-text-2xl">
          Ficou Claro?
        </q-toolbar-title>

        <q-btn
          flat
          round
          dense
          :icon="isDark ? 'light_mode' : 'dark_mode'"
          @click="toggleTheme"
          color="white"
          aria-label="Alternar Tema"
        />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
