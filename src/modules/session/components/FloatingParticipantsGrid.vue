<script setup lang="ts">
import { computed } from 'vue';
import type { SessionPresenceUser } from '@/modules/session/composables/useSessionPresence';
import Fluent3dIcon from '@/core/components/Fluent3dIcon.vue';

const props = withDefaults(
  defineProps<{
    participants: SessionPresenceUser[];
    isProfessor?: boolean;
    maxVisible?: number;
  }>(),
  {
    isProfessor: false,
    maxVisible: 36,
  },
);

// Filtra apenas alunos e convidados para o mural
const studentsList = computed(() => {
  return props.participants.filter((p) => p.role !== 'professor');
});

const totalStudents = computed(() => studentsList.value.length);
const visibleStudents = computed(() => studentsList.value.slice(0, props.maxVisible));
const overflowCount = computed(() => Math.max(0, studentsList.value.length - props.maxVisible));

function getFloatClass(index: number): string {
  const mod = index % 3;
  if (mod === 0) return 'fc-float-1';
  if (mod === 1) return 'fc-float-2';
  return 'fc-float-3';
}
</script>

<template>
  <div class="fc-floating-grid-container tw-w-full tw-flex tw-flex-col tw-h-full">
    <!-- Cabeçalho do Mural de Presença -->
    <header class="tw-flex tw-items-center tw-justify-between tw-gap-2 tw-mb-4">
      <div class="tw-flex tw-items-center tw-gap-2.5">
        <span class="tw-relative tw-flex tw-h-3 tw-w-3">
          <span
            class="tw-animate-ping tw-absolute tw-inline-flex tw-h-full tw-w-full tw-rounded-full tw-bg-positive tw-opacity-75"
          ></span>
          <span
            class="tw-relative tw-inline-flex tw-rounded-full tw-h-3 tw-w-3 tw-bg-positive"
          ></span>
        </span>
        <span class="tw-text-sm sm:tw-text-base tw-font-bold tw-font-space-grotesk">
          Alunos Conectados
        </span>
      </div>

      <div
        class="tw-inline-flex tw-items-center tw-gap-1.5 tw-px-3 tw-py-1 tw-rounded-full bg-primary-soft text-primary tw-text-xs tw-font-extrabold"
      >
        <q-icon name="group" size="16px" />
        <span>{{ totalStudents }} na sala</span>
      </div>
    </header>

    <!-- Estado Vazio: Nenhum Aluno Conectado Ainda (Radar de Boas-Vindas) -->
    <q-card
      v-if="totalStudents === 0"
      flat
      bordered
      class="tw-flex-1 tw-min-h-[220px] sm:tw-min-h-[280px] tw-rounded-3xl tw-p-6 sm:tw-p-8 tw-flex tw-flex-col tw-items-center tw-justify-center tw-text-center tw-border-dashed tw-relative tw-overflow-hidden"
    >
      <!-- Radar Sutil em Segundo Plano -->
      <div
        class="tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center tw-pointer-events-none tw-opacity-20"
      >
        <div
          class="tw-w-44 tw-h-44 tw-rounded-full tw-border-2 tw-border-primary tw-animate-ping"
        ></div>
        <div class="tw-absolute tw-w-28 tw-h-28 tw-rounded-full tw-border tw-border-primary"></div>
      </div>

      <div class="tw-relative tw-z-10 tw-flex tw-flex-col tw-items-center">
        <Fluent3dIcon name="student" :size="48" floating class="tw-mb-3" />
        <h3 class="tw-text-base sm:tw-text-lg tw-font-bold tw-font-space-grotesk tw-m-0">
          Aguardando os alunos entrarem...
        </h3>
        <p
          class="text-muted tw-text-xs sm:tw-text-sm tw-max-w-sm tw-mt-1 tw-mb-0 tw-leading-relaxed"
        >
          Os alunos aparecerão aqui em tempo real assim que escanearem o QR Code ou inserirem o
          código da aula.
        </p>
      </div>
    </q-card>

    <!-- Mural de Presença com Molduras Flutuantes -->
    <div
      v-else
      class="tw-flex-1 tw-min-h-[220px] sm:tw-min-h-[280px] tw-p-2 tw-overflow-y-auto tw-no-scrollbar"
      role="status"
      aria-live="polite"
    >
      <TransitionGroup
        name="fc-pill"
        tag="div"
        class="tw-flex tw-flex-wrap tw-items-center tw-justify-center sm:tw-justify-start tw-gap-2.5 sm:tw-gap-3"
      >
        <!-- Moldura Flutuante do Aluno -->
        <q-card
          v-for="(student, idx) in visibleStudents"
          :key="student.userId"
          flat
          bordered
          class="fc-floating-pill tw-p-2 tw-pr-3.5 tw-rounded-2xl tw-flex tw-items-center tw-gap-2.5 tw-shadow-sm hover:tw-shadow-md hover:tw-scale-105 tw-transition-all tw-duration-300"
          :class="getFloatClass(idx)"
        >
          <!-- Avatar DiceBear com Anel de Status -->
          <div
            class="tw-relative tw-w-9 tw-h-9 tw-rounded-xl tw-overflow-hidden bg-primary-soft tw-ring-2 tw-ring-primary/20 tw-shrink-0 tw-flex tw-items-center tw-justify-center"
          >
            <q-img
              v-if="student.avatar"
              :src="student.avatar"
              class="tw-w-full tw-h-full"
              spinner-color="primary"
            />
            <q-icon v-else name="person" size="20px" color="primary" />

            <!-- Ponto Verde Vivo de Presença -->
            <span
              class="tw-absolute tw-bottom-0 tw-right-0 tw-w-2.5 tw-h-2.5 tw-rounded-full tw-bg-positive tw-ring-2 tw-ring-white"
            ></span>
          </div>

          <!-- Informações do Participante -->
          <div class="tw-min-w-0 tw-text-left">
            <div
              class="tw-text-xs tw-font-bold tw-truncate tw-max-w-[130px] sm:tw-max-w-[150px]"
              :title="student.name"
            >
              {{ student.name }}
            </div>
            <span class="tw-text-[10px] text-muted tw-block tw-leading-tight">
              {{ student.role === 'visitante' ? 'Convidado' : 'Aluno' }}
            </span>
          </div>
        </q-card>

        <!-- Pílula de Alunos Adicionais (+X Alunos) -->
        <q-card
          v-if="overflowCount > 0"
          key="overflow"
          flat
          bordered
          class="tw-p-2.5 tw-px-4 tw-rounded-2xl tw-flex tw-items-center tw-gap-2 bg-primary-soft text-primary tw-font-bold tw-text-xs"
        >
          <q-icon name="more_horiz" size="18px" />
          <span>+{{ overflowCount }} outros colegas</span>
        </q-card>
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped>
/* Transições de Entrada e Saída do TransitionGroup */
.fc-pill-enter-active,
.fc-pill-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fc-pill-enter-from {
  opacity: 0;
  transform: scale(0.6) translateY(20px);
}

.fc-pill-leave-to {
  opacity: 0;
  transform: scale(0.6) translateY(-20px);
}

/* Molduras Flutuantes Alternadas Orgânicas */
@keyframes fc-float-1 {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-6px);
  }
}

@keyframes fc-float-2 {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-9px);
  }
}

@keyframes fc-float-3 {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-4px);
  }
}

.fc-float-1 {
  animation: fc-float-1 3.6s ease-in-out infinite;
}

.fc-float-2 {
  animation: fc-float-2 4.4s ease-in-out infinite 0.8s;
}

.fc-float-3 {
  animation: fc-float-3 3.9s ease-in-out infinite 1.4s;
}

/* Acessibilidade: Respeito a Preferência de Movimento Reduzido */
@media (prefers-reduced-motion: reduce) {
  .fc-float-1,
  .fc-float-2,
  .fc-float-3 {
    animation: none !important;
  }

  .fc-pill-enter-active,
  .fc-pill-leave-active {
    transition: none !important;
  }
}
</style>
