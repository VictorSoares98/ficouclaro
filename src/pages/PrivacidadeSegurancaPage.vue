<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store';
import { useQuasar } from 'quasar';
import BaseSurfaceCard from '@/core/components/BaseSurfaceCard.vue';

const authStore = useAuthStore();
const $q = useQuasar();

function confirmDeleteAccount() {
  $q.dialog({
    title: 'Excluir Conta',
    message: 'Tem certeza? Esta ação é irreversível. Para confirmar, digite exatamente "EXCLUIR MINHA CONTA" abaixo:',
    prompt: {
      model: '',
      type: 'text'
    },
    color: 'negative',
    cancel: true,
    persistent: true,
  }).onOk((data: string) => {
    if (data !== 'EXCLUIR MINHA CONTA') {
      $q.notify({ color: 'warning', message: 'Frase de confirmação incorreta. Operação cancelada.' });
      return;
    }

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

function getSanitizedData() {
  if (!authStore.user) return null;
  return {
    id: authStore.user.auth.id,
    email: authStore.user.auth.email,
    nome: authStore.user.perfil.nome_completo,
    papel: authStore.user.perfil.papel,
    criado_em: authStore.user.auth.created_at,
    termos_aceitos_em: authStore.user.perfil.termos_aceitos_em,
    versao_termos: authStore.user.perfil.versao_termos,
    exportado_em: new Date().toISOString(),
  };
}

function exportDataJSON() {
  const dataToExport = getSanitizedData();
  if (!dataToExport) {
    $q.notify({ color: 'negative', message: 'Usuário não autenticado.' });
    return;
  }

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
  triggerDownload(dataStr, 'meus_dados_ficou_claro.json');
}

function exportDataCSV() {
  const data = getSanitizedData();
  if (!data) {
    $q.notify({ color: 'negative', message: 'Usuário não autenticado.' });
    return;
  }

  const keys = Object.keys(data);
  const values = Object.values(data).map(v => `"${String(v || '').replace(/"/g, '""')}"`);
  const csvContent = `${keys.join(',')}\n${values.join(',')}`;

  const dataStr = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
  triggerDownload(dataStr, 'meus_dados_ficou_claro.csv');
}

function triggerDownload(href: string, filename: string) {
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute('href', href);
  downloadAnchorNode.setAttribute('download', filename);
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
          Baixe um relatório sanitizado com seu perfil completo.
        </p>
        <div class="tw-flex tw-gap-4 tw-flex-wrap">
          <q-btn
            color="primary"
            icon="data_object"
            label="Baixar Meus Dados (JSON)"
            unelevated
            no-caps
            @click="exportDataJSON"
          />
          <q-btn
            color="secondary"
            icon="table_view"
            label="Baixar Meus Dados (CSV)"
            unelevated
            no-caps
            @click="exportDataCSV"
          />
        </div>
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
