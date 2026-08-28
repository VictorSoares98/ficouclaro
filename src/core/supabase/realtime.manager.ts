import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabaseClient } from '@/core/supabase/client';

class RealtimeManager {
  private channels = new Map<string, RealtimeChannel>();
  private refCounts = new Map<string, number>();
  private subscribedChannels = new Set<string>();

  /**
   * Obtém um canal existente ou cria um novo se não existir.
   * Incrementa o contador de referências para proteger a conexão de destruição prematura.
   *
   * IMPORTANTE: Após registrar todos os listeners com .on(), acione
   * realtimeManager.subscribe(channelName) para ativar a conexão.
   * Nunca chame .subscribe() diretamente no canal retornado.
   *
   * @param channelName Nome único do canal (ex: 'session-123')
   * @returns Instância do RealtimeChannel para anexar listeners via .on()
   */
  getChannel(channelName: string): RealtimeChannel {
    const currentCount = this.refCounts.get(channelName) || 0;
    this.refCounts.set(channelName, currentCount + 1);

    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)!;
    }

    const channel = supabaseClient.channel(channelName);
    this.channels.set(channelName, channel);
    return channel;
  }

  /**
   * Ativa a subscription de um canal previamente configurado com .on().
   * É idempotente: chamadas subsequentes para um canal já subscrito são ignoradas com segurança,
   * prevenindo o bug de duplo-subscribe que causa comportamento indefinido no SDK do Supabase.
   *
   * @param channelName Nome único do canal (ex: 'session-123')
   */
  subscribe(channelName: string): void {
    if (this.subscribedChannels.has(channelName)) {
      return; // No-op: canal já subscrito, ignorando com segurança
    }
    const channel = this.channels.get(channelName);
    if (channel) {
      channel.subscribe();
      this.subscribedChannels.add(channelName);
    }
  }

  /**
   * Decrementa a referência do canal.
   * Se for o último observador a sair (count == 0), a conexão websocket é encerrada no Supabase
   * liberando o pool de conexões do plano Free.
   *
   * ATENÇÃO: Os componentes NUNCA devem chamar `channel.unsubscribe()` diretamente,
   * pois isso derrubaria a conexão para todos os outros componentes da tela.
   * Usem APENAS este método.
   *
   * @param channelName Nome único do canal (ex: 'session-123')
   */
  releaseChannel(channelName: string): void {
    const currentCount = this.refCounts.get(channelName) || 0;

    if (currentCount <= 1) {
      const channel = this.channels.get(channelName);
      if (channel) {
        // Encerra oficialmente a subscription no backend do Supabase
        supabaseClient.removeChannel(channel).catch(console.error);
        this.channels.delete(channelName);
      }
      this.refCounts.delete(channelName);
      this.subscribedChannels.delete(channelName);
    } else {
      this.refCounts.set(channelName, currentCount - 1);
    }
  }
}

export const realtimeManager = new RealtimeManager();
