<script setup lang="ts">
defineProps<{
  icon: string;
  ariaLabel: string;
  color?: string;
  disable?: boolean;
  title?: string;
}>();
</script>

<template>
  <q-btn
    flat
    round
    :icon="icon"
    :aria-label="ariaLabel"
    :color="color"
    :disable="disable"
    :title="title"
    class="tw-min-w-[44px] tw-min-h-[44px]"
  >
    <slot></slot>
  </q-btn>
</template>
