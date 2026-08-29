<script setup lang="ts">
import { computed } from 'vue';
import type { Enquete, Resposta } from '@/modules/poll/stores/poll.store';

const props = defineProps<{
  poll: Enquete;
  results: Resposta[];
}>();

const totalVotes = computed(() => props.results?.length || 0);

// Calcula a porcentagem de cada opção
const optionStats = computed(() => {
  if (props.poll.tipo !== 'multipla_escolha' || !Array.isArray(props.poll.opcoes)) {
    return [];
  }

  // Helper profissional para conversão segura (Type Guard runtime)
  const getSafeString = (val: unknown): string => {
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return String(val);
    if (val === null || val === undefined) return '';
    return JSON.stringify(val); // Garante que objetos não virem "[object Object]"
  };

  const counts: Record<string, number> = {};

  // Inicializa com 0
  props.poll.opcoes.forEach((opt) => {
    counts[getSafeString(opt)] = 0;
  });

  // Conta os votos reais
  props.results?.forEach((r) => {
    const val = getSafeString(r.resposta);
    if (counts[val] !== undefined) {
      counts[val]++;
    }
  });

  return props.poll.opcoes.map((opt) => {
    const label = getSafeString(opt);
    const count = counts[label] || 0;
    const percentage = totalVotes.value > 0 ? count / totalVotes.value : 0;
    return {
      label,
      count,
      percentage,
    };
  });
});
</script>

<template>
  <div class="tw-space-y-4">
    <div class="tw-flex tw-justify-between tw-items-end">
      <h3 class="tw-text-lg tw-font-bold">{{ poll.pergunta }}</h3>
      <div class="tw-text-sm tw-opacity-70">{{ totalVotes }} Votos</div>
    </div>

    <div v-if="poll.tipo === 'multipla_escolha'" class="tw-space-y-3">
      <div v-for="stat in optionStats" :key="stat.label" class="tw-space-y-1">
        <div class="tw-flex tw-justify-between tw-text-sm">
          <span>{{ stat.label }}</span>
          <span class="tw-font-bold"
            >{{ stat.count }} ({{ Math.round(stat.percentage * 100) }}%)</span
          >
        </div>
        <q-linear-progress
          :value="stat.percentage"
          color="primary"
          size="10px"
          rounded
          class="tw-bg-gray-200 dark:tw-bg-gray-700"
        />
      </div>
    </div>

    <div
      v-else
      class="tw-p-4 tw-bg-gray-100 dark:tw-bg-gray-800 tw-rounded-lg tw-text-center tw-opacity-70"
    >
      Visualização para '{{ poll.tipo }}' estará disponível no próximo patch.
    </div>
  </div>
</template>
