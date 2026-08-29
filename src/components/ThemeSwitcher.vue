<script setup lang="ts">
import { useThemeStore } from '@/stores/theme.store';
import type { AppTheme } from '@/core/types/theme.types';
import BaseIconButton from '@/core/components/BaseIconButton.vue';

const themeStore = useThemeStore();

function toggleMode() {
  themeStore.toggleMode();
}

function selectTheme(theme: AppTheme) {
  themeStore.setTheme(theme);
}

const themeOptions: { value: AppTheme; label: string }[] = [
  { value: 'default', label: 'Default (Azul)' },
  { value: 'ocean', label: 'Ocean (Ciano)' },
  { value: 'dracula', label: 'Dracula (Roxo)' },
  { value: 'summer_berries', label: 'Amoras do Verão' },
  { value: 'lunar_twilight', label: 'Crepúsculo Lunar' },
  { value: 'nature_terrain', label: 'Natura e Terreno' },
];
</script>

<template>
  <div class="tw-flex tw-items-center">
    <!-- Dropdown de Temas (Branding) -->
    <q-btn-dropdown
      flat
      dense
      color="white"
      icon="palette"
      class="tw-mr-2"
      aria-label="Selecionar Marca"
    >
      <q-list>
        <q-item
          v-for="option in themeOptions"
          :key="option.value"
          clickable
          v-close-popup
          @click="selectTheme(option.value)"
          :active="themeStore.activeTheme === option.value"
        >
          <q-item-section>{{ option.label }}</q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>

    <!-- Toggle de Iluminação (Mode) -->
    <BaseIconButton
      :icon="
        themeStore.activeMode === 'dark'
          ? 'dark_mode'
          : themeStore.activeMode === 'light'
            ? 'light_mode'
            : 'brightness_auto'
      "
      @click="toggleMode"
      color="white"
      ariaLabel="Alternar Iluminação"
    >
      <q-tooltip>Iluminação: {{ themeStore.activeMode }}</q-tooltip>
    </BaseIconButton>
  </div>
</template>
