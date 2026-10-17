<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import AccessibilityMenu from '@/components/AccessibilityMenu.vue';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const router = useRouter();
const authStore = useAuthStore();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
});

const isAuthenticated = computed(() => authStore.isAuthenticated);
const isProfessor = computed(() => authStore.isProfessor);
const user = computed(() => authStore.user);
const perfil = computed(() => authStore.user?.perfil);

function navigateTo(path: string) {
  isOpen.value = false;
  void router.push(path);
}
</script>

<template>
  <q-drawer
    v-model="isOpen"
    side="right"
    overlay
    behavior="mobile"
    :width="300"
    class="fc-glass-drawer tw-shadow-2xl"
  >
    <div class="tw-flex tw-flex-col tw-h-full tw-p-5">
      <!-- Topo do Drawer com Título e Fechar -->
      <div class="tw-flex tw-items-center tw-justify-between tw-pb-4">
        <h2 class="text-subtitle1 text-weight-bold tw-font-space-grotesk tw-m-0">
          FICOU <span class="text-primary">CLARO?</span>
        </h2>
        <q-btn flat round dense icon="close" aria-label="Fechar menu" @click="isOpen = false" />
      </div>

      <q-separator />

      <!-- Card do Usuário Autenticado -->
      <div v-if="isAuthenticated && user" class="tw-py-4">
        <div class="tw-flex tw-items-center tw-gap-3">
          <div
            class="tw-w-10 tw-h-10 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-white tw-font-bold tw-text-xs tw-shadow-md tw-bg-gradient-to-tr"
            :class="
              isProfessor
                ? 'tw-from-purple-600 tw-to-indigo-600'
                : 'tw-from-primary tw-to-secondary'
            "
          >
            <img
              v-if="perfil?.url_avatar"
              :src="perfil.url_avatar"
              :alt="perfil?.nome_completo || 'Avatar'"
              class="tw-w-full tw-h-full tw-rounded-full tw-object-cover"
            />
            <span v-else>{{ perfil?.nome_completo?.slice(0, 2).toUpperCase() || 'FC' }}</span>
          </div>

          <div class="tw-min-w-0 tw-flex-1">
            <div class="tw-text-xs tw-font-bold tw-truncate">
              {{ perfil?.nome_completo || 'Minha Conta' }}
            </div>
            <div class="tw-text-[10px] text-muted tw-truncate">
              {{ isProfessor ? 'Professor Docente 🎓' : 'Aluno Universitário ⚡' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Ações para Visitante (Não Autenticado) -->
      <div v-else class="tw-py-4 tw-space-y-2">
        <q-btn
          unelevated
          color="primary"
          label="Começar Gratuitamente"
          no-caps
          class="tw-w-full tw-rounded-xl text-weight-bold tw-text-xs tw-h-10"
          @click="navigateTo('/register')"
        />
        <q-btn
          outline
          color="primary"
          label="Já tenho uma conta"
          no-caps
          class="tw-w-full tw-rounded-xl text-weight-bold tw-text-xs tw-h-10"
          @click="navigateTo('/login')"
        />
      </div>

      <q-separator />

      <!-- Links de Navegação Suplementares -->
      <q-scroll-area class="tw-flex-1 tw-py-2">
        <q-list class="tw-space-y-1 tw-text-xs">
          <q-item clickable class="tw-rounded-xl" @click="navigateTo('/mapa')">
            <q-item-section avatar class="tw-min-w-[32px]">
              <q-icon name="explore" color="primary" size="18px" />
            </q-item-section>
            <q-item-section class="tw-font-bold"> Mapa de Monitorias </q-item-section>
            <q-item-section side>
              <q-badge color="primary" rounded class="tw-text-[9px]">Novo ✨</q-badge>
            </q-item-section>
          </q-item>

          <q-item clickable class="tw-rounded-xl" @click="navigateTo('/sala')">
            <q-item-section avatar class="tw-min-w-[32px]">
              <q-icon name="pin" color="secondary" size="18px" />
            </q-item-section>
            <q-item-section class="tw-font-medium"> Entrar em Aula com Código </q-item-section>
          </q-item>

          <q-separator class="tw-my-2" />

          <q-item-label header class="tw-text-[10px] text-muted tw-font-bold tw-uppercase tw-p-2">
            Institucional & Segurança
          </q-item-label>

          <q-item clickable class="tw-rounded-xl" @click="navigateTo('/privacidade-seguranca')">
            <q-item-section avatar class="tw-min-w-[32px]">
              <q-icon name="security" color="positive" size="18px" />
            </q-item-section>
            <q-item-section class="tw-font-medium"> Privacidade & LGPD </q-item-section>
          </q-item>

          <q-item clickable class="tw-rounded-xl" @click="navigateTo('/termos')">
            <q-item-section avatar class="tw-min-w-[32px]">
              <q-icon name="description" size="18px" />
            </q-item-section>
            <q-item-section class="tw-font-medium"> Termos de Uso </q-item-section>
          </q-item>

          <q-item clickable class="tw-rounded-xl" @click="navigateTo('/privacidade')">
            <q-item-section avatar class="tw-min-w-[32px]">
              <q-icon name="lock" size="18px" />
            </q-item-section>
            <q-item-section class="tw-font-medium"> Política de Privacidade </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>

      <q-separator />

      <!-- Rodapé do Drawer com Acessibilidade -->
      <div class="tw-pt-3 tw-flex tw-items-center tw-justify-between">
        <span class="tw-text-xs text-muted tw-font-medium">Acessibilidade:</span>
        <AccessibilityMenu />
      </div>
    </div>
  </q-drawer>
</template>
