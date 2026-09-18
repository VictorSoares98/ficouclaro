<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'submit', payload: { text: string; isAnonymous: boolean }): void;
}>();

const text = ref('');
const isAnonymous = ref(true);

function handleSubmit() {
  const trimmed = text.value.trim();
  if (trimmed.length >= 10) {
    emit('submit', { text: trimmed, isAnonymous: isAnonymous.value });
    text.value = '';
  }
}
</script>

<template>
  <q-card flat bordered class="tw-p-4 tw-rounded-xl tw-w-full">
    <div class="tw-flex tw-items-center tw-justify-between tw-mb-2">
      <div class="tw-text-sm tw-font-semibold text-muted">
        Tem alguma dúvida?
      </div>
      <q-checkbox 
        v-model="isAnonymous" 
        label="Enviar anonimamente" 
        color="primary" 
        dense 
        class="text-muted tw-text-sm"
      />
    </div>
    <q-input
      v-model="text"
      type="textarea"
      autogrow
      outlined
      counter
      maxlength="500"
      placeholder="Ex: Professor, não entendi a diferença entre mitose e meiose na fase final..."
      :rules="[
        (val) => val.trim().length >= 10 || 'A dúvida deve ter pelo menos 10 caracteres',
        (val) => val.trim().length <= 500 || 'Limite máximo de 500 caracteres excedido',
      ]"
      lazy-rules
    />
    <div class="tw-flex tw-justify-end tw-mt-2">
      <q-btn
        color="primary"
        label="Enviar"
        unelevated
        no-caps
        :disable="text.trim().length < 10"
        :loading="loading"
        @click="handleSubmit"
      />
    </div>
  </q-card>
</template>
