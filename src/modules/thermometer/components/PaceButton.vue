<script setup lang="ts">
import { onUnmounted } from 'vue';
import { useThermometerStore } from '@/modules/thermometer/stores/thermometer.store';
import type { SinalRitmo } from '@/modules/thermometer/services/thermometer.service';
import { useSessionStore } from '@/modules/session/stores/session.store';
import { useQuasar } from 'quasar';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const thermometerStore = useThermometerStore();
const sessionStore = useSessionStore();
const $q = useQuasar();

// Garante que o timer de cooldown seja cancelado e o estado seja limpo ao sair da tela
onUnmounted(() => {
  thermometerStore.clearStudentState();
});

const options: { value: SinalRitmo; label: string; icon: string; color: string }[] = [
  { value: 'tudo_certo', label: 'Tudo Certo', icon: 'thumb_up', color: 'positive' },
  { value: 'boiando', label: 'Tô Boiando', icon: 'sentiment_very_dissatisfied', color: 'warning' },
  { value: 'muito_rapido', label: 'Muito Rápido', icon: 'speed', color: 'negative' },
  { value: 'muito_devagar', label: 'Muito Devagar', icon: 'slow_motion_video', color: 'info' },
];

async function handleSignal(sinal: SinalRitmo) {
  if (sessionStore.currentSession) {
    if ($q.platform.is.capacitor) {
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch (e) {
        console.warn('Haptics indisponível:', e);
      }
    }
    void thermometerStore.sendSignal(sessionStore.currentSession.id, sinal);
  }
}
</script>

<template>
  <div class="tw-w-full">
    <div class="tw-text-center tw-mb-6">
      <h3 class="tw-text-lg tw-font-bold tw-text-primary">Termômetro de Ritmo</h3>
      <p class="tw-text-sm text-muted">Como está a aula para você agora?</p>
    </div>

    <!-- Grid de Feedback -->
    <div class="tw-grid tw-grid-cols-2 tw-gap-4">
      <q-btn
        v-for="opt in options"
        :key="opt.value"
        :color="opt.color"
        :outline="thermometerStore.lastSignalSent !== opt.value"
        class="tw-py-6 tw-rounded-xl tw-flex tw-flex-col hover:tw-shadow-md active:tw-scale-95 tw-transition-all"
        no-caps
        unelevated
        @click="handleSignal(opt.value)"
      >
        <div class="tw-flex tw-flex-col tw-items-center tw-gap-2">
          <q-icon :name="opt.icon" size="2.5rem" />
          <span class="tw-font-semibold tw-text-sm">{{ opt.label }}</span>
        </div>
      </q-btn>
    </div>

    <!-- Feedback Visual de Cooldown -->
    <div class="tw-mt-6 tw-text-center tw-min-h-[24px]">
      <transition name="q-transition--fade">
        <span
          v-if="thermometerStore.isCooldown"
          class="tw-text-xs tw-text-warning tw-flex tw-items-center tw-justify-center tw-gap-1"
        >
          <q-icon name="timer" />
          Aguarde alguns segundos para enviar outro feedback...
        </span>
        <span
          v-else-if="thermometerStore.lastSignalSent"
          class="tw-text-xs tw-text-positive tw-flex tw-items-center tw-justify-center tw-gap-1"
        >
          <q-icon name="check_circle" />
          Feedback enviado!
        </span>
      </transition>
    </div>
  </div>
</template>
