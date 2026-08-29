<script setup lang="ts">
defineProps<{
  icon: string;
  ariaLabel: string;
}>();
</script>

<template>
  <q-btn flat round :icon="icon" :aria-label="ariaLabel" class="tw-min-w-[44px] tw-min-h-[44px]">
    <slot></slot>
  </q-btn>
</template>
