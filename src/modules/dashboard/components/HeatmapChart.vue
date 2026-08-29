<script setup lang="ts">
import { use, type ComposeOption } from 'echarts/core';
import { HeatmapChart, type HeatmapSeriesOption } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
  GridComponent,
  CalendarComponent,
  type TooltipComponentOption,
  type VisualMapComponentOption,
  type CalendarComponentOption,
} from 'echarts/components';
import type { CallbackDataParams } from 'echarts/types/dist/shared';
import { CanvasRenderer } from 'echarts/renderers';
import VChart from 'vue-echarts';
import { computed } from 'vue';
import type { SessionInsights } from '@/modules/dashboard/services/dashboard.service';
import { useQuasar } from 'quasar';

use([
  HeatmapChart,
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
  GridComponent,
  CalendarComponent,
  CanvasRenderer,
]);

type EChartsOption = ComposeOption<
  HeatmapSeriesOption | TooltipComponentOption | VisualMapComponentOption | CalendarComponentOption
>;

const props = defineProps<{
  insights: SessionInsights[];
}>();

const $q = useQuasar();

const chartOptions = computed<EChartsOption>(() => {
  const isDark = $q.dark.isActive;

  // Mapeia os dados para formato [data_str, valor, sessao_id, topico]
  // Aqui o valor de "calor" será a quantidade de sinais de ritmo, indicando sessões agitadas.
  const data = props.insights
    .filter((i) => i.iniciada_em)
    .map((i) => {
      const date = new Date(i.iniciada_em!);
      const dateStr = date.toISOString().split('T')[0];
      return [
        dateStr,
        i.total_sinais > 0 ? i.total_sinais : 0,
        i.sessao_id,
        i.topico || 'Aula Sem Tópico',
      ];
    });

  // Descobrir min e max ano para o calendário (fallback para ano atual)
  const years = data.map((item) => (item[0] as string).substring(0, 4));
  const minYear = years.length ? Math.min(...years.map(Number)) : new Date().getFullYear();
  const maxVal = data.length ? Math.max(...data.map((item) => item[1] as number)) : 10;

  return {
    tooltip: {
      position: 'top',
      formatter: function (params: CallbackDataParams | CallbackDataParams[]) {
        const p = Array.isArray(params) ? params[0] : params;
        if (!p) return '';
        const val = p.value as [string, number, string, string];
        if (!val) return '';
        return `<b>${val[0]}</b><br/>${val[3]}<br/>Agitação (sinais): ${val[1]}`;
      },
    },
    visualMap: {
      min: 0,
      max: maxVal === 0 ? 10 : maxVal,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      top: 0,
      inRange: {
        color: isDark ? ['#1d1d1d', '#f2c037'] : ['#f5f5f5', '#f2c037'], // Cinza para Amarelo Quasar
      },
      textStyle: {
        color: isDark ? '#fff' : '#000',
      },
    },
    calendar: {
      top: 60,
      left: 30,
      right: 30,
      cellSize: ['auto', 20],
      range: String(minYear),
      itemStyle: {
        borderWidth: 0.5,
        borderColor: isDark ? '#333' : '#ccc',
        color: isDark ? '#1d1d1d' : '#f5f5f5',
      },
      yearLabel: { show: false },
      dayLabel: {
        firstDay: 0,
        nameMap: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
        color: isDark ? '#ccc' : '#333',
      },
      monthLabel: {
        nameMap: [
          'Jan',
          'Fev',
          'Mar',
          'Abr',
          'Mai',
          'Jun',
          'Jul',
          'Ago',
          'Set',
          'Out',
          'Nov',
          'Dez',
        ],
        color: isDark ? '#ccc' : '#333',
      },
    },
    series: [
      {
        type: 'heatmap',
        coordinateSystem: 'calendar',
        data: data,
      },
    ],
  };
});
</script>

<template>
  <div class="tw-h-[250px] tw-w-full">
    <v-chart class="tw-w-full tw-h-full" :option="chartOptions" autoresize />
  </div>
</template>
