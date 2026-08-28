<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import ThemeSwitcher from '@/components/ThemeSwitcher.vue';

const authStore = useAuthStore();
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
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="tw-bg-primary tw-text-white">
      <q-toolbar>
        <q-toolbar-title class="tw-font-bold">
          Ficou Claro? <span class="tw-text-sm tw-font-normal tw-opacity-80">| Área do Aluno</span>
        </q-toolbar-title>
        <ThemeSwitcher />
        <q-btn-dropdown flat round dense icon="person" class="tw-ml-2">
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

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
