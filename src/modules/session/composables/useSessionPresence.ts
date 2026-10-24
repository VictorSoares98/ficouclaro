import { ref, onUnmounted } from 'vue';
import { realtimeManager } from '@/core/supabase/realtime.manager';
import { soundService } from '@/core/services/sound.service';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface SessionPresenceUser {
  userId: string;
  name: string;
  avatar?: string | undefined;
  role?: 'professor' | 'aluno' | 'visitante' | undefined;
  joinedAt?: string | undefined;
}

/**
 * Composable para gerenciamento de presença em tempo real na sessão via Supabase Presence (ADR-006)
 */
export function useSessionPresence(sessionId: string, isProfessor = false) {
  const participants = ref<SessionPresenceUser[]>([]);
  const isConnected = ref(false);
  const lastWave = ref<{ senderName: string; senderId: string; timestamp: number } | null>(null);
  const channelName = `session-presence-${sessionId}`;
  let channel: RealtimeChannel | null = null;
  const mountedAt = Date.now();
  let lastSoundTime = 0;

  async function triggerJoinFeedback() {
    // Ignora feedback sonoro nos primeiros 2s para evitar notificações dos alunos já presentes na sala
    if (Date.now() - mountedAt < 2000) return;

    const now = Date.now();
    // Debounce de 1.5s para evitar saturação acústica
    if (now - lastSoundTime > 1500) {
      lastSoundTime = now;
      try {
        soundService.playNotificationChime();
      } catch {
        // Fallback silencioso
      }
      try {
        await Haptics.impact({ style: ImpactStyle.Light }).catch(() => {
          // Ignora graciosamente em navegadores que não suportam a API de vibração
        });
      } catch {
        // Fallback silencioso no navegador
      }
    }
  }

  function syncPresence() {
    if (!channel) return;
    const state = channel.presenceState<SessionPresenceUser>();
    const list: SessionPresenceUser[] = [];
    const seen = new Set<string>();

    Object.values(state).forEach((presences) => {
      presences.forEach((p) => {
        if (p && p.userId && !seen.has(p.userId)) {
          seen.add(p.userId);
          list.push(p);
        }
      });
    });

    // Ordena os participantes pelo horário de entrada mais recente
    list.sort((a, b) => {
      const timeA = a.joinedAt ? new Date(a.joinedAt).getTime() : 0;
      const timeB = b.joinedAt ? new Date(b.joinedAt).getTime() : 0;
      return timeB - timeA;
    });

    participants.value = list;
  }

  function initChannel() {
    if (!sessionId) return;
    channel = realtimeManager.getChannel(channelName);

    channel
      .on('presence', { event: 'sync' }, () => {
        syncPresence();
        isConnected.value = true;
      })
      .on('presence', { event: 'join' }, (payload?: { newPresences?: SessionPresenceUser[] }) => {
        syncPresence();
        if (isProfessor) {
          const hasNewStudent = Array.isArray(payload?.newPresences)
            ? payload.newPresences.some((p) => p.role !== 'professor')
            : true;
          if (hasNewStudent) {
            void triggerJoinFeedback();
          }
        }
      })
      .on('presence', { event: 'leave' }, () => {
        syncPresence();
      })
      .on(
        'broadcast',
        { event: 'wave' },
        (payload: { payload?: { senderName?: string; senderId?: string } }) => {
          const data = payload?.payload;
          if (data?.senderName) {
            lastWave.value = {
              senderName: data.senderName,
              senderId: data.senderId || '',
              timestamp: Date.now(),
            };
          }
        },
      );

    realtimeManager.subscribe(channelName);
  }

  async function sendWave(senderName: string, senderId: string) {
    if (!channel) {
      initChannel();
    }
    if (!channel) return;

    try {
      await channel.send({
        type: 'broadcast',
        event: 'wave',
        payload: { senderName, senderId },
      });
      lastWave.value = {
        senderName,
        senderId,
        timestamp: Date.now(),
      };
    } catch (err) {
      console.warn('[useSessionPresence] Falha ao enviar aceno:', err);
    }
  }

  async function trackUser(user: SessionPresenceUser) {
    if (!channel) {
      initChannel();
    }
    if (!channel) return;

    try {
      await channel.track({
        ...user,
        joinedAt: user.joinedAt || new Date().toISOString(),
      });
    } catch (err) {
      console.warn('[useSessionPresence] Falha ao registrar presença:', err);
    }
  }

  async function untrackUser() {
    if (!channel) return;
    try {
      await channel.untrack();
    } catch (err) {
      console.warn('[useSessionPresence] Falha ao remover presença:', err);
    }
  }

  // Inicializa o canal na ativação
  initChannel();

  onUnmounted(() => {
    void untrackUser();
    if (channelName) {
      realtimeManager.releaseChannel(channelName);
    }
    channel = null;
    isConnected.value = false;
  });

  return {
    participants,
    isConnected,
    lastWave,
    sendWave,
    trackUser,
    untrackUser,
  };
}
