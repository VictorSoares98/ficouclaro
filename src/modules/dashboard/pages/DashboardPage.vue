<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useDashboardStore } from '@/modules/dashboard/stores/dashboard.store';
import InsightCard from '@/modules/dashboard/components/InsightCard.vue';
import HeatmapChart from '@/modules/dashboard/components/HeatmapChart.vue';
import CourseEvolutionChart from '@/modules/dashboard/components/CourseEvolutionChart.vue';
import BaseSkeletonList from '@/core/components/BaseSkeletonList.vue';
import { useCourseStore } from '@/modules/courses/stores/course.store';

const route = useRoute();
const dashboardStore = useDashboardStore();
const courseStore = useCourseStore();

const cursoId = String((route.params as Record<string, unknown>).cursoId);

const courseTitle = computed(() => {
  const course = courseStore.courses.find((c) => c.id === cursoId);
  return course ? course.nome : 'Carregando curso...';
});

onMounted(async () => {
  if (courseStore.courses.length === 0) {
    await courseStore.fetchMyCourses();
  }
  await dashboardStore.loadCourseInsights(cursoId);
});

// Apenas para não deixar o cache visual poluído caso volte depois
onUnmounted(() => {
  // O store faz cache. Não limparemos no unmount para navegação rápida,
  // mas forceReload limpa se forçado.
});
</script>

<template>
  <q-page class="tw-p-4 sm:tw-p-8 tw-max-w-6xl tw-mx-auto">
    <!-- Header -->
    <div class="tw-flex tw-justify-between tw-items-center tw-mb-8">
      <div>
        <h1 class="tw-text-2xl sm:tw-text-3xl tw-font-bold tw-text-primary">Insights Analíticos</h1>
        <p class="tw-opacity-70 tw-mt-1 tw-text-sm sm:tw-text-base">
          {{ courseTitle }}
        </p>
      </div>
      <q-btn outline color="primary" icon="arrow_back" label="Voltar" to="/professor" />
    </div>

    <!-- Loading State -->
    <div v-if="dashboardStore.isLoading" class="tw-mt-8">
      <BaseSkeletonList :count="3" type="card" />
    </div>

    <!-- Error State -->
    <div v-else-if="dashboardStore.error" class="tw-text-center tw-py-20">
      <q-icon name="error_outline" size="4rem" color="negative" />
      <p class="tw-text-negative tw-mt-4">{{ dashboardStore.error }}</p>
      <q-btn
        class="tw-mt-4"
        color="primary"
        label="Tentar Novamente"
        @click="dashboardStore.forceReload"
      />
    </div>

    <!-- Empty State -->
    <div v-else-if="dashboardStore.insights.length === 0" class="tw-text-center tw-py-20">
      <q-icon name="insights" size="4rem" color="grey" class="tw-opacity-50" />
      <p class="tw-opacity-70 tw-mt-4">Nenhuma sessão registrada para analisar métricas ainda.</p>
    </div>

    <!-- Dashboard Content -->
    <div v-else class="tw-space-y-8">
      <!-- Cards de Métricas Rápidas -->
      <div class="tw-grid tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-3 sm:tw-gap-4">
        <InsightCard
          title="Média Global"
          :value="dashboardStore.globalAverageRating + ' ★'"
          icon="star"
          color="warning"
        />
        <InsightCard
          title="Total de Dúvidas"
          :value="dashboardStore.totalQuestions"
          icon="question_answer"
          color="primary"
        />
        <InsightCard
          title="Sinais de Ritmo"
          :value="dashboardStore.totalPaceSignals"
          icon="speed"
          color="info"
        />
        <InsightCard
          title="Ponto Crítico"
          :value="
            dashboardStore.lowestRatedSession?.media_estrelas
              ? dashboardStore.lowestRatedSession.media_estrelas + ' ★'
              : 'N/A'
          "
          :subtitle="dashboardStore.lowestRatedSession?.topico || 'N/A'"
          icon="warning"
          color="negative"
        />
      </div>

      <!-- Gráficos -->
      <div class="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-8">
        <!-- Evolução (Linha) -->
        <q-card
          class="tw-bg-white/10 tw-backdrop-blur-md tw-border tw-border-white/20 tw-shadow-sm tw-rounded-xl"
        >
          <q-card-section>
            <h2 class="tw-text-lg tw-font-bold tw-mb-4">Evolução de Retenção</h2>
            <CourseEvolutionChart :insights="dashboardStore.insights" />
          </q-card-section>
        </q-card>

        <!-- Heatmap (Calendário) -->
        <q-card
          class="tw-bg-white/10 tw-backdrop-blur-md tw-border tw-border-white/20 tw-shadow-sm tw-rounded-xl"
        >
          <q-card-section>
            <h2 class="tw-text-lg tw-font-bold tw-mb-4">Heatmap de Agitação</h2>
            <p class="tw-text-xs tw-opacity-60 tw-mb-2">
              Baseado no volume de Sinais de Ritmo por dia.
            </p>
            <HeatmapChart :insights="dashboardStore.insights" />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>
