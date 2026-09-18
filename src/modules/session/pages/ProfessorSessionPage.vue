<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSessionStore } from '@/modules/session/stores/session.store';
import { useCourseStore } from '@/modules/courses/stores/course.store';
import { useQuasar } from 'quasar';
import ThermometerDisplay from '@/modules/thermometer/components/ThermometerDisplay.vue';
import QaPanel from '@/modules/qa/components/QaPanel.vue';
import ProfessorPollPanel from '@/modules/poll/components/ProfessorPollPanel.vue';
import ProfessorReviewPanel from '@/modules/flash-review/components/ProfessorReviewPanel.vue';
import QrcodeVue from 'qrcode.vue';

const route = useRoute();
const router = useRouter();
const sessionStore = useSessionStore();
const courseStore = useCourseStore();
const $q = useQuasar();

const sessionId = String((route.params as Record<string, unknown>).id);
const tab = ref('termometro');

const currentCourse = computed(() => {
  if (!sessionStore.currentSession) return null;
  return (
    courseStore.courses.find((c) => c.id === sessionStore.currentSession?.disciplina_id) || null
  );
});

const qrValue = computed(() => {
  if (!currentCourse.value) return '';
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}#/hub?join=${currentCourse.value.codigo_convite}`;
});

onMounted(async () => {
  try {
    await sessionStore.joinSession(sessionId);
    if (courseStore.courses.length === 0) {
      await courseStore.fetchMyCourses();
    }
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
    <div class="tw-p-4 tw-shadow-sm tw-flex tw-justify-between tw-items-center">
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
        </div>
      </div>
      <div v-else>
        <q-skeleton type="text" width="150px" />
      </div>

      <!-- Controles de Ação -->
      <div v-if="sessionStore.currentSession" class="tw-flex tw-space-x-2">
        <q-btn
          v-if="
            sessionStore.currentSession.status === 'aguardando' ||
            sessionStore.currentSession.status === 'encerrada'
          "
          color="primary"
          outline
          icon="arrow_back"
          label="Voltar"
          to="/disciplinas"
        />
        <q-btn
          v-if="sessionStore.currentSession.status === 'ativa'"
          color="negative"
          icon="stop"
          label="Encerrar"
          @click="handleEnd"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="sessionStore.isLoading" class="tw-flex-1 tw-flex tw-flex-col tw-p-4">
      <q-skeleton type="rect" height="40px" class="tw-w-full tw-mb-4" />
      <q-skeleton type="rect" class="tw-flex-1 tw-w-full tw-rounded-xl" />
    </div>

    <!-- Abas de Ferramentas (Apenas Visível se Ativa ou Encerrada) -->
    <div
      class="tw-flex-1 tw-flex tw-flex-col"
      v-else-if="sessionStore.currentSession && sessionStore.currentSession.status !== 'aguardando'"
    >
      <q-tabs
        v-model="tab"
        dense
        mobile-arrows
        outside-arrows
        class="tw-text-grey tw-shadow-sm"
        active-color="primary"
        indicator-color="primary"
        align="justify"
      >
        <q-tab name="termometro" icon="thermostat" :label="$q.screen.gt.xs ? 'Clima' : undefined" />
        <q-tab name="qa" icon="question_answer" :label="$q.screen.gt.xs ? 'Dúvidas' : undefined" />
        <q-tab name="enquetes" icon="poll" :label="$q.screen.gt.xs ? 'Enquetes' : undefined" />
        <q-tab
          name="avaliacoes"
          icon="star"
          :label="$q.screen.gt.xs ? 'Avaliações' : undefined"
          v-if="sessionStore.currentSession.status === 'encerrada'"
        />
      </q-tabs>

      <q-tab-panels v-model="tab" animated class="tw-flex-1 tw-bg-transparent">
        <q-tab-panel
          name="termometro"
          class="tw-p-0 sm:tw-p-4 tw-flex tw-items-start tw-justify-center"
        >
          <ThermometerDisplay />
        </q-tab-panel>

        <q-tab-panel name="qa" class="tw-p-0 sm:tw-p-4 tw-flex tw-items-start tw-justify-center">
          <QaPanel />
        </q-tab-panel>

        <q-tab-panel name="enquetes" class="tw-p-4 tw-h-full tw-flex tw-flex-col">
          <ProfessorPollPanel />
        </q-tab-panel>

        <q-tab-panel
          name="avaliacoes"
          class="tw-p-4 tw-h-full tw-flex tw-flex-col"
          v-if="sessionStore.currentSession.status === 'encerrada'"
        >
          <ProfessorReviewPanel :sessionId="sessionId" />
        </q-tab-panel>
      </q-tab-panels>
    </div>

    <!-- State Aguardando -->
    <div
      class="tw-flex-1 tw-flex tw-items-center tw-justify-center"
      v-else-if="sessionStore.currentSession && sessionStore.currentSession.status === 'aguardando'"
    >
      <div class="tw-text-center">
        <h2 class="tw-text-2xl tw-font-bold tw-text-primary tw-mb-2">Sala de Espera</h2>
        <p class="text-muted tw-max-w-md tw-mx-auto tw-mb-6">
          Os alunos já podem entrar na aula. Escaneie o QR Code abaixo ou acesse pelo código da
          turma.
        </p>

        <!-- QR Code -->
        <div
          v-if="currentCourse"
          class="tw-bg-white tw-p-4 tw-rounded-xl tw-shadow-sm tw-inline-block tw-mb-4"
        >
          <QrcodeVue :value="qrValue" :size="200" level="H" />
        </div>

        <div
          v-if="currentCourse"
          class="tw-text-4xl tw-font-black tw-tracking-widest tw-text-primary tw-uppercase tw-mb-8"
        >
          {{ currentCourse.codigo_convite }}
        </div>

        <q-btn
          color="positive"
          size="lg"
          icon="play_arrow"
          label="Iniciar Aula"
          class="tw-w-full tw-max-w-xs tw-rounded-xl tw-shadow-md"
          @click="handleStart"
        />
      </div>
    </div>
  </q-page>
</template>
