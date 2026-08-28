<script setup lang="ts">
import { useThemeStore } from '@/stores/theme.store';
import type { AppTheme } from '@/core/types/theme.types';

const themeStore = useThemeStore();

function toggleMode() {
  themeStore.toggleMode();
}

function selectTheme(theme: AppTheme) {
  themeStore.setTheme(theme);
}
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
          clickable
          v-close-popup
          @click="selectTheme('default')"
          :active="themeStore.activeTheme === 'default'"
        >
          <q-item-section>Default (Azul)</q-item-section>
        </q-item>
        <q-item
          clickable
          v-close-popup
          @click="selectTheme('ocean')"
          :active="themeStore.activeTheme === 'ocean'"
        >
          <q-item-section>Ocean (Ciano)</q-item-section>
        </q-item>
        <q-item
          clickable
          v-close-popup
          @click="selectTheme('dracula')"
          :active="themeStore.activeTheme === 'dracula'"
        >
          <q-item-section>Dracula (Roxo)</q-item-section>
        </q-item>
        <q-item
          clickable
          v-close-popup
          @click="selectTheme('summer_berries')"
          :active="themeStore.activeTheme === 'summer_berries'"
        >
          <q-item-section>Amoras do Verão</q-item-section>
        </q-item>
        <q-item
          clickable
          v-close-popup
          @click="selectTheme('lunar_twilight')"
          :active="themeStore.activeTheme === 'lunar_twilight'"
        >
          <q-item-section>Crepúsculo Lunar</q-item-section>
        </q-item>
        <q-item
          clickable
          v-close-popup
          @click="selectTheme('nature_terrain')"
          :active="themeStore.activeTheme === 'nature_terrain'"
        >
          <q-item-section>Natura e Terreno</q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>

    <!-- Toggle de Iluminação (Mode) -->
    <q-btn
      flat
      round
      dense
      :icon="
        themeStore.activeMode === 'dark'
          ? 'dark_mode'
          : themeStore.activeMode === 'light'
            ? 'light_mode'
            : 'brightness_auto'
      "
      @click="toggleMode"
      color="white"
      aria-label="Alternar Iluminação"
    >
      <q-tooltip>Iluminação: {{ themeStore.activeMode }}</q-tooltip>
    </q-btn>
  </div>
</template>
