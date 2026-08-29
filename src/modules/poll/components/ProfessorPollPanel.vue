<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { usePollStore } from '@/modules/poll/stores/poll.store';
import { useSessionStore } from '@/modules/session/stores/session.store';
import PollCreatorForm from './PollCreatorForm.vue';
import MultipleChoiceResult from './MultipleChoiceResult.vue';
import BaseSkeletonList from '@/core/components/BaseSkeletonList.vue';
import { useQuasar } from 'quasar';

const pollStore = usePollStore();
const sessionStore = useSessionStore();
const $q = useQuasar();

onMounted(async () => {
  if (sessionStore.currentSession) {
    try {
      await pollStore.loadAllPolls(sessionStore.currentSession.id);
      pollStore.subscribeToSessionPolls(sessionStore.currentSession.id, true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        $q.notify({ color: 'negative', message: err.message || 'Erro ao carregar enquetes' });
      }
    }
  }
});

onUnmounted(() => {
  if (sessionStore.currentSession) {
    pollStore.unsubscribeFromSessionPolls(sessionStore.currentSession.id);
  }
});

async function closePoll(pollId: string) {
  try {
    await pollStore.closePoll(pollId);
    $q.notify({ color: 'warning', message: 'Enquete encerrada.' });
  } catch (err: unknown) {
    if (err instanceof Error) {
      $q.notify({ color: 'negative', message: err.message });
    }
  }
}

async function activatePoll(pollId: string) {
  try {
    await pollStore.activatePoll(pollId);
    $q.notify({ color: 'positive', message: 'Enquete ativada!' });
  } catch (err: unknown) {
    if (err instanceof Error) {
      $q.notify({ color: 'negative', message: err.message });
    }
  }
}
</script>

<template>
  <div class="tw-w-full tw-max-w-3xl tw-mx-auto tw-space-y-6">
    <!-- Criar Nova -->
    <PollCreatorForm />

    <div v-if="pollStore.isLoading" class="tw-mt-4">
      <BaseSkeletonList :count="2" type="card" />
    </div>

    <!-- Ativas -->
    <div v-else-if="pollStore.activePolls.length > 0">
      <h2 class="tw-text-xl tw-font-bold tw-text-positive tw-mb-4">Em Andamento</h2>
      <div class="tw-space-y-4">
        <q-card
          v-for="poll in pollStore.activePolls"
          :key="poll.id"
          flat
          bordered
          class="tw-p-4 tw-border-positive"
        >
          <MultipleChoiceResult :poll="poll" :results="pollStore.pollResults[poll.id] || []" />
          <div class="tw-flex tw-justify-end tw-mt-4">
            <q-btn color="negative" outline label="Encerrar" @click="closePoll(poll.id)" />
          </div>
        </q-card>
      </div>
    </div>

    <!-- Anteriores (Rascunhos e Encerradas) -->
    <div v-if="pollStore.pastPolls.length > 0">
      <h2 class="tw-text-xl tw-font-bold tw-opacity-70 tw-mb-4">Histórico & Rascunhos</h2>
      <div class="tw-space-y-4">
        <q-card v-for="poll in pollStore.pastPolls" :key="poll.id" flat bordered class="tw-p-4">
          <div v-if="poll.status === 'rascunho'">
            <div class="tw-flex tw-justify-between tw-items-center">
              <span class="tw-font-bold">{{ poll.pergunta }}</span>
              <q-badge color="grey">Rascunho</q-badge>
            </div>
            <div class="tw-text-sm tw-opacity-60 tw-mt-1">{{ poll.tipo }}</div>
            <div class="tw-flex tw-justify-end tw-mt-4">
              <q-btn color="positive" label="Lançar Enquete" @click="activatePoll(poll.id)" />
            </div>
          </div>
          <div v-else>
            <MultipleChoiceResult :poll="poll" :results="pollStore.pollResults[poll.id] || []" />
            <div class="tw-text-xs tw-text-right tw-opacity-50 tw-mt-2">
              Encerrada em {{ new Date(poll.encerrada_em || '').toLocaleString() }}
            </div>
          </div>
        </q-card>
      </div>
    </div>
  </div>
</template>
