<script setup lang="ts">
import type { Duvida } from '@/modules/qa/services/qa.service';
import { useAuthStore } from '@/stores/auth.store';
import { computed, ref } from 'vue';
import BaseIconButton from '@/core/components/BaseIconButton.vue';
import BaseSurfaceCard from '@/core/components/BaseSurfaceCard.vue';
import { getWikipediaSummary } from '@/core/services/api/wikipedia.service';
import { useAsyncOperation } from '@/core/composables/useAsyncOperation';

const props = defineProps<{
  question: Duvida;
  hasUpvoted: boolean;
}>();

const emit = defineEmits<{
  (e: 'upvote', id: string): void;
  (e: 'mark-answered', id: string): void;
}>();

const authStore = useAuthStore();
const isProfessor = computed(() => authStore.user?.perfil.papel === 'professor');

function handleUpvote() {
  if (!props.hasUpvoted && !isProfessor.value) {
    emit('upvote', props.question.id);
  }
}

function handleAnswered() {
  if (isProfessor.value && !props.question.foi_respondida) {
    emit('mark-answered', props.question.id);
  }
}

// --- Wikipedia Mashup Logic ---
const isWikiDialogOpen = ref(false);
const wikiSearchTerm = ref('');
const wikiResult = ref('');
const { isLoading: isSearchingWiki, execute: executeWikiSearch } = useAsyncOperation();

const searchWiki = async () => {
  if (!wikiSearchTerm.value.trim()) return;
  wikiResult.value = '';

  try {
    wikiResult.value = await executeWikiSearch(
      () => getWikipediaSummary(wikiSearchTerm.value),
      'Erro ao buscar na Wikipedia.',
    );
  } catch {
    // Tratamento nativo do ADR-005 já notifica
  }
};
</script>

<template>
  <BaseSurfaceCard
    variant="flat"
    class="tw-p-4 tw-w-full"
    :class="{ 'text-hint': question.foi_respondida }"
  >
    <div class="tw-flex tw-gap-3">
      <!-- Votos -->
      <div class="tw-flex tw-flex-col tw-items-center tw-justify-start tw-w-12">
        <BaseIconButton
          :icon="hasUpvoted ? 'thumb_up' : 'thumb_up_off_alt'"
          :color="hasUpvoted ? 'primary' : 'grey'"
          :disable="isProfessor || question.foi_respondida || hasUpvoted"
          ariaLabel="Votar nesta dúvida"
          @click="handleUpvote"
        />
        <span class="tw-font-bold tw-text-lg" :class="{ 'tw-text-primary': hasUpvoted }">
          {{ question.votos }}
        </span>
      </div>

      <!-- Conteúdo -->
      <div class="tw-flex-1 tw-flex tw-flex-col tw-justify-center">
        <p class="tw-text-sm tw-m-0 tw-leading-relaxed tw-whitespace-pre-wrap">
          {{ question.texto }}
        </p>
      </div>

      <!-- Actions & Status -->
      <div class="tw-flex tw-flex-col tw-items-end tw-justify-between">
        <q-badge v-if="question.foi_respondida" color="positive" class="tw-mb-2">
          Respondida
        </q-badge>

        <div class="tw-flex tw-gap-2">
          <!-- Botão Wikipedia Mashup -->
          <BaseIconButton
            icon="menu_book"
            color="secondary"
            title="Dicionário / Wikipedia"
            ariaLabel="Buscar termo da dúvida na Wikipedia"
            @click="isWikiDialogOpen = true"
          />

          <BaseIconButton
            v-if="isProfessor && !question.foi_respondida"
            icon="check_circle"
            color="positive"
            title="Marcar como respondida"
            ariaLabel="Marcar dúvida como respondida"
            @click="handleAnswered"
          />
        </div>
      </div>
    </div>

    <!-- Wikipedia Modal -->
    <q-dialog v-model="isWikiDialogOpen" position="bottom">
      <BaseSurfaceCard class="tw-w-full tw-max-w-md tw-p-6">
        <div class="tw-flex tw-justify-between tw-items-center tw-mb-4">
          <h3 class="tw-text-lg tw-font-bold tw-text-primary tw-flex tw-items-center tw-gap-2">
            <q-icon name="menu_book" size="1.5rem" />
            Wikipedia
          </h3>
          <q-btn icon="close" flat round dense v-close-popup />
        </div>

        <p class="text-muted tw-text-sm tw-mb-4">
          Algum termo técnico da dúvida não ficou claro? Busque rapidamente um resumo.
        </p>

        <div class="tw-flex tw-gap-2 tw-mb-4">
          <q-input
            v-model="wikiSearchTerm"
            dense
            outlined
            placeholder="Ex: API, DNS, Mitocôndria..."
            class="tw-flex-1"
            color="primary"
            @keyup.enter="searchWiki"
          />
          <q-btn color="primary" icon="search" :loading="isSearchingWiki" @click="searchWiki" />
        </div>

        <!-- Resultados / Loading -->
        <div v-if="isSearchingWiki" class="tw-space-y-2 tw-mt-4">
          <q-skeleton type="text" width="100%" />
          <q-skeleton type="text" width="90%" />
          <q-skeleton type="text" width="80%" />
        </div>
        <BaseSurfaceCard v-else-if="wikiResult" variant="flat" class="tw-mt-4 tw-p-4">
          <p class="text-body2 tw-leading-relaxed tw-m-0">
            {{ wikiResult }}
          </p>
        </BaseSurfaceCard>
      </BaseSurfaceCard>
    </q-dialog>
  </BaseSurfaceCard>
</template>
