import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { accessibilityStorageService } from '@/core/services/accessibilityStorage.service';
import { vlibrasService } from '@/core/services/vlibras.service';
import type { FontScale } from '@/core/types/accessibility.types';

export const useAccessibilityStore = defineStore('accessibility', () => {
  const prefs = accessibilityStorageService.getPreferences();

  const fontScale = ref<FontScale>(prefs.fontScale);
  const librasEnabled = ref<boolean>(prefs.librasEnabled);
  const isLibrasLoading = ref<boolean>(false);

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

  async function activateLibras(): Promise<boolean> {
    if (librasEnabled.value) return true;
    if (isLibrasLoading.value) return false;

    isLibrasLoading.value = true;
    try {
      const success = await vlibrasService.mount();
      librasEnabled.value = success;
      return success;
    } finally {
      isLibrasLoading.value = false;
    }
  }

  async function toggleLibras(): Promise<boolean> {
    return activateLibras();
  }

  function initAccessibility() {
    applyFontScale(fontScale.value);
    // Persistência Total: Se o usuário já ativou previamente no dispositivo, inicializa no boot
    if (librasEnabled.value) {
      void vlibrasService.mount();
    }
  }

  return {
    fontScale,
    librasEnabled,
    isLibrasLoading,
    setFontScale,
    activateLibras,
    toggleLibras,
    initAccessibility,
  };
});
