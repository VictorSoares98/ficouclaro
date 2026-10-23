<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from '@/stores/auth.store';

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();

const user = computed(() => authStore.user);
const perfil = computed(() => authStore.user?.perfil);
const isProfessor = computed(() => authStore.isProfessor);

const userInitials = computed(() => {
  const name = perfil.value?.nome_completo || user.value?.auth.email || 'FC';
  const parts = name.trim().split(' ');
  const first = parts[0];
  const second = parts[1];
  if (parts.length >= 2 && first && second) {
    return (first.charAt(0) + second.charAt(0)).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
});

const roleLabel = computed(() => (isProfessor.value ? 'Professor' : 'Aluno'));
const roleColor = computed(() => (isProfessor.value ? 'secondary' : 'primary'));
const roleIcon = computed(() => (isProfessor.value ? 'school' : 'bolt'));

function handleLogout() {
  $q.dialog({
    title: 'Encerrar Sessão',
    message: 'Deseja realmente sair da sua conta?',
    ok: { label: 'Sair', color: 'negative', unelevated: true, noCaps: true },
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
  }).onOk(() => {
    void (async () => {
      try {
        await authStore.signOut();
        $q.notify({
          type: 'positive',
          message: 'Sessão encerrada com sucesso.',
          position: 'top',
        });
        void router.push('/login');
      } catch (error) {
        const err = error as Error;
        $q.notify({
          type: 'negative',
          message: 'Erro ao sair: ' + err.message,
          position: 'top',
        });
      }
    })();
  });
}
</script>

<template>
  <div v-if="user" class="tw-relative tw-inline-flex tw-items-center">
    <!-- Botão de Gatilho do Dropdown com Avatar e Indicador -->
    <button
      type="button"
      class="fc-badge-button tw-flex tw-items-center tw-gap-2.5 tw-p-1.5 tw-pr-3 tw-rounded-full focus:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-primary cursor-pointer"
      aria-label="Menu da conta do usuário"
      aria-haspopup="true"
    >
      <!-- Avatar com Anel Gamificado de Nível -->
      <div class="tw-relative tw-flex tw-items-center tw-justify-center">
        <div
          class="tw-w-8 tw-h-8 sm:tw-w-9 sm:tw-h-9 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-white tw-font-bold tw-text-xs tw-shadow-sm tw-bg-gradient-to-tr"
          :class="
            isProfessor ? 'tw-from-purple-600 tw-to-indigo-600' : 'tw-from-primary tw-to-secondary'
          "
        >
          <img
            v-if="perfil?.url_avatar"
            :src="perfil.url_avatar"
            :alt="perfil?.nome_completo || 'Avatar'"
            class="tw-w-full tw-h-full tw-rounded-full tw-object-cover"
          />
          <span v-else>{{ userInitials }}</span>
        </div>

        <!-- Indicador de Status Ativo -->
        <span
          class="tw-absolute -tw-bottom-0.5 -tw-right-0.5 tw-w-2.5 tw-h-2.5 tw-rounded-full tw-bg-positive tw-ring-2 tw-ring-white dark:tw-ring-slate-900"
        ></span>
      </div>

      <!-- Nome e Badge (Oculto em telas ultra-compactas, visível em sm+) -->
      <div class="tw-hidden sm:tw-flex tw-flex-col tw-text-left tw-leading-tight">
        <span class="tw-text-xs tw-font-bold tw-max-w-[120px] tw-truncate">
          {{ perfil?.nome_completo?.split(' ')[0] || 'Minha Conta' }}
        </span>
        <span class="tw-text-[10px] text-muted tw-flex tw-items-center tw-gap-1">
          <q-icon :name="roleIcon" size="11px" :color="roleColor" />
          {{ roleLabel }}
        </span>
      </div>

      <q-icon name="keyboard_arrow_down" size="16px" class="text-muted tw-hidden sm:tw-block" />

      <!-- Dropdown Quasar Governado Nativamente por q-card (ADR-003 & ui-quasar-tailwind) -->
      <q-menu
        anchor="bottom right"
        self="top right"
        :offset="[0, 8]"
        class="tw-rounded-2xl tw-shadow-2xl tw-min-w-[270px] tw-overflow-hidden"
      >
        <q-card flat class="tw-m-0">
          <!-- Cabeçalho do Perfil -->
          <div class="tw-p-4 bg-primary-soft">
            <div class="tw-flex tw-items-center tw-gap-3">
              <div
                class="tw-w-11 tw-h-11 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-white tw-font-bold tw-text-sm tw-shadow-md tw-bg-gradient-to-tr"
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
                <span v-else>{{ userInitials }}</span>
              </div>
              <div class="tw-min-w-0 tw-flex-1">
                <div class="tw-text-sm tw-font-bold tw-truncate">
                  {{ perfil?.nome_completo || 'Usuário Ficou Claro' }}
                </div>
                <div class="tw-text-[11px] text-muted tw-truncate">
                  {{ user.auth.email }}
                </div>
              </div>
            </div>

            <!-- Badges de Status e Papel -->
            <div class="tw-flex tw-items-center tw-gap-2 tw-mt-3">
              <q-badge
                rounded
                :color="roleColor"
                class="tw-text-[10px] text-weight-bold tw-px-2 tw-py-0.5"
              >
                {{ roleLabel }}
              </q-badge>
              <q-badge
                v-if="!isProfessor"
                outline
                color="warning"
                class="tw-text-[10px] text-weight-bold tw-px-2 tw-py-0.5"
              >
                ⚡ Nível 3 · 320 XP
              </q-badge>
              <q-badge
                v-else
                outline
                color="positive"
                class="tw-text-[10px] text-weight-bold tw-px-2 tw-py-0.5"
              >
                🎓 Docente Verificado
              </q-badge>
            </div>
          </div>

          <q-separator />

          <!-- Links de Navegação -->
          <q-list class="tw-p-1.5 tw-text-xs">
            <q-item
              v-if="!isProfessor"
              clickable
              v-close-popup
              to="/hub"
              class="tw-rounded-xl tw-transition-colors"
            >
              <q-item-section avatar class="tw-min-w-[32px]">
                <q-icon name="school" color="primary" size="18px" />
              </q-item-section>
              <q-item-section class="tw-font-medium">Meu Hub de Aulas</q-item-section>
            </q-item>

            <q-item
              v-if="isProfessor"
              clickable
              v-close-popup
              to="/dashboard"
              class="tw-rounded-xl tw-transition-colors"
            >
              <q-item-section avatar class="tw-min-w-[32px]">
                <q-icon name="dashboard" color="secondary" size="18px" />
              </q-item-section>
              <q-item-section class="tw-font-medium">Dashboard do Docente</q-item-section>
            </q-item>

            <q-item
              v-if="isProfessor"
              clickable
              v-close-popup
              to="/disciplinas"
              class="tw-rounded-xl tw-transition-colors"
            >
              <q-item-section avatar class="tw-min-w-[32px]">
                <q-icon name="library_books" color="secondary" size="18px" />
              </q-item-section>
              <q-item-section class="tw-font-medium">Minhas Turmas</q-item-section>
            </q-item>

            <q-item clickable v-close-popup to="/mapa" class="tw-rounded-xl tw-transition-colors">
              <q-item-section avatar class="tw-min-w-[32px]">
                <q-icon name="explore" color="info" size="18px" />
              </q-item-section>
              <q-item-section class="tw-font-medium">Mapa de Grupos do Campus</q-item-section>
            </q-item>

            <q-separator class="tw-my-1" />

            <q-item
              clickable
              v-close-popup
              to="/privacidade-seguranca"
              class="tw-rounded-xl tw-transition-colors"
            >
              <q-item-section avatar class="tw-min-w-[32px]">
                <q-icon name="security" color="positive" size="18px" />
              </q-item-section>
              <q-item-section class="tw-font-medium">Privacidade e Segurança</q-item-section>
            </q-item>

            <q-item clickable v-close-popup to="/termos" class="tw-rounded-xl tw-transition-colors">
              <q-item-section avatar class="tw-min-w-[32px]">
                <q-icon name="description" size="18px" />
              </q-item-section>
              <q-item-section class="tw-font-medium">Termos de Uso</q-item-section>
            </q-item>

            <q-separator class="tw-my-1" />

            <!-- Ação de Logout -->
            <q-item
              clickable
              v-close-popup
              @click="handleLogout"
              class="tw-rounded-xl text-negative tw-transition-colors"
            >
              <q-item-section avatar class="tw-min-w-[32px]">
                <q-icon name="logout" color="negative" size="18px" />
              </q-item-section>
              <q-item-section class="tw-font-bold">Encerrar Sessão</q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </q-menu>
    </button>
  </div>
</template>
