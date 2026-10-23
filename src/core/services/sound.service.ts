/**
 * SoundService: Síntese de áudio procedural via Web Audio API.
 * Elimina dependências de arquivos de áudio externos, prevenindo erros 404 ou latência de rede.
 */
class SoundService {
  private audioCtx: AudioContext | null = null;
  private isMuted = false;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.audioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      void this.audioCtx.resume();
    }

    return this.audioCtx;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Toca um tom senoidal suave com envelope ADSR para evitar cliques acústicos.
   */
  private playTone(
    frequency: number,
    startTime: number,
    duration: number,
    peakVolume = 0.15,
  ): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, startTime);

      // Envelope ADSR suave
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(peakVolume, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    } catch (e) {
      console.warn('[SoundService] Falha ao reproduzir tom procedural:', e);
    }
  }

  /**
   * Efeito Sonoro: Aula Iniciada (Sequência melódica ascendente triunfal)
   */
  public playClassStarted(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    const now = ctx.currentTime;
    this.playTone(523.25, now, 0.18, 0.15); // C5
    this.playTone(659.25, now + 0.12, 0.18, 0.15); // E5
    this.playTone(783.99, now + 0.24, 0.22, 0.18); // G5
    this.playTone(1046.5, now + 0.38, 0.35, 0.2); // C6
  }

  /**
   * Efeito Sonoro: Aula Encerrada (Sequência descendente suave)
   */
  public playClassEnded(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    const now = ctx.currentTime;
    this.playTone(783.99, now, 0.16, 0.15); // G5
    this.playTone(659.25, now + 0.14, 0.16, 0.15); // E5
    this.playTone(523.25, now + 0.28, 0.35, 0.12); // C5
  }

  /**
   * Efeito Sonoro: Nova Dúvida enviada (Toque duplo discreto e amigável)
   */
  public playNewQuestion(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    const now = ctx.currentTime;
    this.playTone(880.0, now, 0.1, 0.15); // A5
    this.playTone(1174.66, now + 0.1, 0.22, 0.18); // D6
  }

  /**
   * Efeito Sonoro: Enquete Aberta (Acorde rápido arpejado chamativo)
   */
  public playPollOpened(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    const now = ctx.currentTime;
    this.playTone(698.46, now, 0.12, 0.15); // F5
    this.playTone(880.0, now + 0.1, 0.12, 0.16); // A5
    this.playTone(1046.5, now + 0.2, 0.25, 0.18); // C6
  }

  /**
   * Efeito Sonoro: Notificação Padrão / Sistema
   */
  public playNotificationChime(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    const now = ctx.currentTime;
    this.playTone(659.25, now, 0.14, 0.14); // E5
    this.playTone(987.77, now + 0.1, 0.25, 0.16); // B5
  }

  /**
   * Toca o som de acordo com o tipo de evento
   */
  public playForEventType(tipo: string): void {
    switch (tipo) {
      case 'aula_iniciada':
        this.playClassStarted();
        break;
      case 'aula_encerrada':
        this.playClassEnded();
        break;
      case 'nova_duvida':
      case 'duvida_respondida':
        this.playNewQuestion();
        break;
      case 'enquete_aberta':
        this.playPollOpened();
        break;
      default:
        this.playNotificationChime();
        break;
    }
  }
}

export const soundService = new SoundService();
