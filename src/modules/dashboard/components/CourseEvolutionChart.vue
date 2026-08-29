<script setup lang="ts">
import { use, type ComposeOption } from 'echarts/core';
import { LineChart, type LineSeriesOption } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  type TooltipComponentOption,
  type GridComponentOption,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import VChart from 'vue-echarts';
import { computed } from 'vue';
import type { SessionInsights } from '@/modules/dashboard/services/dashboard.service';
import { useQuasar } from 'quasar';

use([LineChart, TitleComponent, TooltipComponent, GridComponent, CanvasRenderer]);

type EChartsOption = ComposeOption<LineSeriesOption | TooltipComponentOption | GridComponentOption>;

const props = defineProps<{
  insights: SessionInsights[];
}>();

const $q = useQuasar();

const chartOptions = computed<EChartsOption>(() => {
  const isDark = $q.dark.isActive;
  const textColor = isDark ? '#ccc' : '#333';

  // Apenas sessões que tem avaliações
  const validData = props.insights.filter((i) => i.total_avaliacoes > 0);

  const xAxisData = validData.map((i) => {
    if (!i.iniciada_em) return 'Desconhecido';
    const d = new Date(i.iniciada_em);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
  });

  const seriesData = validData.map((i) => i.media_estrelas);

  return {
    tooltip: {
      trigger: 'axis',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xAxisData,
      axisLabel: { color: textColor },
    },
    yAxis: {
      type: 'value',
      min: 1,
      max: 5,
      axisLabel: { color: textColor },
      splitLine: {
        lineStyle: {
          color: isDark ? '#333' : '#eee',
        },
      },
    },
    series: [
      {
        name: 'Média de Avaliação',
        type: 'line',
        data: seriesData,
        smooth: true,
        lineStyle: {
          color: '#1976D2', // Quasar primary
          width: 3,
        },
        itemStyle: {
          color: '#1976D2',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,

            colorStops: [
              { offset: 0, color: 'rgba(25, 118, 210, 0.5)' },
              { offset: 1, color: 'rgba(25, 118, 210, 0)' },
            ],
            global: false,
          },
        },
      },
    ],
  };
});
</script>

<template>
  <div class="tw-h-[300px] tw-w-full">
    <v-chart class="tw-w-full tw-h-full" :option="chartOptions" autoresize />
  </div>
</template>
