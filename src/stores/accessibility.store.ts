import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { accessibilityStorageService } from '@/core/services/accessibilityStorage.service';
import type { FontScale } from '@/core/types/accessibility.types';

export const useAccessibilityStore = defineStore('accessibility', () => {
  const prefs = accessibilityStorageService.getPreferences();

  const fontScale = ref<FontScale>(prefs.fontScale);
  const librasEnabled = ref<boolean>(prefs.librasEnabled);

  const applyFontScale = (scale: FontScale) => {
    document.documentElement.style.setProperty('--fc-font-scale', scale.toString());
  };

  watch([fontScale, librasEnabled], ([newScale, newLibras]) => {
    accessibilityStorageService.savePreferences({
      fontScale: newScale,
      librasEnabled: newLibras,
    });
  });

  watch(fontScale, (newScale) => applyFontScale(newScale));

  function setFontScale(scale: FontScale) {
    fontScale.value = scale;
  }

  function toggleLibras() {
    librasEnabled.value = !librasEnabled.value;
  }

  function initAccessibility() {
    applyFontScale(fontScale.value);
  }

  return {
    fontScale,
    librasEnabled,
    setFontScale,
    toggleLibras,
    initAccessibility,
  };
});
