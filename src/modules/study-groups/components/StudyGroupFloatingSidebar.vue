<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import { gsap } from '@/boot/gsap';
import { Draggable } from 'gsap/Draggable';
import { useStudyGroupStore } from '../stores/study-group.store';
import StudyGroupCard from './StudyGroupCard.vue';
import type { StudyGroupPublic } from '../types/study-group.types';

const store = useStudyGroupStore();
const currentSnapState = ref<'peek' | 'half' | 'expanded'>('peek');
let gsapCtx: gsap.Context | null = null;
let snapCycleFn: (() => void) | null = null;

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
        };
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
          <q-skeleton
            v-for="i in 3"
            :key="i"
            type="rect"
            height="110px"
            class="tw-rounded-2xl"
          />
        </div>

        <!-- Lista Vazia -->
        <div
          v-else-if="store.filteredGroups.length === 0"
          class="tw-h-full tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-12 tw-text-center tw-px-4"
        >
          <q-icon name="location_off" size="3rem" class="text-hint tw-mb-2" />
          <h4 class="tw-font-bold tw-text-sm tw-mb-1">Nenhum grupo encontrado</h4>
          <p class="tw-text-xs text-muted">
            Tente buscar por outro termo ou remova os filtros de busca.
          </p>
          <q-btn
            v-if="store.filters.type !== 'all' || store.filters.search"
            unelevated
            color="primary"
            class="tw-mt-3 tw-rounded-xl text-weight-bold tw-text-xs"
            label="Limpar Filtros"
            @click="store.clearFilters()"
          />
        </div>

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
