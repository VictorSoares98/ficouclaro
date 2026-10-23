import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Notify } from 'quasar';
import { soundService } from '@/core/services/sound.service';
import { notificationService } from '@/core/services/notification.service';
import { realtimeManager } from '@/core/supabase/realtime.manager';
import type { AppNotification, TipoNotificacao } from '@/core/types/notification.types';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export const useNotificationStore = defineStore('notification', () => {
  // Estado de Som persistido no localStorage
  const savedMute =
    typeof window !== 'undefined'
      ? localStorage.getItem('ficouclaro_sound_muted') === 'true'
      : false;
  const isSoundMuted = ref<boolean>(savedMute);
  soundService.setMuted(savedMute);

  // Status de permissão de notificações do sistema
  const permissionStatus = ref<NotificationPermission>(notificationService.getPermissionStatus());

  // Lista reativa de notificações do usuário
  const notifications = ref<AppNotification[]>([]);
  const activeUserId = ref<string | null>(null);
  const isRealtimeSubscribed = ref(false);

  const unreadCount = computed(() => notifications.value.filter((n) => !n.lida).length);

  /**
   * Alterna entre som ativado e mudo, persistindo a preferência do usuário.
   */
  function toggleSound(): boolean {
    isSoundMuted.value = !isSoundMuted.value;
    soundService.setMuted(isSoundMuted.value);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ficouclaro_sound_muted', String(isSoundMuted.value));
    }

    if (!isSoundMuted.value) {
      // Pequeno bip de confirmação ao reativar o áudio
      soundService.playNotificationChime();
    }

    return isSoundMuted.value;
  }

  /**
   * Força o estado de mudo diretamente.
   */
  function setSoundMuted(muted: boolean): void {
    isSoundMuted.value = muted;
    soundService.setMuted(muted);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ficouclaro_sound_muted', String(muted));
    }
  }

  /**
   * Toca um som de teste com a Web Audio API procedural.
   */
  function testSound(tipo: TipoNotificacao = 'sistema'): void {
    if (isSoundMuted.value) {
      Notify.create({
        type: 'info',
        message: 'O som está silenciado no momento. Ative o som para ouvir.',
        icon: 'volume_off',
        position: 'top',
        timeout: 2500,
      });
      return;
    }
    soundService.playForEventType(tipo);
  }

  /**
   * Solicita permissão para notificações push / sistema de forma resiliente.
   */
  async function requestNotificationPermission(): Promise<NotificationPermission> {
    const status = await notificationService.requestPermission();
    permissionStatus.value = status;

    if (status === 'granted') {
      Notify.create({
        type: 'positive',
        message: 'Notificações push ativadas com sucesso!',
        icon: 'notifications_active',
        position: 'top',
        timeout: 3000,
      });
      if (activeUserId.value) {
        void notificationService.registerDevice(activeUserId.value);
      }
    } else if (status === 'denied') {
      Notify.create({
        type: 'warning',
        message: 'Notificações do navegador bloqueadas. O app exibirá alertas visuais na tela.',
        icon: 'notifications_off',
        position: 'top',
        timeout: 4000,
      });
    }

    return status;
  }

  /**
   * Inicializa o histórico e a escuta em tempo real das notificações do usuário.
   */
  async function initUserNotifications(userId: string): Promise<void> {
    if (!userId) return;

    if (activeUserId.value === userId && isRealtimeSubscribed.value) {
      return;
    }

    if (activeUserId.value && activeUserId.value !== userId) {
      cleanupUserNotifications();
    }

    activeUserId.value = userId;

    // Registra o dispositivo do usuário
    void notificationService.registerDevice(userId);

    // Carrega notificações anteriores
    try {
      notifications.value = await notificationService.fetchNotifications(userId);
    } catch (e) {
      console.warn('[NotificationStore] Falha ao buscar histórico de notificações:', e);
    }

    // Inicia assinatura Realtime singleton
    const channelName = `user-notifications-${userId}`;
    const channel = realtimeManager.getChannel(channelName);

    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notificacoes',
        filter: `usuario_id=eq.${userId}`,
      },
      (payload: RealtimePostgresChangesPayload<AppNotification>) => {
        if (payload.eventType === 'INSERT') {
          const newNotif = payload.new;
          notifications.value = [newNotif, ...notifications.value];

          // 1. Feedback Sonoro
          soundService.playForEventType(newNotif.tipo);

          // 2. Notificação Nativa do Sistema / Push
          notificationService.showSystemNotification(newNotif.titulo, {
            body: newNotif.mensagem,
            tag: newNotif.id,
          });

          // 3. Feedback Visual em tela (Quasar Notify)
          const notifyOptions: Parameters<typeof Notify.create>[0] = {
            message: newNotif.titulo,
            caption: newNotif.mensagem,
            icon:
              newNotif.tipo === 'aula_iniciada'
                ? 'cast_for_education'
                : newNotif.tipo === 'nova_duvida'
                  ? 'live_help'
                  : newNotif.tipo === 'enquete_aberta'
                    ? 'poll'
                    : 'notifications',
            color: newNotif.tipo === 'aula_iniciada' ? 'primary' : 'dark',
            position: 'top-right',
            timeout: 5000,
          };

          if (newNotif.link) {
            notifyOptions.actions = [
              {
                label: 'Ver',
                color: 'white',
                handler: () => {
                  if (typeof window !== 'undefined' && newNotif.link) {
                    window.location.href = newNotif.link;
                  }
                },
              },
            ];
          }

          Notify.create(notifyOptions);
        }
      },
    );

    realtimeManager.subscribe(channelName);
    isRealtimeSubscribed.value = true;
  }

  /**
   * Libera o canal Realtime e desassina as notificações.
   */
  function cleanupUserNotifications(): void {
    if (activeUserId.value && isRealtimeSubscribed.value) {
      realtimeManager.releaseChannel(`user-notifications-${activeUserId.value}`);
      isRealtimeSubscribed.value = false;
      activeUserId.value = null;
    }
  }

  /**
   * Marca uma notificação como lida.
   */
  async function markAsRead(notificationId: string): Promise<void> {
    const target = notifications.value.find((n) => n.id === notificationId);
    if (target) {
      target.lida = true;
    }
    await notificationService.markAsRead(notificationId);
  }

  /**
   * Marca todas as notificações como lidas.
   */
  async function markAllAsRead(): Promise<void> {
    notifications.value.forEach((n) => {
      n.lida = true;
    });
    if (activeUserId.value) {
      await notificationService.markAllAsRead(activeUserId.value);
    }
  }

  /**
   * Remove uma notificação do histórico.
   */
  async function deleteNotification(notificationId: string): Promise<void> {
    notifications.value = notifications.value.filter((n) => n.id !== notificationId);
    await notificationService.deleteNotification(notificationId);
  }

  return {
    isSoundMuted,
    permissionStatus,
    notifications,
    unreadCount,
    toggleSound,
    setSoundMuted,
    testSound,
    requestNotificationPermission,
    initUserNotifications,
    cleanupUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
});
