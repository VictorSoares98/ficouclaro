<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import { gsap } from '@/boot/gsap';
import { Draggable } from 'gsap/Draggable';
import { useStudyGroupStore } from '../stores/study-group.store';
import StudyGroupCard from './StudyGroupCard.vue';
import EmptyState from '@/components/EmptyState.vue';
import type { StudyGroupPublic } from '../types/study-group.types';

const emit = defineEmits<{
  (e: 'create-group'): void;
}>();

const store = useStudyGroupStore();
const currentSnapState = ref<'peek' | 'half' | 'expanded'>('peek');
let gsapCtx: gsap.Context | null = null;
let snapCycleFn: (() => void) | null = null;

interface EmptyStateConfig {
  icon: string;
  title: string;
  description: string;
  state: 'no_data' | 'no_search_results' | 'no_category_results' | 'no_combined_results';
  categoryLabel?: string;
}

const categoryLabels: Record<string, string> = {
  estudo: 'Estudos',
  reforco: 'Reforço',
  monitoria: 'Monitoria',
  projeto: 'Projetos',
};

const categoryIcons: Record<string, string> = {
  estudo: 'menu_book',
  reforco: 'school',
  monitoria: 'record_voice_over',
  projeto: 'rocket_launch',
};

const emptyStateConfig = computed<EmptyStateConfig>(() => {
  const hasSearch = store.filters.search.trim().length > 0;
  const hasType = store.filters.type !== 'all';
  const searchTerm = store.filters.search.trim();

  // Cenário 1: Banco inicial zerado / sem dados no campus (Zero Data)
  if (store.groups.length === 0 && !hasSearch && !hasType) {
    return {
      state: 'no_data',
      icon: 'groups',
      title: 'Nenhum grupo cadastrado ainda',
      description:
        'Seja o pioneiro no seu campus! Crie o primeiro grupo de estudos ou monitoria e convide seus colegas de turma.',
    };
  }

  // Cenário 2: Busca e Filtro de categoria combinados sem resultados
  if (hasSearch && hasType) {
    const catLabel = categoryLabels[store.filters.type] || 'Categoria';
    return {
      state: 'no_combined_results',
      icon: 'filter_alt_off',
      title: `Nenhum grupo de ${catLabel} para "${searchTerm}"`,
      description:
        'Tente buscar em todas as categorias ou utilizar termos mais amplos para encontrar grupos.',
      categoryLabel: catLabel,
    };
  }

  // Cenário 3: Busca textual sem resultados
  if (hasSearch) {
    return {
      state: 'no_search_results',
      icon: 'search_off',
      title: `Nenhum resultado para "${searchTerm}"`,
      description:
        'Não encontramos grupos com esse nome, matéria ou campus. Verifique a ortografia ou use palavras-chave mais genéricas.',
    };
  }

  // Cenário 4: Filtro de categoria selecionado sem ofertas disponíveis
  const catLabel = categoryLabels[store.filters.type] || 'Categoria';
  const catIcon = categoryIcons[store.filters.type] || 'filter_list_off';
  return {
    state: 'no_category_results',
    icon: catIcon,
    title: `Nenhum grupo de ${catLabel} no momento`,
    description:
      'Ainda não há grupos ou monitorias cadastrados nesta categoria. Que tal explorar outras modalidades ou iniciar um grupo?',
    categoryLabel: catLabel,
  };
});

function handleSelectGroup(group: StudyGroupPublic) {
  store.selectGroup(group);
}

function cycleSheetState() {
  if (snapCycleFn) {
    snapCycleFn();
  }
}

onMounted(() => {
  void nextTick(() => {
    gsapCtx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add('(max-width: 767px)', () => {
        const panel = document.querySelector('.floating-panel') as HTMLElement;
        if (!panel) return;

        // Cálculos dinâmicos e calibrados do Bottom Sheet móvel
        const panelHeight = panel.getBoundingClientRect().height;
        const collapsedY = Math.max(0, panelHeight - 145); // Peek: expõe ~145px (handle, título e barra de busca)
        const halfY = Math.round(panelHeight * 0.52); // Half: ~48% da altura visível
        const expandedY = 0; // Expanded: sobe respeitando o teto de 76px abaixo do header

        const snapPoints = [expandedY, halfY, collapsedY];

        const updateStateFromY = (yVal: number) => {
          if (Math.abs(yVal - expandedY) < 30) {
            currentSnapState.value = 'expanded';
          } else if (Math.abs(yVal - halfY) < 40) {
            currentSnapState.value = 'half';
          } else {
            currentSnapState.value = 'peek';
          }
        };

        // Define o estado inicial recolhido no mobile
        gsap.set(panel, { y: collapsedY });
        currentSnapState.value = 'peek';

        const dragInstance = Draggable.create(panel, {
          type: 'y',
          trigger: '#drag-zone',
          bounds: { minY: expandedY, maxY: collapsedY },
          edgeResistance: 1, // Trava absoluta sem vazamento de tela
          dragClickables: true, // Permite clicar e focar em inputs sem bloquear
          onRelease: function () {
            const closest = snapPoints.reduce((prev, curr) =>
              Math.abs(curr - this.y) < Math.abs(prev - this.y) ? curr : prev,
            );

            let targetY = closest;
            const dir = this.getDirection('y');

            // Força a intenção de movimento do usuário via swipe
            if (dir === 'up') {
              if (this.y < halfY) targetY = expandedY;
              else targetY = halfY;
            } else if (dir === 'down') {
              if (this.y > halfY) targetY = collapsedY;
              else targetY = halfY;
            }

            updateStateFromY(targetY);

            gsap.to(this.target, {
              y: targetY,
              duration: 0.3,
              ease: 'power2.out',
            });
          },
        })[0];

        // Função de alternância de estado para o botão do handle e atalhos de teclado
        snapCycleFn = () => {
          let nextY: number;
          if (currentSnapState.value === 'peek') {
            nextY = halfY;
          } else if (currentSnapState.value === 'half') {
            nextY = expandedY;
          } else {
            nextY = collapsedY;
          }
          updateStateFromY(nextY);
          gsap.to(panel, {
            y: nextY,
            duration: 0.35,
            ease: 'power2.out',
            onUpdate: () => dragInstance?.update(),
          });
        };

        // Auto-expandir a gaveta se o usuário selecionar um grupo no mapa
        const stopWatcher = watch(
          () => store.selectedGroup,
          (newGroup) => {
            if (newGroup) {
              const currentY = gsap.getProperty(panel, 'y') as number;
              if (currentY > expandedY) {
                currentSnapState.value = 'expanded';
                gsap.to(panel, {
                  y: expandedY,
                  duration: 0.4,
                  ease: 'power2.out',
                  onUpdate: () => dragInstance?.update(),
                });
              }
            }
          },
        );

        return () => {
          stopWatcher();
          snapCycleFn = null;
          dragInstance?.kill();
          gsap.set(panel, { clearProps: 'y' });
        };
      });

      // Garante que em telas desktop/tablet o painel sempre resete translações verticais do Bottom Sheet móvel
      mm.add('(min-width: 768px)', () => {
        const panel = document.querySelector('.floating-panel') as HTMLElement;
        if (panel) {
          gsap.set(panel, { clearProps: 'y' });
        }
      });
    });
  });
});

onBeforeUnmount(() => {
  snapCycleFn = null;
  if (gsapCtx) {
    gsapCtx.revert();
  }
});
</script>

<template>
  <q-card
    @touchstart.stop
    @touchmove.stop
    @mousedown.stop
    @wheel.stop
    class="tw-backdrop-blur-xl tw-shadow-2xl tw-flex tw-flex-col tw-overflow-hidden tw-rounded-t-3xl tw-rounded-b-none md:tw-rounded-3xl tw-w-full tw-h-full"
  >
    <!-- Área combinada de Arraste (Handle + Título + Pesquisa) -->
    <div id="drag-zone" class="tw-w-full">
      <!-- Handle Acessível para Mobile (Gaveta Bottom Sheet - WCAG 2.1 AA) -->
      <div class="tw-w-full tw-flex tw-justify-center tw-pt-2 tw-pb-1 md:tw-hidden">
        <button
          type="button"
          class="tw-w-full tw-h-11 tw-flex tw-items-center tw-justify-center tw-bg-transparent tw-border-none tw-cursor-grab active:tw-cursor-grabbing tw-touch-none focus:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-primary tw-rounded-t-3xl"
          :aria-expanded="currentSnapState === 'expanded'"
          aria-label="Alternar altura do painel de grupos de estudo"
          @click="cycleSheetState"
          @keydown.enter.prevent="cycleSheetState"
          @keydown.space.prevent="cycleSheetState"
        >
          <span
            class="tw-w-12 tw-h-1.5 tw-rounded-full tw-transition-colors"
            style="background-color: currentColor; opacity: 0.3"
          ></span>
        </button>
      </div>

      <!-- Cabeçalho do Painel com Título e Filtros -->
      <q-card-section class="tw-p-4 sm:tw-p-6 tw-pt-1 sm:tw-pt-3 md:tw-pt-6 cursor-grab">
        <div class="tw-flex tw-items-center tw-gap-2.5 tw-mb-1">
          <div
            class="tw-w-8 tw-h-8 tw-rounded-xl tw-bg-primary/10 tw-text-primary tw-flex tw-items-center tw-justify-center"
          >
            <q-icon name="explore" size="20px" />
          </div>
          <h2 class="text-h6 text-weight-bold tw-font-space-grotesk tw-m-0 tw-leading-tight">
            Grupos de Estudo
          </h2>
        </div>

        <p class="text-caption tw-opacity-70 tw-mb-3.5 tw-font-medium">
          Encontre monitorias e grupos de reforço na sua faculdade
        </p>

        <!-- data-drag-ignore impede o GSAP de interceptar cliques nesses componentes -->
        <div data-drag-ignore="true">
          <!-- Campo de Busca Estilizado -->
          <q-input
            v-model="store.filters.search"
            placeholder="Buscar faculdade, matéria ou campus..."
            dense
            outlined
            rounded
            clearable
            hide-bottom-space
            class="tw-mb-3"
            style="height: 44px"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>

          <!-- Filtros Rápidos por Categoria (Chips horizontais com rolagem invisível) -->
          <div class="tw-flex tw-gap-2 tw-overflow-x-auto no-scrollbar tw-pb-1">
            <q-chip
              clickable
              :color="store.filters.type === 'all' ? 'primary' : ''"
              :text-color="store.filters.type === 'all' ? 'white' : 'primary'"
              :outline="store.filters.type !== 'all'"
              class="tw-m-0 tw-shrink-0 text-weight-bold tw-px-3"
              @click="store.setTypeFilter('all')"
            >
              Todos
            </q-chip>

            <q-chip
              clickable
              :color="store.filters.type === 'estudo' ? 'primary' : ''"
              :text-color="store.filters.type === 'estudo' ? 'white' : 'primary'"
              :outline="store.filters.type !== 'estudo'"
              class="tw-m-0 tw-shrink-0 tw-px-3"
              @click="store.setTypeFilter('estudo')"
            >
              Estudos
            </q-chip>

            <q-chip
              clickable
              :color="store.filters.type === 'reforco' ? 'primary' : ''"
              :text-color="store.filters.type === 'reforco' ? 'white' : 'primary'"
              :outline="store.filters.type !== 'reforco'"
              class="tw-m-0 tw-shrink-0 tw-px-3"
              @click="store.setTypeFilter('reforco')"
            >
              Reforço
            </q-chip>

            <q-chip
              clickable
              :color="store.filters.type === 'monitoria' ? 'primary' : ''"
              :text-color="store.filters.type === 'monitoria' ? 'white' : 'primary'"
              :outline="store.filters.type !== 'monitoria'"
              class="tw-m-0 tw-shrink-0 tw-px-3"
              @click="store.setTypeFilter('monitoria')"
            >
              Monitoria
            </q-chip>

            <q-chip
              clickable
              :color="store.filters.type === 'projeto' ? 'primary' : ''"
              :text-color="store.filters.type === 'projeto' ? 'white' : 'primary'"
              :outline="store.filters.type !== 'projeto'"
              class="tw-m-0 tw-shrink-0 tw-px-3"
              @click="store.setTypeFilter('projeto')"
            >
              Projetos
            </q-chip>
          </div>
        </div>
      </q-card-section>
    </div>

    <q-separator />

    <!-- Lista de Grupos com Rolagem Suave -->
    <div
      class="tw-flex-1 tw-flex tw-flex-col tw-overflow-hidden tw-relative"
      style="padding: 1rem; padding-bottom: calc(2rem + env(safe-area-inset-bottom, 0px))"
    >
      <q-scroll-area class="tw-flex-1 no-scrollbar tw-overscroll-contain">
        <!-- Skeleton Loading Nativo do Quasar -->
        <div v-if="store.isLoading" class="tw-space-y-3">
          <q-skeleton v-for="i in 3" :key="i" type="rect" height="110px" class="tw-rounded-2xl" />
        </div>

        <!-- Lista Vazia Contextual (Padrão de Mercado) -->
        <EmptyState
          v-else-if="store.filteredGroups.length === 0"
          :icon="emptyStateConfig.icon"
          :title="emptyStateConfig.title"
          :description="emptyStateConfig.description"
        >
          <template #action>
            <!-- Ações para Cenário 'no_data' (Banco zerado) -->
            <q-btn
              v-if="emptyStateConfig.state === 'no_data'"
              unelevated
              color="primary"
              icon="add"
              label="Criar Primeiro Grupo"
              no-caps
              class="tw-rounded-xl text-weight-bold tw-text-xs tw-shadow-md"
              @click="emit('create-group')"
            />

            <!-- Ações para Cenário 'no_search_results' (Busca sem resultados) -->
            <q-btn
              v-else-if="emptyStateConfig.state === 'no_search_results'"
              unelevated
              color="primary"
              icon="close"
              label="Limpar Busca"
              no-caps
              class="tw-rounded-xl text-weight-bold tw-text-xs"
              @click="store.setSearch('')"
            />

            <!-- Ações para Cenário 'no_category_results' (Filtro por categoria sem ofertas) -->
            <div
              v-else-if="emptyStateConfig.state === 'no_category_results'"
              class="tw-flex tw-flex-wrap tw-items-center tw-justify-center tw-gap-2"
            >
              <q-btn
                unelevated
                color="primary"
                label="Ver Todas as Categorias"
                no-caps
                class="tw-rounded-xl text-weight-bold tw-text-xs"
                @click="store.setTypeFilter('all')"
              />
              <q-btn
                flat
                color="primary"
                icon="add"
                :label="`Criar de ${emptyStateConfig.categoryLabel || 'Grupo'}`"
                no-caps
                class="tw-rounded-xl text-weight-bold tw-text-xs"
                @click="emit('create-group')"
              />
            </div>

            <!-- Ações para Cenário 'no_combined_results' (Busca + Filtro combinados) -->
            <q-btn
              v-else-if="emptyStateConfig.state === 'no_combined_results'"
              unelevated
              color="primary"
              icon="refresh"
              label="Limpar Filtros e Busca"
              no-caps
              class="tw-rounded-xl text-weight-bold tw-text-xs"
              @click="store.clearFilters()"
            />
          </template>
        </EmptyState>

        <!-- Itens Encontrados -->
        <div v-else class="tw-space-y-3">
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
  </q-card>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.cursor-grab {
  cursor: grab;
}
.cursor-grab:active {
  cursor: grabbing;
}
</style>
