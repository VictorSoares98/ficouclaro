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

        <h2 class="tw-text-2xl tw-font-semibold tw-mt-8 tw-mb-4">2. Anonimização e Feedback</h2>
        <p>
          O sistema de "Termômetro" (sinais de ritmo) e o "Painel de Dúvidas" foram desenhados para
          proteger a identidade do aluno. Seus registros no banco de dados não vinculam diretamente
          sua identidade (ID de usuário) ao conteúdo da dúvida ou ao sinal emitido perante a visão
          do professor, garantindo um ambiente seguro para o aprendizado livre de julgamentos.
        </p>

        <h2 class="tw-text-2xl tw-font-semibold tw-mt-8 tw-mb-4">
          3. Seu Direito ao Esquecimento (Art. 18, VI)
        </h2>
        <p>
          Você tem o controle absoluto sobre seus dados. A qualquer momento, através das
          configurações do seu perfil, você pode acionar a opção "Excluir Minha Conta". Este
          processo apagará imediatamente seus dados pessoais (nome, e-mail e avatar) do nosso
          sistema de autenticação, anonimizando ou destruindo em cascata os registros atrelados.
        </p>

        <h2 class="tw-text-2xl tw-font-semibold tw-mt-8 tw-mb-4">4. Segurança dos Dados</h2>
        <p>
          Utilizamos o Supabase como nossa infraestrutura de backend. Toda comunicação é
          criptografada de ponta a ponta (HTTPS/WSS) e o acesso ao banco de dados é restrito por
          políticas severas de Row Level Security (RLS), o que significa que nenhum usuário possui
          permissão técnica para visualizar dados além daqueles aos quais foi autorizado.
        </p>

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
