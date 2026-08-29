<script setup lang="ts">
import { ref } from 'vue';
import { usePollStore } from '@/modules/poll/stores/poll.store';
import type { Enquete } from '@/modules/poll/stores/poll.store';
import { useQuasar } from 'quasar';
import BaseSurfaceCard from '@/core/components/BaseSurfaceCard.vue';

const props = defineProps<{
  poll: Enquete;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const pollStore = usePollStore();
const $q = useQuasar();

const respostaNumber = ref<number>(0);
const respostaString = ref<string>('');

async function submit() {
  let valorFinal: string | number;

  if (props.poll.tipo === 'escala_clareza') {
    if (respostaNumber.value === 0) {
      $q.notify({ color: 'warning', message: 'Selecione uma pontuação antes de enviar.' });
      return;
    }
    valorFinal = respostaNumber.value;
  } else {
    if (respostaString.value === '') {
      $q.notify({ color: 'warning', message: 'Preencha a resposta antes de enviar.' });
      return;
    }
    valorFinal = respostaString.value;
  }

  try {
    await pollStore.submitResponse(props.poll.id, valorFinal);
    $q.notify({ color: 'positive', message: 'Resposta enviada com sucesso!' });
    emit('close');
  } catch (error: unknown) {
    if (error instanceof Error) {
      $q.notify({ color: 'negative', message: error.message });
    }
  }
}
</script>

<template>
  <BaseSurfaceCard class="tw-w-full tw-max-w-md">
    <q-card-section class="tw-bg-primary tw-text-white tw-flex tw-items-center tw-gap-3">
      <q-icon name="poll" size="2rem" />
      <div class="tw-text-xl tw-font-bold">Nova Enquete</div>
    </q-card-section>

    <q-card-section class="tw-p-6 tw-space-y-6">
      <div class="tw-text-lg tw-font-medium tw-text-center">
        {{ poll.pergunta }}
      </div>

      <div class="tw-mt-4">
        <!-- Múltipla Escolha -->
        <template v-if="poll.tipo === 'multipla_escolha' && Array.isArray(poll.opcoes)">
          <div class="tw-space-y-2">
            <q-radio
              v-for="(opcao, index) in poll.opcoes"
              :key="index"
              v-model="respostaString"
              :val="opcao"
              :label="String(opcao)"
              class="tw-w-full tw-border tw-border-gray-200 dark:tw-border-gray-700 tw-rounded-lg tw-px-4 tw-py-2 hover:tw-bg-gray-50 dark:hover:tw-bg-gray-800 tw-transition-colors"
            />
          </div>
        </template>

        <!-- Escala de Clareza -->
        <template v-else-if="poll.tipo === 'escala_clareza'">
          <div class="tw-flex tw-justify-center">
            <q-rating
              v-model="respostaNumber"
              size="3rem"
              color="warning"
              icon="star_border"
              icon-selected="star"
              :max="5"
            />
          </div>
          <div class="tw-flex tw-justify-between tw-text-xs text-hint tw-mt-2">
            <span>Nada Claro</span>
            <span>Muito Claro</span>
          </div>
        </template>

        <!-- Nuvem de Palavras -->
        <template v-else-if="poll.tipo === 'nuvem_palavras'">
          <q-input
            v-model="respostaString"
            outlined
            placeholder="Digite uma palavra..."
            counter
            maxlength="20"
            @keyup.enter="submit"
          />
        </template>

        <!-- Fallback/Ranking (MVP Simples) -->
        <template v-else>
          <q-input
            v-model="respostaString"
            outlined
            placeholder="Sua resposta..."
            @keyup.enter="submit"
          />
        </template>
      </div>
    </q-card-section>

    <q-card-actions align="center" class="tw-p-4 tw-bg-gray-50 dark:tw-bg-dark-page">
      <q-btn
        label="Enviar Resposta"
        color="primary"
        size="lg"
        class="tw-w-full tw-font-bold"
        @click="submit"
        :loading="pollStore.isLoading"
      />
    </q-card-actions>
  </BaseSurfaceCard>
</template>
