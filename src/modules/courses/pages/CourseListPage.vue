<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCourseStore } from '@/modules/courses/stores/course.store';
import { useSessionStore } from '@/modules/session/stores/session.store';
import { useAuthStore } from '@/stores/auth.store';
import { useQuasar } from 'quasar';
import CourseCard from '@/modules/courses/components/CourseCard.vue';
import CourseCardSkeleton from '@/modules/courses/components/CourseCardSkeleton.vue';

const courseStore = useCourseStore();
const sessionStore = useSessionStore();
const authStore = useAuthStore();
const router = useRouter();
const $q = useQuasar();

const isCreating = ref(false);
const newCourseName = ref('');
const newCourseDesc = ref('');

onMounted(async () => {
  await courseStore.fetchMyCourses();
});

async function handleCreateCourse() {
  if (!newCourseName.value) return;
  try {
    await courseStore.createCourse(newCourseName.value, newCourseDesc.value);
    $q.notify({ color: 'positive', message: 'Disciplina criada com sucesso!' });
    isCreating.value = false;
    newCourseName.value = '';
    newCourseDesc.value = '';
  } catch (err: unknown) {
    $q.notify({
      color: 'negative',
      message: err instanceof Error ? err.message : 'Erro ao carregar',
    });
  }
}

async function handleStartSession(courseId: string) {
  try {
    $q.loading.show({ message: 'Preparando Sala...' });
    if (!authStore.user) throw new Error('Não autenticado');

    // Cria uma sessão com tópico "Aula de Hoje" padrão (pode ser editado futuramente)
    const session = await sessionStore.createSession(
      authStore.user.auth.id,
      courseId,
      'Aula de Hoje',
    );

    $q.loading.hide();
    void router.push(`/professor/session/${session.id}`);
  } catch (err: unknown) {
    $q.loading.hide();
    $q.notify({
      color: 'negative',
      message: err instanceof Error ? err.message : 'Erro ao criar sala',
    });
  }
}
</script>

<template>
  <q-page class="tw-p-4 md:tw-p-8 tw-max-w-4xl tw-mx-auto">
    <div class="tw-flex tw-justify-between tw-items-center tw-mb-8">
      <div>
        <h1 class="tw-text-2xl tw-font-bold tw-text-primary">Minhas Disciplinas</h1>
        <p class="tw-opacity-70">Gerencie suas turmas e inicie aulas.</p>
      </div>
      <q-btn color="primary" icon="add" label="Nova Disciplina" @click="isCreating = true" />
    </div>

    <!-- Loading State -->
    <div v-if="courseStore.isLoading" class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
      <CourseCardSkeleton v-for="i in 4" :key="i" />
    </div>

    <!-- Empty State -->
    <div v-else-if="courseStore.courses.length === 0" class="tw-text-center tw-py-12">
      <q-icon name="school" size="4rem" class="tw-opacity-20 tw-mb-4" />
      <h2 class="tw-text-xl tw-font-bold">Nenhuma disciplina criada</h2>
      <p class="tw-opacity-70 tw-mb-4">
        Comece criando a sua primeira disciplina para gerar o código de convite aos alunos.
      </p>
      <q-btn color="primary" outline label="Criar Disciplina" @click="isCreating = true" />
    </div>

    <!-- Listagem -->
    <div v-else class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
      <CourseCard
        v-for="course in courseStore.courses"
        :key="course.id"
        :course="course"
        actionLabel="Iniciar Aula"
        actionIcon="play_arrow"
        actionColor="primary"
        :showInviteCode="true"
        @action="handleStartSession"
      />
    </div>

    <!-- Modal Nova Disciplina -->
    <q-dialog v-model="isCreating">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6 tw-font-bold">Nova Disciplina</div>
        </q-card-section>

        <q-card-section class="q-pt-none tw-space-y-4">
          <q-input
            outlined
            v-model="newCourseName"
            label="Nome da Disciplina *"
            autofocus
            @keyup.enter="handleCreateCourse"
          />
          <q-input
            outlined
            v-model="newCourseDesc"
            label="Descrição (Opcional)"
            type="textarea"
            rows="3"
          />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn flat label="Criar" @click="handleCreateCourse" :disable="!newCourseName" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>
