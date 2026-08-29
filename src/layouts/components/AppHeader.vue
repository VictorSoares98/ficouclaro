<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store';
import { useThemeStore } from '@/stores/theme.store';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import ThemeSwitcher from '@/components/ThemeSwitcher.vue';
import BaseIconButton from '@/core/components/BaseIconButton.vue';

defineProps<{
  subtitle?: string;
  showProfileMenu?: boolean;
  showBrandingMenu?: boolean;
}>();

const authStore = useAuthStore();
const themeStore = useThemeStore();
const router = useRouter();
const $q = useQuasar();

async function handleLogout() {
  try {
    await authStore.signOut();
    $q.notify({ color: 'positive', message: 'Sessão encerrada com sucesso!' });
    await router.push('/');
  } catch (error) {
    const err = error as Error;
    $q.notify({ color: 'negative', message: 'Erro ao sair: ' + err.message });
  }
}

function confirmDeleteAccount() {
  $q.dialog({
    title: 'Excluir Conta',
    message: 'Tem certeza? Esta ação é irreversível e apagará todos os seus dados da plataforma.',
    color: 'negative',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        $q.loading.show({ message: 'Excluindo conta...' });
        await authStore.deleteAccount();
        $q.notify({ color: 'positive', message: 'Conta excluída com sucesso.' });
        await router.push('/');
      } catch (error) {
        const err = error as Error;
        $q.notify({ color: 'negative', message: 'Erro ao excluir conta: ' + err.message });
      } finally {
        $q.loading.hide();
      }
    })();
  });
}
</script>

<template>
  <q-header elevated class="tw-bg-primary tw-text-white tw-transition-colors tw-duration-300">
    <q-toolbar class="tw-h-16">
      <q-toolbar-title class="tw-font-bold tw-tracking-tight tw-text-white tw-text-2xl">
        Ficou Claro?
        <span v-if="subtitle" class="tw-text-sm tw-font-normal text-muted">| {{ subtitle }}</span>
      </q-toolbar-title>

      <!-- Dropdown de Temas (Branding) -->
      <q-btn-dropdown
        v-if="showBrandingMenu"
        flat
        dense
        color="white"
        icon="palette"
        class="tw-mr-2"
        aria-label="Selecionar Marca"
      >
        <q-list>
          <q-item
            clickable
            v-close-popup
            @click="themeStore.setTheme('default')"
            :active="themeStore.activeTheme === 'default'"
          >
            <q-item-section>Default (Azul)</q-item-section>
          </q-item>
          <q-item
            clickable
            v-close-popup
            @click="themeStore.setTheme('ocean')"
            :active="themeStore.activeTheme === 'ocean'"
          >
            <q-item-section>Ocean (Ciano)</q-item-section>
          </q-item>
          <q-item
            clickable
            v-close-popup
            @click="themeStore.setTheme('dracula')"
            :active="themeStore.activeTheme === 'dracula'"
          >
            <q-item-section>Dracula (Roxo)</q-item-section>
          </q-item>
          <q-item
            clickable
            v-close-popup
            @click="themeStore.setTheme('summer_berries')"
            :active="themeStore.activeTheme === 'summer_berries'"
          >
            <q-item-section>Amoras do Verão</q-item-section>
          </q-item>
          <q-item
            clickable
            v-close-popup
            @click="themeStore.setTheme('lunar_twilight')"
            :active="themeStore.activeTheme === 'lunar_twilight'"
          >
            <q-item-section>Crepúsculo Lunar</q-item-section>
          </q-item>
          <q-item
            clickable
            v-close-popup
            @click="themeStore.setTheme('nature_terrain')"
            :active="themeStore.activeTheme === 'nature_terrain'"
          >
            <q-item-section>Natura e Terreno</q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>

      <!-- Theme Switcher Geral (Usado nas Áreas Restritas) -->
      <ThemeSwitcher v-if="!showBrandingMenu" />

      <!-- Toggle Simples de Iluminação (Usado na Área Pública) -->
      <BaseIconButton
        v-if="showBrandingMenu"
        :icon="
          themeStore.activeMode === 'dark'
            ? 'dark_mode'
            : themeStore.activeMode === 'light'
              ? 'light_mode'
              : 'brightness_auto'
        "
        @click="themeStore.toggleMode()"
        color="white"
        ariaLabel="Alternar Iluminação"
      >
        <q-tooltip>Iluminação: {{ themeStore.activeMode }}</q-tooltip>
      </BaseIconButton>

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
          <q-item clickable v-close-popup @click="confirmDeleteAccount" class="text-negative">
            <q-item-section avatar>
              <q-icon name="delete_forever" color="negative" />
            </q-item-section>
            <q-item-section>Excluir Minha Conta</q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </q-toolbar>
  </q-header>
</template>
