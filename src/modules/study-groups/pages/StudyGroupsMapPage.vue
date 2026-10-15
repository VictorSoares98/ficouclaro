<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from '@/stores/auth.store';
import LeafletMapCore from '../components/LeafletMapCore.vue';
import StudyGroupFloatingSidebar from '../components/StudyGroupFloatingSidebar.vue';
import AccessibilityMenu from '@/components/AccessibilityMenu.vue';

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();
const mapCoreRef = ref<InstanceType<typeof LeafletMapCore> | null>(null);

function handleSidebarToggle() {
  setTimeout(() => {
    mapCoreRef.value?.invalidateSize();
  }, 350);
}

function handleCreateGroupClick() {
  if (!authStore.isAuthenticated) {
    $q.dialog({
      title: 'Identificação Necessária',
      message: 'Para criar um grupo de estudo ou monitoria no seu campus, é necessário entrar na sua conta.',
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

    <!-- 2. Barra Superior Flutuante: Ações Rápidas à Direita em q-card nativo -->
    <div class="tw-absolute tw-top-4 tw-right-4 tw-z-20 tw-flex tw-items-center tw-gap-2">
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

    <!-- 3. Gaveta Lateral Flutuante com Busca e Listagem de Grupos -->
    <StudyGroupFloatingSidebar @toggle="handleSidebarToggle" />
  </q-page>
</template>
