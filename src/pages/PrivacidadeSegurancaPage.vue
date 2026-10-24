<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store';
import { useQuasar } from 'quasar';
import { supabaseClient } from '@/core/supabase/client';
import BaseSurfaceCard from '@/core/components/BaseSurfaceCard.vue';

const authStore = useAuthStore();
const $q = useQuasar();

function confirmDeleteAccount() {
  $q.dialog({
    title: 'Excluir Conta',
    message:
      'Tem certeza? Esta ação é irreversível. Para confirmar, digite exatamente "EXCLUIR MINHA CONTA" abaixo:',
    prompt: {
      model: '',
      type: 'text',
    },
    color: 'negative',
    cancel: true,
    persistent: true,
  }).onOk((data: string) => {
    if (data !== 'EXCLUIR MINHA CONTA') {
      $q.notify({
        color: 'warning',
        message: 'Frase de confirmação incorreta. Operação cancelada.',
      });
      return;
    }

    void (async () => {
      try {
        $q.loading.show({ message: 'Excluindo conta com segurança...' });
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

function getFallbackData() {
  if (!authStore.user) return null;
  return {
    titular: {
      id: authStore.user.auth.id,
      email: authStore.user.auth.email,
      nome_completo: authStore.user.perfil.nome_completo,
      papel: authStore.user.perfil.papel,
      criado_em: authStore.user.auth.created_at,
      termos_aceitos_em: authStore.user.perfil.termos_aceitos_em,
      versao_termos: authStore.user.perfil.versao_termos,
    },
    exportado_em: new Date().toISOString(),
  };
}

async function fetchFullUserData(): Promise<Record<string, unknown> | null> {
  try {
    const { data, error } = await supabaseClient.rpc('export_my_data');
    if (error || !data) {
      console.warn('[DSAR] Erro na RPC export_my_data, utilizando dados locais:', error);
      return getFallbackData();
    }
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    return parsed as Record<string, unknown>;
  } catch (err) {
    console.warn('[DSAR] Exceção ao consultar export_my_data:', err);
    return getFallbackData();
  }
}

async function exportDataJSON() {
  $q.loading.show({ message: 'Compilando seus dados...' });
  try {
    const dataToExport = await fetchFullUserData();
    if (!dataToExport) {
      $q.notify({ color: 'negative', message: 'Usuário não autenticado.' });
      return;
    }

    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
    triggerDownload(dataStr, 'meus_dados_ficou_claro.json');
  } finally {
    $q.loading.hide();
  }
}

function safeCsvVal(val: unknown): string {
  if (typeof val === 'string') return val.replace(/"/g, '""');
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  return '';
}

async function exportDataCSV() {
  $q.loading.show({ message: 'Compilando relatório em formato CSV...' });
  try {
    const fullData = await fetchFullUserData();
    if (!fullData) {
      $q.notify({ color: 'negative', message: 'Usuário não autenticado.' });
      return;
    }

    const lines: string[] = ['=== PERFIL DO TITULAR ===', 'Campo,Valor'];
    const titular = (fullData.titular as Record<string, unknown>) || {};
    for (const [k, v] of Object.entries(titular)) {
      lines.push(`"${k}","${safeCsvVal(v)}"`);
    }

    lines.push('', '=== MATRÍCULAS E DISCIPLINAS ===', 'Tipo,Nome,Curso,Semestre');
    const matriculas = (fullData.matriculas as Array<Record<string, unknown>>) || [];
    for (const m of matriculas) {
      lines.push(
        `"Aluno","${safeCsvVal(m.disciplina_nome)}","${safeCsvVal(m.curso)}","${safeCsvVal(m.semestre)}"`,
      );
    }
    const lecionadas = (fullData.disciplinas_lecionadas as Array<Record<string, unknown>>) || [];
    for (const d of lecionadas) {
      lines.push(
        `"Professor","${safeCsvVal(d.nome)}","${safeCsvVal(d.curso)}","${safeCsvVal(d.semestre)}"`,
      );
    }

    lines.push('', '=== DÚVIDAS SUBMETIDAS ===', 'Texto,Votos,Respondida,Data');
    const duvidas = (fullData.duvidas_submetidas as Array<Record<string, unknown>>) || [];
    for (const dv of duvidas) {
      const resp = dv.foi_respondida ? 'Sim' : 'Não';
      lines.push(
        `"${safeCsvVal(dv.texto)}","${safeCsvVal(dv.votos)}","${resp}","${safeCsvVal(dv.created_at)}"`,
      );
    }

    lines.push('', '=== GRUPOS DE ESTUDO ===', 'Grupo,Papel,Instituição,Campus');
    const criados = (fullData.grupos_estudo_criados as Array<Record<string, unknown>>) || [];
    for (const g of criados) {
      lines.push(
        `"${safeCsvVal(g.nome)}","Criador","${safeCsvVal(g.instituicao)}","${safeCsvVal(g.campus)}"`,
      );
    }
    const membro = (fullData.grupos_membro as Array<Record<string, unknown>>) || [];
    for (const gm of membro) {
      const papel = gm.is_monitor ? 'Monitor' : 'Membro';
      lines.push(`"${safeCsvVal(gm.grupo_nome)}","${papel}","",""`);
    }

    const csvContent = lines.join('\n');
    const dataStr = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    triggerDownload(dataStr, 'meus_dados_ficou_claro.csv');
  } finally {
    $q.loading.hide();
  }
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
          A Lei Geral de Proteção de Dados (LGPD) garante a você o direito de saber quais dados
          temos sobre você. Baixe um relatório sanitizado com seu perfil completo.
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
          Ao excluir sua conta, todas as suas informações de perfil serão removidas de nossos
          servidores. Suas avaliações e dúvidas passadas serão mantidas, mas desvinculadas da sua
          identidade para garantir o anonimato histórico.
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
