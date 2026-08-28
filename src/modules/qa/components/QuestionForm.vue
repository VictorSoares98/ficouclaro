<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  (e: 'submit', text: string): void;
}>();

const text = ref('');

function handleSubmit() {
  const trimmed = text.value.trim();
  if (trimmed.length >= 10) {
    emit('submit', trimmed);
    text.value = '';
  }
}
</script>

<template>
  <q-card flat bordered class="tw-p-4 tw-rounded-xl tw-w-full">
    <div class="tw-text-sm tw-font-semibold tw-mb-2 tw-opacity-80">
      Tem alguma dúvida? (Envio anônimo)
    </div>
    <q-input
      v-model="text"
      type="textarea"
      autogrow
      outlined
      dense
      placeholder="Digite sua dúvida aqui (mínimo 10 caracteres)..."
      :rules="[(val) => val.trim().length >= 10 || 'A dúvida deve ter pelo menos 10 caracteres']"
      lazy-rules
    />
    <div class="tw-flex tw-justify-end tw-mt-2">
      <q-btn
        color="primary"
        label="Enviar"
        unelevated
        no-caps
        :disable="text.trim().length < 10"
        @click="handleSubmit"
      />
    </div>
  </q-card>
</template>
