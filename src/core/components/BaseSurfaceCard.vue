<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'elevated' | 'flat' | 'glass';
  }>(),
  {
    variant: 'elevated',
  },
);
</script>

<template>
  <q-card
    :flat="variant === 'flat' || variant === 'glass'"
    :bordered="variant === 'flat' || variant === 'glass'"
    class="tw-rounded-2xl tw-overflow-hidden tw-transition-all tw-duration-300"
    :class="{
      'tw-shadow-md hover:tw-shadow-lg': variant === 'elevated',
      'tw-bg-white/10 tw-backdrop-blur-md tw-border-white/20': variant === 'glass',
      'tw-border-gray-200 dark:tw-border-gray-800': variant === 'flat',
    }"
  >
    <slot></slot>
  </q-card>
</template>
