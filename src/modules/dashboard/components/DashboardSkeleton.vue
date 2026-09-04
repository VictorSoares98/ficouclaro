<script setup lang="ts">
// Skeleton component to mirror the layout of the Dashboard page
// 4 small metric cards + 2 large chart panels
</script>

<template>
  <div class="tw-space-y-8 tw-mt-8">
    <!-- 4 Métricas Grid -->
    <div class="tw-grid tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-3 sm:tw-gap-4">
      <q-card
        v-for="i in 4"
        :key="i"
        class="tw-bg-white/5 tw-backdrop-blur-sm tw-border tw-border-white/10 tw-shadow-sm tw-rounded-xl tw-p-4"
        flat
      >
        <div class="tw-flex tw-justify-between tw-items-start">
          <div>
            <q-skeleton type="text" width="80px" class="tw-mb-2" />
            <q-skeleton type="text" width="60px" height="30px" />
          </div>
          <q-skeleton type="QAvatar" size="36px" />
        </div>
      </q-card>
    </div>

    <!-- 2 Gráficos Grid -->
    <div class="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-8">
      <q-card
        v-for="j in 2"
        :key="'chart-' + j"
        class="tw-bg-white/5 tw-backdrop-blur-sm tw-border tw-border-white/10 tw-shadow-sm tw-rounded-xl"
        flat
      >
        <q-card-section>
          <q-skeleton type="text" width="150px" class="tw-mb-4" />
          <q-skeleton type="rect" height="250px" class="tw-rounded-lg" />
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>
