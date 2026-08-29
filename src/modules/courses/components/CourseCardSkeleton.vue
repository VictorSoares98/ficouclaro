<script setup lang="ts">
import BaseSurfaceCard from '@/core/components/BaseSurfaceCard.vue';
</script>

<template>
  <BaseSurfaceCard class="tw-h-full">
    <q-card-section>
      <q-skeleton type="text" class="tw-text-xl tw-mb-2" />
      <q-skeleton type="text" width="60%" />
    </q-card-section>
  </BaseSurfaceCard>
</template>
