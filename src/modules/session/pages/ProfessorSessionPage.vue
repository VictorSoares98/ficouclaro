<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSessionStore } from '../stores/session.store';
import { useQuasar } from 'quasar';

const route = useRoute();
const router = useRouter();
const sessionStore = useSessionStore();
const $q = useQuasar();

const sessionId = String((route.params as Record<string, unknown>).id);
const tab = ref('termometro');

onMounted(async () => {
  try {
    await sessionStore.joinSession(sessionId);
  } catch (err: unknown) {
    $q.notify({
      color: 'negative',
      message: err instanceof Error ? err.message : 'Erro ao entrar na sessão',
    });
    void router.replace('/professor'); // Voltar em caso de erro
  }
});

onUnmounted(() => {
  sessionStore.leaveSession();
});

async function handleStart() {
  try {
    await sessionStore.startSession();
    $q.notify({ color: 'positive', message: 'Aula iniciada! Alunos agora podem enviar feedback.' });
  } catch (err: unknown) {
    $q.notify({ color: 'negative', message: err instanceof Error ? err.message : 'Erro' });
  }
}

function handleEnd() {
  $q.dialog({
    title: 'Encerrar Aula',
    message: 'Tem certeza que deseja finalizar esta aula? Os alunos não poderão mais interagir.',
    cancel: true,
    persistent: true,
    color: 'negative',
  }).onOk(() => {
    sessionStore
      .endSession()
      .then(() => {
        $q.notify({ color: 'warning', message: 'Aula encerrada.' });
      })
      .catch((err: unknown) => {
        $q.notify({
          color: 'negative',
          message: err instanceof Error ? err.message : 'Erro ao encerrar',
        });
      });
  });
}
</script>

<template>
  <q-page class="tw-flex tw-flex-col tw-h-[calc(100vh-64px)]">
    <!-- Header Fixo da Sessão -->
    <div
      class="tw-p-4 tw-bg-white dark:tw-bg-dark tw-shadow-sm tw-flex tw-justify-between tw-items-center"
    >
      <div v-if="sessionStore.currentSession">
        <h1 class="tw-text-xl tw-font-bold tw-text-primary">
          {{ sessionStore.currentSession.topico || 'Aula sem Tópico' }}
        </h1>
        <div class="tw-flex tw-items-center tw-space-x-2 tw-mt-1 tw-text-sm">
          <q-badge
            :color="
              sessionStore.currentSession.status === 'aguardando'
                ? 'warning'
                : sessionStore.currentSession.status === 'ativa'
                  ? 'positive'
                  : 'negative'
            "
          >
            {{ sessionStore.currentSession.status.toUpperCase() }}
          </q-badge>
          <span class="tw-opacity-60">ID: {{ sessionId }}</span>
        </div>
      </div>
      <div v-else>
        <q-skeleton type="text" width="150px" />
      </div>

      <!-- Controles de Ação -->
      <div v-if="sessionStore.currentSession" class="tw-flex tw-space-x-2">
        <q-btn
          v-if="sessionStore.currentSession.status === 'aguardando'"
          color="positive"
          icon="play_arrow"
          label="Iniciar Aula"
          @click="handleStart"
        />
        <q-btn
          v-if="sessionStore.currentSession.status === 'ativa'"
          color="negative"
          icon="stop"
          label="Encerrar"
          @click="handleEnd"
        />
        <q-btn
          v-if="sessionStore.currentSession.status === 'encerrada'"
          color="primary"
          outline
          icon="arrow_back"
          label="Voltar"
          to="/professor"
        />
      </div>
    </div>

    <!-- Abas de Ferramentas (Apenas Visível se Ativa ou Encerrada) -->
    <div
      class="tw-flex-1 tw-flex tw-flex-col"
      v-if="sessionStore.currentSession?.status !== 'aguardando'"
    >
      <q-tabs
        v-model="tab"
        dense
        class="tw-text-grey tw-bg-white dark:tw-bg-dark tw-shadow-sm"
        active-color="primary"
        indicator-color="primary"
        align="justify"
      >
        <q-tab name="termometro" icon="thermostat" label="Termômetro" />
        <q-tab name="qa" icon="question_answer" label="Dúvidas" />
        <q-tab name="enquetes" icon="poll" label="Enquetes" />
      </q-tabs>

      <q-tab-panels v-model="tab" animated class="tw-flex-1 tw-bg-transparent">
        <q-tab-panel name="termometro" class="tw-flex tw-items-center tw-justify-center">
          <div class="tw-text-center tw-opacity-50">[Painel do Termômetro Virá Aqui]</div>
        </q-tab-panel>

        <q-tab-panel name="qa" class="tw-flex tw-items-center tw-justify-center">
          <div class="tw-text-center tw-opacity-50">[Painel de Dúvidas Virá Aqui]</div>
        </q-tab-panel>

        <q-tab-panel name="enquetes" class="tw-flex tw-items-center tw-justify-center">
          <div class="tw-text-center tw-opacity-50">[Painel de Enquetes Virá Aqui]</div>
        </q-tab-panel>
      </q-tab-panels>
    </div>

    <!-- State Aguardando -->
    <div
      class="tw-flex-1 tw-flex tw-items-center tw-justify-center"
      v-else-if="sessionStore.currentSession?.status === 'aguardando'"
    >
      <div class="tw-text-center">
        <q-icon name="qr_code_scanner" size="6rem" color="primary" class="tw-mb-4" />
        <h2 class="tw-text-xl tw-font-bold">Sala de Espera</h2>
        <p class="tw-opacity-70 tw-max-w-md tw-mx-auto tw-mt-2">
          Os alunos já podem entrar na aula. Clique em "Iniciar Aula" quando estiver pronto para
          liberar as ferramentas.
        </p>
      </div>
    </div>
  </q-page>
</template>
