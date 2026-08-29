<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  password: string;
}>();

const validations = computed(() => {
  const p = props.password || '';
  return {
    length: p.length >= 12,
    uppercase: /[A-Z]/.test(p),
    lowercase: /[a-z]/.test(p),
    number: /[0-9]/.test(p),
    symbol: /[\W_]/.test(p),
  };
});

const progress = computed(() => {
  const v = validations.value;
  let score = 0;
  if (v.length) score++;
  if (v.uppercase) score++;
  if (v.lowercase) score++;
  if (v.number) score++;
  if (v.symbol) score++;
  return score / 5;
});

const color = computed(() => {
  const p = progress.value;
  if (p <= 0.4) return 'negative';
  if (p <= 0.8) return 'warning';
  return 'positive';
});
</script>

<template>
  <div class="tw-w-full tw-mt-2 tw-mb-4">
    <q-linear-progress :value="progress" :color="color" class="tw-rounded-md tw-mb-3" size="4px" />
    <div class="tw-grid tw-grid-cols-2 tw-gap-2 tw-text-xs tw-px-1">
      <div
        class="tw-flex tw-items-center tw-gap-1"
        :class="validations.length ? 'tw-text-positive' : 'text-hint'"
      >
        <q-icon
          :name="validations.length ? 'check_circle' : 'radio_button_unchecked'"
          size="14px"
        />
        <span>12+ caracteres</span>
      </div>
      <div
        class="tw-flex tw-items-center tw-gap-1"
        :class="validations.uppercase ? 'tw-text-positive' : 'text-hint'"
      >
        <q-icon
          :name="validations.uppercase ? 'check_circle' : 'radio_button_unchecked'"
          size="14px"
        />
        <span>Maiúscula</span>
      </div>
      <div
        class="tw-flex tw-items-center tw-gap-1"
        :class="validations.lowercase ? 'tw-text-positive' : 'text-hint'"
      >
        <q-icon
          :name="validations.lowercase ? 'check_circle' : 'radio_button_unchecked'"
          size="14px"
        />
        <span>Minúscula</span>
      </div>
      <div
        class="tw-flex tw-items-center tw-gap-1"
        :class="validations.number ? 'tw-text-positive' : 'text-hint'"
      >
        <q-icon
          :name="validations.number ? 'check_circle' : 'radio_button_unchecked'"
          size="14px"
        />
        <span>Número</span>
      </div>
      <div
        class="tw-flex tw-items-center tw-gap-1 tw-col-span-2"
        :class="validations.symbol ? 'tw-text-positive' : 'text-hint'"
      >
        <q-icon
          :name="validations.symbol ? 'check_circle' : 'radio_button_unchecked'"
          size="14px"
        />
        <span>Símbolo especial (!@#$%)</span>
      </div>
    </div>
  </div>
</template>
