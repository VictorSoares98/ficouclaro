<script setup lang="ts">
interface BentoFeature {
  id: string;
  badge: string;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  colSpanClass: string;
  tag: string;
}

const features: BentoFeature[] = [
  {
    id: 'thermometer',
    badge: 'Tempo Real',
    title: 'Termômetro da Aula ao Vivo',
    description:
      'Os alunos sinalizam o ritmo da explicação sem interromper ou se expor. O professor calibra a velocidade didática instantaneamente.',
    icon: 'speed',
    iconColor: 'primary',
    colSpanClass: 'md:tw-col-span-2',
    tag: 'Fim do silêncio constrangedor',
  },
  {
    id: 'qa',
    badge: 'Anonimato Seguro',
    title: 'Q&A Anônimo com Upvoting',
    description:
      'Acabe com a timidez na sala. Os estudantes enviam dúvidas anônimas e a turma vota nas mais pertinentes, priorizando as lacunas reais.',
    icon: 'question_answer',
    iconColor: 'secondary',
    colSpanClass: 'md:tw-col-span-1',
    tag: 'Mais perguntas, zero vergonha',
  },
  {
    id: 'map',
    badge: 'Geolocalização Universitária',
    title: 'Mapa de Monitorias & Grupos de Estudo',
    description:
      'Conecte-se fisicamente no campus. Descubra onde estão ocorrendo monitorias, grupos de reforço e estudos em tempo real com Leaflet integrado.',
    icon: 'explore',
    iconColor: 'info',
    colSpanClass: 'md:tw-col-span-1',
    tag: 'Encontros reais na faculdade',
  },
  {
    id: 'poll',
    badge: 'Checagem Instantânea',
    title: 'Enquetes & Quizzes Relâmpago',
    description:
      'Lance perguntas de múltipla escolha em 5 segundos. Veja as respostas serem computadas ao vivo em gráficos dinâmicos sem burocracia.',
    icon: 'poll',
    iconColor: 'warning',
    colSpanClass: 'md:tw-col-span-2',
    tag: 'Avaliação formativa sem estresse',
  },
  {
    id: 'flash-review',
    badge: 'Fixação Rápida',
    title: 'Flash Review Pós-Tópico',
    description:
      '3 minutos antes do sinal tocar: micro-desafios e flashes rápidos para fixar os conceitos na memória de longo prazo antes de sair da sala.',
    icon: 'bolt',
    iconColor: 'accent',
    colSpanClass: 'md:tw-col-span-1',
    tag: 'Retenção comprovada',
  },
  {
    id: 'dashboard',
    badge: 'Analytics Pedagógico $0 AI',
    title: 'Heatmaps & Insights Formativos',
    description:
      'Dashboards com mapas de calor que mostram exatamente qual matéria a turma teve mais dificuldade, gerando dados formativos para a próxima aula.',
    icon: 'insights',
    iconColor: 'positive',
    colSpanClass: 'md:tw-col-span-2',
    tag: 'Decisões guiadas por dados',
  },
];
</script>

<template>
  <section class="tw-w-full tw-py-16 md:tw-py-24 tw-px-4 sm:tw-px-6 md:tw-px-8 tw-relative tw-z-10">
    <div class="tw-max-w-7xl tw-mx-auto">
      <!-- Cabeçalho da Seção -->
      <div class="tw-text-center tw-max-w-3xl tw-mx-auto tw-mb-12 md:tw-mb-16">
        <q-badge
          color="primary"
          outline
          class="tw-px-3.5 tw-py-1.5 tw-rounded-full text-weight-bold tw-text-xs tw-mb-3"
        >
          ✨ O ECOSSISTEMA COMPLETO
        </q-badge>
        <h2
          class="text-h4 sm:text-h3 text-weight-bold tw-font-space-grotesk tw-tracking-tight tw-mb-4"
        >
          Tudo o que sua sala precisa para <span class="text-primary">realmente aprender</span>
        </h2>
        <p class="text-muted tw-text-base sm:tw-text-lg tw-leading-relaxed tw-m-0">
          Substitua a adivinhação por métricas vivas. Conecte alunos tímidos, professores engajados
          e grupos de monitoria física num só lugar.
        </p>
      </div>

      <!-- Bento Grid de Funcionalidades -->
      <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-5 sm:tw-gap-6">
        <q-card
          v-for="item in features"
          :key="item.id"
          flat
          bordered
          class="tw-backdrop-blur-xl tw-rounded-3xl tw-p-6 sm:tw-p-8 tw-shadow-sm hover:tw-shadow-xl hover:tw--translate-y-1 tw-transition-all tw-duration-300 tw-flex tw-flex-col tw-justify-between"
          :class="[item.colSpanClass, 'tw-border tw-border-white/10']"
        >
          <div>
            <!-- Header do Card com Ícone e Badge -->
            <div class="tw-flex tw-items-center tw-justify-between tw-gap-3 tw-mb-5">
              <div
                class="tw-w-12 tw-h-12 tw-rounded-2xl tw-flex tw-items-center tw-justify-center tw-shadow-sm"
                :class="`tw-bg-${item.iconColor}/10 tw-text-${item.iconColor}`"
              >
                <q-icon :name="item.icon" size="24px" :color="item.iconColor" />
              </div>
              <q-badge
                rounded
                :color="item.iconColor"
                class="tw-text-[11px] text-weight-bold tw-px-2.5 tw-py-1 tw-shadow-sm"
              >
                {{ item.badge }}
              </q-badge>
            </div>

            <!-- Título e Descrição -->
            <h3 class="text-h6 text-weight-bold tw-font-space-grotesk tw-mb-2.5 tw-leading-snug">
              {{ item.title }}
            </h3>
            <p class="text-muted tw-text-sm sm:tw-text-base tw-leading-relaxed tw-mb-5">
              {{ item.description }}
            </p>
          </div>

          <!-- Rodapé do Card: Tag de Impacto -->
          <div
            class="tw-pt-3 tw-border-t tw-border-white/10 tw-flex tw-items-center tw-justify-between"
          >
            <span class="tw-text-xs tw-font-semibold tw-opacity-80"> 💡 {{ item.tag }} </span>
            <q-icon name="arrow_forward" size="16px" class="tw-opacity-50" />
          </div>
        </q-card>
      </div>
    </div>
  </section>
</template>
