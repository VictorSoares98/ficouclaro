<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Disciplina } from '@/modules/courses/services/course.service';
import BaseSurfaceCard from '@/core/components/BaseSurfaceCard.vue';
import QrcodeVue from 'qrcode.vue';

const showQrCode = ref(false);
const qrValue = computed(() => `ficouclaro://join/${props.course.codigo_convite}`);

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
</script>

<template>
  <BaseSurfaceCard class="tw-h-full tw-flex tw-flex-col">
    <q-card-section class="tw-flex-grow tw-flex tw-flex-col">
      <!-- HEADER ROW: Badges (Left) & Options (Right) -->
      <div class="tw-flex tw-justify-between tw-items-center tw-mb-3">
        <!-- Left: Invite Code -->
        <div class="tw-flex tw-items-center tw-gap-2">
          <q-badge v-if="showInviteCode" color="secondary" class="tw-text-sm tw-uppercase">
            Cód: {{ course.codigo_convite }}
          </q-badge>
          <q-btn
            v-if="showInviteCode"
            flat
            round
            dense
            size="sm"
            color="primary"
            icon="qr_code"
            @click="showQrCode = true"
          >
            <q-tooltip>Mostrar QR Code</q-tooltip>
          </q-btn>
        </div>

        <!-- Right: Status & 3 Dots -->
        <div class="tw-flex tw-items-center tw-gap-2">
          <template v-if="sessionStatus !== undefined">
            <q-badge
              v-if="sessionStatus === 'ativa'"
              color="positive"
              class="tw-text-xs tw-animate-pulse"
            >
              🔴 AO VIVO
            </q-badge>
            <q-badge
              v-else-if="sessionStatus === 'aguardando'"
              color="warning"
              class="tw-text-xs text-black"
            >
              🟡 ESPERA
            </q-badge>
            <q-badge v-else color="grey-7" class="tw-text-xs"> ⚪ SEM AULA </q-badge>
          </template>

          <q-btn
            v-if="showOptionsBtn"
            flat
            round
            dense
            icon="more_vert"
            class="tw-text-grey-7 hover:tw-text-primary tw-transition-colors"
          >
            <q-menu auto-close>
              <q-list style="min-width: 150px">
                <q-item clickable @click="$emit('edit', course.id)">
                  <q-item-section avatar class="tw-min-w-0 tw-pr-2">
                    <q-icon name="edit" size="sm" />
                  </q-item-section>
                  <q-item-section>Editar</q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable @click="$emit('delete', course.id)" class="text-negative">
                  <q-item-section avatar class="tw-min-w-0 tw-pr-2">
                    <q-icon name="delete" size="sm" color="negative" />
                  </q-item-section>
                  <q-item-section>Excluir</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </div>

      <!-- MAIN INFO ROW: Avatar + Title -->
      <div class="tw-flex tw-items-center tw-gap-3 tw-w-full">
        <q-avatar
          v-if="course.icone"
          size="md"
          color="primary"
          text-color="white"
          class="tw-shrink-0"
        >
          <q-icon :name="course.icone" />
        </q-avatar>
        <div class="tw-min-w-0 tw-flex-1">
          <h2 class="tw-text-xl tw-font-bold tw-truncate" :title="course.nome">
            {{ course.nome }}
          </h2>
          <div
            v-if="course.curso || course.semestre"
            class="tw-text-xs tw-text-primary tw-font-medium tw-mt-0.5 tw-truncate"
          >
            {{ course.curso || '' }} {{ course.curso && course.semestre ? '•' : '' }}
            {{ course.semestre || '' }}
          </div>
        </div>
      </div>

      <!-- DESCRIPTION -->
      <p class="text-muted tw-mt-4 tw-text-sm tw-flex-grow">
        {{ course.descricao || 'Sem descrição' }}
      </p>

      <!-- METADATA (Turma/Horário) -->
      <div
        v-if="course.turma || course.horario || course.dia_semana || course.sala || course.bloco"
        class="tw-mt-4 tw-flex tw-flex-wrap tw-gap-3 tw-text-xs text-muted"
      >
        <div v-if="course.turma" class="tw-flex tw-items-center tw-gap-1">
          <q-icon name="group" size="xs" /> {{ course.turma }}
        </div>
        <div v-if="course.dia_semana || course.horario" class="tw-flex tw-items-center tw-gap-1">
          <q-icon name="schedule" size="xs" /> {{ course.dia_semana || '' }}
          {{ course.horario || '' }}
        </div>
        <div v-if="course.sala || course.bloco" class="tw-flex tw-items-center tw-gap-1">
          <q-icon name="room" size="xs" /> {{ course.sala || '' }}
          {{ course.sala && course.bloco ? '-' : '' }} {{ course.bloco || '' }}
        </div>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-actions class="tw-flex tw-flex-nowrap tw-gap-2 tw-p-3">
      <q-btn
        v-if="showInsightsBtn"
        class="tw-flex-1"
        flat
        no-wrap
        color="secondary"
        icon="insights"
        label="Insights"
        @click="$emit('insights', course.id)"
      />
      <q-btn
        class="tw-flex-1"
        flat
        no-wrap
        :color="sessionStatus === 'nenhuma' || sessionStatus === 'encerrada' ? 'grey' : actionColor"
        :icon="actionIcon"
        :label="sessionStatus === 'aguardando' ? 'Entrar na Sala' : actionLabel"
        :disable="sessionStatus === 'nenhuma' || sessionStatus === 'encerrada'"
        @click="$emit('action', course.id)"
      />
    </q-card-actions>
  </BaseSurfaceCard>

  <!-- Modal de QR Code -->
  <q-dialog v-model="showQrCode">
    <q-card class="tw-rounded-2xl tw-p-4 tw-text-center tw-bg-white dark:tw-bg-dark-page">
      <q-card-section>
        <div class="tw-text-xl tw-font-bold tw-mb-2">Convite para Turma</div>
        <p class="text-muted tw-mb-6">Escaneie o código abaixo para entrar</p>
        <div class="tw-bg-white tw-p-4 tw-rounded-xl tw-inline-block">
          <QrcodeVue :value="qrValue" :size="250" level="H" />
        </div>
        <div
          class="tw-text-3xl tw-font-black tw-tracking-widest tw-mt-6 tw-text-primary tw-uppercase"
        >
          {{ course.codigo_convite }}
        </div>
      </q-card-section>
      <q-card-actions align="center">
        <q-btn flat label="Fechar" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
