<script setup lang="ts">
import BaseSurfaceCard from '@/core/components/BaseSurfaceCard.vue';
</script>

<template>
  <BaseSurfaceCard class="tw-h-full tw-flex tw-flex-col tw-rounded-3xl tw-overflow-hidden">
    <!-- Barra decorativa superior de skeleton -->
    <q-skeleton type="rect" height="6px" square class="tw-w-full" />

    <q-card-section class="tw-flex-grow tw-flex tw-flex-col tw-p-5 sm:tw-p-6">
      <!-- Topo: Código e Status -->
      <div class="tw-flex tw-justify-between tw-items-center tw-mb-4">
        <q-skeleton type="rect" width="100px" height="26px" class="tw-rounded-xl" />
        <q-skeleton type="rect" width="80px" height="24px" class="tw-rounded-full" />
      </div>

      <!-- Identificação: Avatar + Título -->
      <div class="tw-flex tw-items-center tw-gap-3.5 tw-mb-4">
        <q-skeleton type="rect" width="48px" height="48px" class="tw-rounded-2xl tw-shrink-0" />
        <div class="tw-flex-1 tw-min-w-0">
          <q-skeleton type="text" width="80%" height="28px" class="tw-mb-1 tw-rounded" />
          <q-skeleton type="text" width="45%" height="18px" class="tw-rounded" />
        </div>
      </div>

      <!-- Descrição -->
      <div class="tw-space-y-1.5 tw-mb-5 tw-flex-grow">
        <q-skeleton type="text" width="100%" height="16px" class="tw-rounded" />
        <q-skeleton type="text" width="85%" height="16px" class="tw-rounded" />
      </div>

      <!-- Metadados em Pílulas -->
      <div class="tw-flex tw-flex-wrap tw-gap-2 tw-pt-1">
        <q-skeleton type="rect" width="70px" height="24px" class="tw-rounded-xl" />
        <q-skeleton type="rect" width="95px" height="24px" class="tw-rounded-xl" />
        <q-skeleton type="rect" width="60px" height="24px" class="tw-rounded-xl" />
      </div>
    </q-card-section>

    <q-separator />

    <!-- Ações Inferiores -->
    <q-card-actions class="tw-p-4 tw-flex tw-gap-2.5">
      <q-skeleton type="rect" width="110px" height="44px" class="tw-rounded-2xl" />
      <q-skeleton type="rect" class="tw-flex-1 tw-rounded-2xl" height="44px" />
    </q-card-actions>
  </BaseSurfaceCard>
</template>
