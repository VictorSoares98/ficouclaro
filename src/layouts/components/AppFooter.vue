<script setup lang="ts">
import FooterGamifiedBadge from '@/components/footer/FooterGamifiedBadge.vue';

const currentYear = new Date().getFullYear();

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}
</script>

<template>
  <!-- Rodapé Institucional Semântico e Fluido (Não-Fixo / Scroll Natural) -->
  <footer
    class="fc-glass-footer tw-w-full tw-relative tw-pt-12 tw-pb-8 sm:tw-pt-16 sm:tw-pb-10 tw-z-10"
    style="padding-bottom: calc(5.5rem + env(safe-area-inset-bottom, 0px))"
  >
    <div class="tw-max-w-7xl tw-mx-auto tw-px-4 sm:tw-px-6 md:tw-px-8">
      <!-- 1. Faixa Superior Gamificada com Prova Social e Nível do Campus -->
      <FooterGamifiedBadge />

      <!-- 2. Grid Principal com 4 Colunas de Navegação e Governança -->
      <div
        class="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-8 sm:tw-gap-10 tw-mb-12"
      >
        <!-- Coluna 1: Identidade, Missão e Certificações -->
        <div class="tw-space-y-3.5">
          <div class="tw-flex tw-items-center tw-gap-2">
            <h3 class="text-h6 text-weight-bold tw-font-space-grotesk tw-m-0 tw-leading-none">
              FICOU <span class="text-primary">CLARO?</span>
            </h3>
          </div>

          <p class="text-muted tw-text-xs sm:tw-text-sm tw-leading-relaxed tw-m-0">
            A plataforma de feedback em tempo real que transforma o silêncio da sala de aula em
            engajamento ativo e conecta estudantes a monitorias físicas no campus.
          </p>

          <div class="tw-flex tw-flex-wrap tw-gap-2 tw-pt-1">
            <q-badge color="primary" outline class="tw-text-[10px] text-weight-bold tw-rounded-md">
              LGPD Compliance
            </q-badge>
            <q-badge
              color="secondary"
              outline
              class="tw-text-[10px] text-weight-bold tw-rounded-md"
            >
              Acessibilidade WCAG 2.1
            </q-badge>
          </div>
        </div>

        <!-- Coluna 2: Soluções & Recursos -->
        <div>
          <h4 class="tw-text-xs tw-font-bold tw-uppercase tw-tracking-wider text-muted tw-mb-4">
            Recursos da Plataforma
          </h4>
          <ul class="tw-space-y-2.5 tw-list-none tw-p-0 tw-m-0 tw-text-xs sm:tw-text-sm">
            <li>
              <router-link
                to="/sala"
                class="tw-flex tw-items-center tw-gap-1.5 hover:tw-text-primary hover:tw-translate-x-1 tw-transition-all"
              >
                <q-icon name="speed" size="14px" />
                <span>Termômetro ao Vivo</span>
              </router-link>
            </li>
            <li>
              <router-link
                to="/sala"
                class="tw-flex tw-items-center tw-gap-1.5 hover:tw-text-primary hover:tw-translate-x-1 tw-transition-all"
              >
                <q-icon name="question_answer" size="14px" />
                <span>Q&A com Votação Anônima</span>
              </router-link>
            </li>
            <li>
              <router-link
                to="/mapa"
                class="tw-flex tw-items-center tw-gap-1.5 hover:tw-text-primary hover:tw-translate-x-1 tw-transition-all"
              >
                <q-icon name="explore" size="14px" color="primary" />
                <span class="text-weight-bold text-primary">Mapa de Monitorias</span>
                <q-badge color="primary" rounded class="tw-text-[9px] tw-ml-1">Novo</q-badge>
              </router-link>
            </li>
            <li>
              <router-link
                to="/sala"
                class="tw-flex tw-items-center tw-gap-1.5 hover:tw-text-primary hover:tw-translate-x-1 tw-transition-all"
              >
                <q-icon name="poll" size="14px" />
                <span>Enquetes & Quizzes Relâmpago</span>
              </router-link>
            </li>
            <li>
              <router-link
                to="/disciplinas"
                class="tw-flex tw-items-center tw-gap-1.5 hover:tw-text-primary hover:tw-translate-x-1 tw-transition-all"
              >
                <q-icon name="insights" size="14px" />
                <span>Analytics Pedagógico $0 AI</span>
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Coluna 3: Ecossistema & Acesso Rápido -->
        <div>
          <h4 class="tw-text-xs tw-font-bold tw-uppercase tw-tracking-wider text-muted tw-mb-4">
            Ecossistema Acadêmico
          </h4>
          <ul class="tw-space-y-2.5 tw-list-none tw-p-0 tw-m-0 tw-text-xs sm:tw-text-sm">
            <li>
              <router-link
                to="/sala"
                class="tw-flex tw-items-center tw-gap-1.5 hover:tw-text-primary hover:tw-translate-x-1 tw-transition-all"
              >
                <q-icon name="pin" size="14px" />
                <span>Entrar em Aula com Código PIN</span>
              </router-link>
            </li>
            <li>
              <router-link
                to="/hub"
                class="tw-flex tw-items-center tw-gap-1.5 hover:tw-text-primary hover:tw-translate-x-1 tw-transition-all"
              >
                <q-icon name="school" size="14px" />
                <span>Painel do Aluno</span>
              </router-link>
            </li>
            <li>
              <router-link
                to="/dashboard"
                class="tw-flex tw-items-center tw-gap-1.5 hover:tw-text-primary hover:tw-translate-x-1 tw-transition-all"
              >
                <q-icon name="dashboard" size="14px" />
                <span>Painel do Professor</span>
              </router-link>
            </li>
            <li>
              <router-link
                to="/register"
                class="tw-flex tw-items-center tw-gap-1.5 hover:tw-text-primary hover:tw-translate-x-1 tw-transition-all"
              >
                <q-icon name="person_add" size="14px" />
                <span>Cadastrar como Docente</span>
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Coluna 4: Governança, LGPD e Inclusão -->
        <div>
          <h4 class="tw-text-xs tw-font-bold tw-uppercase tw-tracking-wider text-muted tw-mb-4">
            Segurança & Governança
          </h4>
          <ul class="tw-space-y-2.5 tw-list-none tw-p-0 tw-m-0 tw-text-xs sm:tw-text-sm">
            <li>
              <router-link
                to="/privacidade"
                class="tw-flex tw-items-center tw-gap-1.5 hover:tw-text-primary hover:tw-translate-x-1 tw-transition-all"
              >
                <q-icon name="lock" size="14px" />
                <span>Política de Privacidade</span>
              </router-link>
            </li>
            <li>
              <router-link
                to="/privacidade-seguranca"
                class="tw-flex tw-items-center tw-gap-1.5 hover:tw-text-primary hover:tw-translate-x-1 tw-transition-all"
              >
                <q-icon name="shield" size="14px" />
                <span>Central de Segurança & LGPD</span>
              </router-link>
            </li>
            <li>
              <router-link
                to="/termos"
                class="tw-flex tw-items-center tw-gap-1.5 hover:tw-text-primary hover:tw-translate-x-1 tw-transition-all"
              >
                <q-icon name="description" size="14px" />
                <span>Termos de Uso</span>
              </router-link>
            </li>
            <li>
              <span class="tw-flex tw-items-center tw-gap-1.5 text-muted">
                <q-icon name="translate" size="14px" />
                <span>Suporte VLibras Integrado</span>
              </span>
            </li>
          </ul>
        </div>
      </div>

      <!-- 3. Linha Inferior com Copyright e Botão Voltar ao Topo -->
      <div
        class="tw-pt-6 tw-border-t tw-border-white/10 tw-flex tw-flex-col sm:tw-flex-row tw-items-center tw-justify-between tw-gap-4"
      >
        <div class="tw-text-xs text-muted tw-text-center sm:tw-text-left">
          &copy; {{ currentYear }} <strong>FICOU CLARO?</strong> Todos os direitos reservados. Feito
          para aproximar professores e alunos.
        </div>

        <q-btn
          flat
          dense
          no-caps
          color="primary"
          class="tw-rounded-xl tw-text-xs text-weight-bold tw-px-3 tw-py-1 tw-flex tw-items-center tw-gap-1.5 hover:tw-bg-primary/10 tw-transition-colors"
          aria-label="Voltar ao início da página"
          @click="scrollToTop"
        >
          <span>Voltar ao Topo</span>
          <q-icon name="arrow_upward" size="14px" />
        </q-btn>
      </div>
    </div>
  </footer>
</template>
