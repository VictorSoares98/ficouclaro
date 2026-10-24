<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCourseStore } from '@/modules/courses/stores/course.store';
import { useSessionStore } from '@/modules/session/stores/session.store';
import { useQuasar } from 'quasar';
import CourseCard from '@/modules/courses/components/CourseCard.vue';
import CourseCardSkeleton from '@/modules/courses/components/CourseCardSkeleton.vue';
import BaseSurfaceCard from '@/core/components/BaseSurfaceCard.vue';
import QrCodeScannerModal from '@/components/QrCodeScannerModal.vue';
import type { ClassroomInviteDetails } from '@/modules/courses/services/course.service';

const courseStore = useCourseStore();
const sessionStore = useSessionStore();
const router = useRouter();
const $q = useQuasar();

const isEnrolling = ref(false);
const isScannerOpen = ref(false);
const inviteCode = ref('');
const isRefreshing = ref(false);

async function handleRefresh() {
  isRefreshing.value = true;
  await courseStore.fetchMyCourses();
  const courseIds = courseStore.courses.map((c) => c.id);
  await sessionStore.fetchCoursesSessions(courseIds);
  isRefreshing.value = false;
}

onMounted(async () => {
  await handleRefresh();
  sessionStore.subscribeToCoursesSessions();

  // Abordagem Premium (Universal/Deep Links):
  // Se o aluno escanear um QR code web, a URL trará ?join=CODIGO
  const joinCode = router.currentRoute.value.query.join;
  if (joinCode && typeof joinCode === 'string') {
    inviteCode.value = joinCode.toUpperCase();
    isEnrolling.value = true;
    await handleEnroll();

    // Limpa a URL para não matricular de novo caso ele atualize a página
    void router.replace({ query: { ...router.currentRoute.value.query, join: undefined } });
  }
});

onUnmounted(() => {
  sessionStore.unsubscribeCoursesSessions();
});

async function handleEnroll() {
  if (!inviteCode.value) return;
  try {
    await courseStore.enroll(inviteCode.value);
    $q.notify({ color: 'positive', message: 'Matriculado com sucesso!' });
    isEnrolling.value = false;
    inviteCode.value = '';
  } catch (err: unknown) {
    $q.notify({
      color: 'negative',
      message: err instanceof Error ? err.message : 'Erro na matrícula',
    });
  }
}

async function handleScannerDetected(payload: {
  code: string;
  details: ClassroomInviteDetails | null;
}) {
  inviteCode.value = payload.code.toUpperCase();
  $q.notify({
    type: 'positive',
    icon: 'qr_code_scanner',
    message: payload.details
      ? `Turma "${payload.details.nome}" identificada! Realizando matrícula...`
      : 'Código do QR Code identificado! Realizando matrícula...',
  });
  await handleEnroll();
}

function getSessionStatus(courseId: string): 'aguardando' | 'ativa' | 'encerrada' | 'nenhuma' {
  return sessionStore.coursesSessions?.[courseId]?.status || 'nenhuma';
}

async function handleJoinActiveSession(courseId: string) {
  const session = sessionStore.coursesSessions?.[courseId];
  if (session && (session.status === 'aguardando' || session.status === 'ativa')) {
    void router.push(`/sala/${session.id}`);
    return;
  }

  try {
    $q.loading.show({ message: 'Buscando aula ativa...' });
    const sessionId = await sessionStore.getActiveSession(courseId);
    $q.loading.hide();
    void router.push(`/sala/${sessionId}`);
  } catch (err: unknown) {
    $q.loading.hide();
    $q.notify({
      color: 'warning',
      message:
        err instanceof Error ? err.message : 'Não há aula aberta nesta disciplina no momento.',
    });
  }
}
</script>

<template>
  <q-page class="tw-p-4 md:tw-p-8 lg:tw-p-12 tw-max-w-[1400px] tw-mx-auto">
    <div
      class="tw-flex tw-flex-col sm:tw-flex-row sm:tw-justify-between sm:tw-items-center tw-gap-4 tw-mb-8"
    >
      <div>
        <h1 class="tw-text-2xl tw-font-bold tw-text-primary">Minhas Disciplinas</h1>
        <p class="text-muted">Acesse suas turmas e entre nas aulas ao vivo.</p>
      </div>
      <div class="tw-flex tw-gap-2 tw-self-end sm:tw-self-auto">
        <q-btn flat color="primary" icon="refresh" :loading="isRefreshing" @click="handleRefresh">
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 8]" class="tw-text-sm">
            Atualizar Status das Aulas
          </q-tooltip>
        </q-btn>
        <q-btn
          outline
          color="primary"
          icon="qr_code_scanner"
          label="Escanear QR Code"
          class="tw-rounded-xl"
          @click="isScannerOpen = true"
        >
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 8]" class="tw-text-sm">
            Escanear QR Code com a câmera
          </q-tooltip>
        </q-btn>
        <q-btn
          color="primary"
          icon="add"
          label="Entrar em Turma"
          class="tw-rounded-xl"
          @click="isEnrolling = true"
        >
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 8]" class="tw-text-sm">
            Entrar em Turma via Código
          </q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="courseStore.isLoading"
      class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-6"
    >
      <CourseCardSkeleton v-for="i in 4" :key="i" />
    </div>

    <!-- Empty State: Nenhuma Matrícula -->
    <div
      v-else-if="courseStore.courses.length === 0"
      class="tw-flex-1 tw-flex tw-items-center tw-justify-center tw-py-12"
    >
      <BaseSurfaceCard
        class="tw-max-w-md tw-w-full tw-p-8 tw-text-center tw-rounded-3xl tw-shadow-lg"
      >
        <!-- Personagem 3D Estudante Microsoft Fluent -->
        <div
          class="tw-relative tw-w-28 tw-h-28 tw-mx-auto tw-mb-4 tw-flex tw-items-center tw-justify-center"
        >
          <div
            class="tw-absolute tw-inset-0 tw-rounded-full bg-primary-soft tw-blur-xl tw-opacity-50"
          ></div>
          <img
            src="/images/fluent-3d/student-3d.png"
            alt="Estudante Universitário 3D"
            width="112"
            height="112"
            class="tw-relative tw-w-28 tw-h-28 tw-object-contain tw-drop-shadow-lg hover:tw-scale-105 tw-transition-transform tw-duration-300"
            loading="lazy"
            decoding="async"
          />
        </div>

        <h2 class="tw-text-xl tw-font-black tw-font-space-grotesk tw-mb-2">
          Nenhuma matrícula encontrada
        </h2>
        <p class="text-muted tw-text-xs sm:tw-text-sm tw-leading-relaxed tw-mb-6">
          Você ainda não está vinculado a nenhuma disciplina. Peça o código de convite ou escaneie o
          QR Code do seu professor para começar a acompanhar as aulas ao vivo.
        </p>

        <div class="tw-flex tw-flex-col sm:tw-flex-row tw-gap-3">
          <q-btn
            unelevated
            no-caps
            color="primary"
            icon="qr_code_scanner"
            label="Escanear QR Code"
            class="tw-flex-1 tw-rounded-2xl tw-h-12 tw-font-bold tw-shadow-md hover:tw-scale-105 tw-transition-transform"
            @click="isScannerOpen = true"
          />
          <q-btn
            outline
            no-caps
            color="primary"
            icon="pin"
            label="Inserir Código"
            class="tw-flex-1 tw-rounded-2xl tw-h-12 tw-font-bold hover:tw-scale-105 tw-transition-transform"
            @click="isEnrolling = true"
          />
        </div>
      </BaseSurfaceCard>
    </div>

    <!-- Listagem -->
    <div v-else class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-6">
      <CourseCard
        v-for="course in courseStore.courses"
        :key="course.id"
        :course="course"
        :sessionStatus="getSessionStatus(course.id)"
        actionLabel="Entrar na Aula"
        actionIcon="login"
        actionColor="positive"
        @action="handleJoinActiveSession"
      />
    </div>

    <!-- Modal Entrar em Turma -->
    <q-dialog v-model="isEnrolling" :position="$q.screen.lt.md ? 'bottom' : 'standard'">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="tw-text-lg tw-font-bold">Matricular-se</div>
          <p class="tw-text-sm text-muted tw-mt-1">Insira o código fornecido pelo professor.</p>
        </q-card-section>

        <q-card-section class="tw-pt-0 tw-space-y-4">
          <q-input
            outlined
            v-model="inviteCode"
            label="Código de Convite *"
            autofocus
            input-class="tw-uppercase"
            @update:model-value="(val) => (inviteCode = String(val).toUpperCase())"
            @keyup.enter="handleEnroll"
          >
            <template v-slot:append>
              <q-btn
                flat
                round
                dense
                color="primary"
                icon="qr_code_scanner"
                aria-label="Escanear com a câmera"
                @click="
                  isEnrolling = false;
                  isScannerOpen = true;
                "
              >
                <q-tooltip>Escanear QR Code</q-tooltip>
              </q-btn>
            </template>
          </q-input>

          <q-btn
            flat
            no-caps
            color="primary"
            icon="qr_code_scanner"
            label="Ou aponte a câmera para o QR Code"
            class="tw-w-full tw-text-xs tw-rounded-xl"
            @click="
              isEnrolling = false;
              isScannerOpen = true;
            "
          />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn flat label="Entrar" @click="handleEnroll" :disable="!inviteCode" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal de Escaneamento de QR Code -->
    <QrCodeScannerModal v-model="isScannerOpen" @detected="handleScannerDetected" />
  </q-page>
</template>
