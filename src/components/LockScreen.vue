<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import { biometricService } from '@/core/services/biometric.service';
import { Platform } from 'quasar';

const authStore = useAuthStore();
const password = ref('');
const isCheckingBiometry = ref(false);

async function unlockWithBiometry() {
  if (!Platform.is.capacitor || !biometricService.isBiometricsEnabled()) return;
  
  isCheckingBiometry.value = true;
  const success = await biometricService.authenticate();
  if (success) {
    authStore.unlockSession();
  }
  isCheckingBiometry.value = false;
}

async function unlockWithPassword() {
  if (!password.value) return;
  const success = await authStore.unlockWithPassword(password.value);
  if (success) {
    password.value = '';
  }
}

async function logout() {
  await authStore.signOut();
}

onMounted(() => {
  // Dispara a biometria automaticamente assim que a tela de bloqueio monta
  if (Platform.is.capacitor && biometricService.isBiometricsEnabled()) {
    void unlockWithBiometry();
  }
});
</script>

<template>
  <div class="tw-fixed tw-inset-0 tw-z-[9999] tw-bg-dark-page tw-flex tw-flex-col tw-items-center tw-justify-center tw-p-6">
    <!-- Overlay de fundo borrado sobre o app -->
    <div class="tw-absolute tw-inset-0 tw-backdrop-blur-md tw-bg-black/90"></div>
    
    <div class="tw-relative tw-z-10 tw-w-full tw-max-w-md tw-flex tw-flex-col tw-items-center tw-text-center">
      <q-avatar size="100px" class="tw-mb-6 tw-bg-primary tw-text-white">
        <q-icon name="lock" size="50px" />
      </q-avatar>
      
      <h2 class="tw-text-2xl tw-font-bold tw-text-white tw-mb-2">Sessão Bloqueada</h2>
      <p class="tw-text-gray-400 tw-mb-8">
        {{ authStore.user?.perfil.nome_completo || authStore.user?.auth.email }}
      </p>

      <!-- Fallback de Senha para Web/PWA ou falha de Biometria -->
      <q-input
        v-model="password"
        type="password"
        label="Senha"
        color="primary"
        label-color="grey-5"
        text-color="white"
        filled
        class="tw-w-full tw-mb-4"
        @keyup.enter="unlockWithPassword"
        :disable="authStore.isLoading"
      />

      <q-btn
        color="primary"
        label="Desbloquear"
        class="tw-w-full tw-mb-4 tw-h-12"
        @click="unlockWithPassword"
        :loading="authStore.isLoading"
      />

      <!-- Botão de Biometria apenas nativo -->
      <q-btn
        v-if="Platform.is.capacitor && biometricService.isBiometricsEnabled()"
        flat
        color="white"
        icon="fingerprint"
        label="Usar Biometria"
        class="tw-w-full tw-mb-6 tw-h-12"
        @click="unlockWithBiometry"
        :loading="isCheckingBiometry"
      />

      <q-btn
        flat
        color="negative"
        label="Sair desta conta"
        class="tw-w-full"
        @click="logout"
      />
    </div>
  </div>
</template>
