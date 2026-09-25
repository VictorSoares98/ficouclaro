<script setup lang="ts">
import { ref } from 'vue';

const isAnimatingOut = ref(false);

const hide = () => {
  isAnimatingOut.value = true;
};

defineExpose({ hide });
</script>

<template>
  <!-- Background com a MESMA cor do capacitor.config.ts para não haver salto -->
  <div
    class="tw-fixed tw-inset-0 tw-z-[9999] tw-flex tw-items-center tw-justify-center tw-bg-[#1976D2] tw-transition-colors tw-duration-700"
    :class="{ 'tw-bg-transparent tw-pointer-events-none': isAnimatingOut }"
  >
    <!-- O ícone idêntico ao do Android 12, que fará um Zoom-Out elegante -->
    <img
      src="@/assets/icon.png"
      alt="Ficou Claro Splash"
      class="tw-w-40 tw-h-40 md:tw-w-72 md:tw-h-72 lg:tw-w-96 lg:tw-h-96 logo-anim"
      :class="{ 'zoom-out': isAnimatingOut }"
    />
  </div>
</template>

<style scoped>
.logo-anim {
  transition: all 0.7s cubic-bezier(0.25, 1, 0.5, 1);
  transform: scale(1);
  opacity: 1;
}

.zoom-out {
  transform: scale(3) translateY(-10px);
  opacity: 0;
}
</style>
