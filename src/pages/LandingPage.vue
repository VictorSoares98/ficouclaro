<script setup lang="ts">
// Landing Page
</script>

<template>
  <q-page class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-px-4 tw-text-center">
    <div class="tw-max-w-3xl tw-space-y-8">
      <h1 class="tw-text-5xl md:tw-text-6xl tw-font-extrabold tw-tracking-tight">
        O fim das dúvidas que
        <span class="tw-text-primary">ficaram para trás</span>
      </h1>

      <p class="tw-text-lg md:tw-text-xl text-muted tw-max-w-2xl tw-mx-auto">
        Acompanhe o ritmo da turma em tempo real. Uma plataforma conectando professores e alunos
        para garantir que todo o conteúdo realmente "ficou claro".
      </p>

      <div
        class="tw-flex tw-flex-col sm:tw-flex-row tw-items-center tw-justify-center tw-gap-4 tw-pt-8"
      >
        <q-btn
          color="primary"
          to="/register"
          label="Começar Agora"
          size="lg"
          unelevated
          class="tw-w-full sm:tw-w-auto tw-px-8 tw-rounded-full tw-font-bold"
        />
        <q-btn
          color="secondary"
          to="/login"
          label="Já tenho uma conta"
          size="lg"
          outline
          class="tw-w-full sm:tw-w-auto tw-px-8 tw-rounded-full tw-font-bold"
        />
      </div>
    </div>
  </q-page>
</template>
