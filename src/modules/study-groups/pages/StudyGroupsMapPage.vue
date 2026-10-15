<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { gsap } from '@/boot/gsap';
import { useAuthStore } from '@/stores/auth.store';
import { useStudyGroupStore } from '../stores/study-group.store';
import LeafletMapCore from '../components/LeafletMapCore.vue';
import StudyGroupFloatingSidebar from '../components/StudyGroupFloatingSidebar.vue';
import AccessibilityMenu from '@/components/AccessibilityMenu.vue';

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();
const store = useStudyGroupStore();

const mapCoreRef = ref<InstanceType<typeof LeafletMapCore> | null>(null);
const isSidebarCollapsed = ref(false);

function toggleSidebar() {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
  gsap.to('.floating-panel', {
    x: isSidebarCollapsed.value ? '-100%' : 0,
    duration: 0.5,
    ease: 'power3.inOut',
    onComplete: () => {
      mapCoreRef.value?.invalidateSize();
    },
  });
}

// Abre o painel no desktop se o usuário selecionar um grupo no mapa
watch(
  () => store.selectedGroup,
  (newGroup) => {
    if (newGroup && isSidebarCollapsed.value) {
      isSidebarCollapsed.value = false;
      gsap.to('.floating-panel', {
        x: 0,
        duration: 0.5,
        ease: 'power3.out',
        onComplete: () => {
          mapCoreRef.value?.invalidateSize();
        },
      });
    }
  },
);

// Reseta o estado horizontal do GSAP caso o usuário redimensione para mobile
watch(
  () => $q.screen.lt.md,
  (isMobile) => {
    if (isMobile && isSidebarCollapsed.value) {
      isSidebarCollapsed.value = false;
      gsap.set('.floating-panel', { x: 0 });
    }
  },
);

onMounted(() => {
  void nextTick(() => {
    // GSAP: Animação suave de entrada do painel flutuante
    gsap.fromTo(
      '.floating-panel',
      { x: -50, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.2 },
    );
  });
});

function handleCreateGroupClick() {
  if (!authStore.isAuthenticated) {
    $q.dialog({
      title: 'Identificação Necessária',
      message:
        'Para criar um grupo de estudo ou monitoria no seu campus, é necessário entrar na sua conta.',
      ok: { label: 'Entrar na Plataforma', color: 'primary', unelevated: true },
      cancel: { label: 'Cancelar', flat: true, color: 'grey-7' },
    }).onOk(() => {
      void router.push('/login?redirect=/mapa');
    });
    return;
  }

  $q.notify({
    type: 'info',
    message: 'Módulo de cadastro de grupos em desenvolvimento para a próxima fase.',
    position: 'top',
  });
}
</script>

<template>
  <q-page class="tw-relative tw-w-full tw-h-screen tw-overflow-hidden">
    <!-- 1. Núcleo do Mapa Leaflet em Tela Cheia -->
    <LeafletMapCore ref="mapCoreRef" />

    <!-- 2. Header Flutuante Translúcido (Espelho da arquitetura do Find My Pockets) -->
    <header
      class="tw-absolute tw-top-0 tw-left-0 tw-w-full tw-z-[1000] tw-px-4 sm:tw-px-6 tw-pb-4 tw-flex tw-justify-between tw-items-center tw-pointer-events-none md:tw-px-8"
      style="padding-top: calc(1rem + env(safe-area-inset-top, 0px))"
    >
      <q-card
        class="tw-pointer-events-auto tw-backdrop-blur-md tw-px-4 tw-py-2 tw-rounded-2xl tw-shadow-lg"
      >
        <h1 class="text-h6 text-weight-bold tw-font-space-grotesk tw-m-0 tw-leading-none">
          FICOU <span class="text-primary">CLARO?</span>
        </h1>
      </q-card>

      <!-- Ações Rápidas na Direita -->
      <div class="tw-pointer-events-auto tw-flex tw-items-center tw-gap-2">
        <q-card
          flat
          bordered
          class="tw-p-1 tw-rounded-2xl tw-shadow-lg tw-flex tw-items-center tw-gap-1.5 tw-backdrop-blur-md"
        >
          <!-- Botão Voltar ao Início -->
          <q-btn
            flat
            round
            dense
            icon="home"
            color="primary"
            to="/"
            aria-label="Voltar à Página Inicial"
          >
            <q-tooltip class="tw-text-xs">Voltar ao Início</q-tooltip>
          </q-btn>

          <!-- Menu de Acessibilidade -->
          <AccessibilityMenu />
        </q-card>

        <!-- Botão Criar Grupo (Destaque Principal) -->
        <q-btn
          unelevated
          color="primary"
          icon="add"
          label="Criar Grupo"
          no-caps
          class="tw-rounded-2xl tw-font-bold tw-text-xs sm:tw-text-sm tw-shadow-xl tw-h-10 tw-px-3.5 sm:tw-px-4"
          @click="handleCreateGroupClick"
        />
      </div>
    </header>

    <!-- 3. Painel Lateral/Inferior Flutuante (Filtros e Resultados) -->
    <div
      class="tw-absolute tw-z-[1000] tw-pointer-events-none floating-panel tw-bottom-0 tw-left-0 tw-w-full tw-h-[calc(100dvh-env(safe-area-inset-top,0px)-60px)] md:tw-top-24 md:tw-bottom-auto md:tw-left-6 md:tw-w-full md:tw-max-w-[492px] md:tw-h-[calc(100vh-8rem)] tw-flex tw-items-end md:tw-items-center"
    >
      <StudyGroupFloatingSidebar class="tw-pointer-events-auto tw-w-full tw-h-full" />

      <!-- Botão de Ocultar/Mostrar Aba (Tablet e Desktop) -->
      <q-btn
        round
        :icon="isSidebarCollapsed ? 'chevron_right' : 'chevron_left'"
        color="white"
        text-color="primary"
        class="tw-absolute -tw-right-5 tw-pointer-events-auto tw-shadow-lg tw-hidden md:tw-flex tw-transition-transform tw-duration-300 hover:tw-scale-110"
        style="width: 40px; height: 40px"
        :aria-label="isSidebarCollapsed ? 'Expandir painel lateral' : 'Recolher painel lateral'"
        @click="toggleSidebar"
      />
    </div>
  </q-page>
</template>
