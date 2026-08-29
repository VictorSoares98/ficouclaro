<script setup lang="ts">
defineProps<{
  title: string;
  subtitle: string;
  isLoading?: boolean;
}>();
import BaseSurfaceCard from '@/core/components/BaseSurfaceCard.vue';
</script>

<template>
  <q-page class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-p-4 tw-min-h-[100dvh]">
    <BaseSurfaceCard
      class="tw-w-full tw-max-w-md tw-p-8 tw-relative tw-overflow-y-auto tw-max-h-[90dvh]"
    >
      <div class="tw-text-center tw-mb-8">
        <h2 class="tw-text-3xl tw-font-extrabold tw-mb-2">{{ title }}</h2>
        <p class="tw-opacity-70">{{ subtitle }}</p>
      </div>

      <slot></slot>

      <div class="tw-mt-8 tw-text-center" v-if="$slots.footer">
        <slot name="footer"></slot>
      </div>

      <q-inner-loading :showing="isLoading">
        <q-spinner-gears size="3rem" color="primary" />
      </q-inner-loading>
    </BaseSurfaceCard>
  </q-page>
</template>
