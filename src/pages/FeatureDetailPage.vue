<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Platform } from 'quasar';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { getFeatureBySlug, FEATURE_SLUGS, type FeatureDetail } from '@/core/config/features.config';

const route = useRoute();
const router = useRouter();

const currentSlug = computed(() => {
  const params = route.params as Record<string, string | string[] | undefined>;
  const raw = params.slug;
  return typeof raw === 'string' ? raw : Array.isArray(raw) ? (raw[0] ?? '') : '';
});

const feature = computed<FeatureDetail | undefined>(() => {
  return getFeatureBySlug(currentSlug.value);
});

// Redireciona para 404 caso o slug informado não exista
function validateSlug() {
  if (!feature.value) {
    void router.replace('/404');
  }
}

onMounted(() => {
  validateSlug();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

watch(
  () => currentSlug.value,
  () => {
    validateSlug();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
);

// --- ESTADOS DOS SIMULADORES HANDS-ON ---

// 1. Simulador do Termômetro
const paceScore = ref(85);
const lastPaceType = ref<string | null>(null);
const paceStatus = ref('Ritmo estável: a maior parte da turma está acompanhando com clareza.');

async function triggerHaptic() {
  if (Platform.is.capacitor) {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {
      // Ignora erro de haptics não suportado
    }
  }
}

function handlePaceAction(type: 'slow' | 'ok' | 'fast') {
  lastPaceType.value = type;
  void triggerHaptic();

  if (type === 'slow') {
    paceScore.value = Math.max(40, paceScore.value - 15);
    paceStatus.value =
      '🐢 Alerta emitido: O painel do professor foi notificado para desacelerar e revisar!';
  } else if (type === 'ok') {
    paceScore.value = Math.min(100, paceScore.value + 5);
    paceStatus.value = '💡 Ficou Claro! A turma confirma excelente fixação dos conceitos.';
  } else {
    paceScore.value = Math.min(95, paceScore.value + 8);
    paceStatus.value = '⚡ Acelerar: Turma dominou o tópico e está apta a avançar na matéria.';
  }
}

// 2. Simulador de Q&A com Upvote
interface MockQuestion {
  id: number;
  text: string;
  votes: number;
  hasVoted: boolean;
  timeAgo: string;
}

const mockQuestions = ref<MockQuestion[]>([
  {
    id: 1,
    text: 'Poderia demonstrar novamente a regra da cadeia no exemplo 3?',
    votes: 14,
    hasVoted: false,
    timeAgo: 'há 4 min',
  },
  {
    id: 2,
    text: 'Essa fórmula de complexidade se aplica também a grafos não direcionados?',
    votes: 9,
    hasVoted: false,
    timeAgo: 'há 7 min',
  },
  {
    id: 3,
    text: 'Qual o critério de parada na recursão do exercício 2?',
    votes: 6,
    hasVoted: false,
    timeAgo: 'há 10 min',
  },
]);

const newQuestionText = ref('');

function toggleUpvote(qId: number) {
  const item = mockQuestions.value.find((q) => q.id === qId);
  if (!item) return;

  void triggerHaptic();
  if (item.hasVoted) {
    item.votes--;
    item.hasVoted = false;
  } else {
    item.votes++;
    item.hasVoted = true;
  }

  // Ordena por maior número de votos automaticamente
  mockQuestions.value.sort((a, b) => b.votes - a.votes);
}

function submitMockQuestion() {
  const text = newQuestionText.value.trim();
  if (!text) return;

  mockQuestions.value.unshift({
    id: Date.now(),
    text,
    votes: 1,
    hasVoted: true,
    timeAgo: 'agora',
  });
  newQuestionText.value = '';
  void triggerHaptic();
}

// 3. Simulador de Enquete Relâmpago
interface MockPollOption {
  id: string;
  label: string;
  votes: number;
}

const mockPollOptions = ref<MockPollOption[]>([
  { id: 'a', label: 'O(log n) - Busca Binária', votes: 24 },
  { id: 'b', label: 'O(n) - Varredura Linear', votes: 6 },
  { id: 'c', label: 'O(n²) - Laço Aninhado', votes: 2 },
]);

const selectedPollOption = ref<string | null>(null);

const totalPollVotes = computed(() => {
  return mockPollOptions.value.reduce((acc, curr) => acc + curr.votes, 0);
});

function votePoll(optionId: string) {
  if (selectedPollOption.value) return; // Voto único
  selectedPollOption.value = optionId;
  const opt = mockPollOptions.value.find((o) => o.id === optionId);
  if (opt) {
    opt.votes++;
  }
  void triggerHaptic();
}

// 4. Simulador de Analytics Pedagógico $0 AI
const simulatedInsightMetric = ref(92);
const activeFilter = ref<'geral' | 'dificuldade' | 'engajamento'>('geral');
</script>

<template>
  <q-page v-if="feature" class="tw-min-h-screen tw-pb-20 tw-relative tw-overflow-x-hidden">
    <!-- Efeitos de Fundo Decorativo -->
    <div
      class="tw-absolute tw-top-0 tw-left-1/2 -tw-translate-x-1/2 tw-w-full tw-max-w-7xl tw-h-96 tw-bg-primary/5 tw-filter tw-blur-3xl tw-pointer-events-none tw-rounded-full"
    ></div>

    <div
      class="tw-max-w-6xl tw-mx-auto tw-px-4 sm:tw-px-6 md:tw-px-8 tw-pt-8 sm:tw-pt-12 tw-relative tw-z-10"
    >
      <!-- Breadcrumb & Navegação Rápida -->
      <nav
        class="tw-flex tw-items-center tw-gap-2 tw-text-xs tw-font-semibold tw-opacity-70 tw-mb-6 sm:tw-mb-8"
      >
        <router-link to="/" class="hover:tw-text-primary tw-transition-colors">Início</router-link>
        <span>/</span>
        <span class="tw-opacity-50">Recursos</span>
        <span>/</span>
        <span class="text-primary">{{ feature.title }}</span>
      </nav>

      <!-- 1. Hero da Funcionalidade -->
      <header
        class="tw-text-center tw-max-w-3xl tw-mx-auto tw-mb-12 sm:tw-mb-16 tw-space-y-4 sm:tw-space-y-6"
      >
        <div
          class="tw-inline-flex tw-items-center tw-gap-2 tw-px-4 tw-py-1.5 tw-rounded-full tw-bg-primary/10 tw-border tw-border-primary/20 tw-text-primary tw-text-xs tw-font-bold tw-shadow-sm"
        >
          <q-icon :name="feature.icon" size="16px" />
          <span>{{ feature.badge.toUpperCase() }}</span>
        </div>

        <h1
          class="tw-text-3xl sm:tw-text-4xl md:tw-text-5xl tw-font-extrabold tw-font-space-grotesk tw-tracking-tight tw-leading-tight tw-m-0"
        >
          {{ feature.headline }}
        </h1>

        <p class="text-muted tw-text-base sm:tw-text-lg tw-leading-relaxed tw-m-0">
          {{ feature.shortDescription }}
        </p>

        <div
          class="tw-flex tw-flex-wrap tw-items-center tw-justify-center tw-gap-3 sm:tw-gap-4 tw-pt-2"
        >
          <q-btn
            unelevated
            color="primary"
            label="Experimentar em Aula"
            no-caps
            to="/register"
            class="tw-px-6 tw-h-11 tw-rounded-xl tw-font-bold tw-shadow-md hover:tw-scale-105 tw-transition-transform"
          />
          <q-btn
            outline
            color="primary"
            label="Entrar em Aula com PIN"
            icon="pin"
            no-caps
            to="/?focus=pin"
            class="tw-px-5 tw-h-11 tw-rounded-xl tw-font-semibold hover:tw-bg-primary/10 tw-transition-colors"
          />
        </div>
      </header>

      <!-- 2. Comparativo: O Problema Antigo vs. A Solução do Ficou Claro -->
      <section class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6 tw-mb-14 sm:tw-mb-20">
        <q-card
          flat
          bordered
          class="tw-p-6 sm:tw-p-8 tw-rounded-3xl tw-border-negative/20 tw-shadow-md"
        >
          <div class="tw-flex tw-items-center tw-gap-3 tw-mb-3 text-negative">
            <q-icon name="report_problem" size="24px" />
            <h2 class="tw-text-lg tw-font-bold tw-m-0">O Cenário Tradicional</h2>
          </div>
          <p class="text-muted tw-text-sm sm:tw-text-base tw-leading-relaxed tw-m-0">
            {{ feature.problemStatement }}
          </p>
        </q-card>

        <q-card
          flat
          bordered
          class="tw-p-6 sm:tw-p-8 tw-rounded-3xl tw-border-positive/20 tw-shadow-md"
        >
          <div class="tw-flex tw-items-center tw-gap-3 tw-mb-3 text-positive">
            <q-icon name="check_circle" size="24px" />
            <h2 class="tw-text-lg tw-font-bold tw-m-0">Como o Ficou Claro Resolve</h2>
          </div>
          <p class="text-muted tw-text-sm sm:tw-text-base tw-leading-relaxed tw-m-0">
            {{ feature.solutionDetails }}
          </p>
        </q-card>
      </section>

      <!-- 3. SIMULADOR INTERATIVO HANDS-ON EMBUTIDO -->
      <section class="tw-mb-16 sm:tw-mb-24">
        <div class="tw-text-center tw-mb-8">
          <q-badge
            color="positive"
            class="tw-mb-2 tw-px-3 tw-py-1 tw-rounded-full text-weight-bold tw-text-xs"
          >
            🎮 SIMULAÇÃO PRÁTICA INTERATIVA
          </q-badge>
          <h2 class="tw-text-2xl sm:tw-text-3xl tw-font-bold tw-font-space-grotesk tw-m-0">
            Experimente o {{ feature.title }} Agora Mesmo
          </h2>
          <p class="text-muted tw-text-xs sm:tw-text-sm tw-mt-1 tw-m-0">
            Interaja com o componente abaixo exatamente como acontece na aula real.
          </p>
        </div>

        <q-card
          flat
          bordered
          class="tw-p-6 sm:tw-p-10 tw-rounded-[2.5rem] tw-shadow-xl tw-border-primary/20 tw-max-w-3xl tw-mx-auto tw-relative tw-overflow-hidden"
        >
          <!-- Simulador: Termômetro -->
          <div v-if="feature.interactiveType === 'thermometer'" class="tw-space-y-6 tw-text-center">
            <div class="tw-flex tw-flex-col tw-items-center">
              <span
                class="tw-text-xs tw-font-bold tw-uppercase tw-tracking-wider text-muted tw-mb-1"
              >
                Temperatura Cognitiva da Turma
              </span>
              <div
                class="tw-text-4xl sm:tw-text-5xl tw-font-black tw-font-space-grotesk text-primary"
              >
                {{ paceScore }}%
              </div>
              <q-linear-progress
                :value="paceScore / 100"
                color="primary"
                track-color="primary-subtle"
                rounded
                class="tw-h-3 tw-w-full tw-max-w-md tw-mt-3"
              />
            </div>

            <div
              class="tw-p-3.5 tw-rounded-2xl tw-bg-primary/5 tw-border tw-border-primary/10 tw-text-xs sm:tw-text-sm tw-font-medium text-muted"
            >
              {{ paceStatus }}
            </div>

            <div>
              <p class="tw-text-xs tw-font-semibold tw-opacity-80 tw-mb-3">
                Como aluno, toque em uma reação para calibrar o professor:
              </p>
              <div class="tw-grid tw-grid-cols-3 tw-gap-3 sm:tw-gap-4 tw-max-w-md tw-mx-auto">
                <q-btn
                  unelevated
                  no-caps
                  class="tw-rounded-2xl tw-py-3 tw-flex-col tw-gap-1 tw-border tw-border-gray-200 dark:tw-border-gray-700"
                  :class="{ 'tw-ring-2 tw-ring-primary': lastPaceType === 'slow' }"
                  @click="handlePaceAction('slow')"
                >
                  <span class="tw-text-2xl">🐢</span>
                  <span class="tw-text-xs tw-font-bold">Devagar</span>
                </q-btn>

                <q-btn
                  unelevated
                  no-caps
                  color="primary"
                  class="tw-rounded-2xl tw-py-3 tw-flex-col tw-gap-1"
                  :class="{ 'tw-ring-2 tw-ring-offset-2 tw-ring-primary': lastPaceType === 'ok' }"
                  @click="handlePaceAction('ok')"
                >
                  <span class="tw-text-2xl">💡</span>
                  <span class="tw-text-xs tw-font-bold">Ficou Claro!</span>
                </q-btn>

                <q-btn
                  unelevated
                  no-caps
                  class="tw-rounded-2xl tw-py-3 tw-flex-col tw-gap-1 tw-border tw-border-gray-200 dark:tw-border-gray-700"
                  :class="{ 'tw-ring-2 tw-ring-secondary': lastPaceType === 'fast' }"
                  @click="handlePaceAction('fast')"
                >
                  <span class="tw-text-2xl">⚡</span>
                  <span class="tw-text-xs tw-font-bold">Acelerar</span>
                </q-btn>
              </div>
            </div>
          </div>

          <!-- Simulador: Q&A -->
          <div v-else-if="feature.interactiveType === 'qa'" class="tw-space-y-5">
            <div class="tw-flex tw-items-center tw-justify-between">
              <span class="tw-text-xs tw-font-bold tw-uppercase tw-tracking-wider text-muted">
                Dúvidas em Tempo Real na Sala
              </span>
              <q-badge outline color="secondary" class="tw-text-[11px] text-weight-bold">
                {{ mockQuestions.length }} Perguntas
              </q-badge>
            </div>

            <!-- Lista de Dúvidas Mockadas -->
            <div class="tw-space-y-3">
              <div
                v-for="item in mockQuestions"
                :key="item.id"
                class="tw-p-4 tw-rounded-2xl tw-border tw-border-gray-100 dark:tw-border-gray-800 tw-flex tw-items-center tw-justify-between tw-gap-3 tw-transition-all"
                :class="{ 'tw-bg-secondary/5 tw-border-secondary/30': item.hasVoted }"
              >
                <div class="tw-flex-1">
                  <p class="tw-text-xs sm:tw-text-sm tw-font-medium tw-m-0">
                    {{ item.text }}
                  </p>
                  <span class="tw-text-[10px] tw-opacity-50 tw-mt-1 tw-block">
                    Enviada anonimamente &bull; {{ item.timeAgo }}
                  </span>
                </div>

                <q-btn
                  dense
                  rounded
                  :unelevated="item.hasVoted"
                  :outline="!item.hasVoted"
                  color="secondary"
                  class="tw-px-3 tw-py-1 tw-shrink-0"
                  @click="toggleUpvote(item.id)"
                >
                  <q-icon name="arrow_upward" size="14px" class="tw-mr-1" />
                  <span class="tw-text-xs tw-font-bold">{{ item.votes }}</span>
                </q-btn>
              </div>
            </div>

            <!-- Campo de Envio Simulado -->
            <div class="tw-pt-2 tw-flex tw-gap-2">
              <q-input
                v-model="newQuestionText"
                placeholder="Simular envio de dúvida anônima..."
                outlined
                dense
                class="tw-flex-1"
                @keyup.enter="submitMockQuestion"
              />
              <q-btn
                color="secondary"
                label="Enviar"
                unelevated
                no-caps
                class="tw-rounded-xl tw-px-4 tw-font-semibold"
                :disable="!newQuestionText.trim()"
                @click="submitMockQuestion"
              />
            </div>
          </div>

          <!-- Simulador: Enquetes -->
          <div v-else-if="feature.interactiveType === 'poll'" class="tw-space-y-5">
            <div class="tw-text-left">
              <q-badge
                color="warning"
                text-color="black"
                class="tw-mb-2 text-weight-bold tw-text-[10px]"
              >
                ENQUETE DA AULA AO VIVO
              </q-badge>
              <h3 class="tw-text-base sm:tw-text-lg tw-font-bold tw-m-0">
                Qual a complexidade temporal de busca em uma árvore AVL balanceada?
              </h3>
            </div>

            <!-- Opções da Enquete -->
            <div class="tw-space-y-2.5">
              <div
                v-for="opt in mockPollOptions"
                :key="opt.id"
                class="tw-p-3.5 tw-rounded-2xl tw-border tw-cursor-pointer tw-relative tw-overflow-hidden tw-transition-all"
                :class="
                  selectedPollOption === opt.id
                    ? 'tw-border-warning tw-bg-warning/10'
                    : 'tw-border-gray-200 dark:tw-border-gray-800 hover:tw-border-warning/50'
                "
                @click="votePoll(opt.id)"
              >
                <!-- Barra de Progresso de Fundo -->
                <div
                  v-if="selectedPollOption"
                  class="tw-absolute tw-inset-y-0 tw-left-0 tw-bg-warning/15 tw-transition-all tw-duration-500"
                  :style="{ width: `${Math.round((opt.votes / totalPollVotes) * 100)}%` }"
                ></div>

                <div
                  class="tw-relative tw-z-10 tw-flex tw-items-center tw-justify-between tw-text-xs sm:tw-text-sm"
                >
                  <span class="tw-font-medium">{{ opt.label }}</span>
                  <span v-if="selectedPollOption" class="tw-font-bold text-warning">
                    {{ Math.round((opt.votes / totalPollVotes) * 100) }}% ({{ opt.votes }})
                  </span>
                </div>
              </div>
            </div>

            <p class="tw-text-center tw-text-[11px] text-muted tw-m-0">
              <template v-if="!selectedPollOption">
                Toque em uma alternativa para registrar seu voto em tempo real.
              </template>
              <template v-else>
                Voto computado com sucesso! Os resultados atualizam dinamicamente para toda a sala.
              </template>
            </p>
          </div>

          <!-- Simulador: Analytics $0 AI -->
          <div v-else class="tw-space-y-6 tw-text-center">
            <div class="tw-flex tw-justify-center tw-gap-2">
              <q-btn
                dense
                no-caps
                :unelevated="activeFilter === 'geral'"
                :flat="activeFilter !== 'geral'"
                color="accent"
                label="Visão Geral"
                class="tw-rounded-xl tw-px-3 tw-text-xs"
                @click="
                  activeFilter = 'geral';
                  simulatedInsightMetric = 92;
                "
              />
              <q-btn
                dense
                no-caps
                :unelevated="activeFilter === 'dificuldade'"
                :flat="activeFilter !== 'dificuldade'"
                color="accent"
                label="Tópicos Críticos"
                class="tw-rounded-xl tw-px-3 tw-text-xs"
                @click="
                  activeFilter = 'dificuldade';
                  simulatedInsightMetric = 68;
                "
              />
              <q-btn
                dense
                no-caps
                :unelevated="activeFilter === 'engajamento'"
                :flat="activeFilter !== 'engajamento'"
                color="accent"
                label="Retenção"
                class="tw-rounded-xl tw-px-3 tw-text-xs"
                @click="
                  activeFilter = 'engajamento';
                  simulatedInsightMetric = 96;
                "
              />
            </div>

            <div
              class="tw-p-6 tw-rounded-3xl tw-bg-accent/5 tw-border tw-border-accent/20 tw-text-center"
            >
              <div class="tw-text-4xl tw-font-extrabold tw-font-space-grotesk text-accent tw-mb-1">
                {{ simulatedInsightMetric }}%
              </div>
              <div class="tw-text-xs tw-font-bold text-muted tw-uppercase tw-tracking-wider">
                Índice de Retenção Didática Calculado via WebAssembly Local
              </div>
              <p class="text-muted tw-text-xs sm:tw-text-sm tw-mt-3 tw-mb-0 tw-max-w-md tw-mx-auto">
                "A turma apresentou engajamento ótimo durante a primeira metade da aula.
                Recomendamos iniciar com um quiz curto na próxima aula para fixar as fórmulas."
              </p>
            </div>
          </div>
        </q-card>
      </section>

      <!-- 4. Métricas de Impacto Comprovado -->
      <section class="tw-mb-16 sm:tw-mb-20">
        <div class="tw-grid tw-grid-cols-1 sm:tw-grid-cols-3 tw-gap-6 tw-text-center">
          <q-card
            v-for="(metric, idx) in feature.metrics"
            :key="idx"
            flat
            bordered
            class="tw-p-6 tw-rounded-3xl tw-shadow-sm"
          >
            <div
              class="tw-text-3xl sm:tw-text-4xl tw-font-black tw-font-space-grotesk text-primary tw-mb-1"
            >
              {{ metric.value }}
            </div>
            <div class="tw-text-sm sm:tw-text-base tw-font-bold tw-mb-1">
              {{ metric.label }}
            </div>
            <p class="text-muted tw-text-xs sm:tw-text-sm tw-m-0">
              {{ metric.description }}
            </p>
          </q-card>
        </div>
      </section>

      <!-- 5. Benefícios Detalhados (Docente vs. Aluno) -->
      <section class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-8 tw-mb-16 sm:tw-mb-20">
        <!-- Para Professores -->
        <q-card flat bordered class="tw-p-6 sm:tw-p-8 tw-rounded-3xl tw-shadow-md">
          <div class="tw-flex tw-items-center tw-gap-2.5 tw-mb-6 text-primary">
            <q-icon name="school" size="24px" />
            <h3 class="tw-text-lg sm:tw-text-xl tw-font-bold tw-m-0">Para o Professor</h3>
          </div>
          <div class="tw-space-y-4">
            <div
              v-for="(b, i) in feature.professorBenefits"
              :key="i"
              class="tw-flex tw-items-start tw-gap-3"
            >
              <div class="tw-p-2 tw-rounded-xl tw-bg-primary/10 text-primary tw-shrink-0">
                <q-icon :name="b.icon" size="18px" />
              </div>
              <div>
                <h4 class="tw-text-sm tw-font-bold tw-m-0">{{ b.title }}</h4>
                <p class="text-muted tw-text-xs sm:tw-text-sm tw-mt-1 tw-m-0">
                  {{ b.description }}
                </p>
              </div>
            </div>
          </div>
        </q-card>

        <!-- Para Alunos -->
        <q-card flat bordered class="tw-p-6 sm:tw-p-8 tw-rounded-3xl tw-shadow-md">
          <div class="tw-flex tw-items-center tw-gap-2.5 tw-mb-6 text-secondary">
            <q-icon name="local_library" size="24px" />
            <h3 class="tw-text-lg sm:tw-text-xl tw-font-bold tw-m-0">Para o Estudante</h3>
          </div>
          <div class="tw-space-y-4">
            <div
              v-for="(b, i) in feature.studentBenefits"
              :key="i"
              class="tw-flex tw-items-start tw-gap-3"
            >
              <div class="tw-p-2 tw-rounded-xl tw-bg-secondary/10 text-secondary tw-shrink-0">
                <q-icon :name="b.icon" size="18px" />
              </div>
              <div>
                <h4 class="tw-text-sm tw-font-bold tw-m-0">{{ b.title }}</h4>
                <p class="text-muted tw-text-xs sm:tw-text-sm tw-mt-1 tw-m-0">
                  {{ b.description }}
                </p>
              </div>
            </div>
          </div>
        </q-card>
      </section>

      <!-- 6. Perguntas Frequentes (FAQ) -->
      <section class="tw-mb-16 sm:tw-mb-24">
        <h2
          class="tw-text-xl sm:tw-text-2xl tw-font-bold tw-font-space-grotesk tw-text-center tw-mb-6 sm:tw-mb-8"
        >
          Dúvidas Comuns sobre o {{ feature.title }}
        </h2>
        <div class="tw-max-w-3xl tw-mx-auto tw-space-y-3">
          <q-card
            v-for="(faq, fIndex) in feature.faqs"
            :key="fIndex"
            flat
            bordered
            class="tw-rounded-2xl tw-overflow-hidden"
          >
            <q-expansion-item
              :label="faq.question"
              header-class="tw-font-bold tw-text-sm sm:tw-text-base text-weight-bold"
              expand-icon-class="text-primary"
            >
              <div class="tw-px-4 tw-pb-4 text-muted tw-text-xs sm:tw-text-sm tw-leading-relaxed">
                {{ faq.answer }}
              </div>
            </q-expansion-item>
          </q-card>
        </div>
      </section>

      <!-- 7. Navegação entre Outros Recursos -->
      <section class="tw-mb-16 tw-text-center">
        <span
          class="tw-text-xs tw-font-bold tw-uppercase tw-tracking-wider text-muted tw-mb-4 tw-block"
        >
          Explore Outras Soluções da Plataforma
        </span>
        <div class="tw-flex tw-flex-wrap tw-justify-center tw-gap-2.5">
          <q-btn
            v-for="slug in FEATURE_SLUGS"
            :key="slug"
            flat
            no-caps
            :to="`/recursos/${slug}`"
            class="tw-rounded-xl tw-px-4 tw-py-2 tw-text-xs sm:tw-text-sm tw-font-semibold"
            :class="slug === feature.slug ? 'tw-bg-primary text-white' : 'hover:tw-bg-primary/10'"
          >
            {{ getFeatureBySlug(slug)?.title }}
          </q-btn>
          <q-btn
            flat
            no-caps
            to="/mapa"
            class="tw-rounded-xl tw-px-4 tw-py-2 tw-text-xs sm:tw-text-sm tw-font-semibold hover:tw-bg-primary/10"
          >
            Mapa de Monitorias
          </q-btn>
        </div>
      </section>

      <!-- 8. Card de Conversão Final (CTA) -->
      <section>
        <q-card
          flat
          bordered
          class="tw-p-8 sm:tw-p-12 tw-rounded-[2.5rem] tw-text-center tw-bg-gradient-to-r tw-from-primary/10 tw-via-transparent tw-to-secondary/10 tw-border-primary/20 tw-shadow-xl"
        >
          <h2 class="tw-text-2xl sm:tw-text-3xl tw-font-black tw-font-space-grotesk tw-mb-3">
            Pronto para transformar a experiência em sala de aula?
          </h2>
          <p class="text-muted tw-text-xs sm:tw-text-sm tw-max-w-xl tw-mx-auto tw-mb-6">
            Inicie uma turma em menos de 1 minuto ou participe de uma aula ao vivo usando o código
            PIN fornecido pelo seu professor.
          </p>
          <div class="tw-flex tw-flex-wrap tw-items-center tw-justify-center tw-gap-3">
            <q-btn
              color="primary"
              label="Cadastrar como Docente"
              no-caps
              to="/register"
              unelevated
              class="tw-px-6 tw-h-12 tw-rounded-2xl tw-font-bold tw-shadow-lg hover:tw-scale-105 tw-transition-transform"
            />
            <q-btn
              color="primary"
              label="Entrar em Aula com PIN"
              icon="pin"
              no-caps
              to="/?focus=pin"
              outline
              class="tw-px-6 tw-h-12 tw-rounded-2xl tw-font-bold hover:tw-bg-primary/10 tw-transition-colors"
            />
          </div>
        </q-card>
      </section>
    </div>
  </q-page>
</template>
