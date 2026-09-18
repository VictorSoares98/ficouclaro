<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCourseStore } from '@/modules/courses/stores/course.store';
import { useSessionStore } from '@/modules/session/stores/session.store';
import { useAuthStore } from '@/stores/auth.store';
import { useQuasar } from 'quasar';
import type { Disciplina } from '@/modules/courses/services/course.service';
import CourseCard from '@/modules/courses/components/CourseCard.vue';
import CourseCardSkeleton from '@/modules/courses/components/CourseCardSkeleton.vue';
import StartSessionConfirmDialog from '@/modules/courses/components/StartSessionConfirmDialog.vue';

const courseStore = useCourseStore();
const sessionStore = useSessionStore();
const authStore = useAuthStore();
const router = useRouter();
const $q = useQuasar();

const isCourseModalOpen = ref(false);
const editingCourseId = ref<string | null>(null);

const newCourseName = ref('');
const newCourseDesc = ref('');
const newCourseCurso = ref('');
const newCourseSemestre = ref('');
const newCourseTurma = ref('');
const newCourseHorario = ref('');
const newCourseDiaSemana = ref('');
const newCourseSala = ref('');
const newCourseBloco = ref('');
const newCourseIcone = ref('school'); // Default icon

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
      $q.notify({ color: 'positive', message: 'Disciplina atualizada com sucesso!' });
    } else {
      await courseStore.createCourse(payload);
      $q.notify({ color: 'positive', message: 'Disciplina criada com sucesso!' });
    }

    isCourseModalOpen.value = false;
  } catch (err: unknown) {
    $q.notify({
      color: 'negative',
      message: err instanceof Error ? err.message : 'Erro ao salvar',
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
    },
    cancel: {
      label: 'Cancelar',
      color: 'grey-7',
      flat: true,
    },
  }).onOk(() => {
    courseStore
      .deleteCourse(courseId)
      .then(() => {
        $q.notify({ color: 'positive', message: 'Disciplina excluída com sucesso!' });
      })
      .catch((err: unknown) => {
        $q.notify({
          color: 'negative',
          message: err instanceof Error ? err.message : 'Erro ao excluir',
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
      color: 'negative',
      message: err instanceof Error ? err.message : 'Erro ao iniciar aula',
    });
  }
}

function handleOpenInsights(courseId: string) {
  void router.push(`/disciplinas/${courseId}/insights`);
}
</script>

<template>
  <q-page class="tw-p-4 md:tw-p-8 lg:tw-p-12 tw-max-w-[1400px] tw-mx-auto">
    <div
      class="tw-flex tw-flex-col sm:tw-flex-row sm:tw-justify-between sm:tw-items-center tw-gap-4 tw-mb-8"
    >
      <div>
        <h1 class="tw-text-2xl tw-font-bold tw-text-primary">Minhas Disciplinas</h1>
        <p class="text-muted">Gerencie suas turmas e inicie aulas.</p>
      </div>
      <div class="tw-flex tw-flex-col sm:tw-flex-row tw-gap-3 tw-w-full sm:tw-w-auto">
        <q-btn
          v-if="authStore.user?.perfil.papel === 'professor'"
          outline
          color="primary"
          icon="dashboard"
          label="Dashboard Global"
          to="/dashboard"
          class="tw-w-full sm:tw-w-auto"
          no-wrap
        >
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 8]" class="tw-text-sm">
            Dashboard Global
          </q-tooltip>
        </q-btn>

        <q-btn
          color="primary"
          icon="add"
          label="Nova Disciplina"
          @click="openCreateModal"
          class="tw-w-full sm:tw-w-auto"
          no-wrap
        >
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 8]" class="tw-text-sm">
            Nova Disciplina
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

    <!-- Empty State -->
    <div v-else-if="courseStore.courses.length === 0" class="tw-text-center tw-py-12">
      <q-icon name="school" size="4rem" class="tw-opacity-20 tw-mb-4" />
      <h2 class="tw-text-xl tw-font-bold">Nenhuma disciplina criada</h2>
      <p class="text-muted tw-mb-4">
        Comece criando a sua primeira disciplina para gerar o código de convite aos alunos.
      </p>
      <q-btn color="primary" outline label="Criar Disciplina" @click="openCreateModal" />
    </div>

    <!-- Listagem -->
    <div v-else class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-6">
      <CourseCard
        v-for="course in courseStore.courses"
        :key="course.id"
        :course="course"
        actionLabel="Iniciar Aula"
        actionIcon="play_arrow"
        actionColor="primary"
        :showInviteCode="true"
        :showInsightsBtn="authStore.user?.perfil.papel === 'professor'"
        :showOptionsBtn="authStore.user?.perfil.papel === 'professor'"
        @action="openStartSessionDialog"
        @insights="handleOpenInsights"
        @edit="openEditModal"
        @delete="handleDeleteCourse"
      />
    </div>

    <!-- Modal Nova/Editar Disciplina -->
    <q-dialog v-model="isCourseModalOpen" @hide="resetForm">
      <q-card style="width: 700px; max-width: 90vw">
        <q-card-section>
          <div class="tw-text-lg tw-font-bold">
            {{ editingCourseId ? 'Editar Disciplina' : 'Nova Disciplina' }}
          </div>
          <p class="text-muted tw-text-sm">
            Preencha os dados da turma. Apenas o Nome é obrigatório.
          </p>
        </q-card-section>

        <q-card-section class="tw-pt-0">
          <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
            <!-- Coluna 1 -->
            <div class="tw-space-y-4">
              <q-input
                outlined
                v-model="newCourseName"
                label="Nome da Disciplina *"
                autofocus
                :rules="[
                  (val) => !!val || 'O nome é obrigatório',
                  (val) => val.length >= 3 || 'Mínimo de 3 caracteres',
                ]"
                maxlength="100"
              />

              <q-input
                outlined
                v-model="newCourseCurso"
                label="Curso / Graduação"
                placeholder="Ex: Engenharia Civil"
                maxlength="100"
              />

              <q-input
                outlined
                v-model="newCourseSemestre"
                label="Semestre / Período"
                placeholder="Ex: 2024.1"
                mask="####.#"
                hint="Formato: Ano.Semestre (ex: 2024.1)"
                inputmode="numeric"
              />

              <q-input
                outlined
                v-model="newCourseDesc"
                label="Descrição Curta"
                type="textarea"
                rows="2"
                maxlength="250"
              />
            </div>

            <!-- Coluna 2 -->
            <div class="tw-space-y-4">
              <q-select
                outlined
                v-model="newCourseIcone"
                :options="iconeOptions"
                label="Ícone de Identificação"
                emit-value
                map-options
              >
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section avatar>
                      <q-icon :name="scope.opt.icon" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ scope.opt.label }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>

              <div class="tw-grid tw-grid-cols-2 tw-gap-2">
                <q-input
                  outlined
                  v-model="newCourseTurma"
                  label="Turma"
                  placeholder="Ex: T01"
                  maxlength="10"
                  class="tw-uppercase"
                />
                <q-input
                  outlined
                  v-model="newCourseHorario"
                  label="Horário"
                  placeholder="19:00"
                  mask="##:##"
                  inputmode="numeric"
                />
              </div>

              <q-select
                outlined
                v-model="newCourseDiaSemana"
                :options="diaSemanaOptions"
                label="Dia da Semana"
                emit-value
                map-options
                clearable
              />

              <div class="tw-grid tw-grid-cols-2 tw-gap-2">
                <q-input
                  outlined
                  v-model="newCourseSala"
                  label="Sala"
                  placeholder="Ex: 104"
                  maxlength="15"
                  class="tw-uppercase"
                />
                <q-input
                  outlined
                  v-model="newCourseBloco"
                  label="Bloco"
                  placeholder="Ex: B"
                  maxlength="15"
                  class="tw-uppercase"
                />
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            flat
            :label="editingCourseId ? 'Salvar' : 'Criar'"
            @click="handleSaveCourse"
            :disable="!newCourseName"
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
