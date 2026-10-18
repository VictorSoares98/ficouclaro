<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import ProfessorSessionPage from './ProfessorSessionPage.vue';
import StudentSessionPage from './StudentSessionPage.vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const $q = useQuasar();
const router = useRouter();

const role = computed(() => authStore.user?.perfil.papel);
const isGuest = computed(() => {
  if (typeof window === 'undefined' || !window.sessionStorage) return false;
  return Boolean(sessionStorage.getItem('ficouclaro_guest_session'));
});

if (!role.value && !isGuest.value) {
  $q.notify({ type: 'negative', message: 'Sessão inválida ou não autorizada.' });
  void router.replace('/');
}
</script>

<template>
  <ProfessorSessionPage v-if="role === 'professor'" />
  <StudentSessionPage v-else-if="role === 'aluno' || isGuest" />
</template>
