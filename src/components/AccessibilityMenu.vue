<script setup lang="ts">
import { useAccessibilityStore } from '@/stores/accessibility.store';
import { useThemeStore } from '@/stores/theme.store';
import type { AppTheme } from '@/core/types/theme.types';
import type { FontScale } from '@/core/types/accessibility.types';

const accessibilityStore = useAccessibilityStore();
const themeStore = useThemeStore();

const themeOptions: { value: AppTheme; label: string }[] = [
  { value: 'default', label: 'Default (Azul)' },
  { value: 'ocean', label: 'Ocean (Ciano)' },
  { value: 'dracula', label: 'Dracula (Roxo)' },
  { value: 'summer_berries', label: 'Amoras do Verão' },
  { value: 'lunar_twilight', label: 'Crepúsculo Lunar' },
  { value: 'nature_terrain', label: 'Natura e Terreno' },
];

const fontOptions: { value: FontScale; label: string }[] = [
  { value: 1, label: 'Normal (100%)' },
  { value: 1.15, label: 'Grande (115%)' },
  { value: 1.3, label: 'Muito Grande (130%)' },
  { value: 1.5, label: 'Máximo (150%)' },
];

function setFontScale(scale: FontScale) {
  accessibilityStore.setFontScale(scale);
}

function selectTheme(theme: AppTheme) {
  themeStore.setTheme(theme);
}
</script>

<template>
  <q-btn-dropdown
    flat
    dense
    color="white"
    icon="settings_accessibility"
    class="tw-mr-2"
    aria-label="Menu de Acessibilidade e Aparência"
  >
    <q-list style="min-width: 250px">
      <!-- Seção: Fonte -->
      <q-item-label header class="tw-font-bold">Tamanho da Fonte</q-item-label>
      <q-item
        v-for="option in fontOptions"
        :key="option.value"
        clickable
        v-close-popup
        @click="setFontScale(option.value)"
        :active="accessibilityStore.fontScale === option.value"
      >
        <q-item-section avatar>
          <q-icon
            name="format_size"
            :class="{ 'text-primary': accessibilityStore.fontScale === option.value }"
          />
        </q-item-section>
        <q-item-section>{{ option.label }}</q-item-section>
      </q-item>

      <q-separator />

      <!-- Seção: Tema/Cores -->
      <q-item-label header class="tw-font-bold">Marca e Cores</q-item-label>
      <q-item
        v-for="option in themeOptions"
        :key="option.value"
        clickable
        v-close-popup
        @click="selectTheme(option.value)"
        :active="themeStore.activeTheme === option.value"
      >
        <q-item-section avatar>
          <q-icon
            name="palette"
            :class="{ 'text-primary': themeStore.activeTheme === option.value }"
          />
        </q-item-section>
        <q-item-section>{{ option.label }}</q-item-section>
      </q-item>

      <q-separator />

      <!-- Seção: Iluminação -->
      <q-item-label header class="tw-font-bold">Iluminação</q-item-label>
      <q-item
        clickable
        v-close-popup
        @click="themeStore.setMode('light')"
        :active="themeStore.activeMode === 'light'"
      >
        <q-item-section avatar><q-icon name="light_mode" /></q-item-section>
        <q-item-section>Claro</q-item-section>
      </q-item>
      <q-item
        clickable
        v-close-popup
        @click="themeStore.setMode('dark')"
        :active="themeStore.activeMode === 'dark'"
      >
        <q-item-section avatar><q-icon name="dark_mode" /></q-item-section>
        <q-item-section>Escuro</q-item-section>
      </q-item>
      <q-item
        clickable
        v-close-popup
        @click="themeStore.setMode('auto')"
        :active="themeStore.activeMode === 'auto'"
      >
        <q-item-section avatar><q-icon name="brightness_auto" /></q-item-section>
        <q-item-section>Automático</q-item-section>
      </q-item>

      <q-separator />

      <!-- Seção: Libras -->
      <q-item-label header class="tw-font-bold">Inclusão</q-item-label>
      <q-item clickable v-close-popup @click="accessibilityStore.toggleLibras()">
        <q-item-section avatar>
          <q-icon
            name="sign_language"
            :class="{ 'text-primary': accessibilityStore.librasEnabled }"
          />
        </q-item-section>
        <q-item-section>Intérprete de Libras</q-item-section>
        <q-item-section side>
          <q-toggle
            :model-value="accessibilityStore.librasEnabled"
            @update:model-value="accessibilityStore.toggleLibras()"
          />
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>
