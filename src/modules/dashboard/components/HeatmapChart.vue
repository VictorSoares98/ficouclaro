<script setup lang="ts">
import { computed } from 'vue';
import { useQuasar } from 'quasar';
import type { SessionInsights } from '@/modules/dashboard/services/dashboard.service';

const props = defineProps<{
  insights: SessionInsights[];
}>();

const $q = useQuasar();

const WEEKS_TO_SHOW = 26; // Mostra os últimos ~6 meses

const calendarData = computed(() => {
  const isDark = $q.dark.isActive;

  // Agrega dados por data
  const aggregatedData = props.insights
    .filter((i) => i.iniciada_em)
    .reduce(
      (acc, curr) => {
        const date = new Date(curr.iniciada_em);
        const dateStr = date.toISOString().split('T')[0] as string;
        const topic = curr.topico || 'Aula Sem Tópico';

        if (!acc[dateStr]) {
          acc[dateStr] = {
            totalSinais: 0,
            topicos: new Set<string>(),
          };
        }
        acc[dateStr].totalSinais += curr.total_sinais > 0 ? curr.total_sinais : 0;
        acc[dateStr].topicos.add(topic);
        return acc;
      },
      {} as Record<string, { totalSinais: number; topicos: Set<string> }>,
    );

  // Calcula o máximo para a escala de cores (evitando divisão por zero)
  const maxSinais = Math.max(...Object.values(aggregatedData).map((d) => d.totalSinais), 1);

  // Mapeador de intensidade térmica dinâmico usando var(--q-primary) e color-mix para suportar todos os Temas Ortogonais
  function getCellColor(sinais: number, hasSession: boolean) {
    if (!hasSession) return isDark ? '#2b2b2b' : '#ebedf0'; // Fundo do Card/Vazio

    const bg = isDark ? 'var(--q-dark)' : '#ffffff';

    if (sinais === 0) return `color-mix(in srgb, var(--q-primary) 15%, ${bg})`; // Sessão fria

    const ratio = sinais / maxSinais;
    if (ratio <= 0.25) return `color-mix(in srgb, var(--q-primary) 35%, ${bg})`;
    if (ratio <= 0.5) return `color-mix(in srgb, var(--q-primary) 60%, ${bg})`;
    if (ratio <= 0.75) return `color-mix(in srgb, var(--q-primary) 85%, ${bg})`;
    return `var(--q-primary)`; // Agitação Máxima
  }

  // Define limite temporal (hoje) e inibidores de hora
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Define data inicial (retrocede N semanas, e trava no Domingo)
  const start = new Date(today);
  start.setDate(today.getDate() - (WEEKS_TO_SHOW - 1) * 7);
  start.setDate(start.getDate() - start.getDay());

  const days = [];
  let weekIndex = -1;

  const current = new Date(start);
  while (current <= today) {
    if (current.getDay() === 0) weekIndex++; // Computa nova semana (Coluna) no Grid

    const dStr = current.toISOString().split('T')[0] as string;
    const session = aggregatedData[dStr];

    days.push({
      dateStr: dStr,
      dateFormatted: current.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      hasSession: !!session,
      totalSinais: session ? session.totalSinais : 0,
      topicos: session ? Array.from(session.topicos).join(' • ') : '',
      color: getCellColor(session ? session.totalSinais : 0, !!session),
    });

    current.setDate(current.getDate() + 1);
  }

  // Cálculo de Rótulos de Meses baseados na largura das colunas
  const weeksCount = weekIndex + 1;
  const monthLabelsFixed = [];
  let currentMonthStr = '';
  let currentMonthStartCol = 0;

  for (let w = 0; w < weeksCount; w++) {
    const wDate = new Date(start);
    wDate.setDate(wDate.getDate() + w * 7);
    const m = wDate.toLocaleDateString('pt-BR', { month: 'short' });
    const capM = m.charAt(0).toUpperCase() + m.slice(1).replace('.', ''); // Fix formatação (Ex: 'out.' -> 'Out')

    if (capM !== currentMonthStr) {
      if (currentMonthStr !== '') {
        monthLabelsFixed.push({
          label: currentMonthStr,
          cols: w - currentMonthStartCol,
        });
      }
      currentMonthStr = capM;
      currentMonthStartCol = w;
    }
  }
  // Insere o mês restante (mês atual em andamento)
  monthLabelsFixed.push({
    label: currentMonthStr,
    cols: weeksCount - currentMonthStartCol,
  });

  return {
    days,
    monthLabels: monthLabelsFixed.map((m) => ({
      label: m.label,
      width: m.cols * 18, // 14px da célula + 4px de gap = 18px por coluna!
    })),
  };
});
</script>

<template>
  <div class="tw-w-full tw-flex tw-flex-col tw-overflow-x-auto tw-pb-2">
    <!-- Eixo Y (Dias) e Grid -->
    <div class="tw-flex tw-gap-2 tw-min-w-max">
      <!-- Dia da Semana (Eixo Y) -->
      <div
        class="tw-flex tw-flex-col tw-gap-1 tw-text-[10px] tw-text-gray-500 tw-justify-between tw-pt-6 tw-pb-1 tw-font-medium"
      >
        <span>D</span>
        <span class="tw-opacity-0">S</span>
        <span>T</span>
        <span class="tw-opacity-0">Q</span>
        <span>Q</span>
        <span class="tw-opacity-0">S</span>
        <span>S</span>
      </div>

      <!-- Container do Calendário -->
      <div class="tw-flex tw-flex-col tw-gap-1">
        <!-- Mêses (Eixo X) -->
        <div class="tw-flex tw-text-xs tw-text-gray-500 tw-font-medium tw-overflow-hidden">
          <div
            v-for="(m, idx) in calendarData.monthLabels"
            :key="idx"
            :style="{ width: m.width + 'px' }"
            class="tw-whitespace-nowrap tw-overflow-hidden"
          >
            <span v-if="m.width > 20">{{ m.label }}</span>
          </div>
        </div>

        <!-- Grade Nativa de Dias (Efeito GitHub) -->
        <div class="tw-grid tw-grid-rows-7 tw-grid-flow-col tw-gap-1">
          <div
            v-for="day in calendarData.days"
            :key="day.dateStr"
            class="tw-w-[14px] tw-h-[14px] tw-rounded-sm tw-cursor-pointer tw-transition-all hover:tw-ring-2 hover:tw-ring-offset-1 hover:tw-scale-110"
            :class="
              $q.dark.isActive
                ? 'hover:tw-ring-offset-[#1d1d1d] hover:tw-ring-primary'
                : 'hover:tw-ring-offset-white hover:tw-ring-primary'
            "
            :style="{ backgroundColor: day.color }"
          >
            <!-- Tooltip Nativo Quasar (Consistência AAA) -->
            <q-tooltip
              class="bg-dark text-white text-caption shadow-4 tw-px-3 tw-py-2"
              anchor="top middle"
              self="bottom middle"
              :offset="[0, 8]"
            >
              <div class="tw-font-bold tw-text-gray-400">{{ day.dateFormatted }}</div>
              <div v-if="day.hasSession" class="tw-mt-1">
                <div class="tw-text-primary tw-font-bold">{{ day.topicos }}</div>
                <div class="tw-mt-1">
                  Agitação:
                  <span class="tw-text-primary tw-font-bold">{{ day.totalSinais }} sinais</span>
                </div>
              </div>
              <div v-else class="tw-mt-1 tw-text-gray-500">Nenhuma sessão registrada</div>
            </q-tooltip>
          </div>
        </div>
      </div>
    </div>

    <!-- Legenda Inferior -->
    <div
      class="tw-flex tw-justify-end tw-items-center tw-gap-2 tw-mt-4 tw-text-[10px] tw-text-gray-500 tw-font-medium tw-min-w-max"
    >
      <span>Calmo</span>
      <div class="tw-flex tw-gap-1">
        <div
          class="tw-w-[12px] tw-h-[12px] tw-rounded-sm"
          :style="{ backgroundColor: $q.dark.isActive ? '#2b2b2b' : '#ebedf0' }"
        ></div>
        <div
          class="tw-w-[12px] tw-h-[12px] tw-rounded-sm"
          :style="{
            backgroundColor: `color-mix(in srgb, var(--q-primary) 35%, ${$q.dark.isActive ? 'var(--q-dark)' : '#ffffff'})`,
          }"
        ></div>
        <div
          class="tw-w-[12px] tw-h-[12px] tw-rounded-sm"
          :style="{
            backgroundColor: `color-mix(in srgb, var(--q-primary) 60%, ${$q.dark.isActive ? 'var(--q-dark)' : '#ffffff'})`,
          }"
        ></div>
        <div
          class="tw-w-[12px] tw-h-[12px] tw-rounded-sm"
          :style="{
            backgroundColor: `color-mix(in srgb, var(--q-primary) 85%, ${$q.dark.isActive ? 'var(--q-dark)' : '#ffffff'})`,
          }"
        ></div>
        <div
          class="tw-w-[12px] tw-h-[12px] tw-rounded-sm"
          :style="{ backgroundColor: 'var(--q-primary)' }"
        ></div>
      </div>
      <span>Agitado</span>
    </div>
  </div>
</template>
