<script setup lang="ts">
defineProps<{
  title: string;
  subtitle: string;
  isLoading?: boolean;
}>();
</script>

<template>
  <q-page class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-p-4 tw-min-h-[100dvh]">
    <q-card
      class="tw-w-full tw-max-w-md tw-rounded-2xl tw-shadow-xl tw-p-8 tw-relative tw-overflow-y-auto tw-max-h-[90dvh]"
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
    </q-card>
  </q-page>
</template>
