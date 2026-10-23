import { copyToClipboard, Notify } from 'quasar';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

/**
 * Retorna a URL canônica e universal de ingresso na aula.
 * Funciona tanto em ambiente web (usando window.location.origin) quanto em apps móveis (Capacitor).
 */
export function getClassroomJoinUrl(codigoConvite: string): string {
  if (!codigoConvite) return '';
  const code = codigoConvite.trim().toLowerCase();

  let base = 'https://ficouclaro.pages.dev';

  if (typeof window !== 'undefined' && window.location) {
    const origin = window.location.origin;
    const isLocalOrHttps =
      origin &&
      (origin.startsWith('http://localhost') ||
        origin.startsWith('http://127.0.0.1') ||
        origin.startsWith('https://'));

    const isCapacitorScheme =
      window.location.protocol === 'capacitor:' || window.location.protocol === 'ionic:';

    if (isLocalOrHttps && !isCapacitorScheme) {
      base = origin;
    }
  }

  return `${base}/join/${code}`;
}

/**
 * Copia o link da aula para a área de transferência com feedback tátil e notificação Quasar.
 */
export async function copyClassroomLink(url: string, courseName?: string): Promise<boolean> {
  if (!url) return false;
  try {
    await copyToClipboard(url);
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {
      // Haptics silencioso se não suportado no ambiente web
    }

    Notify.create({
      type: 'positive',
      icon: 'content_copy',
      message: courseName
        ? `Link da aula "${courseName}" copiado!`
        : 'Link da aula copiado para a área de transferência!',
      position: 'top',
      timeout: 2500,
    });
    return true;
  } catch (err) {
    console.error('Falha ao copiar link:', err);
    Notify.create({
      type: 'negative',
      icon: 'error_outline',
      message: 'Não foi possível copiar o link automaticamente.',
      position: 'top',
    });
    return false;
  }
}

/**
 * Compartilha o link da aula via Web Share API nativa (WhatsApp, Telegram, etc.) se disponível.
 */
export async function shareClassroomLink(payload: {
  title: string;
  text: string;
  url: string;
}): Promise<boolean> {
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share(payload);
      return true;
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return false;
      }
    }
  }

  return copyClassroomLink(payload.url, payload.title);
}
