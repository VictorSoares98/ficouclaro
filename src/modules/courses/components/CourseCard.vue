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
        <h2 class="tw-text-xl tw-font-bold">{{ course.nome }}</h2>
        <div class="tw-flex tw-flex-col tw-items-end tw-gap-2">
          <q-badge v-if="showInviteCode" color="secondary" class="tw-text-sm">
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
      <p class="text-muted tw-mt-2 tw-text-sm tw-min-h-[40px]">
        {{ course.descricao || 'Sem descrição' }}
      </p>
    </q-card-section>

    <q-separator />

    <q-card-actions align="right">
      <q-btn
        v-if="showInsightsBtn"
        flat
        color="secondary"
        icon="insights"
        label="Insights"
        @click="$emit('insights', course.id)"
      />
      <q-btn
        flat
        :color="sessionStatus === 'nenhuma' || sessionStatus === 'encerrada' ? 'grey' : actionColor"
        :icon="actionIcon"
        :label="sessionStatus === 'aguardando' ? 'Entrar na Sala' : actionLabel"
        :disable="sessionStatus === 'nenhuma' || sessionStatus === 'encerrada'"
        @click="$emit('action', course.id)"
      />
    </q-card-actions>
  </BaseSurfaceCard>
</template>
