<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePollStore } from '@/modules/poll/stores/poll.store';
import { useSessionStore } from '@/modules/session/stores/session.store';
import type { Database } from '@/core/types/database.types';
import BaseIconButton from '@/core/components/BaseIconButton.vue';

const pollStore = usePollStore();
const sessionStore = useSessionStore();

type TipoEnquete = Database['public']['Enums']['tipo_enquete'];

const tipo = ref<TipoEnquete>('multipla_escolha');
const pergunta = ref('');
const opcoes = ref<string[]>(['', '']);

const tipoOptions = [
  { label: 'Múltipla Escolha', value: 'multipla_escolha' },
  { label: 'Nuvem de Palavras', value: 'nuvem_palavras' },
  { label: 'Escala de Clareza (1 a 5)', value: 'escala_clareza' },
  { label: 'Ranking', value: 'ranking' },
];

const needsOptions = computed(() => {
  return tipo.value === 'multipla_escolha' || tipo.value === 'ranking';
});

function addOption() {
  opcoes.value.push('');
}

function removeOption(index: number) {
  if (opcoes.value.length > 2) {
    opcoes.value.splice(index, 1);
  }
}

async function handleCreate() {
  if (!sessionStore.currentSession) return;

  // Filtra opções vazias
  const finalOptions = needsOptions.value
    ? opcoes.value.filter((opt) => opt.trim().length > 0)
    : null;

  if (needsOptions.value && (!finalOptions || finalOptions.length < 2)) {
    // A validação de required field no Quasar vai segurar, mas aqui garantimos
    return;
  }

  await pollStore.createPoll({
    sessao_id: sessionStore.currentSession.id,
    tipo: tipo.value,
    pergunta: pergunta.value,
    opcoes: finalOptions,
    status: 'rascunho',
  });

  // Reset form
  pergunta.value = '';
  opcoes.value = ['', ''];
  tipo.value = 'multipla_escolha';
}
</script>

<template>
  <q-card flat bordered class="tw-p-4 tw-mb-4 tw-rounded-lg">
    <div class="tw-text-lg tw-font-bold tw-mb-4 tw-text-primary">Criar Nova Enquete</div>

    <q-form @submit.prevent="handleCreate" class="tw-space-y-4">
      <q-select
        v-model="tipo"
        :options="tipoOptions"
        emit-value
        map-options
        label="Tipo de Enquete"
        outlined
        dense
        options-dense
        class="tw-w-full md:tw-w-1/2"
      />

      <q-input
        v-model="pergunta"
        label="Pergunta"
        outlined
        dense
        autofocus
        :rules="[(val) => !!val || 'A pergunta é obrigatória']"
      />

      <div
        v-if="needsOptions"
        class="tw-pl-4 tw-border-l-2 tw-border-gray-200 dark:tw-border-gray-700 tw-space-y-2"
      >
        <div class="tw-text-sm tw-opacity-70 tw-mb-2">Opções (Mínimo 2)</div>

        <div v-for="(opcao, index) in opcoes" :key="index" class="tw-flex tw-items-center tw-gap-2">
          <q-input
            v-model="opcoes[index]"
            :label="`Opção ${index + 1}`"
            outlined
            dense
            class="tw-flex-1"
            :rules="[(val) => index >= 2 || !!val || 'Obrigatório']"
            hide-bottom-space
          />
          <BaseIconButton
            icon="delete"
            color="negative"
            ariaLabel="Remover Opção"
            @click="removeOption(index)"
            :disable="opcoes.length <= 2"
          />
        </div>

        <q-btn
          icon="add"
          label="Adicionar Opção"
          color="primary"
          flat
          dense
          class="tw-mt-2"
          @click="addOption"
        />
      </div>

      <div class="tw-flex tw-justify-end tw-mt-4">
        <q-btn
          type="submit"
          label="Salvar Rascunho"
          color="primary"
          :loading="pollStore.isLoading"
        />
      </div>
    </q-form>
  </q-card>
</template>
