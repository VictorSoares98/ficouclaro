<script setup lang="ts">
import { computed } from 'vue';
import type { StudyGroupPublic } from '../types/study-group.types';

const props = defineProps<{
  group: StudyGroupPublic;
  isSelected?: boolean;
}>();

const emit = defineEmits<{
  (e: 'select', group: StudyGroupPublic): void;
}>();

const badgeProps = computed(() => {
  switch (props.group.tipo) {
    case 'monitoria':
      return { label: 'Monitoria', color: 'positive' };
    case 'projeto':
      return { label: 'Projeto', color: 'warning' };
    case 'reforco':
      return { label: 'Reforço', color: 'secondary' };
    default:
      return { label: 'Estudo', color: 'primary' };
  }
});

const scheduleText = computed(() => {
  const dia = props.group.dia_reuniao || props.group.dia_semana || 'A combinar';
  const hora = props.group.horario_reuniao || props.group.horario;
  return hora ? `${dia} · ${hora}` : dia;
});

const locationDetails = computed(() => {
  const parts = [
    props.group.predio_bloco,
    props.group.sala ? `Sala ${props.group.sala}` : null,
    props.group.local_especifico,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(' · ') : null;
});
</script>

<template>
  <q-card
    :id="'study-group-card-' + group.id"
    flat
    bordered
    class="tw-rounded-2xl tw-p-3.5 tw-shadow-sm tw-cursor-pointer hover:tw--translate-y-0.5 tw-transition-all tw-duration-200"
    :class="isSelected ? 'tw-ring-2 tw-ring-primary tw-border-primary' : ''"
    @click="emit('select', props.group)"
  >
    <!-- Topo: Título e Badge de Categoria/Tipo -->
    <div class="tw-flex tw-justify-between tw-items-start tw-gap-2 tw-mb-2">
      <div class="tw-min-w-0 tw-flex-1">
        <h3 class="text-subtitle2 text-weight-bold tw-leading-snug tw-line-clamp-2">
          {{ group.nome }}
        </h3>
        <p class="text-caption tw-opacity-80 tw-truncate tw-mt-0.5">
          {{ group.instituicao }}<span v-if="group.campus"> · {{ group.campus }}</span>
        </p>
        <p v-if="group.cidade && group.estado" class="text-caption tw-opacity-60 tw-truncate">
          {{ group.cidade }}, {{ group.estado }}
        </p>
      </div>

      <q-badge
        :color="badgeProps.color"
        class="text-weight-bold tw-shrink-0 tw-rounded-lg tw-px-2 tw-py-0.5 tw-text-[11px]"
      >
        {{ badgeProps.label }}
      </q-badge>
    </div>

    <!-- Bento Grid Style Info Blocks (Padrão Find My Pockets) -->
    <div class="tw-space-y-1.5 tw-my-2.5">
      <!-- Bloco de Horário e Encontros -->
      <div
        class="tw-rounded-xl tw-p-2 tw-flex tw-items-center tw-gap-2.5 tw-border tw-border-primary/15 tw-bg-primary/5"
      >
        <div
          class="tw-p-1.5 tw-rounded-lg tw-bg-primary/10 tw-text-primary tw-shrink-0 tw-flex tw-items-center tw-justify-center"
        >
          <q-icon name="schedule" size="16px" />
        </div>
        <div class="tw-min-w-0 tw-flex-1">
          <div class="text-caption text-weight-medium tw-truncate">
            {{ scheduleText }}
          </div>
        </div>
      </div>

      <!-- Bloco de Local Específico no Campus (se preenchido) -->
      <div
        v-if="locationDetails"
        class="tw-rounded-xl tw-p-2 tw-flex tw-items-center tw-gap-2.5 tw-border tw-border-secondary/15 tw-bg-secondary/5"
      >
        <div
          class="tw-p-1.5 tw-rounded-lg tw-bg-secondary/10 tw-text-secondary tw-shrink-0 tw-flex tw-items-center tw-justify-center"
        >
          <q-icon name="place" size="16px" />
        </div>
        <div class="tw-min-w-0 tw-flex-1">
          <div class="text-caption tw-truncate">
            {{ locationDetails }}
          </div>
        </div>
      </div>
    </div>

    <!-- Rodapé: Criador, Membros e Vagas -->
    <div
      class="tw-flex tw-items-center tw-justify-between tw-text-xs text-muted tw-pt-2 tw-border-t tw-border-gray-100 dark:tw-border-gray-800"
    >
      <div class="tw-flex tw-items-center tw-gap-1.5 tw-truncate tw-max-w-[55%]">
        <q-avatar v-if="group.criador_avatar" size="18px">
          <img :src="group.criador_avatar" alt="Avatar do criador" />
        </q-avatar>
        <q-avatar
          v-else-if="group.criador_nome"
          size="18px"
          color="primary"
          text-color="white"
          class="tw-font-bold tw-text-[10px]"
        >
          {{ group.criador_nome.charAt(0).toUpperCase() }}
        </q-avatar>
        <span class="tw-truncate" :title="group.criador_nome || 'Monitor'">
          {{ group.criador_nome || 'Monitor' }}
        </span>
      </div>

      <div class="tw-flex tw-items-center tw-gap-2.5 tw-shrink-0">
        <div class="tw-flex tw-items-center tw-gap-1">
          <q-icon name="group" size="14px" />
          <span>{{ group.total_membros }}</span>
        </div>

        <q-badge v-if="group.vagas" outline color="grey-6" class="tw-text-[10px] tw-rounded-md">
          {{ group.vagas }} vagas
        </q-badge>
      </div>
    </div>
  </q-card>
</template>
