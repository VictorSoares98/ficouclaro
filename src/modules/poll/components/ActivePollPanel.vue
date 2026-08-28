<script setup lang="ts">
import { computed } from 'vue';
import { usePollStore } from '../stores/poll.store';
import PollCard from './PollCard.vue';

const pollStore = usePollStore();

// Exibe a primeira enquete ativa que o aluno ainda não respondeu
const pendingPoll = computed(() => {
  return pollStore.activePolls.find((poll) => !pollStore.hasResponded(poll.id));
});

const isModalOpen = computed(() => !!pendingPoll.value);
</script>

<template>
  <q-dialog v-model="isModalOpen" persistent backdrop-filter="blur(4px)">
    <PollCard v-if="pendingPoll" :poll="pendingPoll" @close="() => {}" />
  </q-dialog>
</template>
