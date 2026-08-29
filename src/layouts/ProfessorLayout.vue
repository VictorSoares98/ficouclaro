<script setup lang="ts">
import AppHeader from './components/AppHeader.vue';
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <AppHeader subtitle="Área do Professor" show-profile-menu />

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
