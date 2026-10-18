<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from '@/stores/auth.store';
import { useCourseStore } from '@/modules/courses/stores/course.store';
import {
  courseService,
  type ClassroomInviteDetails,
} from '@/modules/courses/services/course.service';
import BaseSurfaceCard from '@/core/components/BaseSurfaceCard.vue';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();
const courseStore = useCourseStore();

const inviteCode = computed(() => {
  const params = route.params as Record<string, unknown>;
  const param = params.code || route.query.code || route.query.join;
  return typeof param === 'string' ? param.trim().toLowerCase() : '';
});

const isLoading = ref(true);
const inviteDetails = ref<ClassroomInviteDetails | null>(null);
const errorMessage = ref('');
const isEnrolling = ref(false);

const showGuestDialog = ref(false);
const guestName = ref('');

const isAuthenticated = computed(() => authStore.isAuthenticated);
const isAluno = computed(() => authStore.isAluno);
const isProfessor = computed(() => authStore.isProfessor);

async function loadInviteDetails() {
  if (!inviteCode.value) {
    errorMessage.value = 'Código de convite não especificado ou inválido.';
    isLoading.value = false;
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    const details = await courseService.getCourseDetailsByInviteCode(inviteCode.value);
    if (!details) {
      errorMessage.value = 'Disciplina não encontrada ou código de convite expirado.';
      isLoading.value = false;
      return;
    }

    inviteDetails.value = details;

    // Se já estiver logado como Aluno, processa a matrícula automática e direciona
    if (isAuthenticated.value && isAluno.value) {
      await handleAuthenticatedEnroll(details);
    }
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Erro ao carregar detalhes da aula.';
  } finally {
    isLoading.value = false;
  }
}

async function handleAuthenticatedEnroll(details: ClassroomInviteDetails) {
  isEnrolling.value = true;
  try {
    await courseStore.enroll(details.codigo_convite);
    $q.notify({
      type: 'positive',
      icon: 'school',
      message: `Você foi vinculado com sucesso à matéria "${details.nome}"!`,
      position: 'top',
    });

    if (details.sessao_ativa_id) {
      void router.replace(`/sala/${details.sessao_ativa_id}`);
    } else {
      void router.replace('/hub');
    }
  } catch (err: unknown) {
    // Se já estiver matriculado, redireciona suavemente para a aula ou hub
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('já está matriculado')) {
      if (details.sessao_ativa_id) {
        void router.replace(`/sala/${details.sessao_ativa_id}`);
      } else {
        void router.replace('/hub');
      }
    } else {
      $q.notify({
        type: 'negative',
        message: msg || 'Falha ao vincular à disciplina.',
        position: 'top',
      });
    }
  } finally {
    isEnrolling.value = false;
  }
}

function handleGoToRegister() {
  void router.push({
    path: '/register',
    query: { join: inviteCode.value },
  });
}

function handleGoToLogin() {
  void router.push({
    path: '/login',
    query: {
      join: inviteCode.value,
      redirect: `/join/${inviteCode.value}`,
    },
  });
}

function handleEnterAsGuest() {
  if (!inviteDetails.value?.sessao_ativa_id) {
    $q.notify({
      type: 'info',
      icon: 'schedule',
      message:
        'Não há nenhuma aula ao vivo desta disciplina no momento. Crie sua conta para ficar vinculado à turma!',
      position: 'top',
    });
    return;
  }
  showGuestDialog.value = true;
}

function confirmGuestEntry() {
  if (!inviteDetails.value?.sessao_ativa_id) return;

  const nickname = guestName.value.trim() || 'Visitante Convidado';
  if (typeof window !== 'undefined' && window.sessionStorage) {
    sessionStorage.setItem(
      'ficouclaro_guest_session',
      JSON.stringify({
        isGuest: true,
        guestName: nickname,
        courseId: inviteDetails.value.disciplina_id,
        courseName: inviteDetails.value.nome,
        professorName: inviteDetails.value.professor_nome,
        sessionId: inviteDetails.value.sessao_ativa_id,
        inviteCode: inviteCode.value,
        enteredAt: new Date().toISOString(),
      }),
    );
  }

  $q.notify({
    type: 'positive',
    icon: 'meeting_room',
    message: `Bem-vindo(a) à aula, ${nickname}! Entrando no modo visitante...`,
    position: 'top',
  });

  showGuestDialog.value = false;
  void router.replace(`/sala/${inviteDetails.value.sessao_ativa_id}`);
}

onMounted(() => {
  void loadInviteDetails();
});
</script>

<template>
  <q-page class="tw-min-h-screen tw-flex tw-items-center tw-justify-center tw-p-4 sm:tw-p-6">
    <!-- Estado de Carregamento -->
    <div v-if="isLoading || isEnrolling" class="tw-text-center tw-py-16">
      <q-spinner-hourglass color="primary" size="64px" />
      <h2 class="tw-text-lg tw-font-bold tw-mt-4 tw-font-space-grotesk">
        {{ isEnrolling ? 'Vinculando você à turma...' : 'Localizando convite da aula...' }}
      </h2>
      <p class="text-muted tw-text-xs tw-mt-1">Aguarde alguns instantes</p>
    </div>

    <!-- Estado de Erro -->
    <BaseSurfaceCard
      v-else-if="errorMessage || !inviteDetails"
      class="tw-max-w-md tw-w-full tw-p-6 sm:tw-p-8 tw-text-center tw-rounded-3xl tw-shadow-xl"
    >
      <div
        class="tw-w-16 tw-h-16 tw-rounded-2xl bg-negative-soft text-negative tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-4"
      >
        <q-icon name="sentiment_dissatisfied" size="32px" />
      </div>

      <h1 class="tw-text-xl tw-font-bold tw-font-space-grotesk tw-mb-2">Convite Indisponível</h1>
      <p class="text-muted tw-text-sm tw-mb-6">
        {{ errorMessage || 'Não foi possível encontrar a turma correspondente a este link.' }}
      </p>

      <q-btn
        unelevated
        no-caps
        color="primary"
        label="Ir para a Página Inicial"
        to="/"
        class="tw-rounded-xl tw-px-6 tw-h-11 tw-font-bold tw-w-full"
      />
    </BaseSurfaceCard>

    <!-- Estado Conectado como Professor -->
    <BaseSurfaceCard
      v-else-if="isAuthenticated && isProfessor"
      class="tw-max-w-md tw-w-full tw-p-6 sm:tw-p-8 tw-text-center tw-rounded-3xl tw-shadow-xl"
    >
      <div
        class="tw-w-16 tw-h-16 tw-rounded-2xl bg-secondary-soft text-secondary tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-4"
      >
        <q-icon name="school" size="32px" />
      </div>

      <h1 class="tw-text-xl tw-font-bold tw-font-space-grotesk tw-mb-2">
        Acesso com Perfil Docente
      </h1>
      <p class="text-muted tw-text-sm tw-mb-6">
        Você está autenticado como <strong>Professor</strong>. Convites de turma são destinados à
        matrícula de alunos. Acesse seu painel de disciplinas para gerenciar esta turma.
      </p>

      <div class="tw-flex tw-flex-col tw-gap-3">
        <q-btn
          unelevated
          no-caps
          color="secondary"
          label="Ir para Minhas Turmas"
          to="/disciplinas"
          class="tw-rounded-xl tw-h-11 tw-font-bold tw-w-full"
        />
        <q-btn
          flat
          no-caps
          label="Página Inicial"
          to="/"
          class="tw-rounded-xl tw-h-11 tw-font-bold tw-w-full"
        />
      </div>
    </BaseSurfaceCard>

    <!-- Card Principal de Boas-Vindas e Decisão Tripla -->
    <BaseSurfaceCard
      v-else
      class="tw-max-w-lg tw-w-full tw-p-6 sm:tw-p-8 tw-rounded-3xl tw-shadow-2xl tw-relative tw-overflow-hidden"
    >
      <!-- Efeito sutil de iluminação decorativa -->
      <div
        class="tw-absolute -tw-top-20 -tw-right-20 tw-w-40 tw-h-40 tw-bg-primary/10 tw-rounded-full tw-blur-3xl tw-pointer-events-none"
      ></div>

      <!-- Cabeçalho do Card -->
      <div class="tw-flex tw-items-center tw-gap-3 tw-mb-5">
        <div
          class="tw-w-12 tw-h-12 tw-rounded-2xl bg-primary-soft text-primary tw-flex tw-items-center tw-justify-center tw-shadow-sm"
        >
          <q-icon :name="inviteDetails.icone || 'school'" size="28px" />
        </div>
        <div class="tw-min-w-0 tw-flex-1">
          <div class="tw-text-xs tw-font-bold tw-text-primary tw-uppercase tw-tracking-wider">
            Convite de Turma
          </div>
          <h1
            class="tw-text-xl sm:tw-text-2xl tw-font-black tw-font-space-grotesk tw-leading-tight tw-truncate"
          >
            {{ inviteDetails.nome }}
          </h1>
        </div>
      </div>

      <!-- Informações do Professor e da Matéria -->
      <div
        class="tw-p-4 tw-rounded-2xl tw-bg-slate-50 dark:tw-bg-slate-800/60 tw-border tw-border-slate-200/80 dark:tw-border-slate-700/60 tw-mb-6 tw-space-y-3"
      >
        <div class="tw-flex tw-items-center tw-gap-3">
          <div
            class="tw-w-10 tw-h-10 tw-rounded-full tw-bg-primary/20 text-primary tw-flex tw-items-center tw-justify-center tw-font-bold tw-text-sm"
          >
            <img
              v-if="inviteDetails.professor_avatar"
              :src="inviteDetails.professor_avatar"
              :alt="inviteDetails.professor_nome"
              class="tw-w-full tw-h-full tw-rounded-full tw-object-cover"
            />
            <span v-else>{{ inviteDetails.professor_nome.slice(0, 2).toUpperCase() }}</span>
          </div>
          <div class="tw-min-w-0 tw-flex-1">
            <div class="tw-text-[11px] text-muted tw-font-medium">Docente Responsável</div>
            <div class="tw-text-sm tw-font-bold tw-truncate">
              {{ inviteDetails.professor_nome }}
            </div>
          </div>
        </div>

        <p v-if="inviteDetails.descricao" class="tw-text-xs text-muted tw-m-0 tw-line-clamp-2">
          {{ inviteDetails.descricao }}
        </p>

        <!-- Detalhes de local/horário se houver -->
        <div class="tw-flex tw-flex-wrap tw-gap-2 tw-pt-1">
          <q-badge
            v-if="inviteDetails.curso"
            outline
            color="primary"
            class="tw-text-[10px] tw-font-semibold tw-px-2 tw-py-0.5"
          >
            {{ inviteDetails.curso }}
          </q-badge>
          <q-badge
            v-if="inviteDetails.semestre"
            outline
            color="secondary"
            class="tw-text-[10px] tw-font-semibold tw-px-2 tw-py-0.5"
          >
            {{ inviteDetails.semestre }}
          </q-badge>
          <q-badge
            v-if="inviteDetails.sala"
            outline
            color="grey-7"
            class="tw-text-[10px] tw-font-semibold tw-px-2 tw-py-0.5"
          >
            Sala: {{ inviteDetails.sala }}
          </q-badge>
        </div>
      </div>

      <!-- Status da Aula -->
      <div class="tw-mb-6">
        <div
          v-if="inviteDetails.sessao_ativa_id"
          class="tw-flex tw-items-center tw-gap-2.5 tw-p-3 tw-rounded-xl tw-bg-positive/10 tw-border tw-border-positive/20 text-positive"
        >
          <span class="tw-relative tw-flex tw-h-3 tw-w-3">
            <span
              class="tw-animate-ping tw-absolute tw-inline-flex tw-h-full tw-w-full tw-rounded-full tw-bg-positive tw-opacity-75"
            ></span>
            <span
              class="tw-relative tw-inline-flex tw-rounded-full tw-h-3 tw-w-3 tw-bg-positive"
            ></span>
          </span>
          <span class="tw-text-xs tw-font-bold">
            Aula Ao Vivo Agora! Os alunos já estão participando.
          </span>
        </div>
        <div
          v-else
          class="tw-flex tw-items-center tw-gap-2 tw-p-3 tw-rounded-xl tw-bg-slate-100 dark:tw-bg-slate-800/80 text-muted tw-text-xs"
        >
          <q-icon name="schedule" size="18px" />
          <span>Nenhuma sessão ao vivo nesta disciplina no momento.</span>
        </div>
      </div>

      <!-- Decisão Tripla de Acesso -->
      <div class="tw-space-y-3">
        <!-- 1. Opção Recomendada: Criar Conta -->
        <q-btn
          unelevated
          no-caps
          color="primary"
          class="tw-w-full tw-rounded-2xl tw-py-3.5 tw-font-bold tw-text-sm tw-shadow-lg hover:tw-scale-[1.01] tw-transition-transform"
          @click="handleGoToRegister"
        >
          <div class="tw-flex tw-items-center tw-justify-between tw-w-full tw-px-1">
            <div class="tw-flex tw-items-center tw-gap-2.5">
              <q-icon name="person_add" size="20px" />
              <span>Criar Conta Gratuita</span>
            </div>
            <q-badge color="white" text-color="primary" rounded class="tw-text-[10px] tw-font-bold">
              Recomendado
            </q-badge>
          </div>
        </q-btn>

        <!-- 2. Opção Secundária: Já Tenho Conta -->
        <q-btn
          outline
          no-caps
          color="primary"
          class="tw-w-full tw-rounded-2xl tw-py-3.5 tw-font-bold tw-text-sm"
          @click="handleGoToLogin"
        >
          <div class="tw-flex tw-items-center tw-justify-center tw-gap-2 tw-w-full">
            <q-icon name="login" size="20px" />
            <span>Já tenho uma conta (Entrar)</span>
          </div>
        </q-btn>

        <!-- 3. Opção Convidado / Visitante -->
        <div class="tw-pt-2 tw-text-center">
          <q-btn
            flat
            no-caps
            color="grey-8"
            class="tw-text-xs tw-font-semibold tw-rounded-xl hover:tw-bg-slate-100 dark:hover:tw-bg-slate-800"
            @click="handleEnterAsGuest"
          >
            <div class="tw-flex tw-items-center tw-gap-1.5">
              <q-icon name="visibility" size="16px" />
              <span>Acessar aula como Visitante (Ouvinte)</span>
            </div>
          </q-btn>
        </div>
      </div>
    </BaseSurfaceCard>

    <!-- Diálogo Rápido para Entrada de Visitante -->
    <q-dialog v-model="showGuestDialog" persistent>
      <q-card class="tw-rounded-3xl tw-p-6 tw-max-w-sm tw-w-full">
        <q-card-section class="tw-p-0 tw-mb-4">
          <div class="tw-flex tw-items-center tw-gap-2 tw-text-primary tw-mb-1">
            <q-icon name="badge" size="22px" />
            <span class="tw-text-base tw-font-bold tw-font-space-grotesk">Acesso de Visitante</span>
          </div>
          <p class="text-muted tw-text-xs tw-m-0">
            Informe como você gostaria de ser chamado durante a aula de
            <strong>{{ inviteDetails?.nome }}</strong
            >:
          </p>
        </q-card-section>

        <q-card-section class="tw-p-0 tw-mb-6">
          <q-input
            v-model="guestName"
            outlined
            dense
            placeholder="Ex: João Silva ou Convidado"
            maxlength="40"
            autofocus
            class="tw-rounded-xl"
            @keyup.enter="confirmGuestEntry"
          />
          <div class="tw-text-[11px] text-muted tw-mt-2">
            💡 Como visitante, você poderá acompanhar o termômetro e perguntas em tempo real.
          </div>
        </q-card-section>

        <q-card-actions align="right" class="tw-p-0 tw-gap-2">
          <q-btn flat label="Cancelar" color="grey-7" no-caps class="tw-rounded-xl" v-close-popup />
          <q-btn
            unelevated
            label="Entrar na Aula"
            color="primary"
            no-caps
            class="tw-rounded-xl tw-px-4 tw-font-bold"
            @click="confirmGuestEntry"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>
