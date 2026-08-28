<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSessionStore } from '@/modules/session/stores/session.store';
import { useQuasar } from 'quasar';
import PaceButton from '@/modules/thermometer/components/PaceButton.vue';
import QaPanel from '@/modules/qa/components/QaPanel.vue';
import ActivePollPanel from '@/modules/poll/components/ActivePollPanel.vue';
import { usePollStore } from '@/modules/poll/stores/poll.store';

const route = useRoute();
const router = useRouter();
const sessionStore = useSessionStore();
const pollStore = usePollStore();
const $q = useQuasar();

const sessionId = String((route.params as Record<string, unknown>).id);

onMounted(async () => {
  try {
    await sessionStore.joinSession(sessionId);
    await pollStore.loadActivePolls(sessionId);
    pollStore.subscribeToSessionPolls(sessionId, false);
  } catch (err: unknown) {
    $q.notify({ color: 'negative', message: err instanceof Error ? err.message : 'Erro' });
    void router.replace('/aluno'); // Voltar em caso de erro
  }
});

onUnmounted(() => {
  sessionStore.leaveSession();
  pollStore.unsubscribeFromSessionPolls(sessionId);
});
</script>

<template>
  <q-page class="tw-p-4 tw-flex tw-flex-col tw-items-center tw-max-w-xl tw-mx-auto">
    <ActivePollPanel />

    <!-- Esqueleto de loading -->
    <div v-if="sessionStore.isLoading" class="tw-w-full">
      <q-skeleton type="text" class="tw-text-3xl tw-mb-4" />
      <q-skeleton type="rect" height="150px" />
    </div>

    <!-- Sessão Carregada -->
    <div v-else-if="sessionStore.currentSession" class="tw-w-full tw-text-center tw-mt-8">
      <!-- Aguardando Professor -->
      <div v-if="sessionStore.currentSession.status === 'aguardando'" class="tw-space-y-4">
        <q-icon name="hourglass_empty" size="4rem" color="primary" class="tw-animate-pulse" />
        <h2 class="tw-text-2xl tw-font-bold tw-text-primary">Aguardando o professor</h2>
        <p class="tw-opacity-70">
          A aula de <strong>{{ sessionStore.currentSession.topico || 'Sem Tópico' }}</strong> logo
          vai começar.
        </p>
      </div>

      <!-- Sessão Ativa (Onde o termômetro ficará) -->
      <div v-else-if="sessionStore.currentSession.status === 'ativa'" class="tw-space-y-4">
        <q-icon name="cast_for_education" size="4rem" color="positive" />
        <h2 class="tw-text-2xl tw-font-bold tw-text-positive">Aula Ativa!</h2>
        <p class="tw-opacity-70">Tópico: {{ sessionStore.currentSession.topico || 'Aberto' }}</p>

        <div class="tw-mt-8 tw-w-full">
          <PaceButton />
        </div>

        <q-separator class="tw-my-8 tw-w-full" />

        <div class="tw-w-full tw-pb-8">
          <h3 class="tw-text-xl tw-font-bold tw-text-primary tw-text-left tw-mb-4">
            Painel de Dúvidas
          </h3>
          <QaPanel />
        </div>
      </div>

      <!-- Sessão Encerrada -->
      <div v-else-if="sessionStore.currentSession.status === 'encerrada'" class="tw-space-y-4">
        <q-icon name="task_alt" size="4rem" color="warning" />
        <h2 class="tw-text-2xl tw-font-bold tw-text-warning">Aula Encerrada</h2>
        <p class="tw-opacity-70">Obrigado por participar.</p>
        <q-btn color="primary" label="Voltar" to="/aluno" class="tw-mt-4" />
      </div>
    </div>
  </q-page>
</template>
