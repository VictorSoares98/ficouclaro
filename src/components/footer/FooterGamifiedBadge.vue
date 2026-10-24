<script setup lang="ts">
interface CommunityAvatar {
  id: string;
  name: string;
  initials: string;
  role: string;
  bgGradient: string;
}

const avatars: CommunityAvatar[] = [
  {
    id: '1',
    name: 'Ana Silva',
    initials: 'AS',
    role: 'Monitora de Cálculo',
    bgGradient: 'tw-from-blue-500 tw-to-indigo-600',
  },
  {
    id: '2',
    name: 'Bruno Castro',
    initials: 'BC',
    role: 'Aluno de Engenharia',
    bgGradient: 'tw-from-purple-500 tw-to-pink-600',
  },
  {
    id: '3',
    name: 'Carla Dias',
    initials: 'CD',
    role: 'Monitora de Física',
    bgGradient: 'tw-from-amber-500 tw-to-orange-600',
  },
  {
    id: '4',
    name: 'Diego Ramos',
    initials: 'DR',
    role: 'Professor Colaborador',
    bgGradient: 'tw-from-emerald-500 tw-to-teal-600',
  },
];
</script>

<template>
  <div
    class="tw-p-4 sm:tw-p-5 tw-rounded-2xl tw-backdrop-blur-md tw-bg-white/5 tw-border tw-border-white/10 tw-flex tw-flex-col sm:tw-flex-row tw-items-center tw-justify-between tw-gap-4 tw-mb-8"
  >
    <!-- Cluster de Estudantes e Monitores Conectados -->
    <div class="tw-flex tw-items-center tw-gap-3.5">
      <div class="tw-flex -tw-space-x-2.5 tw-overflow-hidden tw-p-0.5">
        <div
          v-for="avatar in avatars"
          :key="avatar.id"
          class="tw-inline-flex tw-items-center tw-justify-center tw-h-9 tw-w-9 tw-rounded-full tw-ring-2 tw-ring-white/20 tw-shadow-sm tw-text-white tw-text-xs tw-font-bold tw-bg-gradient-to-tr tw-transition-transform hover:tw-scale-110 hover:tw-z-10"
          :class="avatar.bgGradient"
          :title="`${avatar.name} (${avatar.role})`"
        >
          {{ avatar.initials }}
        </div>
      </div>

      <div>
        <div class="tw-text-xs sm:tw-text-sm tw-font-bold tw-leading-tight">
          Comunidade Acadêmica Conectada
        </div>
        <div class="tw-text-[11px] text-muted tw-mt-0.5">
          +18.000 dúvidas esclarecidas em 42 campus universitários
        </div>
      </div>
    </div>

    <!-- Indicador Gamificado de Nível do Campus e Status -->
    <div class="tw-flex tw-items-center tw-gap-2.5 tw-shrink-0">
      <q-chip
        dense
        color="primary"
        outline
        class="tw-m-0 text-weight-bold tw-px-3 tw-py-1 tw-text-[11px] tw-rounded-full"
      >
        <q-icon name="stars" color="warning" size="14px" class="tw-mr-1" />
        Campus Nível 4 · Ouro
      </q-chip>

      <div class="tw-flex tw-items-center tw-gap-1.5 tw-text-[11px] text-muted">
        <span class="tw-relative tw-flex tw-h-2 tw-w-2">
          <span
            class="tw-animate-ping tw-absolute tw-inline-flex tw-h-full tw-w-full tw-rounded-full tw-bg-positive tw-opacity-75"
          ></span>
          <span
            class="tw-relative tw-inline-flex tw-rounded-full tw-h-2 tw-w-2 tw-bg-positive"
          ></span>
        </span>
        <span class="tw-hidden sm:tw-inline">Sistemas online</span>
      </div>
    </div>
  </div>
</template>
