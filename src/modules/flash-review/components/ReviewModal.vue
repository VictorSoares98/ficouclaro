<script setup lang="ts">
import { ref, watch } from 'vue';
import { useFlashReviewStore } from '@/modules/flash-review/stores/flashReview.store';
import { useSessionStore } from '@/modules/session/stores/session.store';
import { useQuasar } from 'quasar';

const flashReviewStore = useFlashReviewStore();
const sessionStore = useSessionStore();
const $q = useQuasar();

const isOpen = ref(false);
const rating = ref(0);
const comentario = ref('');

// Cores baseadas na nota (ux guide)
const getRatingColor = (val: number) => {
  if (val <= 2) return 'red-5';
  if (val === 3) return 'warning';
  return 'positive';
};

// Observa mudança de estado da sessão
watch(
  () => sessionStore.currentSession?.status,
  (newStatus) => {
    if (newStatus === 'encerrada' && sessionStore.currentSession) {
      const sessionId = sessionStore.currentSession.id;
      if (!flashReviewStore.hasReviewedSession(sessionId)) {
        isOpen.value = true;
      }
    }
  },
);

async function submit() {
  if (!sessionStore.currentSession) return;
  if (rating.value === 0) {
    $q.notify({
      type: 'warning',
      message: 'Por favor, selecione uma nota de 1 a 5 estrelas.',
    });
    return;
  }

  await flashReviewStore.submitReview({
    sessao_id: sessionStore.currentSession.id,
    nota: rating.value,
    comentario: comentario.value.trim() || null,
  });

  if (!flashReviewStore.error) {
    $q.notify({
      type: 'positive',
      message: 'Avaliação enviada! Obrigado pelo feedback.',
    });
    isOpen.value = false;
  }
}

function skip() {
  if (sessionStore.currentSession) {
    flashReviewStore.markAsSkipped(sessionStore.currentSession.id);
  }
  isOpen.value = false;
}
</script>

<template>
  <!-- persistent impede fechamento acidental clicando fora, mas o botão Pular permite saída intencional -->
  <q-dialog v-model="isOpen" persistent backdrop-filter="blur(4px)">
    <q-card class="tw-w-full tw-max-w-md tw-rounded-2xl q-pa-md">
      <q-card-section class="tw-text-center">
        <div class="tw-text-2xl tw-font-bold tw-mb-2">A aula foi encerrada!</div>
        <div class="tw-text-sm tw-opacity-70 tw-mb-6">
          O que você achou da sessão de hoje? Seu feedback é anônimo e ajuda o professor a melhorar.
        </div>

        <div class="tw-flex tw-justify-center tw-mb-6">
          <q-rating
            v-model="rating"
            size="3.5em"
            :color="getRatingColor(rating)"
            icon="star_border"
            icon-selected="star"
          />
        </div>

        <q-input
          v-model="comentario"
          type="textarea"
          outlined
          placeholder="Comentários, sugestões ou dúvidas que ficaram pendentes? (Opcional)"
          rows="3"
          class="tw-mb-4"
        />
      </q-card-section>

      <q-card-actions class="tw-flex tw-justify-between tw-px-4 tw-pb-4">
        <q-btn flat label="Pular" color="grey" @click="skip" class="tw-rounded-xl" />
        <q-btn
          unelevated
          color="primary"
          label="Enviar Feedback"
          @click="submit"
          :loading="flashReviewStore.isLoading"
          class="tw-rounded-xl tw-px-6"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
