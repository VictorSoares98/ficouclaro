<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import AccessibilityMenu from '@/components/AccessibilityMenu.vue';
import NavbarUserBadge from '@/components/navbar/NavbarUserBadge.vue';
import NavbarMobileDrawer from '@/components/navbar/NavbarMobileDrawer.vue';

defineProps<{
  subtitle?: string;
  showProfileMenu?: boolean;
  showBrandingMenu?: boolean;
}>();

const authStore = useAuthStore();
const isDrawerOpen = ref(false);

const isAuthenticated = computed(() => authStore.isAuthenticated);
const isProfessor = computed(() => authStore.isProfessor);
const isAluno = computed(() => authStore.isAluno);
</script>

<template>
  <q-header
    class="tw-backdrop-blur-xl tw-bg-surface/80 dark:tw-bg-dark-page/80 tw-text-gray-900 dark:tw-text-white tw-border-b tw-border-white/10 tw-shadow-sm tw-transition-colors tw-duration-300"
    style="padding-top: env(safe-area-inset-top, 0px)"
  >
    <q-toolbar
      class="tw-h-16 tw-max-w-7xl tw-mx-auto tw-px-4 sm:tw-px-6 md:tw-px-8 tw-flex tw-items-center tw-justify-between"
    >
      <!-- 1. Esquerda: Logotipo Institucional com Tipografia Space Grotesk -->
      <div class="tw-flex tw-items-center tw-gap-3">
        <router-link
          to="/"
          class="tw-flex tw-items-center tw-gap-2 tw-text-inherit tw-no-underline focus:tw-outline-none"
          aria-label="Página Inicial do Ficou Claro"
        >
          <div
            class="tw-w-9 tw-h-9 tw-rounded-xl tw-bg-primary/10 tw-text-primary tw-flex tw-items-center tw-justify-center tw-shadow-sm"
          >
            <q-icon name="lightbulb" size="20px" />
          </div>
          <div class="tw-flex tw-flex-col">
            <span
              class="text-subtitle1 sm:text-h6 text-weight-bold tw-font-space-grotesk tw-leading-none tw-tracking-tight"
            >
              FICOU <span class="text-primary">CLARO?</span>
            </span>
            <span v-if="subtitle" class="tw-text-[10px] text-muted tw-leading-tight tw-font-medium">
              {{ subtitle }}
            </span>
          </div>
        </router-link>
      </div>

      <!-- 2. Centro: Navegação Primária por Papel (Apenas Desktop / gt-sm) -->
      <nav class="tw-hidden md:tw-flex tw-items-center tw-gap-1 lg:tw-gap-2">
        <!-- Navegação para Visitante (Não Autenticado) -->
        <template v-if="!isAuthenticated">
          <q-btn
            flat
            no-caps
            to="/"
            label="Início"
            class="tw-rounded-xl tw-px-3.5 tw-py-1.5 tw-text-xs sm:tw-text-sm tw-font-semibold hover:tw-bg-primary/10 hover:tw-text-primary tw-transition-all"
          />
          <q-btn
            flat
            no-caps
            to="/mapa"
            class="tw-rounded-xl tw-px-3.5 tw-py-1.5 tw-text-xs sm:tw-text-sm tw-font-semibold hover:tw-bg-primary/10 hover:tw-text-primary tw-transition-all"
          >
            <div class="tw-flex tw-items-center tw-gap-1.5">
              <q-icon name="explore" size="16px" color="primary" />
              <span>Mapa de Monitorias</span>
              <q-badge color="primary" rounded class="tw-text-[9px] tw-ml-0.5">Novo ✨</q-badge>
            </div>
          </q-btn>
          <q-btn
            flat
            no-caps
            to="/sala"
            label="Entrar em Aula"
            icon="meeting_room"
            class="tw-rounded-xl tw-px-3.5 tw-py-1.5 tw-text-xs sm:tw-text-sm tw-font-semibold hover:tw-bg-primary/10 hover:tw-text-primary tw-transition-all"
          />
        </template>

        <!-- Navegação para Aluno -->
        <template v-else-if="isAluno">
          <q-btn
            flat
            no-caps
            to="/hub"
            label="Meu Hub de Aulas"
            icon="school"
            class="tw-rounded-xl tw-px-3.5 tw-py-1.5 tw-text-xs sm:tw-text-sm tw-font-semibold hover:tw-bg-primary/10 hover:tw-text-primary tw-transition-all"
          />
          <q-btn
            flat
            no-caps
            to="/mapa"
            class="tw-rounded-xl tw-px-3.5 tw-py-1.5 tw-text-xs sm:tw-text-sm tw-font-semibold hover:tw-bg-primary/10 hover:tw-text-primary tw-transition-all"
          >
            <div class="tw-flex tw-items-center tw-gap-1.5">
              <q-icon name="explore" size="16px" color="primary" />
              <span>Mapa do Campus</span>
            </div>
          </q-btn>
          <q-btn
            flat
            no-caps
            to="/sala"
            label="Entrar na Sala"
            icon="pin"
            class="tw-rounded-xl tw-px-3.5 tw-py-1.5 tw-text-xs sm:tw-text-sm tw-font-semibold hover:tw-bg-primary/10 hover:tw-text-primary tw-transition-all"
          />
        </template>

        <!-- Navegação para Professor -->
        <template v-else-if="isProfessor">
          <q-btn
            flat
            no-caps
            to="/dashboard"
            label="Dashboard Geral"
            icon="dashboard"
            class="tw-rounded-xl tw-px-3.5 tw-py-1.5 tw-text-xs sm:tw-text-sm tw-font-semibold hover:tw-bg-secondary/10 hover:tw-text-secondary tw-transition-all"
          />
          <q-btn
            flat
            no-caps
            to="/disciplinas"
            label="Minhas Turmas"
            icon="library_books"
            class="tw-rounded-xl tw-px-3.5 tw-py-1.5 tw-text-xs sm:tw-text-sm tw-font-semibold hover:tw-bg-secondary/10 hover:tw-text-secondary tw-transition-all"
          />
          <q-btn
            flat
            no-caps
            to="/sala"
            label="Iniciar Sessão"
            icon="cast_for_education"
            class="tw-rounded-xl tw-px-3.5 tw-py-1.5 tw-text-xs sm:tw-text-sm tw-font-semibold hover:tw-bg-secondary/10 hover:tw-text-secondary tw-transition-all"
          />
          <q-btn
            flat
            no-caps
            to="/mapa"
            label="Monitorias"
            icon="explore"
            class="tw-rounded-xl tw-px-3.5 tw-py-1.5 tw-text-xs sm:tw-text-sm tw-font-semibold hover:tw-bg-secondary/10 hover:tw-text-secondary tw-transition-all"
          />
        </template>
      </nav>

      <!-- 3. Direita: Acessibilidade, Perfil Gamificado e Ações Rápidas -->
      <div class="tw-flex tw-items-center tw-gap-2 sm:tw-gap-3">
        <!-- Menu Unificado de Acessibilidade -->
        <AccessibilityMenu />

        <!-- Usuário Autenticado: Badge Gamificado com Avatar e Dropdown -->
        <NavbarUserBadge v-if="isAuthenticated" />

        <!-- Usuário Visitante (Não Autenticado) -->
        <div v-else class="tw-hidden sm:tw-flex tw-items-center tw-gap-2">
          <q-btn
            flat
            no-caps
            to="/login"
            label="Entrar"
            class="tw-rounded-xl tw-px-3.5 tw-h-9 tw-text-xs sm:tw-text-sm tw-font-bold hover:tw-bg-white/10 tw-transition-colors"
          />
          <q-btn
            unelevated
            no-caps
            color="primary"
            to="/register"
            label="Começar Grátis"
            class="tw-rounded-xl tw-px-4 tw-h-9 tw-text-xs sm:tw-text-sm tw-font-bold tw-shadow-md hover:tw-scale-105 tw-transition-transform"
          />
        </div>

        <!-- Botão Menu Hambúrguer para Telas Móveis e Tablets (lt-md) -->
        <q-btn
          flat
          round
          dense
          icon="menu"
          color="inherit"
          class="md:tw-hidden tw-ml-1"
          aria-label="Abrir menu de navegação"
          @click="isDrawerOpen = true"
        />
      </div>
    </q-toolbar>

    <!-- Gaveta Off-Canvas para Navegação Móvel e Suplementar -->
    <NavbarMobileDrawer v-model="isDrawerOpen" />
  </q-header>
</template>
