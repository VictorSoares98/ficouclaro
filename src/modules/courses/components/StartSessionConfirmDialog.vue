<script setup lang="ts">
import { ref, watch } from 'vue';
import BaseSurfaceCard from '@/core/components/BaseSurfaceCard.vue';

const props = defineProps<{
  modelValue: boolean;
  courseName: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'confirm', topic: string): void;
}>();

const topic = ref('Aula de Hoje');

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      topic.value = 'Aula de Hoje';
    }
  },
);

function handleConfirm() {
  if (topic.value.trim()) {
    emit('confirm', topic.value.trim());
    emit('update:modelValue', false);
  }
}

function handleCancel() {
  emit('update:modelValue', false);
}
</script>

<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    persistent
    backdrop-filter="blur(4px)"
    transition-show="scale"
    transition-hide="scale"
  >
    <BaseSurfaceCard style="min-width: 350px" class="tw-p-2">
      <q-card-section>
        <div class="tw-text-xl tw-font-bold tw-text-primary">Iniciar Nova Aula</div>
        <div class="tw-text-sm text-muted tw-mt-1">
          Turma: <strong>{{ courseName }}</strong>
        </div>
      </q-card-section>

      <q-card-section class="tw-pt-0 tw-mt-2">
        <p class="tw-text-sm tw-mb-4">
          Qual será o tópico principal desta aula? Isso organizará o histórico e os insights gerados
          no Dashboard.
        </p>
        <q-input
          outlined
          v-model="topic"
          label="Tópico da Aula *"
          autofocus
          @keyup.enter="handleConfirm"
        />
      </q-card-section>

      <q-card-actions align="right" class="tw-p-4">
        <q-btn flat label="Cancelar" color="grey" @click="handleCancel" class="tw-rounded-xl" />
        <q-btn
          unelevated
          color="primary"
          label="Lançar Sala"
          @click="handleConfirm"
          :disable="!topic.trim()"
          class="tw-rounded-xl tw-px-6 tw-font-bold"
        />
      </q-card-actions>
    </BaseSurfaceCard>
  </q-dialog>
</template>
