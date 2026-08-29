<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useQaStore } from '@/modules/qa/stores/qa.store';
import { useSessionStore } from '@/modules/session/stores/session.store';
import { useAuthStore } from '@/stores/auth.store';
import { useQuasar } from 'quasar';
import QuestionForm from '@/modules/qa/components/QuestionForm.vue';
import QuestionCard from '@/modules/qa/components/QuestionCard.vue';
import BaseSkeletonList from '@/core/components/BaseSkeletonList.vue';

const qaStore = useQaStore();
const sessionStore = useSessionStore();
const authStore = useAuthStore();
const $q = useQuasar();

const isProfessor = computed(() => authStore.user?.perfil.papel === 'professor');
const isSubmitting = ref(false);

onMounted(() => {
  if (sessionStore.currentSession) {
    void qaStore.subscribeToSession(sessionStore.currentSession.id);
  }
});

onUnmounted(() => {
  if (sessionStore.currentSession) {
    qaStore.unsubscribeFromSession(sessionStore.currentSession.id);
  }
});

async function handleSubmit(texto: string) {
  if (sessionStore.currentSession) {
    isSubmitting.value = true;
    try {
      await qaStore.submitQuestion(sessionStore.currentSession.id, texto);
      $q.notify({
        color: 'positive',
        message: 'Dúvida enviada ao painel!',
        icon: 'check_circle',
      });
    } catch {
      $q.notify({
        color: 'negative',
        message: 'Falha ao enviar a dúvida. Tente novamente.',
        icon: 'error',
      });
    } finally {
      isSubmitting.value = false;
    }
  }
}
</script>

<template>
  <div class="tw-flex tw-flex-col tw-w-full tw-max-w-xl tw-mx-auto tw-gap-4">
    <!-- Form Aluno -->
    <QuestionForm v-if="!isProfessor" :loading="isSubmitting" @submit="handleSubmit" />

    <div v-if="qaStore.isLoading" class="tw-flex tw-justify-center tw-p-4">
      <BaseSkeletonList :count="3" type="card" />
    </div>

    <!-- Lista de Dúvidas -->
    <div v-else class="tw-flex tw-flex-col tw-gap-3">
      <div v-if="qaStore.sortedQuestions.length === 0" class="tw-text-center tw-p-8 text-hint">
        Nenhuma dúvida enviada ainda.
      </div>

      <QuestionCard
        v-for="question in qaStore.sortedQuestions"
        :key="question.id"
        :question="question"
        :has-upvoted="qaStore.myUpvotes.has(question.id)"
        @upvote="qaStore.upvoteQuestion($event)"
        @mark-answered="qaStore.markAsAnswered($event)"
      />
    </div>
  </div>
</template>
