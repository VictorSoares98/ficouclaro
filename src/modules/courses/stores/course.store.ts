import { defineStore } from 'pinia';
import { ref } from 'vue';
import { courseService, type Disciplina } from '../services/course.service';
import { useAuthStore } from '../../../stores/auth.store';

export const useCourseStore = defineStore('course', () => {
  const courses = ref<Disciplina[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const authStore = useAuthStore();

  async function fetchMyCourses() {
    if (!authStore.user) return;

    isLoading.value = true;
    error.value = null;
    try {
      const isProfessor = authStore.user.perfil.papel === 'professor';
      courses.value = await courseService.getMyCourses(authStore.user.auth.id, isProfessor);
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar disciplinas.';
    } finally {
      isLoading.value = false;
    }
  }

  async function createCourse(nome: string, descricao?: string) {
    if (!authStore.user) throw new Error('Não autenticado');
    try {
      const newCourse = await courseService.createCourse(authStore.user.auth.id, nome, descricao);
      courses.value.unshift(newCourse); // Adiciona no início da lista
      return newCourse;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Erro ao criar disciplina.';
      throw err instanceof Error ? err : new Error(error.value);
    }
  }

  async function enroll(codigoConvite: string) {
    if (!authStore.user) throw new Error('Não autenticado');
    try {
      await courseService.enrollByCode(authStore.user.auth.id, codigoConvite);
      // Após matricular, recarrega a lista
      await fetchMyCourses();
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Erro ao matricular na disciplina.';
      throw err instanceof Error ? err : new Error(error.value);
    }
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
