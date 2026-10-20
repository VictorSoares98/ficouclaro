<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Disciplina } from '@/modules/courses/services/course.service';
import BaseSurfaceCard from '@/core/components/BaseSurfaceCard.vue';
import QrcodeVue from 'qrcode.vue';
import { useQuasar } from 'quasar';
import {
  getClassroomJoinUrl,
  copyClassroomLink,
  shareClassroomLink,
} from '@/modules/courses/utils/invite.utils';

const $q = useQuasar();

const props = defineProps<{
  course: Disciplina;
  actionLabel: string;
  actionIcon: string;
  actionColor: string;
  showInviteCode?: boolean;
  showInsightsBtn?: boolean;
  showOptionsBtn?: boolean;
  sessionStatus?: 'aguardando' | 'ativa' | 'encerrada' | 'nenhuma';
}>();

defineEmits<{
  (e: 'action', courseId: string): void;
  (e: 'insights', courseId: string): void;
  (e: 'edit', courseId: string): void;
  (e: 'delete', courseId: string): void;
}>();

const showQrCode = ref(false);
const classroomUrl = computed(() => getClassroomJoinUrl(props.course.codigo_convite));
const qrValue = computed(() => classroomUrl.value);

async function handleCopyLink() {
  await copyClassroomLink(classroomUrl.value, props.course.nome);
}

async function handleShareLink() {
  await shareClassroomLink({
    title: `Aula de ${props.course.nome} - Ficou Claro?`,
    text: `Acesse a matéria de ${props.course.nome} através do link ou utilize o código ${props.course.codigo_convite.toUpperCase()}:`,
    url: classroomUrl.value,
  });
}

// Estilo dinâmico da barra de moldura superior por status
const topBorderStyle = computed(() => {
  if (props.sessionStatus === 'ativa') {
    return 'tw-bg-gradient-to-r tw-from-emerald-500 tw-via-teal-400 tw-to-positive';
  }
  if (props.sessionStatus === 'aguardando') {
    return 'tw-bg-gradient-to-r tw-from-amber-500 tw-to-yellow-400';
  }
  if (props.sessionStatus === 'encerrada') {
    return 'tw-bg-gradient-to-r tw-from-slate-400 tw-to-slate-500';
  }
  return 'tw-bg-gradient-to-r tw-from-primary/40 tw-to-secondary/40';
});
</script>

<template>
  <BaseSurfaceCard
    class="fc-course-card tw-h-full tw-flex tw-flex-col tw-rounded-3xl tw-overflow-hidden tw-shadow-sm hover:tw-shadow-xl hover:-tw-translate-y-1 tw-transition-all tw-duration-300 tw-group focus-within:tw-ring-2 focus-within:tw-ring-primary"
  >
    <!-- Moldura Decorativa Superior com Gradiente de Status -->
    <div class="tw-h-1.5 tw-w-full" :class="topBorderStyle"></div>

    <q-card-section class="tw-flex-grow tw-flex tw-flex-col tw-p-5 sm:tw-p-6">
      <!-- 1. Topo: Código de Convite (Tag Geek) e Status em Tempo Real -->
      <div class="tw-flex tw-justify-between tw-items-center tw-mb-4">
        <!-- Código e Atalhos de Convite -->
        <div v-if="showInviteCode" class="tw-flex tw-items-center tw-gap-1.5">
          <div
            class="tw-inline-flex tw-items-center tw-gap-1.5 tw-px-2.5 tw-py-1 tw-rounded-xl bg-primary-soft text-primary tw-border tw-border-primary/20 tw-text-xs tw-font-mono tw-font-bold tw-uppercase tw-tracking-wide"
          >
            <span>CÓD:</span>
            <span>{{ course.codigo_convite }}</span>
          </div>

          <!-- Botão Copiar Rápido -->
          <q-btn
            flat
            round
            dense
            size="sm"
            color="primary"
            icon="content_copy"
            class="tw-rounded-lg hover:tw-bg-primary/10"
            aria-label="Copiar link da aula"
            @click.stop="handleCopyLink"
          >
            <q-tooltip anchor="top middle" self="bottom middle">Copiar link da aula</q-tooltip>
          </q-btn>

          <!-- Botão QR Code -->
          <q-btn
            flat
            round
            dense
            size="sm"
            color="primary"
            icon="qr_code_2"
            class="tw-rounded-lg hover:tw-bg-primary/10"
            aria-label="Exibir QR Code da turma"
            @click.stop="showQrCode = true"
          >
            <q-tooltip anchor="top middle" self="bottom middle">Exibir QR Code</q-tooltip>
          </q-btn>
        </div>
        <div v-else></div>

        <!-- Status da Aula e Menu de Opções -->
        <div class="tw-flex tw-items-center tw-gap-2">
          <!-- Badge de Status Vivo com Micro-animação -->
          <div v-if="sessionStatus !== undefined">
            <!-- Ao Vivo -->
            <div
              v-if="sessionStatus === 'ativa'"
              class="tw-inline-flex tw-items-center tw-gap-1.5 tw-px-2.5 tw-py-1 tw-rounded-full tw-bg-emerald-500/10 tw-border tw-border-emerald-500/30 text-positive tw-text-[11px] tw-font-extrabold"
            >
              <span class="tw-relative tw-flex tw-h-2 tw-w-2">
                <span
                  class="tw-animate-ping tw-absolute tw-inline-flex tw-h-full tw-w-full tw-rounded-full tw-bg-positive tw-opacity-75"
                ></span>
                <span
                  class="tw-relative tw-inline-flex tw-rounded-full tw-h-2 tw-w-2 tw-bg-positive"
                ></span>
              </span>
              <span>AO VIVO</span>
            </div>

            <!-- Em Espera -->
            <div
              v-else-if="sessionStatus === 'aguardando'"
              class="tw-inline-flex tw-items-center tw-gap-1.5 tw-px-2.5 tw-py-1 tw-rounded-full tw-bg-amber-500/10 tw-border tw-border-amber-500/30 text-warning tw-text-[11px] tw-font-extrabold"
            >
              <span class="tw-w-2 tw-h-2 tw-rounded-full tw-bg-amber-500"></span>
              <span>EM ESPERA</span>
            </div>

            <!-- Sem Aula -->
            <div
              v-else
              class="tw-inline-flex tw-items-center tw-gap-1.5 tw-px-2.5 tw-py-1 tw-rounded-full fc-badge-button text-muted tw-text-[11px] tw-font-medium"
            >
              <span class="tw-w-1.5 tw-h-1.5 tw-rounded-full tw-bg-slate-400"></span>
              <span>SEM AULA</span>
            </div>
          </div>

          <!-- Menu de Opções do Professor -->
          <q-btn
            v-if="showOptionsBtn"
            flat
            round
            dense
            icon="more_vert"
            class="text-muted hover:tw-text-primary tw-rounded-xl tw-transition-colors"
            aria-label="Mais opções da disciplina"
          >
            <q-menu auto-close class="tw-rounded-2xl tw-shadow-xl tw-overflow-hidden">
              <q-list style="min-width: 160px" class="tw-p-1.5 tw-text-xs">
                <q-item clickable class="tw-rounded-xl" @click="$emit('edit', course.id)">
                  <q-item-section avatar class="tw-min-w-0 tw-pr-2">
                    <q-icon name="edit" size="18px" color="primary" />
                  </q-item-section>
                  <q-item-section class="tw-font-medium">Editar Turma</q-item-section>
                </q-item>
                <q-separator class="tw-my-1" />
                <q-item
                  clickable
                  class="tw-rounded-xl text-negative"
                  @click="$emit('delete', course.id)"
                >
                  <q-item-section avatar class="tw-min-w-0 tw-pr-2">
                    <q-icon name="delete" size="18px" color="negative" />
                  </q-item-section>
                  <q-item-section class="tw-font-medium">Excluir Turma</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </div>

      <!-- 2. Identificação Principal: Squircle Icon + Título Space Grotesk -->
      <div class="tw-flex tw-items-start tw-gap-3.5 tw-mb-3.5">
        <div
          class="tw-w-12 tw-h-12 tw-rounded-2xl bg-primary-soft text-primary tw-flex tw-items-center tw-justify-center tw-shadow-sm tw-shrink-0 group-hover:tw-scale-105 tw-transition-transform"
        >
          <q-icon :name="course.icone || 'school'" size="24px" />
        </div>

        <div class="tw-min-w-0 tw-flex-1">
          <h2
            class="tw-text-lg sm:tw-text-xl tw-font-black tw-font-space-grotesk tw-tracking-tight tw-leading-tight tw-m-0 tw-truncate"
            :title="course.nome"
          >
            {{ course.nome }}
          </h2>
          <div
            v-if="course.curso || course.semestre"
            class="tw-text-xs text-muted tw-font-medium tw-mt-0.5 tw-truncate"
          >
            {{ course.curso || '' }}
            <span v-if="course.curso && course.semestre" class="tw-mx-1">·</span>
            {{ course.semestre || '' }}
          </div>
        </div>
      </div>

      <!-- 3. Descrição Curta -->
      <p
        class="text-muted tw-text-xs sm:tw-text-sm tw-leading-relaxed tw-flex-grow tw-line-clamp-2 tw-mb-4"
      >
        {{ course.descricao || 'Nenhuma descrição detalhada informada para esta turma.' }}
      </p>

      <!-- 4. Pílulas de Metadados Acadêmicos e Logística -->
      <div
        v-if="course.turma || course.horario || course.dia_semana || course.sala || course.bloco"
        class="tw-flex tw-flex-wrap tw-gap-2 tw-pt-1"
      >
        <div
          v-if="course.turma"
          class="tw-inline-flex tw-items-center tw-gap-1.5 tw-px-2.5 tw-py-1 tw-rounded-xl fc-badge-button text-muted tw-text-xs tw-font-medium"
        >
          <q-icon name="group" size="14px" color="primary" />
          <span>Turma {{ course.turma }}</span>
        </div>

        <div
          v-if="course.dia_semana || course.horario"
          class="tw-inline-flex tw-items-center tw-gap-1.5 tw-px-2.5 tw-py-1 tw-rounded-xl fc-badge-button text-muted tw-text-xs tw-font-medium"
        >
          <q-icon name="schedule" size="14px" color="secondary" />
          <span>{{ course.dia_semana || '' }} {{ course.horario || '' }}</span>
        </div>

        <div
          v-if="course.sala || course.bloco"
          class="tw-inline-flex tw-items-center tw-gap-1.5 tw-px-2.5 tw-py-1 tw-rounded-xl fc-badge-button text-muted tw-text-xs tw-font-medium"
        >
          <q-icon name="room" size="14px" color="positive" />
          <span
            >Sala {{ course.sala || '' }} {{ course.bloco ? `· Bloco ${course.bloco}` : '' }}</span
          >
        </div>
      </div>
    </q-card-section>

    <q-separator class="tw-opacity-50" />

    <!-- 5. Rodapé Ergonômico de Ações (Thumb Zone: altura mínima 44px) -->
    <q-card-actions class="tw-p-4 tw-flex tw-gap-2.5">
      <q-btn
        v-if="showInsightsBtn"
        flat
        no-caps
        color="secondary"
        icon="insights"
        label="Insights"
        class="tw-rounded-2xl tw-h-11 tw-px-4 tw-font-bold tw-text-xs sm:tw-text-sm hover:tw-bg-secondary-soft tw-transition-colors"
        aria-label="Visualizar métricas e insights da disciplina"
        @click="$emit('insights', course.id)"
      />

      <q-btn
        unelevated
        no-caps
        :color="actionColor"
        :icon="actionIcon"
        :label="actionLabel"
        :disable="!showOptionsBtn && (sessionStatus === 'nenhuma' || sessionStatus === 'encerrada')"
        class="tw-flex-1 tw-rounded-2xl tw-h-11 tw-font-bold tw-text-xs sm:tw-text-sm tw-shadow-sm hover:tw-scale-[1.01] hover:tw-shadow-md tw-transition-all"
        :aria-label="actionLabel"
        @click="$emit('action', course.id)"
      />
    </q-card-actions>
  </BaseSurfaceCard>

  <!-- Modal de QR Code da Turma -->
  <q-dialog v-model="showQrCode" :position="$q.screen.lt.md ? 'bottom' : 'standard'">
    <q-card
      class="tw-rounded-3xl tw-p-5 sm:tw-p-6 tw-text-center tw-max-w-md tw-w-full"
    >
      <q-card-section class="tw-p-0">
        <div class="tw-flex tw-items-center tw-justify-between tw-mb-2">
          <div class="tw-flex tw-items-center tw-gap-2">
            <q-icon name="qr_code_2" size="24px" color="primary" />
            <h3 class="tw-text-lg tw-font-bold tw-font-space-grotesk tw-m-0">Convite da Turma</h3>
          </div>
          <q-btn flat round dense icon="close" v-close-popup aria-label="Fechar" />
        </div>

        <p class="text-muted tw-text-xs tw-mb-5">
          Escaneie o QR Code abaixo com a câmera do celular para ingressar diretamente na turma de
          <strong>{{ course.nome }}</strong
          >.
        </p>

        <!-- Moldura do QR Code -->
        <div
          class="tw-bg-white tw-p-4 tw-rounded-2xl tw-shadow-sm tw-inline-block tw-border tw-border-slate-100"
        >
          <QrcodeVue :value="qrValue" :size="240" level="H" />
        </div>

        <div
          class="tw-text-3xl tw-font-black tw-tracking-widest tw-mt-5 tw-text-primary tw-uppercase tw-font-mono"
        >
          {{ course.codigo_convite }}
        </div>

        <!-- Ações de Compartilhamento e Cópia -->
        <div
          class="tw-flex tw-flex-col sm:tw-flex-row tw-items-center tw-justify-center tw-gap-2.5 tw-mt-5"
        >
          <q-btn
            unelevated
            no-caps
            color="primary"
            icon="content_copy"
            label="Copiar Link da Aula"
            class="tw-rounded-2xl tw-px-5 tw-h-11 tw-font-bold tw-w-full sm:tw-w-auto tw-shadow-sm hover:tw-scale-[1.02] tw-transition-transform"
            @click="handleCopyLink"
          />
          <q-btn
            outline
            no-caps
            color="primary"
            icon="share"
            label="Compartilhar"
            class="tw-rounded-2xl tw-px-4 tw-h-11 tw-font-bold tw-w-full sm:tw-w-auto"
            @click="handleShareLink"
          />
        </div>

        <!-- Visualização do Link Direto -->
        <div
          class="tw-mt-4 tw-p-2.5 fc-badge-button tw-rounded-xl tw-text-xs text-muted tw-select-all tw-break-all tw-font-mono"
        >
          {{ classroomUrl }}
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped>
@media (prefers-reduced-motion: reduce) {
  .fc-course-card {
    transition: none !important;
    transform: none !important;
  }
}
</style>
