<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import LandingHeroVisual from '@/components/landing/LandingHeroVisual.vue';
import LandingFeatureBento from '@/components/landing/LandingFeatureBento.vue';
import LandingInteractiveSimulator from '@/components/landing/LandingInteractiveSimulator.vue';

const router = useRouter();
const roomPin = ref('');
const isPinError = ref(false);

function handleQuickJoin() {
  const pin = roomPin.value.trim();
  if (!pin) {
    isPinError.value = true;
    return;
  }
  isPinError.value = false;
  void router.push(`/sala/${pin}`);
}
</script>

<template>
  <q-page
    class="tw-flex tw-flex-col tw-min-h-screen tw-overflow-x-hidden tw-relative tw-bg-gradient-to-br tw-from-primary/5 tw-via-transparent tw-to-secondary/10"
  >
    <!-- 1. Hero Section (Duas Colunas em Telas Grandes) -->
    <section
      class="tw-relative tw-w-full tw-pt-12 sm:tw-pt-16 md:tw-pt-24 tw-pb-16 md:tw-pb-24 tw-px-4 sm:tw-px-6 md:tw-px-8 tw-z-10"
    >
      <div
        class="tw-max-w-7xl tw-mx-auto tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-12 lg:tw-gap-8 tw-items-center"
      >
        <!-- Coluna da Esquerda: Copywriting, Proposta de Valor e Acesso Rápido -->
        <div class="tw-text-center lg:tw-text-left tw-space-y-6">
          <!-- Badge de Destaque -->
          <div
            class="tw-inline-flex tw-items-center tw-gap-2 tw-px-3.5 tw-py-1.5 tw-rounded-full tw-bg-primary/10 tw-border tw-border-primary/20 tw-text-primary tw-text-xs tw-font-bold tw-shadow-sm"
          >
            <span class="tw-relative tw-flex tw-h-2 tw-w-2">
              <span
                class="tw-animate-ping tw-absolute tw-inline-flex tw-h-full tw-w-full tw-rounded-full tw-bg-primary tw-opacity-75"
              ></span>
              <span
                class="tw-relative tw-inline-flex tw-rounded-full tw-h-2 tw-w-2 tw-bg-primary"
              ></span>
            </span>
            <span>A REVOLUÇÃO DO FEEDBACK ACADÊMICO</span>
          </div>

          <!-- Título Principal -->
          <h1
            class="tw-text-3xl sm:tw-text-4xl md:tw-text-5xl lg:tw-text-6xl tw-font-extrabold tw-font-space-grotesk tw-tracking-tight tw-leading-tight"
          >
            O fim das dúvidas que
            <span
              class="tw-bg-gradient-to-r tw-from-primary tw-via-secondary tw-to-accent tw-bg-clip-text tw-text-transparent"
            >
              ficaram para trás.
            </span>
          </h1>

          <!-- Subtítulo -->
          <p
            class="text-muted tw-text-base sm:tw-text-lg md:tw-text-xl tw-leading-relaxed tw-max-w-xl tw-mx-auto lg:tw-mx-0"
          >
            Dê voz a estudantes tímidos, meça o ritmo da explicação ao vivo e conecte turmas a
            monitorias no campus. Sem downloads, em qualquer celular.
          </p>

          <!-- Widget de Entrada Rápida na Sala (Quick PIN) -->
          <div class="tw-pt-2 tw-max-w-md tw-mx-auto lg:tw-mx-0">
            <q-card
              flat
              bordered
              class="tw-p-2 tw-rounded-2xl tw-backdrop-blur-md tw-bg-surface/75 tw-shadow-lg tw-border tw-border-white/10"
            >
              <div class="tw-flex tw-items-center tw-gap-2">
                <q-input
                  v-model="roomPin"
                  placeholder="Código da Sala (ex: 849201)"
                  dense
                  borderless
                  class="tw-flex-1 tw-px-3 tw-font-mono tw-text-sm sm:tw-text-base tw-font-bold"
                  :error="isPinError"
                  hide-bottom-space
                  @keydown.enter="handleQuickJoin"
                  @update:model-value="isPinError = false"
                >
                  <template v-slot:prepend>
                    <q-icon name="meeting_room" color="primary" />
                  </template>
                </q-input>

                <q-btn
                  unelevated
                  color="primary"
                  label="Entrar na Aula"
                  no-caps
                  class="tw-rounded-xl text-weight-bold tw-text-xs sm:tw-text-sm tw-h-10 tw-px-4 tw-shadow-md"
                  @click="handleQuickJoin"
                />
              </div>
            </q-card>
            <div
              v-if="isPinError"
              class="text-negative tw-text-xs tw-mt-1.5 tw-font-medium tw-text-left"
            >
              Por favor, informe o código fornecido pelo professor da aula.
            </div>
          </div>

          <!-- Ações Primárias (CTAs) -->
          <div
            class="tw-flex tw-flex-wrap tw-items-center tw-justify-center lg:tw-justify-start tw-gap-3 sm:tw-gap-4 tw-pt-2"
          >
            <q-btn
              color="primary"
              to="/register"
              label="Começar Gratuitamente"
              no-caps
              unelevated
              class="tw-px-6 tw-h-12 tw-rounded-2xl tw-text-sm sm:tw-text-base tw-font-bold tw-shadow-xl hover:tw-scale-105 tw-transition-transform"
            />
            <q-btn
              color="primary"
              to="/mapa"
              label="Mapa de Monitorias"
              icon="explore"
              no-caps
              outline
              class="tw-px-5 tw-h-12 tw-rounded-2xl tw-text-sm sm:tw-text-base tw-font-bold hover:tw-bg-primary/10 tw-transition-colors"
            />
            <q-btn
              color="secondary"
              to="/login"
              label="Sou Professor"
              no-caps
              flat
              class="tw-px-5 tw-h-12 tw-rounded-2xl tw-text-sm sm:tw-text-base tw-font-bold hover:tw-bg-secondary/10 tw-transition-colors"
            />
          </div>
        </div>

        <!-- Coluna da Direita: Mockup 3D Interativo da Aula ao Vivo -->
        <div class="tw-flex tw-justify-center tw-items-center">
          <LandingHeroVisual />
        </div>
      </div>
    </section>

    <!-- 2. Estatísticas de Impacto e Proposta de Valor -->
    <section
      class="tw-w-full tw-py-12 tw-border-y tw-border-white/10 tw-bg-white/5 tw-backdrop-blur-md tw-relative tw-z-10"
    >
      <div class="tw-max-w-7xl tw-mx-auto tw-px-4 sm:tw-px-6 md:tw-px-8">
        <div class="tw-grid tw-grid-cols-1 sm:tw-grid-cols-3 tw-gap-8 tw-text-center">
          <div>
            <div class="text-h3 text-weight-bolder text-primary tw-font-space-grotesk tw-mb-1">
              4x+
            </div>
            <div class="tw-text-sm sm:tw-text-base tw-font-bold tw-mb-1">Participação da Turma</div>
            <p class="text-muted tw-text-xs sm:tw-text-sm tw-m-0 tw-max-w-xs tw-mx-auto">
              Perguntas enviadas anonimamente eliminam o receio do julgamento social entre colegas.
            </p>
          </div>

          <div>
            <div class="text-h3 text-weight-bolder text-secondary tw-font-space-grotesk tw-mb-1">
              0s
            </div>
            <div class="tw-text-sm sm:tw-text-base tw-font-bold tw-mb-1">Atraso no Feedback</div>
            <p class="text-muted tw-text-xs sm:tw-text-sm tw-m-0 tw-max-w-xs tw-mx-auto">
              O docente sabe que um conceito não ficou claro antes do término da aula, e não na
              prova.
            </p>
          </div>

          <div>
            <div class="text-h3 text-weight-bolder text-accent tw-font-space-grotesk tw-mb-1">
              100%
            </div>
            <div class="tw-text-sm sm:tw-text-base tw-font-bold tw-mb-1">Web & Sem Instalação</div>
            <p class="text-muted tw-text-xs sm:tw-text-sm tw-m-0 tw-max-w-xs tw-mx-auto">
              Basta escanear o QR Code da sala e participar direto do navegador de qualquer
              smartphone.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. Bento Grid com as 6 Funcionalidades Centrais -->
    <LandingFeatureBento />

    <!-- 4. Simulador Interativo Gamificado -->
    <LandingInteractiveSimulator />

    <!-- 5. Seção Institucional: Segurança, LGPD e Inclusão -->
    <section
      class="tw-w-full tw-py-16 md:tw-py-20 tw-px-4 sm:tw-px-6 md:tw-px-8 tw-relative tw-z-10"
    >
      <div class="tw-max-w-6xl tw-mx-auto">
        <q-card
          flat
          bordered
          class="tw-p-8 sm:tw-p-12 tw-rounded-[2.5rem] tw-backdrop-blur-xl tw-border tw-border-white/10 tw-shadow-lg"
          style="background: rgba(var(--q-dark-page, 15, 23, 42), 0.7)"
        >
          <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-8">
            <div class="tw-flex tw-gap-4">
              <div
                class="tw-w-12 tw-h-12 tw-rounded-2xl tw-bg-primary/10 tw-text-primary tw-flex tw-items-center tw-justify-center tw-shrink-0"
              >
                <q-icon name="security" size="24px" />
              </div>
              <div>
                <h4 class="tw-text-base tw-font-bold tw-font-space-grotesk tw-mb-1">
                  Privacidade por Design (LGPD)
                </h4>
                <p class="text-muted tw-text-xs sm:tw-text-sm tw-leading-relaxed tw-m-0">
                  Respostas e sinais de ritmo são desvinculados de identificadores nominais.
                  Segurança jurídica e anonimato garantido para todos os estudantes.
                </p>
              </div>
            </div>

            <div class="tw-flex tw-gap-4">
              <div
                class="tw-w-12 tw-h-12 tw-rounded-2xl tw-bg-secondary/10 tw-text-secondary tw-flex tw-items-center tw-justify-center tw-shrink-0"
              >
                <q-icon name="accessible" size="24px" />
              </div>
              <div>
                <h4 class="tw-text-base tw-font-bold tw-font-space-grotesk tw-mb-1">
                  Acessibilidade Universal
                </h4>
                <p class="text-muted tw-text-xs sm:tw-text-sm tw-leading-relaxed tw-m-0">
                  Compatibilidade com VLibras, leitores de tela e modos de alto contraste para
                  assegurar que nenhum estudante fique para trás.
                </p>
              </div>
            </div>

            <div class="tw-flex tw-gap-4">
              <div
                class="tw-w-12 tw-h-12 tw-rounded-2xl tw-bg-accent/10 tw-text-accent tw-flex tw-items-center tw-justify-center tw-shrink-0"
              >
                <q-icon name="school" size="24px" />
              </div>
              <div>
                <h4 class="tw-text-base tw-font-bold tw-font-space-grotesk tw-mb-1">
                  Para Qualquer IES
                </h4>
                <p class="text-muted tw-text-xs sm:tw-text-sm tw-leading-relaxed tw-m-0">
                  Ideal para universidades públicas e faculdades privadas, integrando departamentos
                  inteiros sem necessidade de infraestrutura pesada.
                </p>
              </div>
            </div>
          </div>
        </q-card>
      </div>
    </section>

    <!-- 6. Call to Action (CTA) Final de Conversão -->
    <section
      class="tw-w-full tw-py-16 md:tw-py-24 tw-px-4 sm:tw-px-6 md:tw-px-8 tw-relative tw-z-10"
    >
      <div class="tw-max-w-5xl tw-mx-auto tw-text-center">
        <q-card
          flat
          bordered
          class="tw-p-8 sm:tw-p-16 tw-rounded-[3rem] tw-backdrop-blur-2xl tw-shadow-2xl tw-border tw-border-primary/30 tw-relative tw-overflow-hidden"
          style="
            background: linear-gradient(135deg, rgba(2, 132, 199, 0.15), rgba(147, 51, 234, 0.15));
          "
        >
          <h2
            class="text-h4 sm:text-h3 text-weight-bolder tw-font-space-grotesk tw-tracking-tight tw-mb-4"
          >
            Pronto para transformar sua próxima aula?
          </h2>
          <p
            class="text-muted tw-text-base sm:tw-text-lg tw-max-w-2xl tw-mx-auto tw-leading-relaxed tw-mb-8"
          >
            Crie sua conta em 30 segundos ou participe de uma aula ativa agora mesmo. O conhecimento
            deve ser claro para todos.
          </p>

          <div class="tw-flex tw-flex-wrap tw-items-center tw-justify-center tw-gap-4">
            <q-btn
              color="primary"
              to="/register"
              label="Criar Conta Gratuita"
              no-caps
              unelevated
              class="tw-px-8 tw-h-14 tw-rounded-2xl tw-text-base tw-font-bold tw-shadow-2xl hover:tw-scale-105 tw-transition-transform"
            />
            <q-btn
              color="primary"
              to="/mapa"
              label="Ver Monitorias no Campus"
              icon="explore"
              no-caps
              outline
              class="tw-px-6 tw-h-14 tw-rounded-2xl tw-text-base tw-font-bold hover:tw-bg-primary/10 tw-transition-colors"
            />
          </div>
        </q-card>
      </div>
    </section>

    <!-- Efeitos Decorativos de Fundo (Atmospheric Blobs) -->
    <div
      class="tw-absolute tw-top-0 tw-left-0 tw-w-full tw-h-full tw-overflow-hidden tw-pointer-events-none tw-z-0"
    >
      <div
        class="tw-absolute -tw-top-40 -tw-left-40 tw-w-96 tw-h-96 tw-bg-primary/20 tw-rounded-full tw-filter tw-blur-3xl tw-opacity-60 tw-animate-blob"
      ></div>
      <div
        class="tw-absolute tw-top-96 -tw-right-40 tw-w-96 tw-h-96 tw-bg-secondary/20 tw-rounded-full tw-filter tw-blur-3xl tw-opacity-50 tw-animate-blob tw-animation-delay-2000"
      ></div>
      <div
        class="tw-absolute tw-bottom-40 tw-left-1/3 tw-w-96 tw-h-96 tw-bg-accent/20 tw-rounded-full tw-filter tw-blur-3xl tw-opacity-40 tw-animate-blob tw-animation-delay-4000"
      ></div>
    </div>
  </q-page>
</template>

<style scoped>
@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}
.tw-animate-blob {
  animation: blob 8s infinite ease-in-out;
}
.tw-animation-delay-2000 {
  animation-delay: 2s;
}
.tw-animation-delay-4000 {
  animation-delay: 4s;
}
</style>
