<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue';
import { useQaStore } from '../stores/qa.store';
import { useSessionStore } from '../../session/stores/session.store';
import { useAuthStore } from '../../../stores/auth.store';
import QuestionForm from './QuestionForm.vue';
import QuestionCard from './QuestionCard.vue';

const qaStore = useQaStore();
const sessionStore = useSessionStore();
const authStore = useAuthStore();

const isProfessor = computed(() => authStore.user?.perfil.papel === 'professor');

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

function handleSubmit(texto: string) {
  if (sessionStore.currentSession) {
    void qaStore.submitQuestion(sessionStore.currentSession.id, texto);
  }
}
</script>

<template>
  <div class="tw-flex tw-flex-col tw-w-full tw-max-w-xl tw-mx-auto tw-gap-4">
    <!-- Form Aluno -->
    <QuestionForm v-if="!isProfessor" @submit="handleSubmit" />

    <div v-if="qaStore.isLoading" class="tw-flex tw-justify-center tw-p-8">
      <q-spinner color="primary" size="2em" />
    </div>

    <!-- Lista de Dúvidas -->
    <div v-else class="tw-flex tw-flex-col tw-gap-3">
      <div v-if="qaStore.sortedQuestions.length === 0" class="tw-text-center tw-p-8 tw-opacity-60">
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
