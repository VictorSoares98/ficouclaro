<script setup lang="ts">
import { ref, watch } from 'vue';
import BaseSurfaceCard from '@/core/components/BaseSurfaceCard.vue';
import { useQuasar } from 'quasar';

const $q = useQuasar();

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
    :position="$q.screen.lt.md ? 'bottom' : 'standard'"
    persistent
    backdrop-filter="blur(6px)"
    transition-show="scale"
    transition-hide="scale"
  >
    <BaseSurfaceCard
      style="min-width: 360px; max-width: 500px"
      class="tw-w-full tw-rounded-3xl tw-p-5 sm:tw-p-6 tw-shadow-2xl"
    >
      <q-card-section class="tw-p-0 tw-mb-4">
        <div class="tw-flex tw-items-center tw-gap-3 tw-mb-2">
          <div
            class="tw-w-10 tw-h-10 tw-rounded-2xl bg-primary-soft text-primary tw-flex tw-items-center tw-justify-center"
          >
            <q-icon name="cast_for_education" size="22px" />
          </div>
          <div class="tw-min-w-0 tw-flex-1">
            <h3 class="tw-text-lg sm:tw-text-xl tw-font-bold tw-font-space-grotesk tw-m-0">
              Iniciar Nova Aula
            </h3>
            <div class="tw-text-xs text-muted tw-truncate">
              Turma: <strong class="tw-text-primary">{{ courseName }}</strong>
            </div>
          </div>
        </div>
        <p class="text-muted tw-text-xs sm:tw-text-sm tw-leading-relaxed tw-m-0">
          Defina o tópico principal desta sessão para organizar o termômetro, as dúvidas e as
          métricas no seu Dashboard.
        </p>
      </q-card-section>

      <q-card-section class="tw-p-0 tw-mb-6">
        <q-input
          outlined
          v-model="topic"
          label="Tópico da Aula *"
          placeholder="Ex: Introdução à Cinemática"
          maxlength="120"
          autofocus
          class="tw-rounded-2xl"
          @keyup.enter="handleConfirm"
        >
          <template v-slot:prepend>
            <q-icon name="menu_book" color="primary" />
          </template>
        </q-input>
      </q-card-section>

      <q-card-actions align="right" class="tw-p-0 tw-gap-2.5">
        <q-btn
          flat
          label="Cancelar"
          color="grey-7"
          no-caps
          class="tw-rounded-xl tw-px-4 tw-h-11"
          @click="handleCancel"
        />
        <q-btn
          unelevated
          color="primary"
          icon="play_arrow"
          label="Lançar Sala"
          no-caps
          class="tw-rounded-xl tw-px-6 tw-h-11 tw-font-bold tw-shadow-sm hover:tw-scale-105 tw-transition-transform"
          :disable="!topic.trim()"
          @click="handleConfirm"
        />
      </q-card-actions>
    </BaseSurfaceCard>
  </q-dialog>
</template>
