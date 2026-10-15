<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { gsap } from '@/boot/gsap';

const visualRootRef = ref<HTMLElement | null>(null);
let gsapCtx: gsap.Context | null = null;

onMounted(() => {
  void nextTick(() => {
    if (!visualRootRef.value) return;

    gsapCtx = gsap.context(() => {
      // Entrada inicial suave dos elementos
      gsap.from('.hero-main-card', {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
      });

      // Animação de flutuação contínua dos cards satélites (Glassmorphism 3D effect)
      gsap.to('.hero-float-card-1', {
        y: -10,
        rotation: 1,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 0.3,
      });

      gsap.to('.hero-float-card-2', {
        y: 12,
        rotation: -1,
        duration: 3.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 0.6,
      });

      // Animação de pulso suave no termômetro de ritmo
      gsap.to('.hero-pulse-bar', {
        width: '92%',
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
      });
    }, visualRootRef.value);
  });
});

onBeforeUnmount(() => {
  if (gsapCtx) {
    gsapCtx.revert();
  }
});
</script>

<template>
  <div
    ref="visualRootRef"
    class="tw-relative tw-w-full tw-max-w-xl tw-mx-auto tw-flex tw-items-center tw-justify-center tw-py-8 sm:tw-py-12"
  >
    <!-- Brilho de fundo atmosférico (Backdrop Glow) -->
    <div
      class="tw-absolute tw-w-72 tw-h-72 tw-rounded-full tw-bg-primary/25 tw-filter tw-blur-3xl tw-pointer-events-none tw-animate-pulse"
      style="animation-duration: 4s"
    ></div>
    <div
      class="tw-absolute -tw-bottom-10 -tw-right-10 tw-w-60 tw-h-60 tw-rounded-full tw-bg-secondary/20 tw-filter tw-blur-3xl tw-pointer-events-none"
    ></div>

    <!-- 1. Card Central: Sala de Aula ao Vivo & Termômetro de Ritmo -->
    <q-card
      flat
      bordered
      class="hero-main-card tw-relative tw-z-10 tw-w-full tw-backdrop-blur-xl tw-rounded-[2.25rem] tw-p-5 sm:tw-p-7 tw-shadow-2xl tw-border tw-border-white/15"
      style="background: rgba(var(--q-dark-page, 15, 23, 42), 0.75)"
    >
      <!-- Topo do Card: Indicador de Sessão Ativa -->
      <div
        class="tw-flex tw-items-center tw-justify-between tw-gap-2 tw-mb-5 tw-pb-4 tw-border-b tw-border-white/10"
      >
        <div class="tw-flex tw-items-center tw-gap-2.5">
          <span class="tw-relative tw-flex tw-h-3 tw-w-3">
            <span
              class="tw-animate-ping tw-absolute tw-inline-flex tw-h-full tw-w-full tw-rounded-full tw-bg-positive tw-opacity-75"
            ></span>
            <span
              class="tw-relative tw-inline-flex tw-rounded-full tw-h-3 tw-w-3 tw-bg-positive"
            ></span>
          </span>
          <div>
            <div class="tw-text-xs sm:tw-text-sm tw-font-bold tw-leading-tight">
              Cálculo II · Sala 402
            </div>
            <div class="tw-text-[11px] text-muted">Prof. Ricardo Rocha</div>
          </div>
        </div>

        <q-chip
          dense
          color="primary"
          text-color="white"
          class="tw-m-0 text-weight-bold tw-px-2.5 tw-py-1 tw-text-[11px] tw-shadow-sm"
        >
          <q-icon name="group" size="14px" class="tw-mr-1" />
          48 online
        </q-chip>
      </div>

      <!-- Centro: Termômetro da Aula em Tempo Real -->
      <div class="tw-mb-5">
        <div class="tw-flex tw-justify-between tw-items-baseline tw-mb-2">
          <span
            class="tw-text-xs sm:tw-text-sm tw-font-semibold tw-flex tw-items-center tw-gap-1.5"
          >
            <q-icon name="speed" color="primary" size="18px" />
            Termômetro de Assimilação
          </span>
          <span class="tw-text-xs sm:tw-text-sm tw-font-extrabold tw-text-primary">
            92% Ficou Claro!
          </span>
        </div>

        <!-- Barra Gradiente de Pulso -->
        <div class="tw-w-full tw-h-3 tw-bg-primary/15 tw-rounded-full tw-overflow-hidden tw-p-0.5">
          <div
            class="hero-pulse-bar tw-h-full tw-rounded-full tw-bg-gradient-to-r tw-from-primary tw-via-secondary tw-to-accent tw-transition-all"
            style="width: 88%"
          ></div>
        </div>

        <!-- Feedback Rápido da Turma -->
        <div class="tw-flex tw-justify-between tw-items-center tw-mt-2.5 tw-text-[11px] text-muted">
          <span>🐢 Muito lento (2%)</span>
          <span class="text-positive text-weight-bold">✨ Ritmo ideal (92%)</span>
          <span>⚡ Acelerado (6%)</span>
        </div>
      </div>

      <!-- Rodapé do Card: Ações de Interação Simuladas -->
      <div class="tw-grid tw-grid-cols-3 tw-gap-2 tw-pt-1">
        <div
          class="tw-p-2 tw-rounded-xl tw-border tw-border-white/10 tw-bg-white/5 tw-text-center tw-transition-transform hover:tw-scale-105 cursor-pointer"
        >
          <div class="tw-text-base sm:tw-text-lg">🐢</div>
          <div class="tw-text-[10px] sm:tw-text-xs tw-font-bold tw-mt-0.5">Mais Devagar</div>
        </div>
        <div
          class="tw-p-2 tw-rounded-xl tw-border tw-border-primary/40 tw-bg-primary/10 tw-text-center tw-transition-transform hover:tw-scale-105 cursor-pointer"
        >
          <div class="tw-text-base sm:tw-text-lg">💡</div>
          <div class="tw-text-[10px] sm:tw-text-xs tw-font-bold tw-text-primary tw-mt-0.5">
            Ficou Claro!
          </div>
        </div>
        <div
          class="tw-p-2 tw-rounded-xl tw-border tw-border-white/10 tw-bg-white/5 tw-text-center tw-transition-transform hover:tw-scale-105 cursor-pointer"
        >
          <div class="tw-text-base sm:tw-text-lg">🙋‍♂️</div>
          <div class="tw-text-[10px] sm:tw-text-xs tw-font-bold tw-mt-0.5">Tirar Dúvida</div>
        </div>
      </div>
    </q-card>

    <!-- 2. Satélite Flutuante Superior Direito: Enquete Relâmpago (Live Poll) -->
    <q-card
      flat
      bordered
      class="hero-float-card-1 tw-absolute -tw-top-4 sm:-tw-top-6 -tw-right-2 sm:-tw-right-6 tw-z-20 tw-p-3 sm:tw-p-4 tw-rounded-2xl tw-backdrop-blur-xl tw-shadow-xl tw-border tw-border-white/20 tw-max-w-[210px] sm:tw-max-w-[230px]"
      style="background: rgba(var(--q-dark-page, 15, 23, 42), 0.88)"
    >
      <div class="tw-flex tw-items-center tw-gap-1.5 tw-mb-1.5">
        <q-icon name="poll" color="warning" size="16px" />
        <span class="tw-text-[11px] tw-font-bold">Quiz ao Vivo</span>
      </div>
      <div class="tw-text-[11px] tw-font-medium tw-leading-snug tw-line-clamp-2 tw-mb-2">
        Qual o valor do limite quando x tende a 0?
      </div>
      <div class="tw-space-y-1">
        <div class="tw-flex tw-justify-between tw-text-[10px] tw-font-semibold">
          <span>Opção B</span>
          <span class="text-positive">78%</span>
        </div>
        <div class="tw-w-full tw-h-1.5 tw-bg-white/10 tw-rounded-full tw-overflow-hidden">
          <div class="tw-h-full tw-bg-positive tw-rounded-full" style="width: 78%"></div>
        </div>
      </div>
    </q-card>

    <!-- 3. Satélite Flutuante Inferior Esquerdo: Dúvida Mais Votada (Q&A Anônimo) -->
    <q-card
      flat
      bordered
      class="hero-float-card-2 tw-absolute -tw-bottom-5 sm:-tw-bottom-7 -tw-left-2 sm:-tw-left-6 tw-z-20 tw-p-3 sm:tw-p-4 tw-rounded-2xl tw-backdrop-blur-xl tw-shadow-xl tw-border tw-border-white/20 tw-max-w-[220px] sm:tw-max-w-[250px]"
      style="background: rgba(var(--q-dark-page, 15, 23, 42), 0.88)"
    >
      <div class="tw-flex tw-items-center tw-justify-between tw-mb-1">
        <span class="tw-flex tw-items-center tw-gap-1 tw-text-[10px] text-muted">
          <q-icon name="lock" size="12px" />
          Pergunta Anônima
        </span>
        <q-badge color="primary" rounded class="tw-text-[10px] text-weight-bold">
          ▲ 23 votos
        </q-badge>
      </div>
      <div class="tw-text-[11px] tw-font-bold tw-leading-tight">
        "Professor, o teorema se aplica também para matrizes não-quadradas?"
      </div>
    </q-card>
  </div>
</template>
