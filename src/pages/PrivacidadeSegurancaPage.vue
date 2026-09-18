<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store';
import { useQuasar } from 'quasar';
import BaseSurfaceCard from '@/core/components/BaseSurfaceCard.vue';

const authStore = useAuthStore();
const $q = useQuasar();

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
        setTimeout(() => {
          window.location.href = '/'; // Hard reload após a notificação
        }, 800);
      } catch (error) {
        const err = error as Error;
        $q.notify({ color: 'negative', message: 'Erro ao excluir conta: ' + err.message });
      } finally {
        $q.loading.hide();
      }
    })();
  });
}

function exportData() {
  if (!authStore.user) {
    $q.notify({ color: 'negative', message: 'Usuário não autenticado.' });
    return;
  }

  // Gera o arquivo JSON com as informações que o app possui em authStore
  const dataToExport = {
    auth: authStore.user.auth,
    perfil: authStore.user.perfil,
    exported_at: new Date().toISOString(),
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute('href', dataStr);
  downloadAnchorNode.setAttribute('download', 'meus_dados_ficou_claro.json');
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();

  $q.notify({ color: 'positive', message: 'Download de dados iniciado com sucesso.' });
}
</script>

<template>
  <q-page class="tw-p-4 sm:tw-p-6 lg:tw-p-8 tw-max-w-4xl tw-mx-auto">
    <div class="tw-mb-8">
      <h1 class="tw-text-2xl sm:tw-text-3xl tw-font-bold tw-tracking-tight tw-mb-2">
        Privacidade e Segurança (LGPD)
      </h1>
      <p class="text-muted tw-text-lg">
        Gerencie seus dados, baixe suas informações ou exclua sua conta.
      </p>
    </div>

    <div class="tw-space-y-6">
      <BaseSurfaceCard class="tw-p-6">
        <h2 class="tw-text-xl tw-font-bold tw-mb-4">Seus Dados (Direito de Acesso)</h2>
        <p class="text-muted tw-mb-6">
          A Lei Geral de Proteção de Dados (LGPD) garante a você o direito de saber quais dados temos sobre você. 
          Baixe um relatório em formato estruturado (JSON) com seu perfil completo.
        </p>
        <q-btn
          color="primary"
          icon="download"
          label="Baixar Meus Dados (JSON)"
          unelevated
          no-caps
          @click="exportData"
        />
      </BaseSurfaceCard>

      <BaseSurfaceCard class="tw-p-6 tw-border-red-100 dark:tw-border-red-900/30">
        <h2 class="tw-text-xl tw-font-bold tw-text-red-600 dark:tw-text-red-400 tw-mb-4">
          Zona de Perigo (Direito ao Esquecimento)
        </h2>
        <p class="text-muted tw-mb-6">
          Ao excluir sua conta, todas as suas informações de perfil serão removidas de nossos servidores. 
          Suas avaliações e dúvidas passadas serão mantidas, mas desvinculadas da sua identidade para garantir o anonimato histórico.
        </p>
        <q-btn
          color="negative"
          icon="delete_forever"
          label="Excluir Minha Conta Definitivamente"
          unelevated
          no-caps
          @click="confirmDeleteAccount"
        />
      </BaseSurfaceCard>
    </div>
  </q-page>
</template>
