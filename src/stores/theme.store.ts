import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { Dark } from 'quasar';
import type { AppTheme, AppMode } from '../core/types/theme.types';

const THEME_STORAGE_KEY = 'ficouclaro_theme';
const MODE_STORAGE_KEY = 'ficouclaro_mode';

export const useThemeStore = defineStore('theme', () => {
  const activeTheme = ref<AppTheme>(
    (localStorage.getItem(THEME_STORAGE_KEY) as AppTheme) || 'default',
  );

  const activeMode = ref<AppMode>((localStorage.getItem(MODE_STORAGE_KEY) as AppMode) || 'auto');

  const applyTheme = (theme: AppTheme) => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  };

  const applyMode = (mode: AppMode) => {
    const darkSetting = mode === 'auto' ? 'auto' : mode === 'dark';
    Dark.set(darkSetting);
    localStorage.setItem(MODE_STORAGE_KEY, mode);
  };

  watch(activeTheme, (newTheme) => applyTheme(newTheme));
  watch(activeMode, (newMode) => applyMode(newMode));

  function setTheme(theme: AppTheme) {
    activeTheme.value = theme;
  }

  function setMode(mode: AppMode) {
    activeMode.value = mode;
  }

  function toggleMode() {
    if (activeMode.value === 'light') setMode('dark');
    else if (activeMode.value === 'dark') setMode('auto');
    else setMode('light');
  }

  function initTheme() {
    applyTheme(activeTheme.value);
    applyMode(activeMode.value);
  }

  return {
    activeTheme,
    activeMode,
    setTheme,
    setMode,
    toggleMode,
    initTheme,
  };
});
