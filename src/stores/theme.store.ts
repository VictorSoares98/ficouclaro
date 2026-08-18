import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { Dark } from 'quasar';
import { type AppTheme, THEME_DARK_VARIANTS } from '../core/types/theme.types';

const THEME_STORAGE_KEY = 'ficouclaro_theme';

export const useThemeStore = defineStore('theme', () => {
  // Inicialização buscando a última escolha do usuário (ou 'light' como default)
  const activeTheme = ref<AppTheme>(
    (localStorage.getItem(THEME_STORAGE_KEY) as AppTheme) || 'light',
  );

  /**
   * Função central que orquestra a injeção do tema (Single Source of Truth)
   */
  const applyTheme = (theme: AppTheme) => {
    // 1. Injeta atributo no <body> para o Tailwind e app.scss mapearem a paleta de cores
    document.body.setAttribute('data-theme', theme);

    // 2. Aciona o Quasar Dark Mode nativo para que os menus e modais invertam contraste
    const isDark = THEME_DARK_VARIANTS[theme];
    Dark.set(isDark);

    // 3. Persistência
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  };

  // Reage automaticamente às mudanças programáticas de tema
  watch(activeTheme, (newTheme) => {
    applyTheme(newTheme);
  });

  // Action pública para alternar os temas
  function setTheme(theme: AppTheme) {
    activeTheme.value = theme;
  }

  // Action executada apenas uma vez na inicialização raiz (App.vue)
  function initTheme() {
    applyTheme(activeTheme.value);
  }

  return {
    activeTheme,
    setTheme,
    initTheme,
  };
});
