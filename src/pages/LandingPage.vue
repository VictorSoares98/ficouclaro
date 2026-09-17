<script setup lang="ts">
import BaseSurfaceCard from '@/core/components/BaseSurfaceCard.vue';
</script>

<template>
  <q-page
    class="tw-flex tw-flex-col tw-min-h-screen tw-overflow-x-hidden tw-relative tw-bg-gradient-to-br tw-from-primary/10 tw-via-transparent tw-to-secondary/10"
  >
    <!-- Hero Section -->
    <div
      class="tw-flex-1 tw-flex tw-flex-col tw-items-center tw-justify-center tw-px-4 tw-pt-12 tw-pb-8 md:tw-pt-24 md:tw-pb-16 tw-text-center tw-z-10"
    >
      <div class="tw-max-w-4xl tw-space-y-6 md:tw-space-y-8">
        <!-- Title -->
        <h1
          class="tw-text-4xl sm:tw-text-5xl md:tw-text-7xl tw-font-extrabold tw-tracking-tight tw-leading-tight"
        >
          O fim das dúvidas que
          <span class="tw-text-primary tw-block sm:tw-inline">ficaram para trás</span>
        </h1>

        <!-- Subtitle -->
        <p class="tw-text-lg md:tw-text-2xl text-muted tw-max-w-2xl tw-mx-auto tw-leading-relaxed">
          Acompanhe o ritmo da turma em tempo real. Uma plataforma conectando professores e alunos
          para garantir que todo o conteúdo realmente "ficou claro".
        </p>

        <!-- CTA Buttons -->
        <div
          class="tw-flex tw-flex-col sm:tw-flex-row tw-items-center tw-justify-center tw-gap-4 tw-pt-8"
        >
          <q-btn
            color="primary"
            to="/register"
            label="Começar Agora"
            unelevated
            class="tw-w-full sm:tw-w-auto tw-px-10 tw-h-14 tw-rounded-full tw-text-lg tw-font-bold tw-shadow-lg hover:tw-scale-105 tw-transition-transform"
          />
          <q-btn
            color="secondary"
            to="/login"
            label="Já tenho uma conta"
            outline
            class="tw-w-full sm:tw-w-auto tw-px-10 tw-h-14 tw-rounded-full tw-text-lg tw-font-bold hover:tw-bg-secondary/10 tw-transition-colors"
          />
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="tw-w-full tw-max-w-7xl tw-mx-auto tw-px-4 tw-pb-16 md:tw-pb-24 tw-z-10">
      <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-6 md:tw-gap-8">
        <!-- Feature 1 -->
        <BaseSurfaceCard
          variant="glass"
          class="tw-p-8 tw-h-full tw-flex tw-flex-col tw-items-center tw-text-center hover:-tw-translate-y-2 tw-transition-transform tw-duration-300"
        >
          <q-icon name="bolt" size="4rem" color="warning" class="tw-mb-6 tw-opacity-90" />
          <h3 class="tw-text-xl tw-font-bold tw-mb-3">Feedback em Tempo Real</h3>
          <p class="text-muted tw-leading-relaxed">
            Alunos enviam sinais de ritmo ("Mais devagar", "Ficou Claro") sem interromper a aula. O
            professor ajusta a didática instantaneamente.
          </p>
        </BaseSurfaceCard>

        <!-- Feature 2 -->
        <BaseSurfaceCard
          variant="glass"
          class="tw-p-8 tw-h-full tw-flex tw-flex-col tw-items-center tw-text-center hover:-tw-translate-y-2 tw-transition-transform tw-duration-300"
        >
          <q-icon name="swipe" size="4rem" color="primary" class="tw-mb-6 tw-opacity-90" />
          <h3 class="tw-text-xl tw-font-bold tw-mb-3">Sem Fricção</h3>
          <p class="text-muted tw-leading-relaxed">
            Sem downloads complexos ou burocracia. Acesso rápido via código da sala direto no
            navegador do celular do aluno.
          </p>
        </BaseSurfaceCard>

        <!-- Feature 3 -->
        <BaseSurfaceCard
          variant="glass"
          class="tw-p-8 tw-h-full tw-flex tw-flex-col tw-items-center tw-text-center hover:-tw-translate-y-2 tw-transition-transform tw-duration-300"
        >
          <q-icon name="insights" size="4rem" color="secondary" class="tw-mb-6 tw-opacity-90" />
          <h3 class="tw-text-xl tw-font-bold tw-mb-3">Dados Instantâneos</h3>
          <p class="text-muted tw-leading-relaxed">
            Gráficos e termômetros gerados automaticamente durante a sessão, permitindo uma
            avaliação formativa contínua.
          </p>
        </BaseSurfaceCard>
      </div>
    </div>

    <!-- Decorative Blobs (Background) -->
    <div
      class="tw-absolute tw-top-0 tw-left-0 tw-w-full tw-h-full tw-overflow-hidden tw-pointer-events-none tw-z-0"
    >
      <div
        class="tw-absolute -tw-top-40 -tw-left-40 tw-w-96 tw-h-96 tw-bg-primary/30 tw-rounded-full tw-filter tw-blur-3xl tw-opacity-50 tw-animate-blob"
      ></div>
      <div
        class="tw-absolute tw-top-40 -tw-right-40 tw-w-96 tw-h-96 tw-bg-secondary/30 tw-rounded-full tw-filter tw-blur-3xl tw-opacity-50 tw-animate-blob tw-animation-delay-2000"
      ></div>
      <div
        class="tw-absolute -tw-bottom-40 tw-left-1/2 tw-w-96 tw-h-96 tw-bg-accent/30 tw-rounded-full tw-filter tw-blur-3xl tw-opacity-50 tw-animate-blob tw-animation-delay-4000"
      ></div>
    </div>
  </q-page>
</template>

<style scoped>
@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}
.tw-animate-blob {
  animation: blob 7s infinite;
}
.tw-animation-delay-2000 {
  animation-delay: 2s;
}
.tw-animation-delay-4000 {
  animation-delay: 4s;
}
</style>
