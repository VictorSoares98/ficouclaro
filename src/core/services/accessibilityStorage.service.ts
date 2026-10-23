import type { AccessibilityPreferences, FontScale } from '../types/accessibility.types';

const STORAGE_KEY = 'ficouclaro_a11y';

const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  fontScale: 1,
  librasEnabled: false,
};

function isValidFontScale(scale: unknown): scale is FontScale {
  return [1, 1.15, 1.3, 1.5].includes(scale as number);
}

export const accessibilityStorageService = {
  getPreferences(): AccessibilityPreferences {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return { ...DEFAULT_PREFERENCES };

      const parsed = JSON.parse(stored);

      const fontScale = isValidFontScale(parsed?.fontScale)
        ? parsed.fontScale
        : DEFAULT_PREFERENCES.fontScale;
      const librasEnabled =
        typeof parsed?.librasEnabled === 'boolean'
          ? parsed.librasEnabled
          : DEFAULT_PREFERENCES.librasEnabled;

      return { fontScale, librasEnabled };
    } catch (e) {
      console.warn('Falha ao ler preferências de acessibilidade. Retornando padrão.', e);
      return { ...DEFAULT_PREFERENCES };
    }
  },

  savePreferences(prefs: AccessibilityPreferences): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch (e) {
      console.error('Falha ao salvar preferências de acessibilidade.', e);
    }
  },
};
