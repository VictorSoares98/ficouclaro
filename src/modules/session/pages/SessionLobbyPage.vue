<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from '@/stores/auth.store';
import { useCourseStore } from '@/modules/courses/stores/course.store';
import { useSessionStore } from '@/modules/session/stores/session.store';
import { sessionService } from '@/modules/session/services/session.service';
import { courseService, type Disciplina } from '@/modules/courses/services/course.service';
import BaseSurfaceCard from '@/core/components/BaseSurfaceCard.vue';
import StartSessionConfirmDialog from '@/modules/courses/components/StartSessionConfirmDialog.vue';

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();
const courseStore = useCourseStore();
const sessionStore = useSessionStore();

const isChecking = ref(true);
const pinCode = ref('');
const isJoining = ref(false);
const selectedCourseForSession = ref<Disciplina | null>(null);

const isConfirmDialogOpen = computed({
  get: () => selectedCourseForSession.value !== null,
  set: (val: boolean) => {
    if (!val) selectedCourseForSession.value = null;
  },
});

const isAuthenticated = computed(() => authStore.isAuthenticated);
const isProfessor = computed(() => authStore.isProfessor);

const WEEKDAYS_PT = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

function getTodayWeekday(): string {
  return WEEKDAYS_PT[new Date().getDay()] || '';
}

function isCourseToday(diaSemana?: string | null): boolean {
  if (!diaSemana) return false;
  return diaSemana.trim().toLowerCase() === getTodayWeekday().toLowerCase();
}

const todayCourses = computed(() => {
  return courseStore.courses.filter((c) => isCourseToday(c.dia_semana));
});

const otherCourses = computed(() => {
  return courseStore.courses.filter((c) => !isCourseToday(c.dia_semana));
});

function getSessionStatus(courseId: string) {
  return sessionStore.coursesSessions?.[courseId]?.status;
}

function getSessionId(courseId: string) {
  return sessionStore.coursesSessions?.[courseId]?.id;
}

async function checkActiveSessionAndRedirect() {
  isChecking.value = true;
  try {
    // 1. Visitante: Checar sessionStorage
    if (!isAuthenticated.value) {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const raw = sessionStorage.getItem('ficouclaro_guest_session');
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (parsed?.sessionId) {
              const sessao = await sessionService.getSessionById(parsed.sessionId);
              if (sessao && (sessao.status === 'ativa' || sessao.status === 'aguardando')) {
                $q.notify({
                  type: 'positive',
                  icon: 'meeting_room',
                  message: `Reconectando à aula "${parsed.courseName || ''}" como visitante...`,
                  position: 'top',
                });
                void router.replace(`/sala/${sessao.id}`);
                return;
              }
            }
          } catch {
            // Ignora erro de JSON corrompido
          }
        }
      }
      isChecking.value = false;
      return;
    }

    // 2. Usuário Autenticado (Aluno ou Professor)
    await courseStore.fetchMyCourses();
    const courseIds = courseStore.courses.map((c) => c.id);

    if (courseIds.length > 0) {
      await sessionStore.fetchCoursesSessions(courseIds);
      sessionStore.subscribeToCoursesSessions();

      // Regra de Negócio Crítica:
      // Se houver aula ativa/aguardando em matéria do dia de hoje, entra DIRETO na sala!
      const activeTodayCourse = courseStore.courses.find((course) => {
        const status = getSessionStatus(course.id);
        const isActive = status === 'ativa' || status === 'aguardando';
        return isActive && isCourseToday(course.dia_semana);
      });

      if (activeTodayCourse) {
        const sessionId = getSessionId(activeTodayCourse.id);
        if (sessionId) {
          $q.notify({
            type: 'positive',
            icon: 'cast_for_education',
            message: `Aula de ${activeTodayCourse.nome} em andamento hoje. Conectando diretamente...`,
            position: 'top',
          });
          void router.replace(`/sala/${sessionId}`);
          return;
        }
      }
    }
  } catch (err: unknown) {
    console.error('[SessionLobbyPage] Falha na checagem de sessões ativas:', err);
  } finally {
    isChecking.value = false;
  }
}

async function handleJoinByPin() {
  const code = pinCode.value.trim().toLowerCase();
  if (!code) {
    $q.notify({
      type: 'warning',
      message: 'Por favor, informe o código de convite ou PIN da aula.',
      position: 'top',
    });
    return;
  }

  isJoining.value = true;
  try {
    const details = await courseService.getCourseDetailsByInviteCode(code);
    if (details) {
      if (details.sessao_ativa_id) {
        $q.notify({
          type: 'positive',
          icon: 'login',
          message: `Conectando à aula de ${details.nome}...`,
          position: 'top',
        });
        void router.push(`/sala/${details.sessao_ativa_id}`);
      } else {
        void router.push(`/join/${code}`);
      }
      return;
    }

    // Fallback: se não for código de 8 caracteres, tenta como ID direto da sessão
    void router.push(`/sala/${code}`);
  } catch {
    void router.push(`/sala/${code}`);
  } finally {
    isJoining.value = false;
  }
}

function handleCourseClick(course: Disciplina) {
  const status = getSessionStatus(course.id);
  const sessionId = getSessionId(course.id);

  if (sessionId && (status === 'ativa' || status === 'aguardando')) {
    void router.push(`/sala/${sessionId}`);
    return;
  }

  if (isProfessor.value) {
    selectedCourseForSession.value = course;
  } else {
    $q.notify({
      type: 'info',
      icon: 'schedule',
      message: `A aula de ${course.nome} ainda não foi iniciada pelo professor.`,
      position: 'top',
    });
  }
}

async function handleConfirmStartSession(topic: string) {
  if (!selectedCourseForSession.value || !authStore.user) return;
  try {
    $q.loading.show({ message: 'Iniciando Sala de Aula...' });
    const session = await sessionStore.createSession(
      authStore.user.auth.id,
      selectedCourseForSession.value.id,
      topic,
    );
    $q.loading.hide();
    void router.push(`/sala/${session.id}`);
  } catch (err: unknown) {
    $q.loading.hide();
    $q.notify({
      type: 'negative',
      message: err instanceof Error ? err.message : 'Erro ao iniciar aula',
      position: 'top',
    });
  }
}

onMounted(() => {
  void checkActiveSessionAndRedirect();
});
</script>

<template>
  <q-page
    class="tw-p-4 sm:tw-p-6 md:tw-p-8 tw-max-w-4xl tw-mx-auto tw-min-h-[85vh] tw-flex tw-flex-col tw-justify-center"
  >
    <!-- 1. Estado de Checagem Inicial (Anti-flicker) -->
    <div v-if="isChecking" class="tw-text-center tw-py-16">
      <q-spinner-dots color="primary" size="56px" />
      <h2 class="tw-text-base sm:tw-text-lg tw-font-bold tw-font-space-grotesk tw-mt-4 tw-m-0">
        Localizando salas ao vivo...
      </h2>
      <p class="text-muted tw-text-xs tw-mt-1">
        Conectando você de forma instantânea às aulas do dia
      </p>
    </div>

    <!-- 2. Lobby de Sessões (Renderizado quando não houve redirecionamento automático) -->
    <div v-else class="tw-space-y-6">
      <!-- Cabeçalho do Lobby -->
      <header class="tw-text-center tw-space-y-2">
        <div
          class="tw-inline-flex tw-items-center tw-gap-2 tw-px-3.5 tw-py-1 tw-rounded-full bg-primary-soft text-primary tw-border tw-border-primary/20 tw-text-xs tw-font-bold"
        >
          <q-icon name="meeting_room" size="16px" />
          <span>LOBBY DE ENTRADA</span>
        </div>

        <h1
          class="tw-text-2xl sm:tw-text-3xl md:tw-text-4xl tw-font-black tw-font-space-grotesk tw-tracking-tight tw-leading-tight tw-m-0"
        >
          Acesso à <span class="text-primary">Sala de Aula</span>
        </h1>

        <p class="text-muted tw-text-xs sm:tw-text-sm tw-max-w-lg tw-mx-auto tw-m-0">
          Informe o código de convite ou PIN para ingressar na aula ao vivo, ou selecione uma turma
          para acompanhar.
        </p>
      </header>

      <!-- Card Central: Inserção de PIN / Código da Turma -->
      <BaseSurfaceCard class="tw-p-5 sm:tw-p-7 tw-rounded-3xl tw-shadow-xl">
        <div class="tw-flex tw-items-center tw-gap-3 tw-mb-4">
          <div
            class="tw-w-10 tw-h-10 tw-rounded-2xl bg-primary-soft text-primary tw-flex tw-items-center tw-justify-center tw-shrink-0"
          >
            <q-icon name="pin" size="22px" />
          </div>
          <div>
            <h2 class="tw-text-base sm:tw-text-lg tw-font-bold tw-font-space-grotesk tw-m-0">
              Possui um Código ou PIN?
            </h2>
            <p class="text-muted tw-text-xs tw-m-0">
              Digite o código de 8 dígitos da disciplina ou o PIN de acesso rápido.
            </p>
          </div>
        </div>

        <form @submit.prevent="handleJoinByPin" class="tw-flex tw-flex-col sm:tw-flex-row tw-gap-3">
          <q-input
            outlined
            v-model="pinCode"
            placeholder="Ex: MAT101 ou CÓDIGO"
            maxlength="20"
            class="tw-flex-grow tw-rounded-2xl tw-uppercase tw-font-mono tw-font-bold"
            autofocus
            aria-label="Código de convite ou PIN da turma"
          >
            <template v-slot:prepend>
              <q-icon name="qr_code_2" color="primary" />
            </template>
          </q-input>

          <q-btn
            unelevated
            type="submit"
            color="primary"
            icon="login"
            label="Entrar na Aula"
            :loading="isJoining"
            class="tw-rounded-2xl tw-h-12 tw-px-6 tw-font-bold tw-text-sm tw-shadow-md hover:tw-scale-[1.02] tw-transition-transform"
          />
        </form>
      </BaseSurfaceCard>

      <!-- 3. Seção: Aulas Programadas para Hoje -->
      <section v-if="isAuthenticated && todayCourses.length > 0" class="tw-space-y-3">
        <div class="tw-flex tw-items-center tw-justify-between">
          <h2
            class="tw-text-sm sm:tw-text-base tw-font-bold tw-font-space-grotesk tw-flex tw-items-center tw-gap-2 tw-m-0"
          >
            <q-icon name="today" size="18px" color="primary" />
            <span>Aulas de Hoje ({{ getTodayWeekday() }})</span>
          </h2>
          <span class="tw-text-xs text-muted">{{ todayCourses.length }} disciplina(s)</span>
        </div>

        <div class="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 tw-gap-3.5">
          <q-card
            v-for="course in todayCourses"
            :key="course.id"
            flat
            bordered
            class="tw-rounded-2xl tw-p-4 tw-transition-all hover:tw-shadow-md tw-cursor-pointer"
            @click="handleCourseClick(course)"
          >
            <div class="tw-flex tw-items-start tw-justify-between tw-gap-3 tw-mb-2">
              <div class="tw-flex tw-items-center tw-gap-2.5">
                <div
                  class="tw-w-9 tw-h-9 tw-rounded-xl bg-primary-soft text-primary tw-flex tw-items-center tw-justify-center"
                >
                  <q-icon :name="course.icone || 'school'" size="20px" />
                </div>
                <div class="tw-min-w-0">
                  <h3
                    class="tw-text-sm sm:tw-text-base tw-font-bold tw-font-space-grotesk tw-m-0 tw-truncate"
                  >
                    {{ course.nome }}
                  </h3>
                  <div class="tw-text-xs text-muted tw-truncate">
                    {{ course.horario ? `Horário: ${course.horario}` : 'Sem horário fixo' }}
                  </div>
                </div>
              </div>

              <!-- Badge de Status -->
              <div>
                <span
                  v-if="getSessionStatus(course.id) === 'ativa'"
                  class="tw-inline-flex tw-items-center tw-gap-1.5 tw-px-2 tw-py-0.5 tw-rounded-full tw-bg-emerald-500/10 tw-border tw-border-emerald-500/30 text-positive tw-text-[10px] tw-font-extrabold"
                >
                  <span class="tw-w-1.5 tw-h-1.5 tw-rounded-full tw-bg-positive"></span>
                  AO VIVO
                </span>
                <span
                  v-else-if="getSessionStatus(course.id) === 'aguardando'"
                  class="tw-inline-flex tw-items-center tw-gap-1.5 tw-px-2 tw-py-0.5 tw-rounded-full tw-bg-amber-500/10 tw-border tw-border-amber-500/30 text-warning tw-text-[10px] tw-font-extrabold"
                >
                  <span class="tw-w-1.5 tw-h-1.5 tw-rounded-full tw-bg-amber-500"></span>
                  EM ESPERA
                </span>
                <span
                  v-else
                  class="tw-inline-flex tw-items-center tw-px-2 tw-py-0.5 tw-rounded-full fc-badge-button text-muted tw-text-[10px]"
                >
                  SEM AULA
                </span>
              </div>
            </div>

            <!-- Ação no Rodapé do Card -->
            <div class="tw-flex tw-items-center tw-justify-between tw-mt-3 tw-pt-2 tw-border-t">
              <span class="tw-text-xs text-muted">
                {{ course.sala ? `Sala ${course.sala}` : 'Campus' }}
              </span>

              <q-btn
                flat
                dense
                no-caps
                size="sm"
                :color="
                  getSessionStatus(course.id) === 'ativa'
                    ? 'positive'
                    : getSessionStatus(course.id) === 'aguardando'
                      ? 'warning'
                      : 'primary'
                "
                :label="
                  getSessionStatus(course.id) === 'ativa' ||
                  getSessionStatus(course.id) === 'aguardando'
                    ? 'Entrar Agora'
                    : isProfessor
                      ? 'Iniciar Aula'
                      : 'Ver Detalhes'
                "
                class="tw-font-bold tw-px-2"
              />
            </div>
          </q-card>
        </div>
      </section>

      <!-- 4. Seção: Outras Disciplinas (Professor ou Aluno com matérias em outros dias) -->
      <section v-if="isAuthenticated && otherCourses.length > 0" class="tw-space-y-3">
        <q-expansion-item
          expand-separator
          icon="view_list"
          :label="`Outras Turmas Cadastradas (${otherCourses.length})`"
          header-class="tw-rounded-2xl tw-font-space-grotesk tw-font-bold text-muted"
          class="tw-rounded-2xl tw-overflow-hidden"
        >
          <div class="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 tw-gap-3 tw-p-2">
            <q-card
              v-for="course in otherCourses"
              :key="course.id"
              flat
              bordered
              class="tw-rounded-2xl tw-p-3.5 tw-cursor-pointer hover:tw-shadow-sm tw-transition-all"
              @click="handleCourseClick(course)"
            >
              <div class="tw-flex tw-items-center tw-justify-between tw-gap-2">
                <div class="tw-min-w-0">
                  <div class="tw-font-bold tw-text-xs sm:tw-text-sm tw-truncate">
                    {{ course.nome }}
                  </div>
                  <div class="tw-text-[11px] text-muted">
                    {{ course.dia_semana || 'Sem dia fixo' }}
                  </div>
                </div>

                <q-btn
                  flat
                  dense
                  no-caps
                  size="sm"
                  color="primary"
                  :label="isProfessor ? 'Iniciar' : 'Acessar'"
                  class="tw-font-bold"
                />
              </div>
            </q-card>
          </div>
        </q-expansion-item>
      </section>

      <!-- 5. Rodapé Informativo para Visitantes -->
      <div v-if="!isAuthenticated" class="tw-text-center tw-pt-4">
        <p class="text-muted tw-text-xs tw-m-0">
          Deseja salvar suas disciplinas e histórico de participação?
          <router-link to="/login" class="text-primary tw-font-bold tw-underline tw-ml-1">
            Fazer login ou criar conta
          </router-link>
        </p>
      </div>
    </div>

    <!-- Modal de Confirmação para Início de Aula pelo Professor -->
    <StartSessionConfirmDialog
      v-model="isConfirmDialogOpen"
      :courseName="selectedCourseForSession?.nome || ''"
      @confirm="handleConfirmStartSession"
    />
  </q-page>
</template>

<style scoped>
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    animation: none !important;
    transform: none !important;
  }
}
</style>
