<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSessionStore } from '@/modules/session/stores/session.store';
import { usePollStore } from '@/modules/poll/stores/poll.store';
import { useQuasar } from 'quasar';
import PaceButton from '@/modules/thermometer/components/PaceButton.vue';
import QaPanel from '@/modules/qa/components/QaPanel.vue';
import ActivePollPanel from '@/modules/poll/components/ActivePollPanel.vue';
import ReviewModal from '@/modules/flash-review/components/ReviewModal.vue';
import BaseSurfaceCard from '@/core/components/BaseSurfaceCard.vue';

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
    <div v-if="sessionStore.isLoading" class="tw-w-full tw-flex tw-flex-col tw-gap-4 tw-mt-4">
      <q-skeleton type="rect" height="60px" class="tw-w-full tw-rounded-lg" />
      <div class="tw-w-full tw-mt-4">
        <q-skeleton type="text" width="150px" class="tw-mb-2" />
        <q-skeleton type="rect" height="100px" class="tw-w-full tw-rounded-lg tw-mb-2" />
        <q-skeleton type="rect" height="100px" class="tw-w-full tw-rounded-lg" />
      </div>
    </div>

    <!-- Sessão Carregada -->
    <div
      v-else-if="sessionStore.currentSession"
      class="tw-w-full tw-text-center"
      :class="{
        'tw-pb-[240px] tw-mt-4': sessionStore.currentSession.status === 'ativa',
        'tw-mt-8': sessionStore.currentSession.status !== 'ativa',
      }"
    >
      <!-- Aguardando Professor -->
      <div v-if="sessionStore.currentSession.status === 'aguardando'" class="tw-space-y-4">
        <q-icon name="hourglass_empty" size="4rem" color="primary" class="tw-animate-pulse" />
        <h2 class="tw-text-2xl tw-font-bold tw-text-primary">Aguardando o professor</h2>
        <p class="text-muted">
          A aula de <strong>{{ sessionStore.currentSession.topico || 'Sem Tópico' }}</strong> logo
          vai começar.
        </p>
      </div>

      <!-- Sessão Ativa (Onde o termômetro ficará) -->
      <div
        v-else-if="sessionStore.currentSession.status === 'ativa'"
        class="tw-flex tw-flex-col tw-gap-4"
      >
        <!-- Banner Compacto de Aula Ativa -->
        <div
          class="tw-flex tw-items-center tw-justify-between tw-w-full tw-bg-positive/10 tw-p-3 tw-rounded-lg"
        >
          <div class="tw-text-left">
            <div class="tw-font-bold tw-text-positive tw-flex tw-items-center tw-gap-2">
              <q-icon name="cast_for_education" size="1.2rem" />
              <span>Aula Ativa</span>
            </div>
            <div class="tw-text-xs text-muted tw-mt-1">
              Tópico: {{ sessionStore.currentSession.topico || 'Aberto' }}
            </div>
          </div>
        </div>

        <!-- Painel Central de Dúvidas -->
        <div class="tw-w-full tw-mt-2">
          <h3 class="tw-text-lg tw-font-bold tw-text-primary tw-text-left tw-mb-3">
            Dúvidas da Turma
          </h3>
          <QaPanel />
        </div>

        <!-- Rodapé Adesivo com Termômetro -->
        <q-page-sticky position="bottom" :offset="[0, 0]" class="tw-z-50">
          <div class="tw-w-[100vw] sm:tw-max-w-xl tw-px-4 tw-pb-8">
            <BaseSurfaceCard
              variant="elevated"
              class="tw-p-4 tw-w-full tw-shadow-[0_-8px_30px_rgba(0,0,0,0.12)] dark:tw-shadow-[0_-8px_30px_rgba(0,0,0,0.5)] tw-border tw-border-black/5 dark:tw-border-white/5"
            >
              <PaceButton />
            </BaseSurfaceCard>
          </div>
        </q-page-sticky>
      </div>

      <!-- Sessão Encerrada -->
      <div v-else-if="sessionStore.currentSession.status === 'encerrada'" class="tw-space-y-4">
        <q-icon name="task_alt" size="4rem" color="warning" />
        <h2 class="tw-text-2xl tw-font-bold tw-text-warning">Aula Encerrada</h2>
        <p class="text-muted">Obrigado por participar.</p>
        <q-btn color="primary" label="Voltar" to="/aluno" class="tw-mt-4" />
      </div>
    </div>
    <ReviewModal />
  </q-page>
</template>
