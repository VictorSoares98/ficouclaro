<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);
const isProfessor = computed(() => authStore.isProfessor);
const isAluno = computed(() => authStore.isAluno);
</script>

<template>
  <!-- MobileNavBottom: Barra inferior tátil ergonômica (Thumb Zone) para viewports lt-md -->
  <q-footer
    class="tw-backdrop-blur-2xl tw-bg-surface/90 dark:tw-bg-dark-page/90 tw-text-gray-600 dark:tw-text-gray-300 tw-border-t tw-border-white/10 tw-shadow-2xl lt-md tw-z-[999]"
    style="padding-bottom: env(safe-area-inset-bottom, 0px)"
  >
    <q-tabs
      no-caps
      active-color="primary"
      indicator-color="primary"
      class="tw-text-xs tw-h-14"
      align="justify"
      dense
    >
      <!-- Abas para Visitante (Não Autenticado) -->
      <template v-if="!isAuthenticated">
        <q-route-tab
          to="/"
          icon="home"
          label="Início"
          exact
          class="tw-transition-transform active:tw-scale-95"
        />
        <q-route-tab
          to="/mapa"
          icon="explore"
          label="Mapa"
          class="tw-transition-transform active:tw-scale-95"
        />
        <q-route-tab
          to="/sala"
          icon="pin"
          label="Aulas"
          class="tw-transition-transform active:tw-scale-95"
        />
        <q-route-tab
          to="/login"
          icon="login"
          label="Entrar"
          class="tw-transition-transform active:tw-scale-95"
        />
      </template>

      <!-- Abas para Aluno -->
      <template v-else-if="isAluno">
        <q-route-tab
          to="/hub"
          icon="school"
          label="Minhas Aulas"
          class="tw-transition-transform active:tw-scale-95"
        />
        <q-route-tab
          to="/mapa"
          icon="explore"
          label="Mapa Campus"
          class="tw-transition-transform active:tw-scale-95"
        />
        <q-route-tab
          to="/sala"
          icon="pin"
          label="Entrar na Sala"
          class="tw-transition-transform active:tw-scale-95"
        />
        <q-route-tab
          to="/privacidade-seguranca"
          icon="person"
          label="Perfil"
          class="tw-transition-transform active:tw-scale-95"
        />
      </template>

      <!-- Abas para Professor -->
      <template v-else-if="isProfessor">
        <q-route-tab
          to="/dashboard"
          icon="dashboard"
          label="Painel"
          class="tw-transition-transform active:tw-scale-95"
        />
        <q-route-tab
          to="/disciplinas"
          icon="library_books"
          label="Turmas"
          class="tw-transition-transform active:tw-scale-95"
        />
        <q-route-tab
          to="/sala"
          icon="cast_for_education"
          label="Iniciar Aula"
          class="tw-transition-transform active:tw-scale-95"
        />
        <q-route-tab
          to="/mapa"
          icon="explore"
          label="Monitorias"
          class="tw-transition-transform active:tw-scale-95"
        />
        <q-route-tab
          to="/privacidade-seguranca"
          icon="person"
          label="Perfil"
          class="tw-transition-transform active:tw-scale-95"
        />
      </template>
    </q-tabs>
  </q-footer>
</template>
