<script setup lang="ts">
withDefaults(
  defineProps<{
    icon: string;
    title: string;
    description: string;
    iconColor?: string;
    flat?: boolean;
    customClass?: string;
  }>(),
  {
    iconColor: 'primary',
    flat: true,
    customClass: '',
  },
);
</script>

<template>
  <div
    class="tw-w-full tw-flex tw-flex-col tw-items-center tw-justify-center tw-text-center tw-py-8 tw-px-4"
    :class="[
      flat
        ? 'tw-bg-transparent'
        : 'tw-border tw-border-black/5 dark:tw-border-white/10 tw-rounded-3xl tw-shadow-sm tw-p-6 sm:tw-p-8',
      customClass,
    ]"
  >
    <!-- Ícone destacado com badge sutil -->
    <div
      class="tw-w-14 tw-h-14 sm:tw-w-16 sm:tw-h-16 tw-rounded-2xl tw-bg-primary/10 tw-text-primary tw-flex tw-items-center tw-justify-center tw-mb-3.5 tw-shadow-sm"
    >
      <q-icon :name="icon" size="2rem" :color="iconColor" />
    </div>

    <!-- Título e Descrição Contextual -->
    <div class="tw-max-w-xs tw-mx-auto">
      <h3 class="text-subtitle1 text-weight-bold tw-font-space-grotesk tw-m-0 tw-leading-snug">
        {{ title }}
      </h3>
      <p class="text-caption tw-opacity-75 tw-mt-1.5 tw-mb-0 tw-leading-relaxed">
        {{ description }}
      </p>
    </div>

    <!-- Slot de Ações Contextuais -->
    <div
      v-if="$slots.action"
      class="tw-mt-4 tw-flex tw-flex-wrap tw-items-center tw-justify-center tw-gap-2"
    >
      <slot name="action"></slot>
    </div>
  </div>
</template>
