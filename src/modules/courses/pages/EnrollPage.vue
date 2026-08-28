<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCourseStore } from '../stores/course.store';
import { useSessionStore } from '../../session/stores/session.store';
import { useQuasar } from 'quasar';
import CourseCard from '../components/CourseCard.vue';
import CourseCardSkeleton from '../components/CourseCardSkeleton.vue';

const courseStore = useCourseStore();
const sessionStore = useSessionStore();
const router = useRouter();
const $q = useQuasar();

const isEnrolling = ref(false);
const inviteCode = ref('');

onMounted(async () => {
  await courseStore.fetchMyCourses();
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

async function handleJoinActiveSession(courseId: string) {
  try {
    $q.loading.show({ message: 'Buscando aula ativa...' });

    // Busca a sessão mais recente deste curso que não esteja encerrada via store
    const sessionId = await sessionStore.getActiveSession(courseId);

    $q.loading.hide();
    void router.push(`/aluno/session/${sessionId}`);
  } catch (err: unknown) {
    $q.loading.hide();
    $q.notify({
      color: 'warning',
      message: err instanceof Error ? err.message : 'Erro ao entrar na aula',
    });
  }
}
</script>

<template>
  <q-page class="tw-p-4 md:tw-p-8 tw-max-w-4xl tw-mx-auto">
    <div class="tw-flex tw-justify-between tw-items-center tw-mb-8">
      <div>
        <h1 class="tw-text-2xl tw-font-bold tw-text-primary">Minhas Disciplinas</h1>
        <p class="tw-opacity-70">Acesse suas turmas e entre nas aulas ao vivo.</p>
      </div>
      <q-btn color="primary" icon="add" label="Entrar em Turma" @click="isEnrolling = true" />
    </div>

    <!-- Loading State -->
    <div v-if="courseStore.isLoading" class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
      <CourseCardSkeleton v-for="i in 4" :key="i" />
    </div>

    <!-- Empty State -->
    <div v-else-if="courseStore.courses.length === 0" class="tw-text-center tw-py-12">
      <q-icon name="cast_for_education" size="4rem" class="tw-opacity-20 tw-mb-4" />
      <h2 class="tw-text-xl tw-font-bold">Nenhuma matrícula encontrada</h2>
      <p class="tw-opacity-70 tw-mb-4">
        Peça o código de convite ao seu professor para se matricular.
      </p>
      <q-btn color="primary" outline label="Usar Código de Convite" @click="isEnrolling = true" />
    </div>

    <!-- Listagem -->
    <div v-else class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
      <CourseCard
        v-for="course in courseStore.courses"
        :key="course.id"
        :course="course"
        actionLabel="Entrar na Aula"
        actionIcon="login"
        actionColor="positive"
        @action="handleJoinActiveSession"
      />
    </div>

    <!-- Modal Entrar em Turma -->
    <q-dialog v-model="isEnrolling">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6 tw-font-bold">Matricular-se</div>
          <p class="tw-text-sm tw-opacity-70 tw-mt-1">Insira o código fornecido pelo professor.</p>
        </q-card-section>

        <q-card-section class="q-pt-none tw-space-y-4">
          <q-input
            outlined
            v-model="inviteCode"
            label="Código de Convite *"
            autofocus
            @keyup.enter="handleEnroll"
          />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn flat label="Entrar" @click="handleEnroll" :disable="!inviteCode" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>
