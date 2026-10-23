<script setup lang="ts">
import { computed } from 'vue';
import { useNotificationStore } from '@/stores/notification.store';

const notificationStore = useNotificationStore();

const isMuted = computed({
  get: () => notificationStore.isSoundMuted,
  set: (val: boolean) => notificationStore.setSoundMuted(val),
});

const permission = computed(() => notificationStore.permissionStatus);
const unreadCount = computed(() => notificationStore.unreadCount);
const notifications = computed(() => notificationStore.notifications);

function formatDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function handleTestSound() {
  notificationStore.testSound('aula_iniciada');
}

async function handleRequestPermission() {
  await notificationStore.requestNotificationPermission();
}

function handleMarkAsRead(id: string) {
  void notificationStore.markAsRead(id);
}

function handleMarkAllAsRead() {
  void notificationStore.markAllAsRead();
}

function handleDelete(id: string) {
  void notificationStore.deleteNotification(id);
}
</script>

<template>
  <div class="tw-relative tw-inline-flex tw-items-center">
    <q-btn
      flat
      round
      dense
      :icon="isMuted ? 'volume_off' : 'notifications_active'"
      :color="isMuted ? 'grey-6' : 'primary'"
      class="tw-transition-transform active:tw-scale-95"
      aria-label="Abrir central de som e notificações"
    >
      <q-badge
        v-if="unreadCount > 0"
        color="negative"
        floating
        rounded
        class="tw-text-[10px] tw-font-bold"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </q-badge>

      <q-tooltip class="text-caption">
        {{ isMuted ? 'Som Silenciado (Clique para abrir opções)' : 'Notificações & Áudio Ativos' }}
      </q-tooltip>

      <q-menu
        anchor="bottom right"
        self="top right"
        :offset="[0, 10]"
        class="tw-rounded-2xl tw-shadow-2xl tw-overflow-hidden"
      >
        <q-card class="tw-w-80 sm:tw-w-96 tw-rounded-2xl">
          <!-- Cabeçalho do Menu -->
          <q-card-section class="tw-py-3 tw-px-4 tw-flex tw-items-center tw-justify-between">
            <div class="tw-flex tw-items-center tw-gap-2">
              <q-icon
                :name="isMuted ? 'volume_off' : 'volume_up'"
                :color="isMuted ? 'grey-6' : 'primary'"
                size="20px"
              />
              <span class="tw-font-bold tw-text-sm">Central de Avisos & Som</span>
            </div>

            <q-btn
              v-if="unreadCount > 0"
              flat
              dense
              no-caps
              size="xs"
              color="primary"
              label="Marcar lidas"
              @click="handleMarkAllAsRead"
            />
          </q-card-section>

          <q-separator />

          <!-- Seção de Controles de Som & Permissão -->
          <q-card-section class="tw-p-4 tw-space-y-3">
            <!-- Alternância de Mudo / Som -->
            <div class="tw-flex tw-items-center tw-justify-between">
              <div class="tw-flex tw-flex-col">
                <span class="tw-text-xs tw-font-semibold">Efeitos Sonoros</span>
                <span class="tw-text-[11px] text-muted">
                  {{ isMuted ? 'Sons do app silenciados' : 'Sons de aula, dúvidas e enquetes' }}
                </span>
              </div>

              <div class="tw-flex tw-items-center tw-gap-2">
                <q-btn
                  flat
                  dense
                  round
                  size="sm"
                  icon="play_arrow"
                  :disable="isMuted"
                  @click="handleTestSound"
                >
                  <q-tooltip>Testar efeito sonoro</q-tooltip>
                </q-btn>

                <q-toggle
                  v-model="isMuted"
                  :false-value="true"
                  :true-value="false"
                  color="primary"
                  dense
                  aria-label="Ativar ou desativar som"
                />
              </div>
            </div>

            <q-separator />

            <!-- Permissão de Notificações do Aparelho / Navegador -->
            <div>
              <div v-if="permission === 'granted'" class="tw-flex tw-items-center tw-gap-2 tw-text-[11px] text-positive">
                <q-icon name="check_circle" size="16px" />
                <span>Notificações push do aparelho ativadas</span>
              </div>

              <div
                v-else-if="permission === 'denied'"
                class="tw-flex tw-items-start tw-gap-2 tw-text-[11px] text-warning tw-leading-tight"
              >
                <q-icon name="info" size="16px" class="tw-shrink-0 tw-mt-0.5" />
                <span>
                  Notificações do navegador bloqueadas. O app continuará emitindo alertas na tela normalmente.
                </span>
              </div>

              <div v-else class="tw-flex tw-items-center tw-justify-between">
                <div class="tw-flex tw-flex-col">
                  <span class="tw-text-xs tw-font-semibold">Notificações Push</span>
                  <span class="tw-text-[11px] text-muted">Receba avisos no aparelho</span>
                </div>
                <q-btn
                  unelevated
                  dense
                  no-caps
                  size="sm"
                  color="primary"
                  label="Permitir"
                  icon="notifications"
                  class="tw-rounded-lg tw-px-2.5 tw-py-1"
                  @click="handleRequestPermission"
                />
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <!-- Lista de Notificações Recentes -->
          <q-list separator class="tw-max-h-64 tw-overflow-y-auto">
            <div
              v-if="notifications.length === 0"
              class="tw-py-8 tw-px-4 tw-text-center tw-text-xs text-muted tw-flex tw-flex-col tw-items-center tw-gap-1"
            >
              <q-icon name="notifications_none" size="28px" class="tw-opacity-40" />
              <span>Nenhuma notificação no momento</span>
            </div>

            <q-item
              v-for="item in notifications"
              :key="item.id"
              class="tw-py-2.5 tw-px-3"
              :class="{ 'bg-primary-soft text-primary': !item.lida }"
            >
              <q-item-section avatar class="tw-min-w-0 tw-pr-2">
                <q-avatar
                  size="28px"
                  :color="item.tipo === 'aula_iniciada' ? 'primary' : 'grey-3'"
                  :text-color="item.tipo === 'aula_iniciada' ? 'white' : 'dark'"
                >
                  <q-icon
                    :name="
                      item.tipo === 'aula_iniciada'
                        ? 'cast_for_education'
                        : item.tipo === 'nova_duvida'
                          ? 'live_help'
                          : item.tipo === 'enquete_aberta'
                            ? 'poll'
                            : 'notifications'
                    "
                    size="16px"
                  />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <div class="tw-flex tw-items-center tw-justify-between tw-gap-1">
                  <q-item-label class="tw-text-xs tw-font-bold tw-truncate">
                    {{ item.titulo }}
                  </q-item-label>
                  <span class="tw-text-[10px] text-muted">{{ formatDate(item.created_at) }}</span>
                </div>
                <q-item-label caption lines="2" class="tw-text-[11px] tw-mt-0.5">
                  {{ item.mensagem }}
                </q-item-label>
              </q-item-section>

              <q-item-section side class="tw-flex-row tw-items-center tw-gap-1 tw-pl-1">
                <q-btn
                  v-if="!item.lida"
                  flat
                  round
                  dense
                  size="xs"
                  icon="done"
                  color="primary"
                  @click="handleMarkAsRead(item.id)"
                >
                  <q-tooltip>Marcar como lida</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  size="xs"
                  icon="close"
                  color="grey-6"
                  @click="handleDelete(item.id)"
                >
                  <q-tooltip>Excluir</q-tooltip>
                </q-btn>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </q-menu>
    </q-btn>
  </div>
</template>
