<script setup lang="ts">
import { ref } from 'vue';

const currentTab = ref('centro');
</script>

<template>
  <q-page class="tw-p-4 sm:tw-p-8 lg:tw-p-12 tw-max-w-[1600px] tw-mx-auto">
    <!-- Header -->
    <div class="tw-flex tw-justify-between tw-items-center tw-mb-8">
      <div>
        <h1 class="tw-text-2xl sm:tw-text-3xl tw-font-bold tw-text-primary">Dashboard Global</h1>
        <p class="text-muted tw-mt-1 tw-text-sm sm:tw-text-base">
          Centro de Comando de todas as suas disciplinas
        </p>
      </div>
    </div>

    <!-- Tabs -->
    <q-tabs
      v-model="currentTab"
      dense
      class="text-grey tw-mb-6"
      active-color="primary"
      indicator-color="primary"
      align="left"
      narrow-indicator
    >
      <q-tab name="centro" icon="dashboard" label="Centro de Comando" />
      <q-tab name="radar" icon="radar" label="Radar de Alunos" />
      <q-tab name="historico" icon="history" label="Histórico Global" />
    </q-tabs>

    <q-separator class="tw-mb-6" />

    <q-tab-panels v-model="currentTab" animated class="tw-bg-transparent">
      <!-- PAINEL 1: CENTRO DE COMANDO (Bento Grid Mock) -->
      <q-tab-panel name="centro" class="tw-p-0">
        <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-4 sm:tw-gap-6">
          <!-- Bento Item: Alertas -->
          <div
            class="md:tw-col-span-3 tw-bg-white/10 tw-backdrop-blur-md tw-border tw-border-white/20 tw-p-6 tw-rounded-3xl tw-shadow-sm"
          >
            <h2 class="tw-text-lg tw-font-bold tw-mb-4">Alertas Recentes</h2>
            <q-skeleton type="rect" height="80px" class="tw-rounded-xl tw-mb-2" />
            <q-skeleton type="rect" height="80px" class="tw-rounded-xl" />
          </div>

          <!-- Bento Item: Média Global -->
          <div
            class="tw-bg-white/10 tw-backdrop-blur-md tw-border tw-border-white/20 tw-p-6 tw-rounded-3xl tw-shadow-sm tw-flex tw-flex-col tw-justify-center tw-items-center"
          >
            <q-icon name="star" size="3rem" color="warning" class="tw-mb-2" />
            <h3 class="tw-text-gray-500 tw-font-medium">Média Global</h3>
            <div class="tw-text-3xl tw-font-bold tw-mt-1">--</div>
          </div>

          <!-- Bento Item: Engajamento Geral -->
          <div
            class="md:tw-col-span-2 tw-bg-white/10 tw-backdrop-blur-md tw-border tw-border-white/20 tw-p-6 tw-rounded-3xl tw-shadow-sm"
          >
            <h2 class="tw-text-lg tw-font-bold tw-mb-4">Comparativo de Turmas</h2>
            <q-skeleton type="rect" height="250px" class="tw-rounded-xl" />
          </div>

          <!-- Bento Item: Sentimento -->
          <div
            class="md:tw-col-span-3 tw-bg-white/10 tw-backdrop-blur-md tw-border tw-border-white/20 tw-p-6 tw-rounded-3xl tw-shadow-sm"
          >
            <h2 class="tw-text-lg tw-font-bold tw-mb-4">Termômetro de Sentimento (IA)</h2>
            <q-skeleton type="rect" height="180px" class="tw-rounded-xl" />
          </div>
        </div>
      </q-tab-panel>

      <!-- PAINEL 2: RADAR DE ALUNOS -->
      <q-tab-panel name="radar" class="tw-p-0">
        <div
          class="tw-bg-white/10 tw-backdrop-blur-md tw-border tw-border-white/20 tw-p-6 tw-rounded-3xl tw-shadow-sm"
        >
          <h2 class="tw-text-lg tw-font-bold tw-mb-4">Radar de Risco de Evasão</h2>
          <q-skeleton type="rect" height="300px" class="tw-rounded-xl" />
        </div>
      </q-tab-panel>

      <!-- PAINEL 3: HISTÓRICO GLOBAL -->
      <q-tab-panel name="historico" class="tw-p-0">
        <div
          class="tw-bg-white/10 tw-backdrop-blur-md tw-border tw-border-white/20 tw-p-6 tw-rounded-3xl tw-shadow-sm"
        >
          <h2 class="tw-text-lg tw-font-bold tw-mb-4">Sessões Anteriores (Todas as Turmas)</h2>
          <q-skeleton type="rect" height="300px" class="tw-rounded-xl" />
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>
