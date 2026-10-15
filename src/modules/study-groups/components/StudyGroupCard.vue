<script setup lang="ts">
import type { StudyGroupPublic } from '../types/study-group.types';

const props = defineProps<{
  group: StudyGroupPublic;
  isSelected?: boolean;
}>();

const emit = defineEmits<{
  (e: 'select', group: StudyGroupPublic): void;
}>();
</script>

<template>
  <div
    class="tw-p-4 tw-rounded-2xl tw-border tw-transition-all tw-cursor-pointer hover:tw-shadow-md"
    :class="[
      isSelected
        ? 'tw-border-primary tw-bg-primary/5 dark:tw-bg-primary/10 tw-shadow-sm'
        : 'tw-border-gray-200 dark:tw-border-gray-800 tw-bg-white dark:tw-bg-dark-page hover:tw-border-primary/40',
    ]"
    @click="emit('select', props.group)"
  >
    <!-- Topo do Card: Nome e Badge de Tipo -->
    <div class="tw-flex tw-items-start tw-justify-between tw-gap-2 tw-mb-2">
      <h3 class="tw-font-bold tw-text-sm sm:tw-text-base tw-leading-snug tw-tracking-tight tw-line-clamp-2">
        {{ group.nome }}
      </h3>

      <span
        class="tw-px-2 tw-py-0.5 tw-rounded-full tw-text-[11px] tw-font-bold tw-shrink-0"
        :class="[
          group.tipo === 'monitoria'
            ? 'tw-bg-positive/10 tw-text-positive'
            : group.tipo === 'projeto'
              ? 'tw-bg-amber-500/10 tw-text-amber-600 dark:tw-text-amber-400'
              : 'tw-bg-primary/10 tw-text-primary',
        ]"
      >
        {{
          group.tipo === 'monitoria'
            ? 'Monitoria'
            : group.tipo === 'projeto'
              ? 'Projeto'
              : group.tipo === 'outro'
                ? 'Outro'
                : 'Estudo'
        }}
      </span>
    </div>

    <!-- Informações da Instituição e Campus -->
    <div class="tw-flex tw-items-center tw-gap-1.5 tw-text-xs text-muted tw-mb-2.5">
      <q-icon name="apartment" size="14px" />
      <span class="tw-truncate">{{ group.instituicao }}</span>
      <span v-if="group.campus" class="tw-truncate tw-opacity-75">· {{ group.campus }}</span>
    </div>

    <!-- Linha de Metadados: Horário e Participantes -->
    <div class="tw-flex tw-items-center tw-justify-between tw-text-xs text-muted tw-pt-2 tw-border-t tw-border-gray-100 dark:tw-border-gray-800/80">
      <div class="tw-flex tw-items-center tw-gap-1">
        <q-icon name="schedule" size="14px" />
        <span>{{ group.dia_semana || 'Data combinada' }} {{ group.horario ? '· ' + group.horario : '' }}</span>
      </div>

      <div class="tw-flex tw-items-center tw-gap-1">
        <q-icon name="group" size="14px" />
        <span>{{ group.total_membros }} {{ group.total_membros === 1 ? 'membro' : 'membros' }}</span>
      </div>
    </div>
  </div>
</template>
