<script setup lang="ts">
// Página Estática: Política de Privacidade
</script>

<template>
  <q-page class="tw-p-4 tw-max-w-4xl tw-mx-auto">
    <div class="tw-mt-8 tw-mb-12">
      <h1 class="tw-text-4xl tw-font-bold tw-mb-6 tw-text-primary">Política de Privacidade</h1>

      <div class="tw-text-lg text-muted tw-space-y-6">
        <p>
          A privacidade dos usuários da plataforma <strong>Ficou Claro?</strong> é uma prioridade.
          Esta política foi elaborada em conformidade com a Lei Geral de Proteção de Dados (LGPD -
          Lei nº 13.709/2018) para garantir transparência no tratamento de suas informações.
        </p>

        <h2 class="tw-text-2xl tw-font-semibold tw-mt-8 tw-mb-4">1. Dados Coletados</h2>
        <p>
          Em conformidade com o princípio da minimização de dados (Art. 6, III da LGPD), coletamos
          apenas o estritamente necessário para o funcionamento da plataforma:
        </p>
        <ul class="tw-list-disc tw-pl-6 tw-space-y-2">
          <li>
            <strong>Dados de Registro:</strong> Nome completo, endereço de e-mail e papel (Aluno ou
            Professor).
          </li>
          <li>
            <strong>Dados de Uso:</strong> Vínculo com turmas, interações de enquetes e hashes
            unidirecionais (SHA-256) gerados localmente para garantir o bloqueio contra votos
            múltiplos, sem identificar pessoalmente o votante no banco de dados aberto de dúvidas.
          </li>
        </ul>

        <h2 class="tw-text-2xl tw-font-semibold tw-mt-8 tw-mb-4">2. Terceiros e Suboperadores</h2>
        <p>
          Para entregar nossos serviços, utilizamos a infraestrutura técnica dos seguintes parceiros
          (que também possuem rígidas políticas de privacidade):
        </p>
        <ul class="tw-list-disc tw-pl-6 tw-space-y-2">
          <li>
            <strong>Supabase:</strong> Banco de dados e autenticação segura (criptografia em repouso
            e trânsito).
          </li>
          <li>
            <strong>Cloudflare / Vercel:</strong> Hospedagem e aceleração de entrega de conteúdo
            (CDN).
          </li>
          <li>
            <strong>Google Fontes/Ícones:</strong> Fornecimento de tipografia e recursos visuais.
          </li>
        </ul>

        <h2 class="tw-text-2xl tw-font-semibold tw-mt-8 tw-mb-4">
          3. Biometria e Processamento Local
        </h2>
        <p>
          Nossa plataforma oferece recursos avançados, como autenticação biométrica via WebAuthn.
          <strong
            >É crucial destacar que suas digitais ou face nunca saem do seu dispositivo.</strong
          >
          Todo o processamento biométrico (incluindo futuros recursos de análise de sentimento via
          Inteligência Artificial) ocorre 100% localmente no navegador ou celular (Edge Computing).
        </p>

        <h2 class="tw-text-2xl tw-font-semibold tw-mt-8 tw-mb-4">4. Seus Direitos (LGPD Hub)</h2>
        <p>
          Você tem controle absoluto sobre seus dados. Criamos uma seção dedicada ("Privacidade e
          Segurança") acessível pelo menu do seu perfil. Lá você pode:
        </p>
        <ul class="tw-list-disc tw-pl-6 tw-space-y-2">
          <li>
            <strong>Direito de Acesso:</strong> Baixar todos os seus dados em formato estruturado
            (JSON).
          </li>
          <li>
            <strong>Direito ao Esquecimento:</strong> Excluir sua conta definitivamente, apagando
            seu nome, e-mail e vinculações, mantendo apenas o histórico anônimo necessário para as
            métricas da turma.
          </li>
        </ul>

        <h2 class="tw-text-2xl tw-font-semibold tw-mt-8 tw-mb-4">5. Contato</h2>
        <p>
          Para exercer seus direitos como titular de dados ou esclarecer dúvidas sobre o tratamento
          de informações, entre em contato com o responsável legal pelo desenvolvimento do projeto.
        </p>
      </div>

      <div class="tw-mt-12 tw-flex tw-justify-start">
        <q-btn color="primary" unelevated icon="arrow_back" label="Voltar" to="/" no-caps />
      </div>
    </div>
  </q-page>
</template>
