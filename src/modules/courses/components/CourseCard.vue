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
        <q-badge v-if="showInviteCode" color="secondary" class="tw-text-sm">
          Cód: {{ course.codigo_convite }}
        </q-badge>
      </div>
      <p class="tw-opacity-70 tw-mt-2 tw-text-sm tw-min-h-[40px]">
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
        :color="actionColor"
        :icon="actionIcon"
        :label="actionLabel"
        @click="$emit('action', course.id)"
      />
    </q-card-actions>
  </BaseSurfaceCard>
</template>
