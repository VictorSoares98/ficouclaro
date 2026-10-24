<script setup lang="ts">
import { ref } from 'vue';

const currentPaceScore = ref(88);
const currentStatusMessage = ref('A turma está assimilando o conteúdo em bom ritmo.');
const interactionCount = ref(1);
const userPaced = ref<string | null>(null);

function handlePaceClick(type: 'slow' | 'perfect' | 'fast') {
  userPaced.value = type;
  interactionCount.value++;

  if (type === 'slow') {
    currentPaceScore.value = Math.max(45, currentPaceScore.value - 12);
    currentStatusMessage.value =
      '🐢 Sinal anônimo enviado: o professor foi avisado para revisar o último exemplo!';
  } else if (type === 'perfect') {
    currentPaceScore.value = Math.min(100, currentPaceScore.value + 6);
    currentStatusMessage.value =
      '💡 Ficou Claro! +10 XP de engajamento computados para o seu perfil.';
  } else {
    currentPaceScore.value = Math.min(95, currentPaceScore.value + 4);
    currentStatusMessage.value =
      '⚡ Ritmo dinâmico: a turma está pronta para os exercícios práticos!';
  }

  if (navigator.vibrate) {
    navigator.vibrate(35);
  }
}

function resetSimulator() {
  currentPaceScore.value = 88;
  currentStatusMessage.value = 'A turma está assimilando o conteúdo em bom ritmo.';
  userPaced.value = null;
}
</script>

<template>
  <section class="tw-w-full tw-py-16 md:tw-py-20 tw-px-4 sm:tw-px-6 md:tw-px-8 tw-relative tw-z-10">
    <div class="tw-max-w-4xl tw-mx-auto">
      <q-card
        flat
        bordered
        class="tw-backdrop-blur-2xl tw-rounded-[2.5rem] tw-p-6 sm:tw-p-10 tw-shadow-2xl tw-border tw-border-primary/20 tw-relative tw-overflow-hidden"
        style="background: rgba(var(--q-dark-page, 15, 23, 42), 0.85)"
      >
        <!-- Efeito de Luz Decorativa -->
        <div
          class="tw-absolute -tw-top-20 -tw-right-20 tw-w-64 tw-h-64 tw-bg-primary/20 tw-rounded-full tw-filter tw-blur-3xl tw-pointer-events-none"
        ></div>

        <!-- Cabeçalho do Simulador -->
        <div class="tw-text-center tw-mb-8">
          <q-badge
            color="positive"
            class="tw-mb-2.5 tw-px-3 tw-py-1 tw-rounded-full text-weight-bold tw-text-xs"
          >
            🎮 SIMULADOR INTERATIVO
          </q-badge>
          <h3 class="text-h5 sm:text-h4 text-weight-bold tw-font-space-grotesk tw-mb-2">
            Experimente na prática: Como funciona em aula?
          </h3>
          <p class="text-muted tw-text-sm sm:tw-text-base tw-max-w-lg tw-mx-auto tw-m-0">
            Dê um clique abaixo como se você fosse um aluno na cadeira. Veja como o feedback chega
            instantaneamente e sem constrangimento.
          </p>
        </div>

        <!-- Painel Dinâmico do Termômetro do Professor -->
        <div
          class="tw-rounded-2xl tw-p-5 sm:tw-p-6 tw-mb-6 tw-border tw-border-white/10 tw-bg-white/5 tw-flex tw-flex-col sm:tw-flex-row tw-items-center tw-justify-between tw-gap-4"
        >
          <div class="tw-flex tw-items-center tw-gap-3.5">
            <div
              class="tw-w-14 tw-h-14 tw-rounded-2xl tw-bg-primary/20 tw-text-primary tw-flex tw-items-center tw-justify-center tw-text-2xl tw-font-extrabold tw-shadow-sm"
            >
              {{ currentPaceScore }}%
            </div>
            <div>
              <div class="tw-text-xs text-muted tw-font-semibold tw-uppercase tw-tracking-wider">
                Termômetro da Turma ao Vivo
              </div>
              <div class="tw-text-base tw-font-bold tw-mt-0.5">
                {{
                  currentPaceScore >= 80
                    ? 'Ritmo Excelente ✨'
                    : currentPaceScore >= 60
                      ? 'Ritmo Moderado ⚖️'
                      : 'Atenção Necessária ⚠️'
                }}
              </div>
            </div>
          </div>

          <!-- Estatística Gamificada -->
          <div class="tw-flex tw-items-center tw-gap-3 tw-text-xs sm:tw-text-sm text-muted">
            <span class="tw-flex tw-items-center tw-gap-1">
              <q-icon name="stars" color="warning" size="18px" />
              <strong>{{ interactionCount * 10 }} XP</strong> acumulados
            </span>
            <q-btn
              v-if="userPaced"
              flat
              dense
              round
              icon="restart_alt"
              size="sm"
              color="grey-6"
              aria-label="Reiniciar simulador"
              @click="resetSimulator"
            >
              <q-tooltip>Reiniciar Simulação</q-tooltip>
            </q-btn>
          </div>
        </div>

        <!-- Barra de Progresso Fluida -->
        <div class="tw-w-full tw-h-3 tw-bg-white/10 tw-rounded-full tw-overflow-hidden tw-mb-6">
          <div
            class="tw-h-full tw-rounded-full tw-transition-all tw-duration-500 tw-bg-gradient-to-r tw-from-warning tw-via-primary tw-to-positive"
            :style="{ width: `${currentPaceScore}%` }"
          ></div>
        </div>

        <!-- Botões de Ação do Aluno (Simulação) -->
        <div class="tw-grid tw-grid-cols-1 sm:tw-grid-cols-3 tw-gap-3 sm:tw-gap-4 tw-mb-6">
          <q-btn
            unelevated
            no-caps
            class="tw-py-3 tw-rounded-2xl tw-font-bold tw-text-sm tw-border tw-border-white/10 hover:tw-border-warning/50 tw-transition-all"
            :class="userPaced === 'slow' ? 'tw-bg-warning/20 tw-text-warning' : 'tw-bg-white/5'"
            @click="handlePaceClick('slow')"
          >
            <div class="tw-flex tw-items-center tw-gap-2">
              <span class="tw-text-xl">🐢</span>
              <span>Mais Devagar</span>
            </div>
          </q-btn>

          <q-btn
            unelevated
            no-caps
            class="tw-py-3 tw-rounded-2xl tw-font-bold tw-text-sm tw-border tw-border-white/10 hover:tw-border-primary/50 tw-transition-all"
            :class="
              userPaced === 'perfect'
                ? 'tw-bg-primary tw-text-white tw-shadow-lg'
                : 'tw-bg-primary/20 tw-text-primary'
            "
            @click="handlePaceClick('perfect')"
          >
            <div class="tw-flex tw-items-center tw-gap-2">
              <span class="tw-text-xl">💡</span>
              <span>Ficou Claro!</span>
            </div>
          </q-btn>

          <q-btn
            unelevated
            no-caps
            class="tw-py-3 tw-rounded-2xl tw-font-bold tw-text-sm tw-border tw-border-white/10 hover:tw-border-positive/50 tw-transition-all"
            :class="userPaced === 'fast' ? 'tw-bg-positive/20 tw-text-positive' : 'tw-bg-white/5'"
            @click="handlePaceClick('fast')"
          >
            <div class="tw-flex tw-items-center tw-gap-2">
              <span class="tw-text-xl">⚡</span>
              <span>Pode Acelerar</span>
            </div>
          </q-btn>
        </div>

        <!-- Mensagem de Feedback Contextual -->
        <div
          class="tw-p-4 tw-rounded-xl tw-bg-white/5 tw-border tw-border-white/10 tw-text-center tw-text-xs sm:tw-text-sm tw-font-medium tw-transition-all"
        >
          {{ currentStatusMessage }}
        </div>
      </q-card>
    </div>
  </section>
</template>
