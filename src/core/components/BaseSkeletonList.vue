<script setup lang="ts">
import BaseSurfaceCard from '@/core/components/BaseSurfaceCard.vue';

withDefaults(
  defineProps<{
    count?: number;
    type?: 'card' | 'list-item';
  }>(),
  {
    count: 3,
    type: 'card',
  },
);
</script>

<template>
  <div class="tw-flex tw-flex-col tw-gap-4 tw-w-full">
    <BaseSurfaceCard v-for="i in count" :key="i" class="tw-p-4 tw-w-full">
      <div v-if="type === 'card'" class="tw-flex tw-flex-col tw-gap-2">
        <div class="tw-flex tw-justify-between tw-items-center">
          <q-skeleton type="text" width="60%" class="tw-text-xl tw-rounded" />
          <q-skeleton type="circle" size="32px" />
        </div>
        <q-skeleton type="text" class="tw-mt-2" />
        <q-skeleton type="text" width="80%" />
      </div>
      <div v-else class="tw-flex tw-items-center tw-gap-4">
        <q-skeleton type="circle" size="40px" />
        <div class="tw-flex-1">
          <q-skeleton type="text" />
          <q-skeleton type="text" width="50%" />
        </div>
      </div>
    </BaseSurfaceCard>
  </div>
</template>
