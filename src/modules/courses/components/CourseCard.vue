<script setup lang="ts">
import type { Disciplina } from '@/modules/courses/services/course.service';
import BaseSurfaceCard from '@/core/components/BaseSurfaceCard.vue';

defineProps<{
  course: Disciplina;
  actionLabel: string;
  actionIcon: string;
  actionColor: string;
  showInviteCode?: boolean;
  showInsightsBtn?: boolean;
  sessionStatus?: 'aguardando' | 'ativa' | 'encerrada' | 'nenhuma';
}>();

defineEmits<{
  (e: 'action', courseId: string): void;
  (e: 'insights', courseId: string): void;
}>();
</script>

<template>
  <BaseSurfaceCard class="tw-h-full">
    <q-card-section>
      <div class="tw-flex tw-justify-between tw-items-start">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-avatar v-if="course.icone" size="md" color="primary" text-color="white">
            <q-icon :name="course.icone" />
          </q-avatar>
          <div>
            <h2 class="tw-text-xl tw-font-bold">{{ course.nome }}</h2>
            <div
              v-if="course.curso || course.semestre"
              class="tw-text-xs tw-text-primary tw-font-medium tw-mt-0.5"
            >
              {{ course.curso || '' }} {{ course.curso && course.semestre ? '•' : '' }}
              {{ course.semestre || '' }}
            </div>
          </div>
        </div>
        <div class="tw-flex tw-flex-col tw-items-end tw-gap-2">
          <q-badge v-if="showInviteCode" color="secondary" class="tw-text-sm tw-uppercase">
            Cód: {{ course.codigo_convite }}
          </q-badge>

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
              🟡 SALA DE ESPERA
            </q-badge>
            <q-badge v-else color="grey-7" class="tw-text-xs"> ⚪ SEM AULA </q-badge>
          </template>
        </div>
      </div>

      <p class="text-muted tw-mt-3 tw-text-sm tw-min-h-[20px]">
        {{ course.descricao || 'Sem descrição' }}
      </p>

      <!-- Metadados de Espaço/Tempo -->
      <div
        v-if="course.turma || course.horario || course.dia_semana || course.sala || course.bloco"
        class="tw-mt-3 tw-flex tw-flex-wrap tw-gap-2 tw-text-xs text-muted"
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
</template>
