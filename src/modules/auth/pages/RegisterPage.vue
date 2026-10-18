<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from '@/stores/auth.store';
import { useCourseStore } from '@/modules/courses/stores/course.store';
import {
  courseService,
  type ClassroomInviteDetails,
} from '@/modules/courses/services/course.service';
import type { PapelUsuario } from '@/core/types/auth.types';
import AuthFormContainer from '@/modules/auth/components/AuthFormContainer.vue';
import PasswordStrengthMeter from '@/modules/auth/components/PasswordStrengthMeter.vue';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();
const courseStore = useCourseStore();

const joinCode = computed(() => {
  const code = route.query.join;
  return typeof code === 'string' ? code.trim().toLowerCase() : '';
});

const joinedCourseDetails = ref<ClassroomInviteDetails | null>(null);

const fullName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const isPasswordVisible = ref(false);
const role = ref<PapelUsuario>('aluno');
const termsAccepted = ref(false);

const googleButtonLabel = computed(() =>
  role.value === 'professor'
    ? 'Cadastrar como Professor com Google'
    : 'Cadastrar como Aluno com Google',
);

onMounted(() => {
  if (joinCode.value) {
    role.value = 'aluno';
    void (async () => {
      const details = await courseService.getCourseDetailsByInviteCode(joinCode.value);
      if (details) {
        joinedCourseDetails.value = details;
      }
    })();
  }

  if (typeof window !== 'undefined' && window.sessionStorage) {
    const saved = sessionStorage.getItem('ficouclaro_register_draft');
    if (saved && !joinCode.value) {
      try {
        const data = JSON.parse(saved);
        if (data.fullName) fullName.value = data.fullName;
        if (data.email) email.value = data.email;
        if (data.role) role.value = data.role;
      } catch {
        sessionStorage.removeItem('ficouclaro_register_draft');
      }
    }
  }
});

watch([fullName, email, role], () => {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    sessionStorage.setItem(
      'ficouclaro_register_draft',
      JSON.stringify({
        fullName: fullName.value,
        email: email.value,
        role: role.value,
      }),
    );
  }
});

const roleOptions: { label: string; value: PapelUsuario }[] = [
  { label: 'Sou Aluno', value: 'aluno' },
  { label: 'Sou Professor', value: 'professor' },
];

async function onSubmit() {
  if (!termsAccepted.value) {
    $q.notify({
      type: 'warning',
      message:
        'É obrigatório aceitar os Termos de Uso e a Política de Privacidade para prosseguir.',
      position: 'top',
    });
    return;
  }

  if (password.value !== confirmPassword.value) {
    $q.notify({
      type: 'negative',
      message: 'As senhas não coincidem',
      position: 'top',
    });
    return;
  }

  try {
    await authStore.register({
      email: email.value,
      password: password.value,
      options: {
        data: {
          nome_completo: fullName.value,
          papel: role.value,
          termos_aceitos_em: new Date().toISOString(),
          versao_termos: '1.0.0', // Versão atual da Política de Privacidade
        },
      },
    });

    // Registra a credencial no gerenciador nativo do dispositivo após criar a conta
    if (
      typeof window !== 'undefined' &&
      'credentials' in navigator &&
      (window as unknown as Record<string, unknown>).PasswordCredential
    ) {
      try {
        const PasswordCred = (
          window as unknown as {
            PasswordCredential: new (data: { id: string; password: string }) => Credential;
          }
        ).PasswordCredential;
        const cred = new PasswordCred({
          id: email.value,
          password: password.value,
        });
        await navigator.credentials.store(cred);
      } catch (err) {
        console.debug('[CredentialManager] Erro ao salvar credencial:', err);
      }
    }

    $q.notify({
      type: 'positive',
      message: 'Conta criada com sucesso!',
      position: 'top',
    });

    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.removeItem('ficouclaro_register_draft');
    }

    // Auto-matrícula se veio de um convite de turma
    if (joinCode.value) {
      try {
        await courseStore.enroll(joinCode.value);
        $q.notify({
          type: 'positive',
          icon: 'school',
          message: `Vinculado(a) com sucesso à matéria "${joinedCourseDetails.value?.nome || joinCode.value}"!`,
          position: 'top',
        });
      } catch (errEnroll) {
        console.warn('Auto-matrícula pós cadastro:', errEnroll);
      }

      if (joinedCourseDetails.value?.sessao_ativa_id) {
        void router.push(`/sala/${joinedCourseDetails.value.sessao_ativa_id}`);
        return;
      }
    }

    if (role.value === 'professor') {
      void router.push('/disciplinas');
    } else {
      void router.push('/hub');
    }
  } catch {
    // O erro já é tratado e notificado globalmente pelo authStore (useAsyncOperation)
    // Este catch serve apenas para interromper o fluxo e evitar o redirecionamento indevido
  }
}

async function onGoogleLogin() {
  if (!termsAccepted.value) {
    $q.notify({
      type: 'warning',
      message:
        'Por favor, assinale o aceite dos Termos de Uso e da Política de Privacidade antes de autenticar com o Google.',
      position: 'top',
    });
    return;
  }

  await authStore.loginWithGoogle({
    papel: role.value,
    termos_aceitos_em: new Date().toISOString(),
    versao_termos: '1.0.0',
  });
}
</script>

<template>
  <AuthFormContainer
    title="Criar Conta"
    subtitle="Junte-se à revolução do aprendizado síncrono."
    :isLoading="authStore.isLoading"
  >
    <div class="tw-space-y-2 sm:tw-space-y-2.5">
      <!-- Notificação de Vinculação à Matéria do Professor -->
      <div
        v-if="joinedCourseDetails"
        class="tw-p-4 tw-rounded-2xl tw-bg-primary-soft tw-border tw-border-primary/20 tw-shadow-sm tw-mb-3"
      >
        <div class="tw-flex tw-items-center tw-gap-3">
          <div
            class="tw-w-10 tw-h-10 tw-rounded-xl bg-primary text-white tw-flex tw-items-center tw-justify-center tw-shrink-0 tw-shadow-sm"
          >
            <q-icon :name="joinedCourseDetails.icone || 'school'" size="22px" />
          </div>
          <div class="tw-flex-1 tw-min-w-0">
            <div class="tw-text-[10px] tw-font-bold tw-text-primary tw-uppercase tw-tracking-wider">
              Vínculo de Turma Automático
            </div>
            <div class="tw-text-sm tw-font-bold tw-font-space-grotesk tw-truncate">
              {{ joinedCourseDetails.nome }}
            </div>
            <div class="tw-text-xs text-muted tw-leading-tight tw-mt-0.5">
              Ao criar sua conta, você será vinculado(a) à matéria do professor
              <strong>{{ joinedCourseDetails.professor_nome }}</strong
              >.
            </div>
          </div>
        </div>
      </div>

      <!-- 1. Seleção de Papel no Topo (Role-First Compacto) -->
      <div v-if="!joinedCourseDetails" class="tw-flex tw-justify-center">
        <q-btn-toggle
          v-model="role"
          spread
          dense
          class="tw-w-full tw-shadow-sm tw-rounded-xl tw-min-h-[36px]"
          no-caps
          unelevated
          toggle-color="primary"
          color="white"
          text-color="grey-8"
          :options="roleOptions"
        />
      </div>
      <div
        v-else
        class="tw-flex tw-items-center tw-justify-center tw-gap-1.5 tw-py-1 tw-text-xs tw-text-primary tw-font-bold"
      >
        <q-icon name="school" size="16px" />
        <span>Cadastro de Aluno Universitário</span>
      </div>

      <!-- 2. Botão de Cadastro Social com Papel Contextualizado -->
      <div>
        <q-btn
          class="tw-w-full tw-min-h-10 sm:tw-min-h-11 tw-py-1.5 tw-px-3 tw-rounded-xl tw-text-xs sm:tw-text-sm tw-font-bold tw-shadow-sm tw-bg-white hover:tw-bg-gray-50 dark:tw-bg-dark-page dark:hover:tw-bg-dark tw-border tw-border-gray-200 dark:tw-border-gray-800"
          text-color="grey-9"
          icon="img:/icons/google.svg"
          :label="googleButtonLabel"
          unelevated
          no-caps
          @click="onGoogleLogin"
          :loading="authStore.isLoading"
        />
      </div>

      <!-- 3. Consentimento Legal Ativo (Opt-in LGPD / Art. 7º e 8º) -->
      <div class="tw-flex tw-items-center tw-justify-center tw-px-1 tw-py-0.5">
        <q-checkbox v-model="termsAccepted" dense size="sm" color="primary">
          <span class="tw-text-[11px] sm:tw-text-xs text-muted tw-leading-tight">
            Li e aceito os
            <router-link to="/termos" class="tw-text-primary hover:tw-underline" target="_blank"
              >Termos de Uso</router-link
            >
            e a
            <router-link
              to="/privacidade"
              class="tw-text-primary hover:tw-underline"
              target="_blank"
              >Política de Privacidade</router-link
            >.
          </span>
        </q-checkbox>
      </div>

      <!-- 4. Divisor -->
      <div class="tw-flex tw-items-center tw-my-1">
        <div class="tw-flex-1 tw-h-px tw-bg-gray-300 dark:tw-bg-gray-700"></div>
        <span class="tw-px-3 text-muted tw-text-xs tw-font-medium">ou com e-mail</span>
        <div class="tw-flex-1 tw-h-px tw-bg-gray-300 dark:tw-bg-gray-700"></div>
      </div>

      <!-- 5. Formulário de Cadastro Tradicional Compacto -->
      <q-form @submit.prevent="onSubmit" class="tw-space-y-1.5 sm:tw-space-y-2">
        <div>
          <label class="tw-text-muted tw-text-[11px] sm:tw-text-xs tw-font-bold tw-mb-0.5 tw-block"
            >Nome Completo</label
          >
          <q-input
            v-model="fullName"
            type="text"
            placeholder="Ex: Carlos Silva"
            dense
            outlined
            hide-bottom-space
            lazy-rules
            :rules="[(val) => !!val || 'O nome é obrigatório']"
            autocomplete="name"
            name="name"
            enterkeyhint="next"
            color="primary"
          />
        </div>

        <div>
          <label class="tw-text-muted tw-text-[11px] sm:tw-text-xs tw-font-bold tw-mb-0.5 tw-block"
            >E-mail de Acesso</label
          >
          <q-input
            v-model="email"
            type="email"
            placeholder="seu.email@faculdade.edu"
            dense
            outlined
            hide-bottom-space
            lazy-rules
            :rules="[
              (val) => !!val || 'O e-mail é obrigatório',
              (val) => /.+@.+\..+/.test(val) || 'E-mail inválido',
            ]"
            autocomplete="email"
            name="email"
            enterkeyhint="next"
            color="primary"
          />
        </div>

        <div>
          <label class="tw-text-muted tw-text-[11px] sm:tw-text-xs tw-font-bold tw-mb-0.5 tw-block"
            >Criar Senha</label
          >
          <q-input
            v-model="password"
            :type="isPasswordVisible ? 'text' : 'password'"
            placeholder="Mínimo 12 caracteres (maiúscula, número e símbolo)"
            dense
            outlined
            hide-bottom-space
            lazy-rules
            :rules="[
              (val) => !!val || 'A senha é obrigatória',
              (val) =>
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/.test(val) ||
                'A senha não atende aos requisitos mínimos de segurança',
            ]"
            autocomplete="new-password"
            name="password"
            enterkeyhint="next"
            color="primary"
          >
            <template v-slot:append>
              <q-btn
                round
                dense
                flat
                size="sm"
                :icon="isPasswordVisible ? 'visibility_off' : 'visibility'"
                :aria-label="isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'"
                @click="isPasswordVisible = !isPasswordVisible"
              />
            </template>
          </q-input>

          <PasswordStrengthMeter :password="password" />
        </div>

        <div>
          <label class="tw-text-muted tw-text-[11px] sm:tw-text-xs tw-font-bold tw-mb-0.5 tw-block"
            >Confirmar Senha</label
          >
          <q-input
            v-model="confirmPassword"
            :type="isPasswordVisible ? 'text' : 'password'"
            placeholder="Repita a senha criada"
            dense
            outlined
            hide-bottom-space
            lazy-rules
            :rules="[
              (val) => !!val || 'A confirmação é obrigatória',
              (val) => val === password || 'As senhas não coincidem',
            ]"
            autocomplete="new-password"
            enterkeyhint="done"
            color="primary"
          >
            <template v-slot:append>
              <q-btn
                round
                dense
                flat
                size="sm"
                :icon="isPasswordVisible ? 'visibility_off' : 'visibility'"
                :aria-label="isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'"
                @click="isPasswordVisible = !isPasswordVisible"
              />
            </template>
          </q-input>
        </div>

        <q-btn
          type="submit"
          color="primary"
          class="tw-w-full tw-min-h-10 sm:tw-min-h-11 tw-py-2 tw-rounded-xl tw-text-xs sm:tw-text-sm tw-font-bold tw-shadow-md tw-mt-1"
          :loading="authStore.isLoading"
          unelevated
          no-caps
          label="Cadastrar na Plataforma"
        />
      </q-form>
    </div>
  </AuthFormContainer>
</template>
