<script setup lang="ts">
// Página Estática: Política de Privacidade (Conformidade LGPD)
</script>

<template>
  <q-page class="tw-p-4 tw-max-w-4xl tw-mx-auto">
    <div class="tw-mt-8 tw-mb-12">
      <h1 class="tw-text-2xl sm:tw-text-3xl tw-font-bold tw-mb-6 tw-text-primary">
        Política de Privacidade
      </h1>

      <div class="tw-text-base text-muted tw-space-y-6">
        <p>
          A privacidade e a proteção de dados dos estudantes, docentes e da comunidade acadêmica no
          <strong>Ficou Claro?</strong> são preceitos inegociáveis. Esta política foi estruturada em
          estrita consonância com a Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº
          13.709/2018) e com as melhores práticas de <em>Privacy by Design</em>.
        </p>

        <h2 class="tw-text-xl tw-font-semibold tw-mt-8 tw-mb-4">
          1. Bases Legais de Tratamento (Art. 7º da LGPD)
        </h2>
        <p>
          O tratamento de seus dados pessoais ocorre exclusivamente sob as seguintes hipóteses
          legais:
        </p>
        <ul class="tw-list-disc tw-pl-6 tw-space-y-2">
          <li>
            <strong>Execução de Contrato (Art. 7º, V):</strong> Para disponibilizar o acesso ao
            sistema, autenticação de usuário, vinculação de disciplinas e participação em salas de
            aula ativas.
          </li>
          <li>
            <strong>Consentimento Explícito (Art. 7º, I):</strong> Para o envio opcional de dúvidas
            identificadas nominalmente, avaliações com autoria e adesão aos termos de serviço.
          </li>
          <li>
            <strong>Legítimo Interesse (Art. 7º, IX):</strong> Para produção de estatísticas
            agregadas e anônimas de aprendizagem (termômetro e ritmo de aula), moderação contra
            assédio e garantia da segurança cibernética da infraestrutura.
          </li>
        </ul>

        <h2 class="tw-text-xl tw-font-semibold tw-mt-8 tw-mb-4">
          2. Dados Pessoais Coletados e Minimização
        </h2>
        <p>
          Em observância ao princípio da necessidade e minimização de dados (Art. 6º, III), tratamos
          apenas o estritamente necessário para viabilizar as atividades educacionais:
        </p>
        <ul class="tw-list-disc tw-pl-6 tw-space-y-2">
          <li>
            <strong>Dados Cadastrais:</strong> Nome completo, endereço de e-mail institucional ou
            pessoal, papel acadêmico (Aluno ou Professor) e avatar visual.
          </li>
          <li>
            <strong>Dados de Navegação e Interação:</strong> Matrículas em turmas, presenças em
            encontros de estudo e metadados de auditoria.
          </li>
          <li>
            <strong>Dados Pseudonimizados / Anônimos:</strong> Votos em enquetes, telemetria do
            termômetro de aula e upvotes em dúvidas utilizam hashes criptográficos unidirecionais
            (HMAC-SHA256), impedindo a correlação direta entre o voto e a identidade do aluno
            perante o corpo docente.
          </li>
        </ul>

        <h2 class="tw-text-xl tw-font-semibold tw-mt-8 tw-mb-4">
          3. Suboperadores e Transferência Internacional de Dados
        </h2>
        <p>
          Para assegurar alta disponibilidade e resiliência, compartilhamos dados com provedores de
          tecnologia especializados que adotam rigorosos padrões de segurança:
        </p>
        <ul class="tw-list-disc tw-pl-6 tw-space-y-2">
          <li>
            <strong>Supabase Inc.:</strong> Hospedagem do banco de dados relacional (PostgreSQL),
            gerenciamento de sessões JWT e canais WebSockets (Servidores nos EUA/UE com Cláusulas
            Padrão Contratuais).
          </li>
          <li>
            <strong>Google LLC:</strong> Provedor de autenticação federada (OAuth 2.0 / OpenID
            Connect) caso opte pelo login social com sua conta Google.
          </li>
          <li>
            <strong>Cloudflare Inc. / Vercel:</strong> Rede de Distribuição de Conteúdo (CDN) e
            proteção contra ataques distribuídos de negação de serviço.
          </li>
          <li>
            <strong>OpenStreetMap Foundation:</strong> Fornecimento dos blocos cartográficos (tiles)
            para a localização física de monitorias e salas de estudo.
          </li>
          <li>
            <strong>Governo Federal do Brasil (VLibras):</strong> Módulo público de acessibilidade
            digital para tradução de conteúdos para a Língua Brasileira de Sinais.
          </li>
        </ul>

        <h2 class="tw-text-xl tw-font-semibold tw-mt-8 tw-mb-4">
          4. Biometria e Processamento Local
        </h2>
        <p>
          Nos dispositivos móveis suportados, disponibilizamos autenticação por biometria (impressão
          digital ou reconhecimento facial).
          <strong
            >Os seus dados biométricos jamais são enviados à nuvem ou aos nossos servidores.</strong
          >
          Todo o reconhecimento e validação ocorrem 100% de forma local dentro do hardware de
          segurança seguro do seu próprio dispositivo (Secure Enclave / Android Keystore).
        </p>

        <h2 class="tw-text-xl tw-font-semibold tw-mt-8 tw-mb-4">
          5. Direitos do Titular (Art. 18 da LGPD)
        </h2>
        <p>
          A qualquer momento, através da nossa central dedicada em
          <router-link to="/privacidade-seguranca" class="tw-text-primary hover:tw-underline"
            >Privacidade e Segurança</router-link
          >, você pode:
        </p>
        <ul class="tw-list-disc tw-pl-6 tw-space-y-2">
          <li>
            <strong>Exportar seus dados (Portabilidade):</strong> Baixar um arquivo completo
            estruturado (JSON ou CSV) com todo o histórico de suas interações e cadastro.
          </li>
          <li>
            <strong>Exercer o Direito ao Esquecimento:</strong> Solicitar a eliminação definitiva e
            irreversível de sua conta e informações pessoais.
          </li>
        </ul>

        <h2 class="tw-text-xl tw-font-semibold tw-mt-8 tw-mb-4">
          6. Contato do Encarregado de Dados (DPO)
        </h2>
        <p>
          Para esclarecer dúvidas, exercer direitos não automatizados ou relatar preocupações sobre
          a privacidade de seus dados, entre em contato diretamente com o nosso Encarregado de
          Proteção de Dados (DPO):
        </p>
        <p class="tw-font-medium tw-text-primary">📧 <strong>dpo@ficouclaro.app</strong></p>
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
