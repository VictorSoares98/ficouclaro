<script setup lang="ts">
defineProps<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color?: string;
}>();
</script>

<template>
  <q-card
    class="tw-bg-white/10 tw-backdrop-blur-md tw-border tw-border-white/20 tw-shadow-sm tw-rounded-xl"
  >
    <q-card-section class="tw-flex tw-items-center tw-justify-between">
      <div>
        <div class="tw-text-sm tw-opacity-70 tw-font-medium">{{ title }}</div>
        <div class="tw-text-2xl tw-font-bold tw-mt-1">{{ value }}</div>
        <div v-if="subtitle" class="tw-text-xs tw-opacity-60 tw-mt-1">{{ subtitle }}</div>
      </div>
      <q-avatar :color="color || 'primary'" text-color="white" :icon="icon" rounded size="md" />
    </q-card-section>
  </q-card>
</template>
