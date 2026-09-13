// ARCADEX Mobile Haptic Feedback Engine
// Provides tactile responses on Android & iOS mobile devices

class HapticService {
  private enabled: boolean = true;

  constructor() {
    try {
      const stored = localStorage.getItem('arcadex_haptics');
      this.enabled = stored !== 'false';
    } catch {
      this.enabled = true;
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(state: boolean): void {
    this.enabled = state;
    try {
      localStorage.setItem('arcadex_haptics', state ? 'true' : 'false');
    } catch {
      // Ignore storage error
    }
    if (state) {
      this.vibrate(15);
    }
  }

  public toggle(): boolean {
    this.setEnabled(!this.enabled);
    return this.enabled;
  }

  private vibrate(pattern: number | number[]): void {
    if (!this.enabled || !this.isSupported()) return;
    try {
      navigator.vibrate(pattern);
    } catch {
      // Silently catch browser policy restrictions
    }
  }

  /** Subtle tick for UI buttons, tabs, level select */
  public light(): void {
    this.vibrate(12);
  }

  /** Firm tactile pulse for tile moves, arrow clearance, button presses */
  public medium(): void {
    this.vibrate(28);
  }

  /** Heavy impact for hard drops, tile merges */
  public heavy(): void {
    this.vibrate(50);
  }

  /** Double buzz for blocked arrows, errors, invalid moves */
  public error(): void {
    this.vibrate([35, 45, 35]);
  }

  /** Triumphant vibration fanfare for game wins */
  public success(): void {
    this.vibrate([20, 35, 60, 45, 80]);
  }

  /** Special fanfare for daily streak increase */
  public streak(): void {
    this.vibrate([25, 30, 25, 30, 60, 50, 100]);
  }

  /** Defeat / game over buzz */
  public defeat(): void {
    this.vibrate([80, 50, 80, 50, 120]);
  }
}

export const haptics = new HapticService();
