<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { useThermometerStore } from '../stores/thermometer.store';
import { useSessionStore } from '../../session/stores/session.store';

const thermometerStore = useThermometerStore();
const sessionStore = useSessionStore();

onMounted(async () => {
  if (sessionStore.currentSession) {
    await thermometerStore.subscribeToSession(sessionStore.currentSession.id);
  }
});

onUnmounted(() => {
  if (sessionStore.currentSession) {
    thermometerStore.unsubscribeFromSession(sessionStore.currentSession.id);
  }
});

const totalSignals = computed(() => {
  const { muito_rapido, boiando, tudo_certo, muito_devagar } = thermometerStore.signalCounts;
  return muito_rapido + boiando + tudo_certo + muito_devagar;
});

function getPercentage(value: number) {
  if (totalSignals.value === 0) return 0;
  return value / totalSignals.value;
}

function formatPercent(value: number) {
  if (totalSignals.value === 0) return '0%';
  return Math.round((value / totalSignals.value) * 100) + '%';
}

const stats = computed(() => [
  {
    label: 'Tudo Certo',
    count: thermometerStore.signalCounts.tudo_certo,
    color: 'positive',
    icon: 'thumb_up',
  },
  {
    label: 'Tô Boiando',
    count: thermometerStore.signalCounts.boiando,
    color: 'warning',
    icon: 'sentiment_very_dissatisfied',
  },
  {
    label: 'Muito Rápido',
    count: thermometerStore.signalCounts.muito_rapido,
    color: 'negative',
    icon: 'speed',
  },
  {
    label: 'Muito Devagar',
    count: thermometerStore.signalCounts.muito_devagar,
    color: 'info',
    icon: 'slow_motion_video',
  },
]);
</script>

<template>
  <div class="tw-w-full tw-max-w-2xl tw-mx-auto tw-p-4">
    <div class="tw-flex tw-justify-between tw-items-end tw-mb-6">
      <div>
        <h3 class="tw-text-xl tw-font-bold tw-text-primary">Clima da Turma</h3>
        <p class="tw-text-sm tw-opacity-70">Monitoramento em tempo real</p>
      </div>
      <div class="tw-text-right">
        <span class="tw-text-3xl tw-font-bold">{{ totalSignals }}</span>
        <p class="tw-text-xs tw-opacity-70 tw-uppercase tw-tracking-wider">Feedbacks</p>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="totalSignals === 0"
      class="tw-py-12 tw-text-center tw-bg-gray-50 dark:tw-bg-dark-page tw-rounded-xl tw-border tw-border-dashed tw-border-gray-300 dark:tw-border-gray-700"
    >
      <q-icon name="insights" size="3rem" class="tw-opacity-30 tw-mb-2" />
      <p class="tw-opacity-60">Aguardando os primeiros sinais dos alunos...</p>
    </div>

    <!-- Barras de Progresso -->
    <div v-else class="tw-space-y-6">
      <div v-for="stat in stats" :key="stat.label" class="tw-flex tw-flex-col tw-gap-2">
        <div class="tw-flex tw-justify-between tw-items-center">
          <div class="tw-flex tw-items-center tw-gap-2">
            <q-icon :name="stat.icon" :color="stat.color" size="1.2rem" />
            <span class="tw-font-semibold">{{ stat.label }}</span>
          </div>
          <div class="tw-flex tw-items-baseline tw-gap-2">
            <span class="tw-font-bold tw-text-lg">{{ stat.count }}</span>
            <span class="tw-text-xs tw-opacity-50 tw-w-8 tw-text-right">{{
              formatPercent(stat.count)
            }}</span>
          </div>
        </div>

        <q-linear-progress
          :value="getPercentage(stat.count)"
          :color="stat.color"
          size="16px"
          rounded
          class="tw-bg-gray-100 dark:tw-bg-gray-800"
        />
      </div>
    </div>
  </div>
</template>
