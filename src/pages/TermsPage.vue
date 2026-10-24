<script setup lang="ts">
// Página Estática: Termos de Uso (Versão 1.0.0)
</script>

<template>
  <q-page class="tw-p-4 tw-max-w-4xl tw-mx-auto">
    <div class="tw-mt-8 tw-mb-12">
      <h1 class="tw-text-2xl sm:tw-text-3xl tw-font-bold tw-mb-6 tw-text-primary">Termos de Uso</h1>

      <div class="tw-text-base text-muted tw-space-y-6">
        <p>
          Bem-vindo ao <strong>Ficou Claro?</strong>. Ao criar uma conta ou utilizar nossa
          plataforma em salas de aula e atividades acadêmicas, você concorda expressamente com os
          termos e condições descritos abaixo. Leia-os atentamente antes de prosseguir.
        </p>

        <h2 class="tw-text-xl tw-font-semibold tw-mt-8 tw-mb-4">
          1. Propósito Educacional Exclusivo
        </h2>
        <p>
          O <strong>Ficou Claro?</strong> é uma ferramenta pedagógica criada para fomentar a
          aprendizagem ativa, o feedback síncrono e o mapeamento de espaços de estudo no campus. É
          estritamente vedada a utilização da plataforma para finalidades comerciais, políticas ou
          qualquer prática que viole os regulamentos disciplinares das instituições de ensino.
        </p>

        <h2 class="tw-text-xl tw-font-semibold tw-mt-8 tw-mb-4">
          2. Cadastro e Responsabilidade pelas Credenciais
        </h2>
        <p>
          Você é o único responsável pela guarda e confidencialidade de suas credenciais de acesso
          (e-mail, senha e tokens de sessão). Toda e qualquer ação realizada a partir de sua conta
          autenticada será de sua integral responsabilidade. O fornecimento deliberado de dados
          falsos resultará na rescisão do acesso.
        </p>

        <h2 class="tw-text-xl tw-font-semibold tw-mt-8 tw-mb-4">
          3. Código de Conduta e Moderação Automatizada
        </h2>
        <p>
          Ainda que as dúvidas e os votos de ritmo sejam anônimos perante a turma e o professor para
          assegurar a segurança psicológica, a plataforma implementa
          <strong>regras estritas de moderação em tempo real</strong>. O envio de mensagens com teor
          ofensivo, discriminatório, assédio, incitação à violência ou divulgação não autorizada de
          dados pessoais de terceiros resultará no bloqueio automático da mensagem, aplicação de
          <em>strikes</em> e eventual suspensão ou banimento da conta do infrator.
        </p>

        <h2 class="tw-text-xl tw-font-semibold tw-mt-8 tw-mb-4">
          4. Disponibilidade do Serviço (SLA)
        </h2>
        <p>
          Na qualidade de aplicação em desenvolvimento contínuo (MVP), o serviço é disponibilizado
          "no estado em que se encontra" (<em>as is</em>), podendo sofrer interrupções temporárias
          para manutenção ou atualizações técnicas sem aviso prévio prolongado.
        </p>

        <h2 class="tw-text-xl tw-font-semibold tw-mt-8 tw-mb-4">
          5. Propriedade Intelectual e Dados
        </h2>
        <p>
          O código-fonte, arquitetura, marcas e identidade visual do <strong>Ficou Claro?</strong>
          pertencem aos seus respectivos desenvolvedores. Os conteúdos pedagógicos gerados pelos
          professores (enquetes, perguntas e disciplinas) permanecem sob a titularidade de seus
          autores, sendo concedida à plataforma apenas a licença necessária para viabilizar as
          aulas.
        </p>

        <h2 class="tw-text-xl tw-font-semibold tw-mt-8 tw-mb-4">
          6. Alterações nos Termos e Notificação
        </h2>
        <p>
          Estes Termos podem ser revisados periodicamente para refletir evoluções da legislação ou
          novas funcionalidades. Quando ocorrerem alterações materiais, a plataforma solicitará um
          novo consentimento formal (<em>re-consent</em>) no próximo acesso do usuário.
        </p>
      </div>

      <div class="tw-mt-12 tw-flex tw-justify-start">
        <q-btn
          color="primary"
          unelevated
          icon="arrow_back"
          label="Voltar"
          @click="$router.back()"
          no-caps
        />
      </div>
    </div>
  </q-page>
</template>
