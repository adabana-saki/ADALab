/**
 * 共通サウンドエンジン
 * Web Audio APIを使用したゲーム効果音システム
 */

export type OscillatorType = 'sine' | 'square' | 'triangle' | 'sawtooth';

export interface SoundOptions {
  frequency: number;
  duration: number;
  type?: OscillatorType;
  volume?: number;
  rampDown?: boolean;
}

export class SoundEngine {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private masterVolume: number = 0.5;

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadSettings();
    }
  }

  private loadSettings() {
    try {
      const enabled = localStorage.getItem('sound-enabled');
      if (enabled !== null) {
        this.enabled = enabled === 'true';
      }
      const volume = localStorage.getItem('sound-volume');
      if (volume !== null) {
        this.masterVolume = parseFloat(volume);
      }
    } catch {
      // ignore
    }
  }

  private saveSettings() {
    try {
      localStorage.setItem('sound-enabled', String(this.enabled));
      localStorage.setItem('sound-volume', String(this.masterVolume));
    } catch {
      // ignore
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      } catch {
        return null;
      }
    }

    // Resumeが必要な場合
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    return this.audioContext;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    this.saveSettings();
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  getVolume(): number {
    return this.masterVolume;
  }

  /**
   * 単音を再生
   */
  playTone(options: SoundOptions) {
    if (!this.enabled) return;

    const ctx = this.getContext();
    if (!ctx) return;

    const { frequency, duration, type = 'sine', volume = 0.3, rampDown = true } = options;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    const actualVolume = volume * this.masterVolume;
    gainNode.gain.setValueAtTime(actualVolume, ctx.currentTime);

    if (rampDown) {
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    }

    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
  }

  /**
   * 複数音を順番に再生（メロディ用）
   */
  playMelody(notes: { frequency: number; duration: number }[], type: OscillatorType = 'sine', volume: number = 0.3) {
    if (!this.enabled) return;

    let delay = 0;
    notes.forEach((note) => {
      setTimeout(() => {
        this.playTone({
          frequency: note.frequency,
          duration: note.duration,
          type,
          volume,
        });
      }, delay * 1000);
      delay += note.duration;
    });
  }

  // ===== 汎用効果音 =====

  /**
   * 成功音
   */
  success() {
    this.playMelody(
      [
        { frequency: 523, duration: 0.1 },
        { frequency: 659, duration: 0.1 },
        { frequency: 784, duration: 0.2 },
      ],
      'sine',
      0.3
    );
  }

  /**
   * エラー音
   */
  error() {
    this.playTone({ frequency: 200, duration: 0.3, type: 'sawtooth', volume: 0.2 });
  }

  /**
   * クリック音
   */
  click() {
    this.playTone({ frequency: 400, duration: 0.05, type: 'square', volume: 0.15 });
  }

  /**
   * ゲームオーバー音
   */
  gameOver() {
    this.playMelody(
      [
        { frequency: 400, duration: 0.15 },
        { frequency: 350, duration: 0.15 },
        { frequency: 300, duration: 0.15 },
        { frequency: 250, duration: 0.3 },
      ],
      'sawtooth',
      0.25
    );
  }

  /**
   * レベルアップ音
   */
  levelUp() {
    this.playMelody(
      [
        { frequency: 440, duration: 0.1 },
        { frequency: 550, duration: 0.1 },
        { frequency: 660, duration: 0.1 },
        { frequency: 880, duration: 0.2 },
      ],
      'sine',
      0.3
    );
  }

  /**
   * 達成音
   */
  achievement() {
    this.playMelody(
      [
        { frequency: 523, duration: 0.1 },
        { frequency: 659, duration: 0.1 },
        { frequency: 784, duration: 0.1 },
        { frequency: 1047, duration: 0.3 },
      ],
      'sine',
      0.35
    );
  }

  // ===== 2048用効果音 =====

  /**
   * タイル移動音
   */
  tileMove() {
    this.playTone({ frequency: 300, duration: 0.05, type: 'triangle', volume: 0.15 });
  }

  /**
   * タイルマージ音（値に応じて音程変化）
   */
  tileMerge(value: number) {
    // 値が大きいほど高い音
    const baseFreq = 300;
    const freq = baseFreq + Math.log2(value) * 50;
    this.playTone({ frequency: freq, duration: 0.1, type: 'sine', volume: 0.25 });
  }

  /**
   * 2048達成音
   */
  win2048() {
    this.playMelody(
      [
        { frequency: 523, duration: 0.15 },
        { frequency: 659, duration: 0.15 },
        { frequency: 784, duration: 0.15 },
        { frequency: 1047, duration: 0.15 },
        { frequency: 1319, duration: 0.3 },
      ],
      'sine',
      0.35
    );
  }

  // ===== Snake用効果音 =====

  /**
   * エサ取得音
   */
  snakeEat() {
    this.playTone({ frequency: 500, duration: 0.08, type: 'sine', volume: 0.25 });
  }

  /**
   * スネーク成長音
   */
  snakeGrow() {
    this.playMelody(
      [
        { frequency: 400, duration: 0.05 },
        { frequency: 500, duration: 0.05 },
      ],
      'triangle',
      0.2
    );
  }

  /**
   * 衝突音
   */
  snakeCrash() {
    this.playTone({ frequency: 150, duration: 0.2, type: 'sawtooth', volume: 0.3 });
  }

  // ===== Typing用効果音 =====

  /**
   * キー入力音（正解）
   */
  typingCorrect() {
    this.playTone({ frequency: 600, duration: 0.03, type: 'sine', volume: 0.15 });
  }

  /**
   * キー入力音（ミス）
   */
  typingMiss() {
    this.playTone({ frequency: 200, duration: 0.1, type: 'square', volume: 0.2 });
  }

  /**
   * 単語完了音
   */
  typingWordComplete() {
    this.playMelody(
      [
        { frequency: 523, duration: 0.05 },
        { frequency: 659, duration: 0.08 },
      ],
      'sine',
      0.2
    );
  }

  /**
   * 時間切れ音
   */
  typingTimeUp() {
    this.playMelody(
      [
        { frequency: 440, duration: 0.15 },
        { frequency: 330, duration: 0.2 },
      ],
      'triangle',
      0.25
    );
  }

  // ===== カウントダウン =====

  /**
   * カウントダウン音
   */
  countdown() {
    this.playTone({ frequency: 440, duration: 0.1, type: 'sine', volume: 0.25 });
  }

  /**
   * カウントダウン完了（GO!）音
   */
  countdownGo() {
    this.playTone({ frequency: 880, duration: 0.2, type: 'sine', volume: 0.3 });
  }
}

// シングルトンインスタンス
let soundEngineInstance: SoundEngine | null = null;

export function getSoundEngine(): SoundEngine {
  if (!soundEngineInstance) {
    soundEngineInstance = new SoundEngine();
  }
  return soundEngineInstance;
}
