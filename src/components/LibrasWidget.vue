<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';
import { useAccessibilityStore } from '@/stores/accessibility.store';
import { vlibrasService } from '@/core/services/vlibras.service';
import { useQuasar } from 'quasar';

const accessibilityStore = useAccessibilityStore();
const $q = useQuasar();

// Estendendo o objeto Window para incluir o VLibras global
declare global {
  interface Window {
    VLibras?: {
      Widget: new (url: string) => unknown;
    };
  }
}

async function initVLibras() {
  if (!accessibilityStore.librasEnabled) return;

  try {
    await vlibrasService.load();
    if (window.VLibras) {
      new window.VLibras.Widget('https://vlibras.gov.br/app');
    }
  } catch (error) {
    console.warn('Erro VLibras:', error);
    $q.notify({
      type: 'warning',
      message: 'Não foi possível carregar o intérprete de Libras. Verifique sua conexão.',
      position: 'top',
    });
  }
}

watch(
  () => accessibilityStore.librasEnabled,
  (enabled) => {
    if (enabled) {
      void initVLibras();
    } else {
      vlibrasService.unload();
    }
  },
);

onMounted(() => {
  if (accessibilityStore.librasEnabled) {
    void initVLibras();
  }
});

onUnmounted(() => {
  vlibrasService.unload();
});
</script>

<template>
  <div vw class="enabled" v-if="accessibilityStore.librasEnabled">
    <div vw-access-button class="active"></div>
    <div vw-plugin-wrapper>
      <div class="vw-plugin-top-wrapper"></div>
    </div>
  </div>
</template>

<style>
/* Ajuste de z-index para não sobrepor diálogos do Quasar */
[vw] {
  z-index: 1000 !important;
}
</style>
