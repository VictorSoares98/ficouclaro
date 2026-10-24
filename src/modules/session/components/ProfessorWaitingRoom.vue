<script setup lang="ts">
import { computed, onMounted } from 'vue';
import type { Sessao } from '@/modules/session/services/session.service';
import type { Disciplina } from '@/modules/courses/services/course.service';
import { useAuthStore } from '@/stores/auth.store';
import { useSessionPresence } from '@/modules/session/composables/useSessionPresence';
import ClassroomQrCard from '@/components/ClassroomQrCard.vue';
import FloatingParticipantsGrid from '@/modules/session/components/FloatingParticipantsGrid.vue';
import Fluent3dIcon from '@/core/components/Fluent3dIcon.vue';

const props = defineProps<{
  session: Sessao;
  course: Disciplina | null;
  classroomUrl: string;
}>();

defineEmits<{
  (e: 'start'): void;
}>();

const authStore = useAuthStore();
const { participants, trackUser } = useSessionPresence(props.session.id, true);

const studentsCount = computed(() => {
  return participants.value.filter((p) => p.role !== 'professor').length;
});

onMounted(() => {
  if (authStore.user) {
    void trackUser({
      userId: authStore.user.auth.id,
      name: authStore.user.perfil.nome_completo || 'Professor',
      avatar: authStore.user.perfil.url_avatar || undefined,
      role: 'professor',
    });
  }
});
</script>

<template>
  <div
    class="fc-professor-waiting-room tw-w-full tw-max-w-6xl tw-mx-auto tw-p-4 sm:tw-p-6 lg:tw-p-8"
  >
    <!-- Cabeçalho do Cockpit Docente -->
    <header class="tw-mb-6 sm:tw-mb-8">
      <div
        class="tw-flex tw-flex-col sm:tw-flex-row sm:tw-items-center sm:tw-justify-between tw-gap-4"
      >
        <div>
          <!-- Pílula de Status e Tópico -->
          <div
            class="tw-inline-flex tw-items-center tw-gap-2 tw-px-3.5 tw-py-1.5 tw-rounded-full bg-primary-soft text-primary tw-font-bold tw-text-xs tw-mb-2"
          >
            <span class="tw-relative tw-flex tw-h-2 tw-w-2">
              <span
                class="tw-animate-ping tw-absolute tw-inline-flex tw-h-full tw-w-full tw-rounded-full tw-bg-primary tw-opacity-75"
              ></span>
              <span
                class="tw-relative tw-inline-flex tw-rounded-full tw-h-2 tw-w-2 tw-bg-primary"
              ></span>
            </span>
            <span>SALA DE ESPERA ABERTA</span>
            <span v-if="session.topico" class="tw-opacity-40">·</span>
            <span v-if="session.topico" class="tw-truncate tw-max-w-xs">{{ session.topico }}</span>
          </div>

          <h1
            class="tw-text-2xl sm:tw-text-3xl lg:tw-text-4xl tw-font-black tw-font-space-grotesk tw-tracking-tight tw-m-0"
          >
            {{ course?.nome || 'Disciplina' }}
          </h1>
          <p
            class="text-muted tw-text-xs sm:tw-text-sm tw-mt-1 tw-mb-0 tw-max-w-2xl tw-leading-relaxed"
          >
            A sessão está pronta para receber conexões. Os alunos já podem escanear o QR Code
            projetado ou acessar diretamente pelo link da turma.
          </p>
        </div>

        <div class="tw-flex tw-items-center tw-gap-2">
          <Fluent3dIcon name="school" :size="48" floating class="tw-hidden sm:tw-block" />
        </div>
      </div>
    </header>

    <!-- Bento Grid da Sala de Espera (2 Colunas em Desktop / 1 Coluna em Mobile) -->
    <div class="tw-grid tw-grid-cols-1 lg:tw-grid-cols-12 tw-gap-6 tw-items-stretch">
      <!-- Coluna Esquerda: QR Code, PIN, Atalhos de Projeção (5 Colunas) -->
      <div class="lg:tw-col-span-5 tw-flex tw-flex-col">
        <ClassroomQrCard
          v-if="course"
          :code="course.codigo_convite"
          :title="course.nome"
          :subtitle="'Aponte a câmera do celular para ingressar diretamente ou utilize o código abaixo.'"
          :url="classroomUrl"
          class="tw-h-full tw-flex tw-flex-col tw-justify-between"
        />
      </div>

      <!-- Coluna Direita: Mural de Alunos com Molduras Flutuantes e Ação de Início (7 Colunas) -->
      <div class="lg:tw-col-span-7 tw-flex tw-flex-col tw-gap-6">
        <!-- Mural de Presença ao Vivo -->
        <q-card flat bordered class="tw-p-5 sm:tw-p-6 tw-rounded-3xl tw-flex-1 tw-flex tw-flex-col">
          <FloatingParticipantsGrid :participants="participants" :isProfessor="true" />
        </q-card>

        <!-- Card de Disparo da Aula -->
        <q-card
          flat
          bordered
          class="tw-p-5 sm:tw-p-6 tw-rounded-3xl tw-bg-gradient-to-r tw-from-primary/5 tw-to-secondary/5"
        >
          <div
            class="tw-flex tw-flex-col sm:tw-flex-row sm:tw-items-center sm:tw-justify-between tw-gap-4"
          >
            <div class="tw-text-left">
              <div
                class="tw-text-sm sm:tw-text-base tw-font-bold tw-font-space-grotesk tw-leading-tight"
              >
                {{
                  studentsCount > 0 ? 'Tudo pronto para começar?' : 'Aguardando primeiros alunos'
                }}
              </div>
              <p class="text-muted tw-text-xs tw-mt-0.5 tw-mb-0">
                Ao clicar em iniciar, o termômetro de ritmo e a central de perguntas serão liberados
                aos participantes.
              </p>
            </div>

            <q-btn
              color="positive"
              size="lg"
              icon="play_arrow"
              :label="studentsCount > 0 ? `Iniciar Aula (${studentsCount})` : 'Iniciar Aula'"
              class="tw-rounded-2xl tw-h-12 sm:tw-h-14 tw-px-6 tw-font-bold tw-text-sm sm:tw-text-base tw-shadow-md hover:tw-scale-[1.02] tw-transition-all tw-w-full sm:tw-w-auto tw-shrink-0"
              @click="$emit('start')"
            />
          </div>
        </q-card>
      </div>
    </div>
  </div>
</template>
