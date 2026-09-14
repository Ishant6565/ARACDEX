import { haptics } from './haptics';

// Zero-latency browser-native Web Audio API synthesizer
// Generates pristine mechanical clicks, chimes, pops, thuds and musical chords in memory

class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  private bgmVolume: number = 0.35;
  private sfxVolume: number = 0.8;

  constructor() {
    const saved = localStorage.getItem('arcadex_sound');
    this.enabled = saved !== null ? saved === 'true' : true;

    try {
      const savedBgm = localStorage.getItem('arcadex_bgm_vol');
      if (savedBgm !== null) this.bgmVolume = Math.max(0, Math.min(1, parseFloat(savedBgm)));
      const savedSfx = localStorage.getItem('arcadex_sfx_vol');
      if (savedSfx !== null) this.sfxVolume = Math.max(0, Math.min(1, parseFloat(savedSfx)));
    } catch {}
  }

  private getContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public toggleSound(): boolean {
    this.enabled = !this.enabled;
    localStorage.setItem('arcadex_sound', String(this.enabled));
    if (this.enabled) {
      this.playClick();
    }
    return this.enabled;
  }

  public playClick(): void {
    haptics.light();
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.03);

      gain.gain.setValueAtTime(0.12 * this.sfxVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.03);
    } catch {}
  }

  public playSlide(): void {
    haptics.medium();
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.08 * this.sfxVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {}
  }

  public playMove(): void {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.025);

      gain.gain.setValueAtTime(0.05 * this.sfxVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.025);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.025);
    } catch {}
  }

  public playRotate(): void {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.035);

      gain.gain.setValueAtTime(0.08 * this.sfxVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.035);
    } catch {}
  }

  public playEat(): void {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.15 * this.sfxVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  public playDrop(): void {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.07);

      gain.gain.setValueAtTime(0.2 * this.sfxVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } catch {}
  }

  public playPop(): void {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(950, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.14 * this.sfxVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {}
  }

  public playSuccess(): void {
    haptics.success();
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const chords = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      chords.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + idx * 0.07;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.12 * this.sfxVolume, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.35);
      });
    } catch {}
  }

  public playError(): void {
    haptics.error();
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.setValueAtTime(110, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.15 * this.sfxVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {}
  }

  public playNote(frequency: number, duration: number = 0.2): void {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      gain.gain.setValueAtTime(0.18 * this.sfxVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  }

  // --- Volume Controls ---
  public getBgmVolume(): number {
    return this.bgmVolume;
  }

  public setBgmVolume(volume: number): void {
    const clamped = Math.max(0, Math.min(1, volume));
    this.bgmVolume = clamped;
    if (this.bgmAudio) {
      this.bgmAudio.volume = clamped;
    }
    try {
      localStorage.setItem('arcadex_bgm_vol', String(clamped));
    } catch {}
  }

  public getSfxVolume(): number {
    return this.sfxVolume;
  }

  public setSfxVolume(volume: number): void {
    const clamped = Math.max(0, Math.min(1, volume));
    this.sfxVolume = clamped;
    try {
      localStorage.setItem('arcadex_sfx_vol', String(clamped));
    } catch {}
  }

  // --- Real MP3 Audio Integration (Downloaded Custom Assets) ---
  private bgmAudio: HTMLAudioElement | null = null;
  private winAudio: HTMLAudioElement | null = null;
  private streakAudio: HTMLAudioElement | null = null;
  private defeatAudio: HTMLAudioElement | null = null;
  public isBgmPlaying: boolean = false;
  public bgmEnabled: boolean = true;

  public autoStartBgmIfEnabled(): void {
    if (typeof window === 'undefined') return;
    const savedPref = localStorage.getItem('arcadex_bgm_enabled');
    this.bgmEnabled = savedPref !== null ? savedPref === 'true' : true;
    if (!this.bgmEnabled) return;

    this.playBGM();

    const startOnInteract = () => {
      if (this.bgmEnabled && !this.isBgmPlaying) {
        this.playBGM();
      }
      ['pointerdown', 'touchstart', 'click', 'keydown'].forEach(evt => {
        window.removeEventListener(evt, startOnInteract);
      });
    };

    ['pointerdown', 'touchstart', 'click', 'keydown'].forEach(evt => {
      window.addEventListener(evt, startOnInteract, { passive: true, once: true });
    });
  }

  public playBGM(): void {
    if (typeof window === 'undefined' || !this.bgmEnabled) return;
    try {
      if (!this.bgmAudio) {
        this.bgmAudio = new Audio('/audio/bgm.mp3');
        this.bgmAudio.loop = true;
        this.bgmAudio.volume = this.bgmVolume;
      } else {
        this.bgmAudio.volume = this.bgmVolume;
      }
      this.bgmAudio.play().then(() => {
        this.isBgmPlaying = true;
      }).catch(() => {
        const startOnFirstInteract = () => {
          if (!this.bgmEnabled) return;
          this.bgmAudio?.play().then(() => {
            this.isBgmPlaying = true;
          }).catch(() => {});
          ['pointerdown', 'touchstart', 'click', 'keydown'].forEach(evt => {
            window.removeEventListener(evt, startOnFirstInteract);
          });
        };
        ['pointerdown', 'touchstart', 'click', 'keydown'].forEach(evt => {
          window.addEventListener(evt, startOnFirstInteract, { passive: true, once: true });
        });
      });
    } catch {}
  }

  public stopBGM(): void {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.isBgmPlaying = false;
    }
  }

  public toggleBGM(): boolean {
    if (this.isBgmPlaying) {
      this.bgmEnabled = false;
      localStorage.setItem('arcadex_bgm_enabled', 'false');
      this.stopBGM();
      return false;
    } else {
      this.bgmEnabled = true;
      localStorage.setItem('arcadex_bgm_enabled', 'true');
      this.playBGM();
      return true;
    }
  }

  // Plays custom victory / win audio (clash win fanfare)
  public playWin(): void {
    haptics.success();
    if (!this.enabled) return;
    try {
      if (!this.winAudio) {
        this.winAudio = new Audio('/audio/win.mp3');
      }
      this.winAudio.currentTime = 0;
      this.winAudio.volume = this.sfxVolume;
      this.winAudio.play().catch(() => this.playSuccess());
    } catch {
      this.playSuccess();
    }
  }

  // Plays custom streak milestone audio (clash streak trumpet)
  public playStreak(): void {
    haptics.streak();
    if (!this.enabled) return;
    try {
      if (!this.streakAudio) {
        this.streakAudio = new Audio('/audio/streak.mp3');
      }
      this.streakAudio.currentTime = 0;
      this.streakAudio.volume = this.sfxVolume;
      this.streakAudio.play().catch(() => this.playSuccess());
    } catch {
      this.playSuccess();
    }
  }

  // Plays custom game-over / defeat audio (clash defeat fanfare)
  public playDefeat(): void {
    haptics.defeat();
    if (!this.enabled) return;
    try {
      if (!this.defeatAudio) {
        this.defeatAudio = new Audio('/audio/defeat.mp3');
      }
      this.defeatAudio.currentTime = 0;
      this.defeatAudio.volume = this.sfxVolume;
      this.defeatAudio.play().catch(() => this.playError());
    } catch {
      this.playError();
    }
  }
}

export const sound = new SoundEngine();
