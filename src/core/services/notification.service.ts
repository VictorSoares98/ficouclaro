import { supabaseClient } from '@/core/supabase/client';
import type { AppNotification, TipoNotificacao } from '@/core/types/notification.types';
import type { Json } from '@/core/types/database.types';

class NotificationService {
  /**
   * Retorna o status atual de permissão do navegador de forma segura.
   */
  public getPermissionStatus(): NotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  /**
   * Solicita permissão ao usuário de forma resiliente.
   * Negar permissão NUNCA lança exceção nem interrompe a navegação.
   */
  public async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (e) {
      console.warn('[NotificationService] Não foi possível solicitar permissão:', e);
      return 'denied';
    }
  }

  /**
   * Registra o dispositivo do usuário na tabela de dispositivos para recebimento de push/alertas.
   */
  public async registerDevice(userId: string): Promise<void> {
    if (!userId || typeof window === 'undefined') return;

    try {
      let endpoint = `client-${userId}-${navigator.userAgent.slice(0, 32)}`;
      let p256dh: string | null = null;
      let authKey: string | null = null;

      // Se houver service worker e pushManager com suporte
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
          const registration = await navigator.serviceWorker.ready;
          const existingSub = await registration.pushManager.getSubscription();
          if (existingSub) {
            endpoint = existingSub.endpoint;
            const p256 = existingSub.getKey('p256dh');
            const auth = existingSub.getKey('auth');
            if (p256) p256dh = btoa(String.fromCharCode(...new Uint8Array(p256)));
            if (auth) authKey = btoa(String.fromCharCode(...new Uint8Array(auth)));
          }
        } catch {
          // Fallback para endpoint de cliente
        }
      }

      const plataforma = /android/i.test(navigator.userAgent)
        ? 'android'
        : /iphone|ipad|ipod/i.test(navigator.userAgent)
          ? 'ios'
          : 'web';

      await supabaseClient.from('dispositivos_usuarios').upsert(
        {
          usuario_id: userId,
          endpoint,
          p256dh,
          auth_key: authKey,
          user_agent: navigator.userAgent,
          plataforma,
          ativo: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'usuario_id,endpoint' },
      );
    } catch (e) {
      console.warn('[NotificationService] Falha ao registrar dispositivo:', e);
    }
  }

  /**
   * Busca a lista recente de notificações do usuário.
   */
  public async fetchNotifications(userId: string, limit = 20): Promise<AppNotification[]> {
    if (!userId) return [];

    const { data, error } = await supabaseClient
      .from('notificacoes')
      .select('*')
      .eq('usuario_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[NotificationService] Erro ao buscar notificações:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Marca uma notificação específica como lida.
   */
  public async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabaseClient
      .from('notificacoes')
      .update({ lida: true })
      .eq('id', notificationId);

    if (error) {
      console.error('[NotificationService] Erro ao marcar notificação como lida:', error);
    }
  }

  /**
   * Marca todas as notificações do usuário como lidas.
   */
  public async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabaseClient
      .from('notificacoes')
      .update({ lida: true })
      .eq('usuario_id', userId)
      .eq('lida', false);

    if (error) {
      console.error(
        '[NotificationService] Erro ao marcar todas as notificações como lidas:',
        error,
      );
    }
  }

  /**
   * Remove uma notificação.
   */
  public async deleteNotification(notificationId: string): Promise<void> {
    const { error } = await supabaseClient.from('notificacoes').delete().eq('id', notificationId);

    if (error) {
      console.error('[NotificationService] Erro ao deletar notificação:', error);
    }
  }

  /**
   * Dispara uma notificação para um usuário específico via RPC.
   */
  public async sendNotification(params: {
    usuarioId: string;
    titulo: string;
    mensagem: string;
    tipo?: TipoNotificacao;
    link?: string;
    dadosExtras?: Json;
  }): Promise<string | null> {
    const { data, error } = await supabaseClient.rpc('enviar_notificacao_evento', {
      p_usuario_id: params.usuarioId,
      p_titulo: params.titulo,
      p_mensagem: params.mensagem,
      p_tipo: params.tipo || 'sistema',
      p_link: params.link || null,
      p_dados_extras: params.dadosExtras ?? {},
    });

    if (error) {
      console.error('[NotificationService] Erro ao enviar notificação:', error);
      return null;
    }

    return data;
  }

  /**
   * Dispara notificação para toda a turma de uma sessão de aula.
   */
  public async notifyClassSession(params: {
    sessaoId: string;
    titulo: string;
    mensagem: string;
    tipo?: TipoNotificacao;
    link?: string;
    dadosExtras?: Json;
  }): Promise<number> {
    const { data, error } = await supabaseClient.rpc('notificar_turma_sessao', {
      p_sessao_id: params.sessaoId,
      p_titulo: params.titulo,
      p_mensagem: params.mensagem,
      p_tipo: params.tipo || 'aula_iniciada',
      p_link: params.link || null,
      p_dados_extras: params.dadosExtras ?? {},
    });

    if (error) {
      console.error('[NotificationService] Erro ao notificar turma da sessão:', error);
      return 0;
    }

    return data || 0;
  }

  /**
   * Exibe uma notificação do sistema se permitido.
   */
  public showSystemNotification(title: string, options?: NotificationOptions): void {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      try {
        if ('serviceWorker' in navigator) {
          void navigator.serviceWorker.ready.then((registration) => {
            void registration.showNotification(title, {
              icon: '/icons/icon-192x192.png',
              badge: '/icons/icon-128x128.png',
              ...options,
            });
          });
        } else {
          new Notification(title, {
            icon: '/icons/icon-192x192.png',
            ...options,
          });
        }
      } catch (e) {
        console.warn('[NotificationService] Falha ao exibir system notification:', e);
      }
    }
  }
}

export const notificationService = new NotificationService();
