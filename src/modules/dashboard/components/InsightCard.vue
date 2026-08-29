<script setup lang="ts">
import BaseSurfaceCard from '@/core/components/BaseSurfaceCard.vue';

defineProps<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color?: string;
}>();
</script>

<template>
  <BaseSurfaceCard variant="glass">
    <q-card-section class="tw-flex tw-items-center tw-justify-between tw-gap-2 tw-p-3 sm:tw-p-4">
      <div class="tw-flex-1 tw-min-w-0">
        <div class="tw-text-xs sm:tw-text-sm tw-opacity-70 tw-font-medium tw-truncate">
          {{ title }}
        </div>
        <div class="tw-text-xl sm:tw-text-2xl tw-font-bold tw-mt-1 tw-truncate">{{ value }}</div>
        <div v-if="subtitle" class="tw-text-[10px] sm:tw-text-xs tw-opacity-60 tw-mt-1 tw-truncate">
          {{ subtitle }}
        </div>
      </div>
      <q-avatar
        :color="color || 'primary'"
        text-color="white"
        :icon="icon"
        rounded
        size="md"
        class="tw-shrink-0"
      />
    </q-card-section>
  </BaseSurfaceCard>
</template>
