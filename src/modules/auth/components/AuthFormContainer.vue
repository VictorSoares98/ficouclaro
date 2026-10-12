<script setup lang="ts">
import { useRoute } from 'vue-router';
import AuthArtworkPanel from './AuthArtworkPanel.vue';
import AccessibilityMenu from '@/components/AccessibilityMenu.vue';

defineProps<{
  title: string;
  subtitle: string;
  isLoading?: boolean;
}>();

const route = useRoute();
</script>

<template>
  <q-page class="tw-flex tw-min-h-screen tw-w-full">
    <!-- Lado Esquerdo: Formulários de Autenticação (Mobile: 100%, Desktop: 5/12) -->
    <div
      class="tw-w-full lg:tw-w-5/12 tw-flex tw-flex-col tw-justify-center tw-items-center tw-py-4 sm:tw-py-6 tw-px-6 sm:tw-px-10 xl:tw-px-14 tw-relative tw-z-10 tw-border-r tw-border-gray-200 dark:tw-border-gray-800"
    >
      <div class="tw-w-full tw-max-w-md tw-flex tw-flex-col tw-my-auto">
        <!-- Barra de Topo: Voltar ao Início e Menu de Acessibilidade -->
        <div class="tw-flex tw-items-center tw-justify-between tw-mb-3 sm:tw-mb-4">
          <q-btn
            flat
            dense
            icon="arrow_back"
            color="primary"
            label="Voltar ao início"
            to="/"
            class="tw-rounded-xl tw-px-2 tw--ml-2 tw-text-xs sm:tw-text-sm"
            no-caps
          />

          <AccessibilityMenu />
        </div>

        <!-- Título e Subtítulo -->
        <div class="tw-mb-3 sm:tw-mb-4">
          <h1 class="tw-text-xl sm:tw-text-2xl tw-font-bold tw-mb-1 tw-tracking-tight">
            {{ title }}
          </h1>
          <p class="text-muted tw-text-xs sm:tw-text-sm">
            {{ subtitle }}
          </p>
        </div>

        <!-- Abas Modernas (Entrar / Criar Conta) com Indicador Animado -->
        <div class="tw-flex tw-mb-4 sm:tw-mb-5 tw-border-b tw-border-gray-200 dark:tw-border-gray-800">
          <router-link
            to="/login"
            :class="[
              'tw-flex-1 tw-py-2 tw-text-sm sm:tw-text-base tw-font-semibold tw-transition-colors tw-relative tw-text-center',
              route.path === '/login' ? 'tw-text-primary' : 'text-muted hover:tw-text-primary',
            ]"
          >
            Entrar
            <div
              v-if="route.path === '/login'"
              class="tw-absolute tw-bottom-0 tw-left-0 tw-w-full tw-h-0.5 sm:tw-h-1 tw-bg-primary tw-rounded-t-full"
            ></div>
          </router-link>

          <router-link
            to="/register"
            :class="[
              'tw-flex-1 tw-py-2 tw-text-sm sm:tw-text-base tw-font-semibold tw-transition-colors tw-relative tw-text-center',
              route.path === '/register' ? 'tw-text-primary' : 'text-muted hover:tw-text-primary',
            ]"
          >
            Criar Conta
            <div
              v-if="route.path === '/register'"
              class="tw-absolute tw-bottom-0 tw-left-0 tw-w-full tw-h-0.5 sm:tw-h-1 tw-bg-primary tw-rounded-t-full"
            ></div>
          </router-link>
        </div>

        <!-- Conteúdo do Formulário -->
        <div class="tw-relative">
          <slot></slot>

          <q-inner-loading :showing="isLoading">
            <q-spinner-gears size="2.5rem" color="primary" />
          </q-inner-loading>
        </div>

        <!-- Rodapé opcional -->
        <div v-if="$slots.footer" class="tw-mt-4 tw-text-center">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>

    <!-- Lado Direito: Artwork & Glassmorphism Social Proof -->
    <AuthArtworkPanel />
  </q-page>
</template>
