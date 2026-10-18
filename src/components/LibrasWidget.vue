<script setup lang="ts">
import { onUnmounted } from 'vue';
import { vlibrasService } from '@/core/services/vlibras.service';

onUnmounted(() => {
  vlibrasService.destroy();
});
</script>

<template>
  <span class="tw-hidden" aria-hidden="true"></span>
</template>

<style>
/* Ajuste de z-index global para o widget não sobrepor diálogos e menus do Quasar */
[vw] {
  z-index: 1000 !important;
}
</style>
