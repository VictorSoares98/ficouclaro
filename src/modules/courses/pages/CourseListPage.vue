<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCourseStore } from '@/modules/courses/stores/course.store';
import { useSessionStore } from '@/modules/session/stores/session.store';
import { useAuthStore } from '@/stores/auth.store';
import { useQuasar } from 'quasar';
import type { Disciplina } from '@/modules/courses/services/course.service';
import CourseCard from '@/modules/courses/components/CourseCard.vue';
import CourseCardSkeleton from '@/modules/courses/components/CourseCardSkeleton.vue';
import StartSessionConfirmDialog from '@/modules/courses/components/StartSessionConfirmDialog.vue';
import BaseSurfaceCard from '@/core/components/BaseSurfaceCard.vue';

const courseStore = useCourseStore();
const sessionStore = useSessionStore();
const authStore = useAuthStore();
const router = useRouter();
const $q = useQuasar();

const isCourseModalOpen = ref(false);
const editingCourseId = ref<string | null>(null);

const searchQuery = ref('');
const selectedFilter = ref<'todas' | 'ativas' | 'espera'>('todas');

const newCourseName = ref('');
const newCourseDesc = ref('');
const newCourseCurso = ref('');
const newCourseSemestre = ref('');
const newCourseTurma = ref('');
const newCourseHorario = ref('');
const newCourseDiaSemana = ref('');
const newCourseSala = ref('');
const newCourseBloco = ref('');
const newCourseIcone = ref('school');

const diaSemanaOptions = [
  { label: 'Segunda-feira', value: 'Segunda-feira' },
  { label: 'Terça-feira', value: 'Terça-feira' },
  { label: 'Quarta-feira', value: 'Quarta-feira' },
  { label: 'Quinta-feira', value: 'Quinta-feira' },
  { label: 'Sexta-feira', value: 'Sexta-feira' },
  { label: 'Sábado', value: 'Sábado' },
];

const iconeOptions = [
  { label: 'Geral (Escola)', value: 'school', icon: 'school' },
  { label: 'Exatas (Cálculo)', value: 'calculate', icon: 'calculate' },
  { label: 'Ciências / Lab', value: 'science', icon: 'science' },
  { label: 'Tecnologia / TI', value: 'computer', icon: 'computer' },
  { label: 'Humanas / História', value: 'history_edu', icon: 'history_edu' },
  { label: 'Linguagens / Arte', value: 'palette', icon: 'palette' },
  { label: 'Negócios / Gestão', value: 'business_center', icon: 'business_center' },
];

const selectedCourseForSession = ref<Disciplina | null>(null);
const isConfirmDialogOpen = computed({
  get: () => selectedCourseForSession.value !== null,
  set: (val) => {
    if (!val) selectedCourseForSession.value = null;
  },
});

onMounted(async () => {
  await courseStore.fetchMyCourses();
  const courseIds = courseStore.courses.map((c) => c.id);
  await sessionStore.fetchCoursesSessions(courseIds);
  sessionStore.subscribeToCoursesSessions();
});

onUnmounted(() => {
  sessionStore.unsubscribeCoursesSessions();
});

function getSessionStatus(courseId: string): 'aguardando' | 'ativa' | 'encerrada' | 'nenhuma' {
  return sessionStore.coursesSessions?.[courseId]?.status || 'nenhuma';
}

// Métricas sintéticas para barra rápida de resumo
const activeSessionsCount = computed(() => {
  return courseStore.courses.filter((c) => getSessionStatus(c.id) === 'ativa').length;
});

const waitingSessionsCount = computed(() => {
  return courseStore.courses.filter((c) => getSessionStatus(c.id) === 'aguardando').length;
});

// Filtro e Busca Computados
const filteredCourses = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();

  return courseStore.courses.filter((course) => {
    // 1. Filtro por status
    const status = getSessionStatus(course.id);
    if (selectedFilter.value === 'ativas' && status !== 'ativa') return false;
    if (selectedFilter.value === 'espera' && status !== 'aguardando') return false;

    // 2. Busca textual
    if (!query) return true;
    const nameMatch = course.nome.toLowerCase().includes(query);
    const codeMatch = course.codigo_convite.toLowerCase().includes(query);
    const courseMatch = course.curso?.toLowerCase().includes(query) || false;
    const roomMatch = course.sala?.toLowerCase().includes(query) || false;

    return nameMatch || codeMatch || courseMatch || roomMatch;
  });
});

function resetForm() {
  editingCourseId.value = null;
  newCourseName.value = '';
  newCourseDesc.value = '';
  newCourseCurso.value = '';
  newCourseSemestre.value = '';
  newCourseTurma.value = '';
  newCourseHorario.value = '';
  newCourseDiaSemana.value = '';
  newCourseSala.value = '';
  newCourseBloco.value = '';
  newCourseIcone.value = 'school';
}

function openCreateModal() {
  resetForm();
  isCourseModalOpen.value = true;
}

function openEditModal(courseId: string) {
  const course = courseStore.courses.find((c) => c.id === courseId);
  if (!course) return;

  editingCourseId.value = course.id;
  newCourseName.value = course.nome;
  newCourseDesc.value = course.descricao || '';
  newCourseCurso.value = course.curso || '';
  newCourseSemestre.value = course.semestre || '';
  newCourseTurma.value = course.turma || '';
  newCourseHorario.value = course.horario || '';
  newCourseDiaSemana.value = course.dia_semana || '';
  newCourseSala.value = course.sala || '';
  newCourseBloco.value = course.bloco || '';
  newCourseIcone.value = course.icone || 'school';

  isCourseModalOpen.value = true;
}

async function handleSaveCourse() {
  if (!newCourseName.value) return;
  try {
    const payload = {
      nome: newCourseName.value,
      descricao: newCourseDesc.value,
      curso: newCourseCurso.value,
      semestre: newCourseSemestre.value,
      turma: newCourseTurma.value?.toUpperCase(),
      horario: newCourseHorario.value,
      dia_semana: newCourseDiaSemana.value,
      sala: newCourseSala.value?.toUpperCase(),
      bloco: newCourseBloco.value?.toUpperCase(),
      icone: newCourseIcone.value,
    };

    if (editingCourseId.value) {
      await courseStore.updateCourse(editingCourseId.value, payload);
      $q.notify({
        type: 'positive',
        message: 'Disciplina atualizada com sucesso!',
        position: 'top',
      });
    } else {
      await courseStore.createCourse(payload);
      $q.notify({
        type: 'positive',
        message: 'Disciplina criada com sucesso!',
        position: 'top',
      });
    }

    isCourseModalOpen.value = false;
  } catch (err: unknown) {
    $q.notify({
      type: 'negative',
      message: err instanceof Error ? err.message : 'Erro ao salvar',
      position: 'top',
    });
  }
}

function handleDeleteCourse(courseId: string) {
  $q.dialog({
    title: 'Excluir Disciplina',
    message:
      'Tem certeza que deseja apagar? Todos os dados, matrículas e aulas da turma serão perdidos permanentemente.',
    color: 'negative',
    persistent: true,
    ok: {
      label: 'Excluir',
      color: 'negative',
      flat: true,
      noCaps: true,
    },
    cancel: {
      label: 'Cancelar',
      color: 'grey-7',
      flat: true,
      noCaps: true,
    },
  }).onOk(() => {
    courseStore
      .deleteCourse(courseId)
      .then(() => {
        $q.notify({
          type: 'positive',
          message: 'Disciplina excluída com sucesso!',
          position: 'top',
        });
      })
      .catch((err: unknown) => {
        $q.notify({
          type: 'negative',
          message: err instanceof Error ? err.message : 'Erro ao excluir',
          position: 'top',
        });
      });
  });
}

function openStartSessionDialog(courseId: string) {
  const course = courseStore.courses.find((c) => c.id === courseId);
  if (course) {
    selectedCourseForSession.value = course;
  }
}

function handleCourseAction(courseId: string) {
  const activeSession = sessionStore.coursesSessions?.[courseId];
  if (
    activeSession &&
    (activeSession.status === 'aguardando' || activeSession.status === 'ativa')
  ) {
    void router.push(`/sala/${activeSession.id}`);
  } else {
    openStartSessionDialog(courseId);
  }
}

function getActionLabel(courseId: string): string {
  const status = sessionStore.coursesSessions?.[courseId]?.status;
  if (status === 'ativa' || status === 'aguardando') {
    return 'Continuar Aula';
  }
  return 'Iniciar Aula';
}

function getActionIcon(courseId: string): string {
  const status = sessionStore.coursesSessions?.[courseId]?.status;
  if (status === 'ativa' || status === 'aguardando') {
    return 'login';
  }
  return 'play_arrow';
}

function getActionColor(courseId: string): string {
  const status = sessionStore.coursesSessions?.[courseId]?.status;
  if (status === 'ativa') return 'positive';
  if (status === 'aguardando') return 'warning';
  return 'primary';
}

async function handleConfirmStartSession(topic: string) {
  if (!selectedCourseForSession.value) return;

  try {
    $q.loading.show({ message: 'Preparando Sala...' });
    if (!authStore.user) throw new Error('Não autenticado');

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

function handleOpenInsights(courseId: string) {
  void router.push(`/disciplinas/${courseId}/insights`);
}
</script>

<template>
  <q-page
    class="tw-p-4 sm:tw-p-6 md:tw-p-8 lg:tw-p-12 tw-max-w-[1400px] tw-mx-auto tw-min-h-screen tw-flex tw-flex-col"
  >
    <!-- 1. Hero / Header Docente -->
    <header class="tw-mb-6 sm:tw-mb-8">
      <div
        class="tw-flex tw-flex-col lg:tw-flex-row lg:tw-items-end lg:tw-justify-between tw-gap-6 tw-pb-2"
      >
        <!-- Título e Subtítulo Space Grotesk -->
        <div class="tw-space-y-2.5">
          <div
            class="tw-inline-flex tw-items-center tw-gap-2 tw-px-3 tw-py-1 tw-rounded-full tw-bg-primary/10 tw-border tw-border-primary/20 text-primary tw-text-xs tw-font-bold"
          >
            <span class="tw-relative tw-flex tw-h-2 tw-w-2">
              <span
                class="tw-animate-ping tw-absolute tw-inline-flex tw-h-full tw-w-full tw-rounded-full tw-bg-primary tw-opacity-75"
              ></span>
              <span
                class="tw-relative tw-inline-flex tw-rounded-full tw-h-2 tw-w-2 tw-bg-primary"
              ></span>
            </span>
            <span>PAINEL DO DOCENTE</span>
          </div>

          <h1
            class="tw-text-2xl sm:tw-text-3xl md:tw-text-4xl tw-font-black tw-font-space-grotesk tw-tracking-tight tw-leading-tight tw-m-0"
          >
            Minhas
            <span
              class="tw-bg-gradient-to-r tw-from-primary tw-via-indigo-500 tw-to-secondary tw-bg-clip-text tw-text-transparent"
            >
              Disciplinas
            </span>
          </h1>

          <p class="text-muted tw-text-xs sm:tw-text-sm tw-max-w-xl tw-leading-relaxed tw-m-0">
            Gerencie suas turmas, convide alunos através de links ou QR codes e inicie aulas
            síncronas com feedback anônimo em tempo real.
          </p>
        </div>

        <!-- Ações no Topo do Header (Botões Ergonômicos 44px) -->
        <div
          class="tw-flex tw-flex-col sm:tw-flex-row tw-items-stretch sm:tw-items-center tw-gap-3 tw-w-full lg:tw-w-auto"
        >
          <q-btn
            v-if="authStore.user?.perfil.papel === 'professor'"
            outline
            no-caps
            color="primary"
            icon="dashboard"
            label="Dashboard Global"
            to="/dashboard"
            class="tw-rounded-2xl tw-h-11 tw-px-4 tw-font-bold tw-text-xs sm:tw-text-sm tw-transition-colors"
          >
            <q-tooltip anchor="top middle" self="bottom middle"
              >Ver métricas consolidadas</q-tooltip
            >
          </q-btn>

          <q-btn
            unelevated
            no-caps
            color="primary"
            icon="add"
            label="Nova Disciplina"
            class="tw-rounded-2xl tw-h-11 tw-px-5 tw-font-bold tw-text-xs sm:tw-text-sm tw-shadow-md hover:tw-scale-105 tw-transition-transform"
            @click="openCreateModal"
          >
            <q-tooltip anchor="top middle" self="bottom middle">Cadastrar nova turma</q-tooltip>
          </q-btn>
        </div>
      </div>

      <q-separator class="tw-my-4 tw-opacity-60" />

      <!-- 2. Barra de Métricas Rápidas (Bento Pills) -->
      <div
        v-if="courseStore.courses.length > 0"
        class="tw-grid tw-grid-cols-2 sm:tw-grid-cols-3 tw-gap-3 tw-mt-5"
      >
        <!-- Card 1: Total -->
        <q-card flat bordered class="tw-p-3.5 tw-rounded-2xl tw-flex tw-items-center tw-gap-3">
          <div
            class="tw-w-9 tw-h-9 tw-rounded-xl bg-primary-soft text-primary tw-flex tw-items-center tw-justify-center"
          >
            <q-icon name="menu_book" size="18px" />
          </div>
          <div>
            <div
              class="tw-text-base sm:tw-text-lg tw-font-black tw-font-space-grotesk tw-leading-tight"
            >
              {{ courseStore.courses.length }}
            </div>
            <div class="tw-text-[11px] text-muted tw-font-medium">Turmas Cadastradas</div>
          </div>
        </q-card>

        <!-- Card 2: Ao Vivo -->
        <q-card flat bordered class="tw-p-3.5 tw-rounded-2xl tw-flex tw-items-center tw-gap-3">
          <div
            class="tw-w-9 tw-h-9 tw-rounded-xl tw-bg-emerald-500/10 text-positive tw-flex tw-items-center tw-justify-center"
          >
            <q-icon name="cast_for_education" size="18px" />
          </div>
          <div>
            <div
              class="tw-text-base sm:tw-text-lg tw-font-black tw-font-space-grotesk tw-leading-tight"
            >
              {{ activeSessionsCount }}
            </div>
            <div class="tw-text-[11px] text-muted tw-font-medium">Aulas Ao Vivo Agora</div>
          </div>
        </q-card>

        <!-- Card 3: Espera -->
        <q-card
          flat
          bordered
          class="tw-col-span-2 sm:tw-col-span-1 tw-p-3.5 tw-rounded-2xl tw-flex tw-items-center tw-gap-3"
        >
          <div
            class="tw-w-9 tw-h-9 tw-rounded-xl tw-bg-amber-500/10 text-warning tw-flex tw-items-center tw-justify-center"
          >
            <q-icon name="hourglass_empty" size="18px" />
          </div>
          <div>
            <div
              class="tw-text-base sm:tw-text-lg tw-font-black tw-font-space-grotesk tw-leading-tight"
            >
              {{ waitingSessionsCount }}
            </div>
            <div class="tw-text-[11px] text-muted tw-font-medium">Salas de Espera</div>
          </div>
        </q-card>
      </div>
    </header>

    <!-- 3. Barra de Filtros e Pesquisa Reativa -->
    <section v-if="courseStore.courses.length > 0" class="tw-mb-6">
      <q-card
        flat
        bordered
        class="tw-flex tw-flex-col sm:tw-flex-row sm:tw-items-center tw-justify-between tw-gap-3.5 tw-p-3 sm:tw-p-4 tw-rounded-2xl"
      >
        <!-- Campo de Pesquisa Rápida -->
        <div class="tw-w-full sm:tw-max-w-xs md:tw-max-w-sm">
          <q-input
            v-model="searchQuery"
            outlined
            dense
            clearable
            placeholder="Buscar por nome, código ou curso..."
            class="tw-rounded-xl"
            aria-label="Buscar disciplinas cadastradas"
          >
            <template v-slot:prepend>
              <q-icon name="search" size="18px" color="primary" />
            </template>
          </q-input>
        </div>

        <!-- Pílulas de Filtro por Status da Aula -->
        <div
          class="tw-flex tw-items-center tw-gap-1.5 tw-overflow-x-auto tw-no-scrollbar tw-py-0.5"
        >
          <q-btn
            no-caps
            dense
            :unelevated="selectedFilter === 'todas'"
            :flat="selectedFilter !== 'todas'"
            :color="selectedFilter === 'todas' ? 'primary' : 'grey-7'"
            class="tw-rounded-xl tw-px-3 tw-h-8 tw-text-xs tw-font-bold tw-transition-colors"
            @click="selectedFilter = 'todas'"
          >
            Todas ({{ courseStore.courses.length }})
          </q-btn>

          <q-btn
            no-caps
            dense
            :unelevated="selectedFilter === 'ativas'"
            :flat="selectedFilter !== 'ativas'"
            :color="selectedFilter === 'ativas' ? 'positive' : 'grey-7'"
            class="tw-rounded-xl tw-px-3 tw-h-8 tw-text-xs tw-font-bold tw-transition-colors"
            @click="selectedFilter = 'ativas'"
          >
            🔴 Ao Vivo ({{ activeSessionsCount }})
          </q-btn>

          <q-btn
            no-caps
            dense
            :unelevated="selectedFilter === 'espera'"
            :flat="selectedFilter !== 'espera'"
            :color="selectedFilter === 'espera' ? 'warning' : 'grey-7'"
            class="tw-rounded-xl tw-px-3 tw-h-8 tw-text-xs tw-font-bold tw-transition-colors"
            @click="selectedFilter = 'espera'"
          >
            🟡 Espera ({{ waitingSessionsCount }})
          </q-btn>
        </div>
      </q-card>
    </section>

    <!-- 4. Área de Conteúdo: Loading / Empty / Grid Bento -->
    <!-- Loading State -->
    <div
      v-if="courseStore.isLoading"
      class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-6"
    >
      <CourseCardSkeleton v-for="i in 6" :key="i" />
    </div>

    <!-- Empty State: Nenhuma Disciplina Criada -->
    <div
      v-else-if="courseStore.courses.length === 0"
      class="tw-flex-1 tw-flex tw-items-center tw-justify-center tw-py-12"
    >
      <BaseSurfaceCard
        class="tw-max-w-md tw-w-full tw-p-8 tw-text-center tw-rounded-3xl tw-shadow-lg"
      >
        <div
          class="tw-w-16 tw-h-16 tw-rounded-2xl bg-primary-soft text-primary tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-4 tw-shadow-sm"
        >
          <q-icon name="school" size="32px" />
        </div>

        <h2 class="tw-text-xl tw-font-black tw-font-space-grotesk tw-mb-2">
          Nenhuma disciplina cadastrada
        </h2>
        <p class="text-muted tw-text-xs sm:tw-text-sm tw-leading-relaxed tw-mb-6">
          Cadastre sua primeira turma para gerar códigos de convite, QR codes e iniciar aulas com o
          termômetro de ritmo e perguntas anônimas.
        </p>

        <q-btn
          unelevated
          no-caps
          color="primary"
          icon="add"
          label="Criar Minha Primeira Disciplina"
          class="tw-w-full tw-rounded-2xl tw-h-12 tw-font-bold tw-shadow-md hover:tw-scale-105 tw-transition-transform"
          @click="openCreateModal"
        />
      </BaseSurfaceCard>
    </div>

    <!-- Empty State: Nenhum Resultado para a Busca -->
    <div
      v-else-if="filteredCourses.length === 0"
      class="tw-flex-1 tw-flex tw-items-center tw-justify-center tw-py-12"
    >
      <BaseSurfaceCard class="tw-max-w-md tw-w-full tw-p-6 sm:tw-p-8 tw-text-center tw-rounded-3xl">
        <div
          class="tw-w-12 tw-h-12 tw-rounded-2xl bg-primary-soft text-primary tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-3"
        >
          <q-icon name="search_off" size="24px" />
        </div>
        <h3 class="tw-text-lg tw-font-bold tw-font-space-grotesk tw-mb-1">
          Nenhuma turma encontrada
        </h3>
        <p class="text-muted tw-text-xs tw-mb-5">
          Não localizamos nenhuma turma com os termos ou filtros aplicados.
        </p>
        <q-btn
          flat
          no-caps
          color="primary"
          label="Limpar Filtros e Busca"
          class="tw-rounded-xl tw-font-bold"
          @click="
            searchQuery = '';
            selectedFilter = 'todas';
          "
        />
      </BaseSurfaceCard>
    </div>

    <!-- Grid Bento Responsivo de Turmas -->
    <div
      v-else
      class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-6 tw-items-stretch"
    >
      <CourseCard
        v-for="course in filteredCourses"
        :key="course.id"
        :course="course"
        :sessionStatus="getSessionStatus(course.id)"
        :actionLabel="getActionLabel(course.id)"
        :actionIcon="getActionIcon(course.id)"
        :actionColor="getActionColor(course.id)"
        :showInviteCode="true"
        :showInsightsBtn="authStore.user?.perfil.papel === 'professor'"
        :showOptionsBtn="authStore.user?.perfil.papel === 'professor'"
        @action="handleCourseAction"
        @insights="handleOpenInsights"
        @edit="openEditModal"
        @delete="handleDeleteCourse"
      />
    </div>

    <!-- 5. Modal Moderno de Nova / Editar Disciplina -->
    <q-dialog
      v-model="isCourseModalOpen"
      @hide="resetForm"
      :position="$q.screen.lt.md ? 'bottom' : 'standard'"
      backdrop-filter="blur(6px)"
    >
      <q-card
        style="width: 720px; max-width: 95vw"
        class="tw-rounded-3xl tw-p-5 sm:tw-p-7 tw-shadow-2xl"
      >
        <!-- Topo do Modal -->
        <q-card-section class="tw-p-0 tw-mb-5">
          <div class="tw-flex tw-items-center tw-justify-between">
            <div class="tw-flex tw-items-center tw-gap-3">
              <div
                class="tw-w-10 tw-h-10 tw-rounded-2xl bg-primary-soft text-primary tw-flex tw-items-center tw-justify-center"
              >
                <q-icon :name="newCourseIcone || 'school'" size="22px" />
              </div>
              <div>
                <h3 class="tw-text-lg sm:tw-text-xl tw-font-black tw-font-space-grotesk tw-m-0">
                  {{ editingCourseId ? 'Editar Disciplina' : 'Nova Disciplina' }}
                </h3>
                <p class="text-muted tw-text-xs tw-m-0">
                  Preencha as informações para organizar sua turma e gerar o código de convite.
                </p>
              </div>
            </div>
            <q-btn flat round dense icon="close" v-close-popup aria-label="Fechar modal" />
          </div>
        </q-card-section>

        <!-- Formulário em Dois Blocos Semânticos -->
        <q-card-section class="tw-p-0 tw-mb-6">
          <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-5">
            <!-- Bloco 1: Identificação Acadêmica -->
            <div class="tw-space-y-3.5">
              <div class="tw-text-xs tw-font-bold text-primary tw-uppercase tw-tracking-wide">
                1. Identificação Acadêmica
              </div>

              <q-input
                outlined
                dense
                v-model="newCourseName"
                label="Nome da Disciplina *"
                placeholder="Ex: Cálculo Diferencial e Integral I"
                autofocus
                class="tw-rounded-xl"
                :rules="[
                  (val) => !!val || 'O nome é obrigatório',
                  (val) => val.length >= 3 || 'Mínimo de 3 caracteres',
                ]"
                maxlength="100"
              />

              <q-input
                outlined
                dense
                v-model="newCourseCurso"
                label="Curso / Graduação"
                placeholder="Ex: Engenharia da Computação"
                maxlength="100"
                class="tw-rounded-xl"
              />

              <q-input
                outlined
                dense
                v-model="newCourseSemestre"
                label="Semestre / Período"
                placeholder="Ex: 2024.1"
                mask="####.#"
                hint="Formato: Ano.Semestre (ex: 2024.1)"
                inputmode="numeric"
                class="tw-rounded-xl"
              />

              <q-select
                outlined
                dense
                v-model="newCourseIcone"
                :options="iconeOptions"
                label="Ícone Representativo"
                emit-value
                map-options
                class="tw-rounded-xl"
              >
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps" class="tw-rounded-xl">
                    <q-item-section avatar>
                      <q-icon :name="scope.opt.icon" color="primary" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="tw-text-xs tw-font-medium">{{
                        scope.opt.label
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>

              <q-input
                outlined
                dense
                v-model="newCourseDesc"
                label="Descrição Curta da Ementa"
                type="textarea"
                rows="2"
                maxlength="250"
                class="tw-rounded-xl"
              />
            </div>

            <!-- Bloco 2: Logística e Horários -->
            <div class="tw-space-y-3.5">
              <div class="tw-text-xs tw-font-bold text-secondary tw-uppercase tw-tracking-wide">
                2. Logística & Horários
              </div>

              <div class="tw-grid tw-grid-cols-2 tw-gap-3">
                <q-input
                  outlined
                  dense
                  v-model="newCourseTurma"
                  label="Turma"
                  placeholder="Ex: T01"
                  maxlength="10"
                  class="tw-uppercase tw-rounded-xl"
                />
                <q-input
                  outlined
                  dense
                  v-model="newCourseHorario"
                  label="Horário"
                  placeholder="19:00"
                  mask="##:##"
                  inputmode="numeric"
                  class="tw-rounded-xl"
                />
              </div>

              <q-select
                outlined
                dense
                v-model="newCourseDiaSemana"
                :options="diaSemanaOptions"
                label="Dia Principal da Semana"
                emit-value
                map-options
                clearable
                class="tw-rounded-xl"
              />

              <div class="tw-grid tw-grid-cols-2 tw-gap-3">
                <q-input
                  outlined
                  dense
                  v-model="newCourseSala"
                  label="Sala"
                  placeholder="Ex: 104"
                  maxlength="15"
                  class="tw-uppercase tw-rounded-xl"
                />
                <q-input
                  outlined
                  dense
                  v-model="newCourseBloco"
                  label="Bloco"
                  placeholder="Ex: B"
                  maxlength="15"
                  class="tw-uppercase tw-rounded-xl"
                />
              </div>

              <div
                class="tw-p-3 tw-rounded-2xl bg-primary-soft text-primary tw-border tw-border-primary/20 tw-text-xs tw-leading-tight"
              >
                💡 Ao salvar a disciplina, um código exclusivo de 8 caracteres será gerado
                automaticamente para que você compartilhe com a turma.
              </div>
            </div>
          </div>
        </q-card-section>

        <!-- Ações do Modal -->
        <q-card-actions align="right" class="tw-p-0 tw-gap-2.5">
          <q-btn
            flat
            label="Cancelar"
            color="grey-7"
            no-caps
            class="tw-rounded-xl tw-px-4 tw-h-11"
            v-close-popup
          />
          <q-btn
            unelevated
            :color="editingCourseId ? 'secondary' : 'primary'"
            :label="editingCourseId ? 'Salvar Alterações' : 'Criar Disciplina'"
            no-caps
            class="tw-rounded-xl tw-px-6 tw-h-11 tw-font-bold tw-shadow-sm hover:tw-scale-105 tw-transition-transform"
            :disable="!newCourseName || newCourseName.length < 3"
            @click="handleSaveCourse"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal de Confirmação de Início de Aula -->
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
