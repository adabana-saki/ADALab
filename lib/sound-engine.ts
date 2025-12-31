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

// BGM関連の型定義
export interface BgmTrack {
  id: string;
  label: string;
  src: string;
}

export const GAME_BGM_TRACKS: Record<string, BgmTrack[]> = {
  snake: [
    { id: 'none', label: 'OFF', src: '' },
    { id: 'snake-runners', label: 'スネーク・ランナーズ', src: '/audio/snake-runners.mp3' },
    { id: 'snake-last-life', label: '蛇腹のラストワンライフ', src: '/audio/snake-last-life.mp3' },
  ],
  '2048': [
    { id: 'none', label: 'OFF', src: '' },
    { id: '2048-combo-rush', label: '2048 Combo Rush', src: '/audio/2048-combo-rush.mp3' },
    { id: '2048-combo-rush-2', label: '2048 Combo Rush 2', src: '/audio/2048-combo-rush-2.mp3' },
  ],
  typing: [
    { id: 'none', label: 'OFF', src: '' },
    { id: 'typing-highscore', label: 'ハイスコアキータイプ', src: '/audio/typing-highscore.mp3' },
    { id: 'typing-rhythm', label: 'ハイスコアキータイプ 2', src: '/audio/typing-rhythm.mp3' },
  ],
};

export class SoundEngine {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private masterVolume: number = 0.5;

  // BGM関連
  private bgmAudio: HTMLAudioElement | null = null;
  private bgmVolume: number = 0.5;
  private currentBgmGame: string = '';
  private currentBgmTrackId: string = 'none';

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
      // BGM設定の読み込み
      const bgmVolume = localStorage.getItem('bgm-volume');
      if (bgmVolume !== null) {
        this.bgmVolume = parseFloat(bgmVolume);
      }
    } catch {
      // ignore
    }
  }

  private saveSettings() {
    try {
      localStorage.setItem('sound-enabled', String(this.enabled));
      localStorage.setItem('sound-volume', String(this.masterVolume));
      localStorage.setItem('bgm-volume', String(this.bgmVolume));
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

  // ===== BGM機能 =====

  /**
   * BGMトラックを設定
   */
  setBgmTrack(game: string, trackId: string) {
    this.currentBgmGame = game;
    this.currentBgmTrackId = trackId;
    try {
      localStorage.setItem(`bgm-track-${game}`, trackId);
    } catch {
      // ignore
    }
  }

  /**
   * 保存されたBGMトラックを取得
   */
  getBgmTrack(game: string): string {
    try {
      return localStorage.getItem(`bgm-track-${game}`) || 'none';
    } catch {
      return 'none';
    }
  }

  /**
   * BGM音量を設定
   */
  setBgmVolume(volume: number) {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.bgmVolume;
    }
    this.saveSettings();
  }

  /**
   * BGM音量を取得
   */
  getBgmVolume(): number {
    return this.bgmVolume;
  }

  /**
   * BGM再生開始
   */
  startBgm(game: string, trackId?: string) {
    if (typeof window === 'undefined') return;

    const tracks = GAME_BGM_TRACKS[game];
    if (!tracks) return;

    const useTrackId = trackId || this.getBgmTrack(game);
    if (useTrackId === 'none') {
      this.stopBgm();
      return;
    }

    const track = tracks.find((t) => t.id === useTrackId);
    if (!track || !track.src) {
      this.stopBgm();
      return;
    }

    // 同じトラックが再生中ならスキップ
    if (this.bgmAudio && this.currentBgmGame === game && this.currentBgmTrackId === useTrackId) {
      if (this.bgmAudio.paused) {
        this.bgmAudio.play().catch(() => {});
      }
      return;
    }

    // 既存のBGMを停止
    this.stopBgm();

    // 新しいBGMを開始
    this.bgmAudio = new Audio(track.src);
    this.bgmAudio.loop = true;
    this.bgmAudio.volume = this.bgmVolume;
    this.currentBgmGame = game;
    this.currentBgmTrackId = useTrackId;

    this.bgmAudio.play().catch(() => {
      // 自動再生ブロックの場合は無視
    });
  }

  /**
   * BGM停止
   */
  stopBgm() {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio.currentTime = 0;
      this.bgmAudio = null;
    }
    this.currentBgmGame = '';
    this.currentBgmTrackId = 'none';
  }

  /**
   * BGM一時停止
   */
  pauseBgm() {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
    }
  }

  /**
   * BGM再開
   */
  resumeBgm() {
    if (this.bgmAudio && this.bgmAudio.paused) {
      this.bgmAudio.play().catch(() => {});
    }
  }

  /**
   * BGM再生中か確認
   */
  isBgmPlaying(): boolean {
    return this.bgmAudio !== null && !this.bgmAudio.paused;
  }

  /**
   * 現在のBGMトラックIDを取得
   */
  getCurrentBgmTrackId(): string {
    return this.currentBgmTrackId;
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
    this.playTone({ frequency: 150, duration: 0.2, type: 'sawtooth', volume: 0.15 });
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
