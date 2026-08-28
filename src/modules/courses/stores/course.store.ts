import { defineStore } from 'pinia';
import { ref } from 'vue';
import { courseService, type Disciplina } from '../services/course.service';
import { useAuthStore } from '../../../stores/auth.store';
import { useAsyncOperation } from '../../../core/composables/useAsyncOperation';

export const useCourseStore = defineStore('course', () => {
  const courses = ref<Disciplina[]>([]);
  const { isLoading, error, execute } = useAsyncOperation();

  const authStore = useAuthStore();

  async function fetchMyCourses() {
    if (!authStore.user) return;

    return execute(async () => {
      const isProfessor = authStore.user!.perfil.papel === 'professor';
      courses.value = await courseService.getMyCourses(authStore.user!.auth.id, isProfessor);
    }, 'Erro ao carregar disciplinas.');
  }

  async function createCourse(nome: string, descricao?: string) {
    if (!authStore.user) throw new Error('Não autenticado');

    return execute(async () => {
      const newCourse = await courseService.createCourse(authStore.user!.auth.id, nome, descricao);
      courses.value.unshift(newCourse); // Adiciona no início da lista
      return newCourse;
    }, 'Erro ao criar disciplina.');
  }

  async function enroll(codigoConvite: string) {
    if (!authStore.user) throw new Error('Não autenticado');

    return execute(async () => {
      await courseService.enrollByCode(authStore.user!.auth.id, codigoConvite);
      // Após matricular, recarrega a lista
      await fetchMyCourses();
    }, 'Erro ao matricular na disciplina.');
  }

  return {
    courses,
    isLoading,
    error,
    fetchMyCourses,
    createCourse,
    enroll,
  };
});
