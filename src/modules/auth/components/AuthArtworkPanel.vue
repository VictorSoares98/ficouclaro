<script setup lang="ts">
// Painel Lateral de Arte e Social Proof inspirado no Find My Pockets
</script>

<template>
  <div class="tw-hidden lg:tw-flex lg:tw-w-7/12 tw-relative tw-overflow-hidden tw-min-h-screen">
    <!-- Imagem de Fundo (Universidade / Aprendizado Ativo) -->
    <div
      class="tw-absolute tw-inset-0 tw-bg-cover tw-bg-center tw-transform tw-scale-105 tw-transition-transform tw-duration-1000"
      style="
        background-image: url('https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop');
      "
    >
      <!-- Overlay com as cores corporativas do Ficou Claro? (Primary / Secondary) -->
      <div
        class="tw-absolute tw-inset-0 tw-bg-gradient-to-tr tw-from-primary/95 tw-via-primary/70 tw-to-secondary/40"
      ></div>
    </div>

    <!-- Pílula de Proposta de Valor no Topo -->
    <div class="tw-absolute tw-top-12 tw-left-12 tw-z-10">
      <div
        class="tw-inline-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-rounded-full tw-bg-white/15 tw-backdrop-blur-md tw-border tw-border-white/20 tw-text-white tw-text-sm tw-font-semibold tw-shadow-lg"
      >
        <span class="tw-w-2 tw-h-2 tw-rounded-full tw-bg-positive tw-animate-pulse"></span>
        Feedback Educacional em Tempo Real
      </div>
    </div>

    <!-- Elementos Flutuantes em Glassmorphism (Testemunhos & Métricas) -->
    <div
      class="tw-absolute tw-bottom-12 tw-left-8 tw-right-8 xl:tw-left-12 xl:tw-right-12 tw-flex tw-gap-6 tw-justify-center tw-z-10"
    >
      <!-- Card 1: Visão do Professor -->
      <div
        class="tw-bg-white/15 dark:tw-bg-black/30 tw-backdrop-blur-xl tw-border tw-border-white/25 tw-rounded-[2rem] tw-p-6 tw-flex-1 tw-max-w-sm tw-shadow-2xl tw-transform tw-transition-transform hover:tw-scale-105"
      >
        <div class="tw-flex tw-items-center tw-gap-3.5 tw-mb-3">
          <q-avatar size="44px" color="white" text-color="primary" class="tw-shadow-md">
            <q-icon name="school" size="26px" />
          </q-avatar>
          <div>
            <h4 class="tw-font-bold tw-text-white tw-text-sm tw-leading-tight">
              Prof. Henrique Silveira
            </h4>
            <p class="tw-text-white/80 tw-text-xs">Docente de Engenharia</p>
          </div>
        </div>
        <p class="tw-text-white/95 tw-text-xs sm:tw-text-sm tw-leading-relaxed tw-italic">
          "Com o termômetro de ritmo, consigo calibrar a velocidade da aula em tempo real. O
          engajamento da turma aumentou imediatamente."
        </p>
      </div>

      <!-- Card 2: Visão do Aluno -->
      <div
        class="tw-bg-white/15 dark:tw-bg-black/30 tw-backdrop-blur-xl tw-border tw-border-white/25 tw-rounded-[2rem] tw-p-6 tw-flex-1 tw-max-w-sm tw-shadow-2xl tw-transform tw-transition-transform hover:tw-scale-105"
      >
        <div class="tw-flex tw-items-center tw-gap-3.5 tw-mb-3">
          <q-avatar size="44px" color="secondary" text-color="white" class="tw-shadow-md">
            <q-icon name="psychology" size="26px" />
          </q-avatar>
          <div>
            <h4 class="tw-font-bold tw-text-white tw-text-sm tw-leading-tight">Mariana Alencar</h4>
            <p class="tw-text-white/80 tw-text-xs">Aluna de Graduação</p>
          </div>
        </div>
        <p class="tw-text-white/95 tw-text-xs sm:tw-text-sm tw-leading-relaxed tw-italic">
          "Poder sinalizar dúvidas anonimamente sem vergonha de interromper a sala transformou
          minha experiência em sala de aula."
        </p>
      </div>
    </div>
  </div>
</template>
