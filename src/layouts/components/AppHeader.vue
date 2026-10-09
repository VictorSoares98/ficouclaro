<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store';
import { useQuasar } from 'quasar';
import AccessibilityMenu from '@/components/AccessibilityMenu.vue';

defineProps<{
  subtitle?: string;
  showProfileMenu?: boolean;
  showBrandingMenu?: boolean;
}>();

const authStore = useAuthStore();
const $q = useQuasar();

async function handleLogout() {
  try {
    await authStore.signOut();
    $q.notify({ color: 'positive', message: 'Sessão encerrada com sucesso!' });
    setTimeout(() => {
      window.location.href = '/login'; // Hard reload após a notificação redirecionando para login
    }, 500);
  } catch (error) {
    const err = error as Error;
    $q.notify({ color: 'negative', message: 'Erro ao sair: ' + err.message });
  }
}
</script>

<template>
  <q-header elevated class="tw-bg-primary tw-text-white tw-transition-colors tw-duration-300">
    <q-toolbar class="tw-h-16">
      <q-toolbar-title class="tw-font-bold tw-tracking-tight tw-text-white tw-text-2xl">
        Ficou Claro?
        <span v-if="subtitle" class="tw-text-sm tw-font-normal text-muted">| {{ subtitle }}</span>
      </q-toolbar-title>

      <!-- Accessibility Menu Unificado (Substitui o ThemeSwitcher antigo e os botões individuais) -->
      <AccessibilityMenu />

      <!-- Menu de Perfil (Áreas Restritas) -->
      <q-btn-dropdown
        v-if="showProfileMenu"
        flat
        round
        dense
        icon="person"
        class="tw-ml-2"
        color="white"
      >
        <q-list>
          <q-item clickable v-close-popup @click="handleLogout">
            <q-item-section avatar>
              <q-icon name="logout" />
            </q-item-section>
            <q-item-section>Sair</q-item-section>
          </q-item>
          <q-separator />
          <q-item clickable v-close-popup to="/privacidade-seguranca" class="tw-text-gray-700">
            <q-item-section avatar>
              <q-icon name="security" color="primary" />
            </q-item-section>
            <q-item-section>Privacidade e Segurança</q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </q-toolbar>
  </q-header>
</template>
