<script setup lang="ts">
import { ref } from 'vue';
import { useStudyGroupStore } from '../stores/study-group.store';
import StudyGroupCard from './StudyGroupCard.vue';
import type { StudyGroupPublic } from '../types/study-group.types';

const store = useStudyGroupStore();
const isCollapsed = ref(false);

const emit = defineEmits<{
  (e: 'toggle', collapsed: boolean): void;
}>();

function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value;
  emit('toggle', isCollapsed.value);
}

function handleSelectGroup(group: StudyGroupPublic) {
  store.selectGroup(group);
}
</script>

<template>
  <aside
    class="tw-absolute tw-top-4 tw-bottom-4 tw-left-4 tw-z-10 tw-w-full tw-max-w-xs sm:tw-max-w-sm tw-transition-transform tw-duration-300 tw-ease-in-out"
    :class="{ 'tw--translate-x-[calc(100%+1.5rem)]': isCollapsed }"
  >
    <!-- Botão Flutuante de Toggle (Abrir/Fechar Sidebar) -->
    <q-btn
      round
      dense
      unelevated
      color="primary"
      :icon="isCollapsed ? 'chevron_right' : 'chevron_left'"
      class="tw-absolute tw-top-4 tw--right-10 tw-shadow-lg tw-z-20"
      :aria-label="isCollapsed ? 'Abrir painel lateral' : 'Recolher painel lateral'"
      @click="toggleSidebar"
    />

    <!-- Painel de Vidro / Superfície do Quasar -->
    <div
      class="tw-h-full tw-w-full tw-flex tw-flex-col tw-rounded-3xl tw-shadow-2xl tw-border tw-border-gray-200/80 dark:tw-border-gray-800/80 tw-bg-white/95 dark:tw-bg-dark-page/95 tw-backdrop-blur-md tw-overflow-hidden"
    >
      <!-- Cabeçalho do Painel -->
      <div class="tw-p-4 sm:tw-p-5 tw-border-b tw-border-gray-100 dark:tw-border-gray-800">
        <div class="tw-flex tw-items-center tw-gap-2.5 tw-mb-1.5">
          <div class="tw-w-8 tw-h-8 tw-rounded-xl tw-bg-primary/10 tw-text-primary tw-flex tw-items-center tw-justify-center">
            <q-icon name="explore" size="20px" />
          </div>
          <div>
            <h2 class="tw-text-base sm:tw-text-lg tw-font-bold tw-leading-tight tw-tracking-tight">
              Grupos de Estudo
            </h2>
          </div>
        </div>

        <p class="tw-text-xs text-muted tw-mb-3">
          Encontre monitorias e grupos de reforço na sua faculdade
        </p>

        <!-- Campo de Busca -->
        <q-input
          v-model="store.filters.search"
          placeholder="Buscar faculdade, matéria ou campus..."
          dense
          outlined
          clearable
          hide-bottom-space
          class="tw-rounded-xl tw-text-xs"
        >
          <template v-slot:prepend>
            <q-icon name="search" size="18px" class="text-muted" />
          </template>
        </q-input>

        <!-- Filtros Rápidos por Categoria -->
        <div class="tw-flex tw-items-center tw-gap-1.5 tw-mt-2.5 tw-flex-wrap">
          <q-btn
            size="sm"
            dense
            rounded
            no-caps
            :unelevated="store.filters.type === 'all'"
            :flat="store.filters.type !== 'all'"
            :color="store.filters.type === 'all' ? 'primary' : 'grey-7'"
            class="tw-px-2.5 tw-text-xs"
            label="Todos"
            @click="store.setTypeFilter('all')"
          />

          <q-btn
            size="sm"
            dense
            rounded
            no-caps
            :unelevated="store.filters.type === 'estudo'"
            :flat="store.filters.type !== 'estudo'"
            :color="store.filters.type === 'estudo' ? 'primary' : 'grey-7'"
            class="tw-px-2.5 tw-text-xs"
            label="Estudos"
            @click="store.setTypeFilter('estudo')"
          />

          <q-btn
            size="sm"
            dense
            rounded
            no-caps
            :unelevated="store.filters.type === 'monitoria'"
            :flat="store.filters.type !== 'monitoria'"
            :color="store.filters.type === 'monitoria' ? 'primary' : 'grey-7'"
            class="tw-px-2.5 tw-text-xs"
            label="Monitoria"
            @click="store.setTypeFilter('monitoria')"
          />

          <q-btn
            size="sm"
            dense
            rounded
            no-caps
            :unelevated="store.filters.type === 'projeto'"
            :flat="store.filters.type !== 'projeto'"
            :color="store.filters.type === 'projeto' ? 'primary' : 'grey-7'"
            class="tw-px-2.5 tw-text-xs"
            label="Projetos"
            @click="store.setTypeFilter('projeto')"
          />
        </div>
      </div>

      <!-- Lista de Grupos com Scroll Suave -->
      <q-scroll-area class="tw-flex-1 tw-px-3 tw-py-3">
        <!-- Skeleton Loading -->
        <div v-if="store.isLoading" class="tw-space-y-3">
          <div
            v-for="i in 3"
            :key="i"
            class="tw-p-4 tw-rounded-2xl tw-border tw-border-gray-200 dark:tw-border-gray-800 tw-animate-pulse"
          >
            <div class="tw-h-4 tw-bg-gray-200 dark:tw-bg-gray-700 tw-rounded tw-w-3/4 tw-mb-2"></div>
            <div class="tw-h-3 tw-bg-gray-200 dark:tw-bg-gray-700 tw-rounded tw-w-1/2 tw-mb-3"></div>
            <div class="tw-h-3 tw-bg-gray-200 dark:tw-bg-gray-700 tw-rounded tw-w-1/3"></div>
          </div>
        </div>

        <!-- Lista Vazia -->
        <div
          v-else-if="store.filteredGroups.length === 0"
          class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-12 tw-text-center tw-px-4"
        >
          <q-icon name="location_off" size="3rem" class="text-hint tw-mb-2" />
          <h4 class="tw-font-bold tw-text-sm tw-mb-1">Nenhum grupo encontrado</h4>
          <p class="tw-text-xs text-muted">
            Tente buscar por outro termo ou remova os filtros de busca.
          </p>
        </div>

        <!-- Itens Encontrados -->
        <div v-else class="tw-space-y-2.5">
          <StudyGroupCard
            v-for="group in store.filteredGroups"
            :key="group.id"
            :group="group"
            :is-selected="store.selectedGroup?.id === group.id"
            @select="handleSelectGroup"
          />
        </div>
      </q-scroll-area>
    </div>
  </aside>
</template>
