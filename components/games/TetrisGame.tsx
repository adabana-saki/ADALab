'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useTetrisLeaderboard } from '@/hooks/useTetrisLeaderboard';
import {
  RotateCw,
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  Play,
  RotateCcw,
  ChevronsDown,
  Square,
  Pause,
  Trophy,
  Zap,
  Flame,
  Clock,
  Volume2,
  VolumeX,
  Medal,
  X,
  Ghost,
  Music,
  Palette,
  Timer,
  Infinity,
  Settings,
} from 'lucide-react';

// ゲーム設定
const FIELD_COL = 10;
const FIELD_ROW = 20;
const BLOCK_SIZE = 28;
const TETRO_SIZE = 4;
const PREVIEW_BLOCK_SIZE = 16;
const NEXT_COUNT = 3;

// 時間経過による加速設定
const TIME_ACCELERATION_INTERVAL = 30000;
const TIME_ACCELERATION_AMOUNT = 50;
const MIN_SPEED = 50;

// ロック遅延
const LOCK_DELAY = 500; // 500ms
const MAX_LOCK_MOVES = 15; // 最大移動回数

// パーフェクトクリアボーナス
const PERFECT_CLEAR_BONUS = 3000;

// ゲームモード
type GameMode = 'endless' | 'sprint';
const SPRINT_LINES = 40;

// レベルごとの落下速度（ミリ秒）
const LEVEL_SPEEDS = [800, 720, 640, 560, 480, 400, 320, 240, 160, 100, 80, 60, 50, 40, 30];

// BGMトラック
type BgmTrack = 'none' | 'block-dance-1' | 'block-dance-2';
const BGM_TRACKS: { id: BgmTrack; label: string; src?: string }[] = [
  { id: 'none', label: 'OFF' },
  { id: 'block-dance-1', label: 'BGM 1', src: '/audio/block-dance-1.mp3' },
  { id: 'block-dance-2', label: 'BGM 2', src: '/audio/block-dance-2.mp3' },
];

// テーマ
type ThemeType = 'classic' | 'neon' | 'pastel' | 'monochrome';
const THEMES: Record<ThemeType, { colors: string[]; bg: string; grid: string }> = {
  classic: {
    colors: ['#1a1a2e', '#06b6d4', '#f97316', '#3b82f6', '#a855f7', '#eab308', '#ef4444', '#22c55e'],
    bg: '#0f0f1a',
    grid: '#1a1a2e',
  },
  neon: {
    colors: ['#0a0a0f', '#00ffff', '#ff6600', '#0066ff', '#ff00ff', '#ffff00', '#ff0066', '#00ff66'],
    bg: '#0a0a0f',
    grid: '#1a1a2e',
  },
  pastel: {
    colors: ['#f5f5f5', '#87ceeb', '#ffb347', '#89cff0', '#dda0dd', '#f0e68c', '#ffb6c1', '#98fb98'],
    bg: '#2a2a3a',
    grid: '#3a3a4a',
  },
  monochrome: {
    colors: ['#1a1a1a', '#ffffff', '#cccccc', '#999999', '#666666', '#e0e0e0', '#b0b0b0', '#808080'],
    bg: '#0a0a0a',
    grid: '#2a2a2a',
  },
};

const TETRO_TYPES = [
  [],
  [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], // I
  [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 1, 0], [0, 0, 0, 0]], // L
  [[0, 0, 1, 0], [0, 0, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0]], // J
  [[0, 1, 0, 0], [0, 1, 1, 0], [0, 1, 0, 0], [0, 0, 0, 0]], // T
  [[0, 0, 0, 0], [0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0]], // O
  [[0, 0, 0, 0], [1, 1, 0, 0], [0, 1, 1, 0], [0, 0, 0, 0]], // Z
  [[0, 0, 0, 0], [0, 1, 1, 0], [1, 1, 0, 0], [0, 0, 0, 0]], // S
];

type TetroType = number[][];

interface GameStats {
  score: number;
  lines: number;
  level: number;
  combo: number;
  highScore: number;
  backToBack: number;
  tSpins: number;
  tetrises: number;
  playTime: number;
  piecesPlaced: number;
  perfectClears: number;
}

// LeaderboardEntry is imported from useTetrisLeaderboard hook

interface LineClearAnimation {
  lines: number[];
  frame: number;
  maxFrames: number;
}

// Leaderboard is now managed by useTetrisLeaderboard hook

// サウンドエンジン（BGM対応）
class SoundEngine {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private bgmEnabled: boolean = true;
  private bgmPlaying: boolean = false;
  private bgmTrack: BgmTrack = 'none';
  private audioElement: HTMLAudioElement | null = null;
  private bgmVolume: number = 0.5;

  init() {
    if (typeof window !== 'undefined' && !this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  setBgmEnabled(enabled: boolean) {
    this.bgmEnabled = enabled;
    if (!enabled) {
      this.stopBgm();
    }
  }

  setBgmTrack(track: BgmTrack) {
    const wasPlaying = this.bgmPlaying;
    this.stopBgm();
    this.bgmTrack = track;
    if (wasPlaying && track !== 'none') {
      this.startBgm();
    }
  }

  getBgmTrack() {
    return this.bgmTrack;
  }

  setBgmVolume(volume: number) {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    if (this.audioElement) {
      this.audioElement.volume = this.bgmVolume;
    }
  }

  getBgmVolume() {
    return this.bgmVolume;
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'square', volume: number = 0.1) {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  move() { this.playTone(200, 0.05, 'square', 0.05); }
  rotate() { this.playTone(300, 0.08, 'square', 0.08); }
  drop() { this.playTone(150, 0.1, 'square', 0.1); }
  lock() { this.playTone(180, 0.08, 'triangle', 0.08); }

  lineClear(lines: number) {
    const baseFreq = 400;
    for (let i = 0; i < lines; i++) {
      setTimeout(() => this.playTone(baseFreq + i * 100, 0.15, 'sine', 0.15), i * 50);
    }
  }

  tetris() {
    [523, 659, 784, 1047].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, 'sine', 0.2), i * 80);
    });
  }

  tSpin() {
    this.playTone(600, 0.1, 'sine', 0.15);
    setTimeout(() => this.playTone(800, 0.15, 'sine', 0.15), 100);
  }

  perfectClear() {
    [523, 659, 784, 880, 1047, 1319].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.25, 'sine', 0.25), i * 100);
    });
  }

  levelUp() {
    [400, 500, 600, 800].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.1, 'sine', 0.1), i * 60);
    });
  }

  gameOver() {
    [400, 350, 300, 250, 200].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, 'sawtooth', 0.1), i * 100);
    });
  }

  hold() { this.playTone(250, 0.08, 'triangle', 0.1); }
  countdown() { this.playTone(440, 0.15, 'sine', 0.2); }
  countdownGo() { this.playTone(880, 0.3, 'sine', 0.3); }

  startBgm() {
    if (!this.bgmEnabled || this.bgmPlaying || this.bgmTrack === 'none') return;

    // MP3ファイル再生
    const track = BGM_TRACKS.find(t => t.id === this.bgmTrack);
    if (!track?.src) return;

    this.audioElement = new Audio(track.src);
    this.audioElement.loop = true; // ループ再生
    this.audioElement.volume = this.bgmVolume;
    this.audioElement.play().catch(() => {
      // 自動再生がブロックされた場合は無視
    });
    this.bgmPlaying = true;
  }

  stopBgm() {
    this.bgmPlaying = false;

    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.audioElement = null;
    }
  }

  pauseBgm() {
    if (this.audioElement) {
      this.audioElement.pause();
    }
  }

  resumeBgm() {
    if (this.audioElement && this.bgmPlaying) {
      this.audioElement.play().catch(() => {});
    }
  }
}

const soundEngine = new SoundEngine();

export function TetrisGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stats, setStats] = useState<GameStats>({
    score: 0, lines: 0, level: 1, combo: 0, highScore: 0,
    backToBack: 0, tSpins: 0, tetrises: 0, playTime: 0,
    piecesPlaced: 0, perfectClears: 0,
  });
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [nextPieces, setNextPieces] = useState<number[]>([1, 2, 3]);
  const [holdPiece, setHoldPiece] = useState<number | null>(null);
  const [canHold, setCanHold] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [bgmEnabled, setBgmEnabled] = useState(false);
  const [bgmTrack, setBgmTrack] = useState<BgmTrack>('none');
  const [bgmVolume, setBgmVolume] = useState(0.5);
  const [lastAction, setLastAction] = useState<string>('');
  const [timeBonus, setTimeBonus] = useState(0);
  const [showNicknameInput, setShowNicknameInput] = useState(false);
  const [nickname, setNickname] = useState('');
  const [pendingScore, setPendingScore] = useState<{ score: number; lines: number; level: number; time: number } | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 新機能の状態
  const [ghostEnabled, setGhostEnabled] = useState(true);
  const [gameMode, setGameMode] = useState<GameMode>('endless');
  const [showModeSelect, setShowModeSelect] = useState(false);
  const [theme, setTheme] = useState<ThemeType>('classic');
  const [showSettings, setShowSettings] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [lineClearAnim, setLineClearAnim] = useState<LineClearAnimation | null>(null);
  const [gameComplete, setGameComplete] = useState(false);

  // グローバルリーダーボード（D1 API）
  const {
    leaderboard,
    isLoading: _leaderboardLoading,
    error: _leaderboardError,
    submitScore,
    isRankingScore,
  } = useTetrisLeaderboard({ mode: gameMode });

  // タッチ操作用
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const gameState = useRef({
    field: [] as number[][],
    tetro: [] as TetroType,
    tetroType: 0,
    tetroX: 0,
    tetroY: 0,
    nextQueue: [] as number[],
    holdType: null as number | null,
    canHold: true,
    stats: { score: 0, lines: 0, level: 1, combo: 0, highScore: 0, backToBack: 0, tSpins: 0, tetrises: 0, playTime: 0, piecesPlaced: 0, perfectClears: 0 },
    gameOver: false,
    isPaused: false,
    lastRotation: false,
    lastKick: false,
    startTime: 0,
    timeAcceleration: 0,
    // ロック遅延
    lockTimer: 0,
    lockMoves: 0,
    isLocking: false,
    // ゲームモード
    mode: 'endless' as GameMode,
    randomFunc: Math.random,
  });

  // テーマカラー取得
  const getColors = useCallback(() => THEMES[theme].colors, [theme]);

  // 初期化
  useEffect(() => {
    const savedHighScore = localStorage.getItem('tetris-highscore-v2');
    if (savedHighScore) {
      const highScore = parseInt(savedHighScore, 10);
      gameState.current.stats.highScore = highScore;
      setStats((s) => ({ ...s, highScore }));
    }

    // Leaderboard is now managed by useTetrisLeaderboard hook (D1 API)

    const savedNickname = localStorage.getItem('tetris-nickname');
    if (savedNickname) setNickname(savedNickname);

    const savedTheme = localStorage.getItem('tetris-theme') as ThemeType;
    if (savedTheme && THEMES[savedTheme]) setTheme(savedTheme);

    const savedGhost = localStorage.getItem('tetris-ghost');
    if (savedGhost !== null) setGhostEnabled(savedGhost === 'true');

    const savedBgmTrack = localStorage.getItem('tetris-bgm-track') as BgmTrack;
    if (savedBgmTrack && BGM_TRACKS.some(t => t.id === savedBgmTrack)) {
      setBgmTrack(savedBgmTrack);
      soundEngine.setBgmTrack(savedBgmTrack);
      if (savedBgmTrack !== 'none') {
        setBgmEnabled(true);
      }
    }

    const savedBgmVolume = localStorage.getItem('tetris-bgm-volume');
    if (savedBgmVolume !== null) {
      const vol = parseFloat(savedBgmVolume);
      if (!isNaN(vol)) {
        setBgmVolume(vol);
        soundEngine.setBgmVolume(vol);
      }
    }

    soundEngine.init();
  }, []);

  // リーダーボード送信（D1 API経由）
  const submitNickname = useCallback(async () => {
    if (!pendingScore || !nickname.trim() || isSubmitting) return;
    setIsSubmitting(true);
    const entry = {
      nickname: nickname.trim().slice(0, 12),
      score: pendingScore.score,
      lines: pendingScore.lines,
      level: pendingScore.level,
      date: new Date().toISOString().split('T')[0],
      mode: gameState.current.mode as 'endless' | 'sprint',
      time: pendingScore.time,
    };
    try {
      await submitScore(entry);
      localStorage.setItem('tetris-nickname', nickname.trim().slice(0, 12));
      setShowNicknameInput(false);
      setPendingScore(null);
      setShowLeaderboard(true);
    } finally {
      setIsSubmitting(false);
    }
  }, [pendingScore, nickname, submitScore, isSubmitting]);

  // サウンド設定
  useEffect(() => {
    soundEngine.setEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    soundEngine.setBgmEnabled(bgmEnabled);
    soundEngine.setBgmTrack(bgmTrack);
    if (bgmEnabled && bgmTrack !== 'none' && isStarted && !gameOver && !isPaused) {
      soundEngine.startBgm();
    } else if (!isStarted || gameOver) {
      soundEngine.stopBgm();
    } else if (isPaused) {
      soundEngine.pauseBgm();
    }
  }, [bgmEnabled, bgmTrack, isStarted, gameOver, isPaused]);

  // BGMトラック変更時に保存
  useEffect(() => {
    localStorage.setItem('tetris-bgm-track', bgmTrack);
  }, [bgmTrack]);

  // BGM音量変更時に保存
  useEffect(() => {
    localStorage.setItem('tetris-bgm-volume', bgmVolume.toString());
    soundEngine.setBgmVolume(bgmVolume);
  }, [bgmVolume]);

  // BGMトラック変更ハンドラ
  const handleBgmTrackChange = useCallback((track: BgmTrack) => {
    setBgmTrack(track);
    if (track !== 'none') {
      setBgmEnabled(true);
    } else {
      setBgmEnabled(false);
    }
  }, []);

  // テーマ保存
  useEffect(() => {
    localStorage.setItem('tetris-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('tetris-ghost', ghostEnabled.toString());
  }, [ghostEnabled]);

  // フィールド初期化
  const initField = useCallback(() => {
    const field: number[][] = [];
    for (let y = 0; y < FIELD_ROW; y++) {
      field[y] = Array(FIELD_COL).fill(0);
    }
    return field;
  }, []);

  // 7-bag方式
  const generateBag = useCallback(() => {
    const bag = [1, 2, 3, 4, 5, 6, 7];
    const rand = gameState.current.randomFunc;
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    return bag;
  }, []);

  const refillQueue = useCallback(() => {
    while (gameState.current.nextQueue.length < NEXT_COUNT + 1) {
      gameState.current.nextQueue.push(...generateBag());
    }
  }, [generateBag]);

  const spawnTetro = useCallback(() => {
    refillQueue();
    const type = gameState.current.nextQueue.shift()!;
    gameState.current.tetroType = type;
    gameState.current.tetro = TETRO_TYPES[type].map((row) => [...row]);
    gameState.current.tetroX = Math.floor(FIELD_COL / 2 - TETRO_SIZE / 2);
    gameState.current.tetroY = 0;
    gameState.current.canHold = true;
    gameState.current.lastRotation = false;
    gameState.current.lastKick = false;
    gameState.current.isLocking = false;
    gameState.current.lockMoves = 0;
    gameState.current.lockTimer = 0;
    setNextPieces([...gameState.current.nextQueue.slice(0, NEXT_COUNT)]);
    setCanHold(true);
  }, [refillQueue]);

  // 衝突判定
  const checkCollision = useCallback((mx: number, my: number, newTetro?: TetroType) => {
    const { field, tetro, tetroX, tetroY } = gameState.current;
    const checkTetro = newTetro || tetro;
    for (let y = 0; y < TETRO_SIZE; y++) {
      for (let x = 0; x < TETRO_SIZE; x++) {
        if (checkTetro[y]?.[x]) {
          const nx = tetroX + mx + x;
          const ny = tetroY + my + y;
          if (ny < 0 || nx < 0 || ny >= FIELD_ROW || nx >= FIELD_COL || field[ny]?.[nx]) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  const getGhostY = useCallback(() => {
    let ghostY = gameState.current.tetroY;
    while (!checkCollision(0, ghostY - gameState.current.tetroY + 1)) {
      ghostY++;
    }
    return ghostY;
  }, [checkCollision]);

  const rotate = useCallback((tetro: TetroType) => {
    const newTetro: TetroType = [];
    for (let y = 0; y < TETRO_SIZE; y++) {
      newTetro[y] = [];
      for (let x = 0; x < TETRO_SIZE; x++) {
        newTetro[y][x] = tetro[TETRO_SIZE - x - 1][y];
      }
    }
    return newTetro;
  }, []);

  const detectTSpin = useCallback(() => {
    const { tetroType, tetroX, tetroY, field, lastRotation } = gameState.current;
    if (tetroType !== 4 || !lastRotation) return false;
    const corners = [[tetroY, tetroX], [tetroY, tetroX + 2], [tetroY + 2, tetroX], [tetroY + 2, tetroX + 2]];
    let filledCorners = 0;
    for (const [cy, cx] of corners) {
      if (cy < 0 || cy >= FIELD_ROW || cx < 0 || cx >= FIELD_COL || field[cy]?.[cx]) {
        filledCorners++;
      }
    }
    return filledCorners >= 3;
  }, []);

  const tryRotate = useCallback(() => {
    const rotated = rotate(gameState.current.tetro);
    const kicks = [0, -1, 1, -2, 2];
    for (const kick of kicks) {
      if (!checkCollision(kick, 0, rotated)) {
        gameState.current.tetro = rotated;
        gameState.current.tetroX += kick;
        gameState.current.lastRotation = true;
        gameState.current.lastKick = kick !== 0;
        // ロック遅延リセット
        if (gameState.current.isLocking && gameState.current.lockMoves < MAX_LOCK_MOVES) {
          gameState.current.lockMoves++;
          gameState.current.lockTimer = Date.now();
        }
        soundEngine.rotate();
        return true;
      }
    }
    return false;
  }, [rotate, checkCollision]);

  // パーフェクトクリア判定
  const isPerfectClear = useCallback(() => {
    return gameState.current.field.every(row => row.every(cell => cell === 0));
  }, []);

  const fixTetro = useCallback(() => {
    const { field, tetro, tetroType, tetroX, tetroY, stats } = gameState.current;
    for (let y = 0; y < TETRO_SIZE; y++) {
      for (let x = 0; x < TETRO_SIZE; x++) {
        if (tetro[y]?.[x]) {
          field[tetroY + y][tetroX + x] = tetroType;
        }
      }
    }
    stats.piecesPlaced++;
    soundEngine.lock();
  }, []);

  // ライン消去（アニメーション対応）
  const checkLines = useCallback(() => {
    const { field, stats, mode } = gameState.current;
    const linesToClear: number[] = [];

    for (let y = 0; y < FIELD_ROW; y++) {
      if (field[y].every((cell) => cell !== 0)) {
        linesToClear.push(y);
      }
    }

    const isTSpin = detectTSpin();
    const lineCount = linesToClear.length;

    if (lineCount > 0) {
      // アニメーション開始
      setLineClearAnim({ lines: linesToClear, frame: 0, maxFrames: 10 });

      setTimeout(() => {
        // ラインを消去
        for (const y of linesToClear) {
          field.splice(y, 1);
          field.unshift(Array(FIELD_COL).fill(0));
        }

        let action = '';
        let basePoints = 0;

        if (isTSpin) {
          stats.tSpins++;
          if (lineCount === 1) { action = 'T-SPIN SINGLE!'; basePoints = 800; }
          else if (lineCount === 2) { action = 'T-SPIN DOUBLE!'; basePoints = 1200; }
          else if (lineCount === 3) { action = 'T-SPIN TRIPLE!'; basePoints = 1600; }
          soundEngine.tSpin();
        } else if (lineCount === 4) {
          action = 'TETRIS!';
          basePoints = 800;
          stats.tetrises++;
          soundEngine.tetris();
        } else {
          basePoints = [0, 100, 300, 500][lineCount] || 0;
          if (lineCount >= 2) action = ['', 'SINGLE', 'DOUBLE', 'TRIPLE'][lineCount];
          soundEngine.lineClear(lineCount);
        }

        // パーフェクトクリア判定
        if (isPerfectClear()) {
          action = 'PERFECT CLEAR!';
          basePoints += PERFECT_CLEAR_BONUS;
          stats.perfectClears++;
          soundEngine.perfectClear();
        }

        // Back-to-Back
        const isSpecial = lineCount === 4 || isTSpin;
        if (isSpecial && stats.backToBack > 0) {
          basePoints = Math.floor(basePoints * 1.5);
          action = 'B2B ' + action;
        }
        stats.backToBack = isSpecial ? stats.backToBack + 1 : 0;

        const points = (basePoints + stats.combo * 50) * stats.level;
        stats.score += points;
        stats.lines += lineCount;
        stats.combo++;

        if (action) {
          setLastAction(action);
          setTimeout(() => setLastAction(''), 1500);
        }

        // レベルアップ
        const newLevel = Math.floor(stats.lines / 10) + 1;
        if (newLevel > stats.level) {
          stats.level = Math.min(newLevel, LEVEL_SPEEDS.length);
          soundEngine.levelUp();
        }

        // ハイスコア
        if (stats.score > stats.highScore) {
          stats.highScore = stats.score;
          localStorage.setItem('tetris-highscore-v2', stats.score.toString());
        }

        setStats({ ...stats });
        setLineClearAnim(null);

        // スプリントモードクリア判定
        if (mode === 'sprint' && stats.lines >= SPRINT_LINES) {
          gameState.current.gameOver = true;
          setGameOver(true);
          setGameComplete(true);
        }
      }, 200);
    } else {
      if (stats.combo > 0) {
        stats.combo = 0;
        setStats({ ...stats });
      }
    }

    return lineCount;
  }, [detectTSpin, isPerfectClear]);

  const holdTetro = useCallback(() => {
    if (!gameState.current.canHold) return;
    const currentType = gameState.current.tetroType;
    const holdType = gameState.current.holdType;
    gameState.current.holdType = currentType;
    gameState.current.canHold = false;
    setHoldPiece(currentType);
    setCanHold(false);
    soundEngine.hold();
    if (holdType) {
      gameState.current.tetroType = holdType;
      gameState.current.tetro = TETRO_TYPES[holdType].map((row) => [...row]);
      gameState.current.tetroX = Math.floor(FIELD_COL / 2 - TETRO_SIZE / 2);
      gameState.current.tetroY = 0;
      gameState.current.lastRotation = false;
      gameState.current.isLocking = false;
      gameState.current.lockMoves = 0;
    } else {
      spawnTetro();
    }
  }, [spawnTetro]);

  const handleGameOver = useCallback(() => {
    gameState.current.gameOver = true;
    setGameOver(true);
    soundEngine.gameOver();
    soundEngine.stopBgm();

    const finalScore = gameState.current.stats.score;
    if (isRankingScore(finalScore)) {
      setPendingScore({
        score: finalScore,
        lines: gameState.current.stats.lines,
        level: gameState.current.stats.level,
        time: gameState.current.stats.playTime,
      });
      setShowNicknameInput(true);
    }
  }, [isRankingScore]);

  const hardDrop = useCallback(() => {
    const ghostY = getGhostY();
    const dropDistance = ghostY - gameState.current.tetroY;
    gameState.current.tetroY = ghostY;
    gameState.current.stats.score += dropDistance * 2;
    gameState.current.lastRotation = false;
    setStats({ ...gameState.current.stats });

    fixTetro();
    checkLines();
    spawnTetro();

    if (checkCollision(0, 0)) {
      handleGameOver();
    }
  }, [getGhostY, fixTetro, checkLines, spawnTetro, checkCollision, handleGameOver]);

  const getCurrentSpeed = useCallback(() => {
    const baseSpeed = LEVEL_SPEEDS[Math.min(gameState.current.stats.level - 1, LEVEL_SPEEDS.length - 1)];
    const timeReduction = gameState.current.timeAcceleration;
    return Math.max(baseSpeed - timeReduction, MIN_SPEED);
  }, []);

  // 描画
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const colors = getColors();
    const { field, tetro, tetroType, tetroX, tetroY, gameOver: isGameOver } = gameState.current;

    // フィールドが初期化されていない場合はカウントダウンのみ描画
    if (!field || field.length === 0) {
      ctx.fillStyle = THEMES[theme].bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (countdown !== null) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = 'bold 72px sans-serif';
        ctx.fillStyle = countdown === 0 ? '#22c55e' : '#06b6d4';
        ctx.textAlign = 'center';
        ctx.fillText(countdown === 0 ? 'GO!' : countdown.toString(), canvas.width / 2, canvas.height / 2 + 20);
      }
      return;
    }

    // 背景
    ctx.fillStyle = THEMES[theme].bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // グリッド
    ctx.strokeStyle = THEMES[theme].grid;
    ctx.lineWidth = 1;
    for (let y = 0; y <= FIELD_ROW; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * BLOCK_SIZE);
      ctx.lineTo(FIELD_COL * BLOCK_SIZE, y * BLOCK_SIZE);
      ctx.stroke();
    }
    for (let x = 0; x <= FIELD_COL; x++) {
      ctx.beginPath();
      ctx.moveTo(x * BLOCK_SIZE, 0);
      ctx.lineTo(x * BLOCK_SIZE, FIELD_ROW * BLOCK_SIZE);
      ctx.stroke();
    }

    // ゲームオーバー警告ライン（DANGER ZONE）
    // 上から1行目の下に赤い破線を描画
    const dangerLineY = 1 * BLOCK_SIZE;
    ctx.save();
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    ctx.beginPath();
    ctx.moveTo(0, dangerLineY);
    ctx.lineTo(FIELD_COL * BLOCK_SIZE, dangerLineY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // ライン消去アニメーション
    const animLines = lineClearAnim?.lines || [];

    // フィールド
    for (let y = 0; y < FIELD_ROW; y++) {
      for (let x = 0; x < FIELD_COL; x++) {
        if (field[y][x]) {
          if (animLines.includes(y) && lineClearAnim) {
            ctx.globalAlpha = 1 - lineClearAnim.frame / lineClearAnim.maxFrames;
          }
          drawBlock(ctx, x, y, field[y][x], BLOCK_SIZE, colors);
          ctx.globalAlpha = 1;
        }
      }
    }

    // ゴーストピース
    if (!isGameOver && ghostEnabled) {
      const ghostY = getGhostY();
      ctx.globalAlpha = 0.3;
      for (let y = 0; y < TETRO_SIZE; y++) {
        for (let x = 0; x < TETRO_SIZE; x++) {
          if (tetro[y]?.[x]) {
            drawBlock(ctx, tetroX + x, ghostY + y, tetroType, BLOCK_SIZE, colors);
          }
        }
      }
      ctx.globalAlpha = 1;
    }

    // 現在のテトロミノ
    for (let y = 0; y < TETRO_SIZE; y++) {
      for (let x = 0; x < TETRO_SIZE; x++) {
        if (tetro[y]?.[x]) {
          drawBlock(ctx, tetroX + x, tetroY + y, tetroType, BLOCK_SIZE, colors);
        }
      }
    }

    // ゲームオーバー/クリア
    if (isGameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = 'bold 28px sans-serif';
      ctx.fillStyle = gameComplete ? '#22c55e' : '#ef4444';
      ctx.textAlign = 'center';
      ctx.fillText(gameComplete ? 'CLEAR!' : 'GAME OVER', canvas.width / 2, canvas.height / 2 - 30);
      ctx.font = '18px sans-serif';
      ctx.fillStyle = '#eab308';
      ctx.fillText(`Score: ${gameState.current.stats.score.toLocaleString()}`, canvas.width / 2, canvas.height / 2 + 10);
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Press SPACE to restart', canvas.width / 2, canvas.height / 2 + 45);
    }

    // カウントダウン
    if (countdown !== null) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = 'bold 72px sans-serif';
      ctx.fillStyle = countdown === 0 ? '#22c55e' : '#06b6d4';
      ctx.textAlign = 'center';
      ctx.fillText(countdown === 0 ? 'GO!' : countdown.toString(), canvas.width / 2, canvas.height / 2 + 20);
    }
  }, [getGhostY, ghostEnabled, theme, getColors, lineClearAnim, countdown, gameComplete]);

  const drawBlock = (ctx: CanvasRenderingContext2D, x: number, y: number, color: number, size: number, colors: string[]) => {
    const px = x * size;
    const py = y * size;
    const inset = size === BLOCK_SIZE ? 2 : 1;
    ctx.fillStyle = colors[color];
    ctx.fillRect(px + inset, py + inset, size - inset * 2, size - inset * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(px + inset, py + inset, size - inset * 2, 3);
    ctx.fillRect(px + inset, py + inset, 3, size - inset * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(px + size - inset - 3, py + inset, 3, size - inset * 2);
    ctx.fillRect(px + inset, py + size - inset - 3, size - inset * 2, 3);
  };

  const drawPreview = useCallback((canvasId: string, type: number | null, size: number = PREVIEW_BLOCK_SIZE) => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const colors = getColors();
    // キャンバスをクリア（type === null でもクリアする）
    ctx.fillStyle = THEMES[theme].grid;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (type !== null && type > 0) {
      const tetro = TETRO_TYPES[type];
      const offsetX = type === 1 ? 0 : type === 5 ? 0.5 : 0.5;
      const offsetY = type === 1 ? 0.5 : type === 5 ? 1 : 0.5;
      for (let y = 0; y < TETRO_SIZE; y++) {
        for (let x = 0; x < TETRO_SIZE; x++) {
          if (tetro[y][x]) {
            const px = (x + offsetX) * size;
            const py = (y + offsetY) * size;
            ctx.fillStyle = colors[type];
            ctx.fillRect(px + 1, py + 1, size - 2, size - 2);
          }
        }
      }
    }
  }, [getColors, theme]);

  useEffect(() => {
    drawPreview('hold-canvas', holdPiece, 18);
    nextPieces.forEach((piece, index) => {
      drawPreview(`next-canvas-${index}`, piece, 14);
    });
  }, [holdPiece, nextPieces, drawPreview]);

  // 落下処理（ロック遅延対応）
  const drop = useCallback(() => {
    if (gameState.current.gameOver || gameState.current.isPaused) return;

    if (!checkCollision(0, 1)) {
      gameState.current.tetroY++;
      gameState.current.lastRotation = false;
      gameState.current.isLocking = false;
      gameState.current.lockMoves = 0;
    } else {
      // ロック遅延開始
      if (!gameState.current.isLocking) {
        gameState.current.isLocking = true;
        gameState.current.lockTimer = Date.now();
      } else if (Date.now() - gameState.current.lockTimer >= LOCK_DELAY ||
                 gameState.current.lockMoves >= MAX_LOCK_MOVES) {
        // ロック
        fixTetro();
        checkLines();
        spawnTetro();
        if (checkCollision(0, 0)) {
          handleGameOver();
        }
      }
    }
    draw();
  }, [checkCollision, fixTetro, checkLines, spawnTetro, draw, handleGameOver]);

  // キー入力
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (countdown !== null) return;

    if (!isStarted) {
      if (e.code === 'Space') {
        e.preventDefault();
        setShowModeSelect(true);
      }
      return;
    }

    if (gameState.current.gameOver) {
      if (e.code === 'Space') {
        e.preventDefault();
        setShowModeSelect(true);
      }
      return;
    }

    if (e.code === 'KeyP' || e.code === 'Escape') {
      gameState.current.isPaused = !gameState.current.isPaused;
      setIsPaused(gameState.current.isPaused);
      return;
    }

    if (gameState.current.isPaused) return;

    e.preventDefault();

    const resetLockTimer = () => {
      if (gameState.current.isLocking && gameState.current.lockMoves < MAX_LOCK_MOVES) {
        gameState.current.lockMoves++;
        gameState.current.lockTimer = Date.now();
      }
    };

    switch (e.code) {
      case 'ArrowLeft':
        if (!checkCollision(-1, 0)) {
          gameState.current.tetroX--;
          gameState.current.lastRotation = false;
          resetLockTimer();
          soundEngine.move();
        }
        break;
      case 'ArrowRight':
        if (!checkCollision(1, 0)) {
          gameState.current.tetroX++;
          gameState.current.lastRotation = false;
          resetLockTimer();
          soundEngine.move();
        }
        break;
      case 'ArrowDown':
        if (!checkCollision(0, 1)) {
          gameState.current.tetroY++;
          gameState.current.stats.score += 1;
          gameState.current.lastRotation = false;
          setStats({ ...gameState.current.stats });
        }
        break;
      case 'ArrowUp':
      case 'KeyX':
        tryRotate();
        break;
      case 'Space':
        hardDrop();
        break;
      case 'KeyC':
      case 'ShiftLeft':
      case 'ShiftRight':
        holdTetro();
        break;
      case 'KeyZ':
        tryRotate(); tryRotate(); tryRotate();
        break;
      case 'KeyG':
        setGhostEnabled(g => !g);
        break;
    }
    draw();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStarted, checkCollision, tryRotate, hardDrop, holdTetro, draw, countdown]);

  // ゲーム開始（カウントダウン付き）
  const startGameWithCountdown = useCallback((mode: GameMode) => {
    setShowModeSelect(false);
    setGameMode(mode);
    gameState.current.mode = mode;
    gameState.current.randomFunc = Math.random;

    // カウントダウン開始
    setCountdown(3);
    soundEngine.countdown();

    setTimeout(() => { setCountdown(2); soundEngine.countdown(); }, 1000);
    setTimeout(() => { setCountdown(1); soundEngine.countdown(); }, 2000);
    setTimeout(() => {
      setCountdown(0);
      soundEngine.countdownGo();
      setTimeout(() => {
        setCountdown(null);
        startGame();
      }, 500);
    }, 3000);
  }, []);

  const startGame = useCallback(() => {
    gameState.current.field = initField();
    gameState.current.stats = {
      score: 0, lines: 0, level: 1, combo: 0,
      highScore: gameState.current.stats.highScore,
      backToBack: 0, tSpins: 0, tetrises: 0, playTime: 0,
      piecesPlaced: 0, perfectClears: 0,
    };
    gameState.current.holdType = null;
    gameState.current.canHold = true;
    gameState.current.gameOver = false;
    gameState.current.isPaused = false;
    gameState.current.nextQueue = [];
    gameState.current.startTime = Date.now();
    gameState.current.timeAcceleration = 0;
    gameState.current.isLocking = false;
    gameState.current.lockMoves = 0;

    setStats({ ...gameState.current.stats });
    setHoldPiece(null);
    setCanHold(true);
    setGameOver(false);
    setGameComplete(false);
    setIsPaused(false);
    setIsStarted(true);
    setLastAction('');
    setTimeBonus(0);

    refillQueue();
    spawnTetro();
    draw();

    if (bgmEnabled && bgmTrack !== 'none') soundEngine.startBgm();
  }, [initField, refillQueue, spawnTetro, draw, bgmEnabled, bgmTrack]);

  // Canvas初期化
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = FIELD_COL * BLOCK_SIZE;
    canvas.height = FIELD_ROW * BLOCK_SIZE;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = THEMES[theme].bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = 'bold 24px sans-serif';
      ctx.fillStyle = '#06b6d4';
      ctx.textAlign = 'center';
      ctx.fillText('TETRIS', canvas.width / 2, canvas.height / 2 - 30);
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Press SPACE to start', canvas.width / 2, canvas.height / 2 + 10);
    }
  }, [theme]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // ゲームループ
  useEffect(() => {
    if (!isStarted || gameOver || isPaused || countdown !== null) return;
    const speed = getCurrentSpeed();
    const interval = setInterval(drop, speed);
    return () => clearInterval(interval);
  }, [isStarted, gameOver, isPaused, stats.level, timeBonus, drop, getCurrentSpeed, countdown]);

  // 時間加速
  useEffect(() => {
    if (!isStarted || gameOver || isPaused || countdown !== null) return;
    const timer = setInterval(() => {
      const elapsed = Date.now() - gameState.current.startTime;
      const newAcceleration = Math.floor(elapsed / TIME_ACCELERATION_INTERVAL) * TIME_ACCELERATION_AMOUNT;
      if (newAcceleration !== gameState.current.timeAcceleration) {
        gameState.current.timeAcceleration = newAcceleration;
        setTimeBonus(newAcceleration);
      }
      gameState.current.stats.playTime = Math.floor(elapsed / 1000);
      setStats({ ...gameState.current.stats });
    }, 1000);
    return () => clearInterval(timer);
  }, [isStarted, gameOver, isPaused, countdown]);

  // ライン消去アニメーション
  useEffect(() => {
    if (!lineClearAnim) return;
    const interval = setInterval(() => {
      setLineClearAnim(prev => {
        if (!prev || prev.frame >= prev.maxFrames) return null;
        return { ...prev, frame: prev.frame + 1 };
      });
      draw();
    }, 20);
    return () => clearInterval(interval);
  }, [lineClearAnim, draw]);

  // カウントダウン描画
  useEffect(() => {
    if (countdown !== null) {
      draw();
    }
  }, [countdown, draw]);

  // スワイプ操作
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || !isStarted || gameState.current.gameOver || gameState.current.isPaused) return;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.time;

    const minSwipe = 30;
    const maxTapTime = 200;

    if (dt < maxTapTime && Math.abs(dx) < minSwipe && Math.abs(dy) < minSwipe) {
      // タップ = 回転
      tryRotate();
    } else if (Math.abs(dx) > Math.abs(dy)) {
      // 横スワイプ
      if (dx > minSwipe && !checkCollision(1, 0)) {
        gameState.current.tetroX++;
        soundEngine.move();
      } else if (dx < -minSwipe && !checkCollision(-1, 0)) {
        gameState.current.tetroX--;
        soundEngine.move();
      }
    } else {
      // 縦スワイプ
      if (dy > minSwipe * 2) {
        hardDrop();
      } else if (dy > minSwipe && !checkCollision(0, 1)) {
        gameState.current.tetroY++;
      }
    }
    draw();
    touchStartRef.current = null;
  };

  // モバイルコントロール
  const handleMobileControl = (action: string) => {
    if (!isStarted || gameState.current.gameOver || gameState.current.isPaused) return;
    switch (action) {
      case 'left':
        if (!checkCollision(-1, 0)) { gameState.current.tetroX--; soundEngine.move(); }
        break;
      case 'right':
        if (!checkCollision(1, 0)) { gameState.current.tetroX++; soundEngine.move(); }
        break;
      case 'down':
        if (!checkCollision(0, 1)) { gameState.current.tetroY++; }
        break;
      case 'rotate':
        tryRotate();
        break;
      case 'hardDrop':
        hardDrop();
        break;
      case 'hold':
        holdTetro();
        break;
    }
    draw();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getModeLabel = (mode: GameMode) => {
    const labels: Record<GameMode, string> = {
      endless: 'エンドレス',
      sprint: `スプリント (${SPRINT_LINES}ライン)`,
    };
    return labels[mode];
  };

  return (
    <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
      {/* 左サイドパネル */}
      <div className="flex lg:flex-col gap-4 order-2 lg:order-1">
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
            <Square size={12} />Hold
          </div>
          <canvas id="hold-canvas" width={72} height={72} className={`rounded ${!canHold ? 'opacity-40' : ''}`} />
        </div>

        <div className="bg-card border border-border rounded-lg p-3">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
            <Zap size={12} />Level
          </div>
          <div className="text-2xl font-bold text-primary">{stats.level}</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-3">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
            <Clock size={12} />Time
          </div>
          <div className="text-lg font-mono text-foreground">{formatTime(stats.playTime)}</div>
          {timeBonus > 0 && <div className="text-xs text-red-500">+{timeBonus}ms</div>}
        </div>

        {/* モード表示 */}
        {isStarted && (
          <div className="bg-card border border-border rounded-lg p-3">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
              <Timer size={12} />Mode
            </div>
            <div className="text-sm font-medium">{getModeLabel(gameMode)}</div>
            {gameMode === 'sprint' && (
              <div className="text-xs text-muted-foreground">{stats.lines}/{SPRINT_LINES}</div>
            )}
          </div>
        )}
      </div>

      {/* メインゲーム */}
      <div className="flex flex-col items-center gap-4 order-1 lg:order-2">
        <div className="flex gap-3 flex-wrap justify-center">
          <div className="bg-card border border-border rounded-lg px-4 py-2 text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Score</div>
            <div className="text-xl font-bold text-primary">{stats.score.toLocaleString()}</div>
          </div>
          <div className="bg-card border border-border rounded-lg px-4 py-2 text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Lines</div>
            <div className="text-xl font-bold text-primary">{stats.lines}</div>
          </div>
          <div className="bg-card border border-border rounded-lg px-4 py-2 text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1 justify-center">
              <Trophy size={12} />Best
            </div>
            <div className="text-xl font-bold text-yellow-500">{stats.highScore.toLocaleString()}</div>
          </div>
        </div>

        {(lastAction || stats.combo > 1) && (
          <div className="flex flex-col items-center gap-1">
            {lastAction && <div className="text-lg font-bold text-cyan-400 animate-pulse">{lastAction}</div>}
            {stats.combo > 1 && (
              <div className="flex items-center gap-2 text-orange-500">
                <Flame size={16} /><span className="font-bold">{stats.combo}x COMBO</span>
              </div>
            )}
          </div>
        )}

        <div
          className="relative"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <canvas ref={canvasRef} className="border-4 border-border rounded-lg shadow-2xl" style={{ imageRendering: 'pixelated' }} />
          {isPaused && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <Pause size={48} className="mx-auto mb-2 text-white" />
                <div className="text-2xl font-bold text-white mb-2">PAUSED</div>
                <div className="text-sm text-gray-400">Press P to resume</div>
              </div>
            </div>
          )}
        </div>

        <div className="text-center text-xs text-muted-foreground hidden md:block">
          ← → 移動 | ↓ 落下 | ↑/X 回転 | Z 逆回転 | SPACE ハードドロップ | C/Shift ホールド | G ゴースト
        </div>

        <div className="flex gap-2 flex-wrap justify-center">
          {(!isStarted || gameOver) && (
            <button onClick={() => setShowModeSelect(true)} className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors">
              {gameOver ? <RotateCcw size={20} /> : <Play size={20} />}
              {gameOver ? 'Retry' : 'Start'}
            </button>
          )}
          <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors" title={soundEnabled ? 'Mute SE' : 'Unmute SE'}>
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button onClick={() => {
            const currentIndex = BGM_TRACKS.findIndex(t => t.id === bgmTrack);
            const nextIndex = (currentIndex + 1) % BGM_TRACKS.length;
            handleBgmTrackChange(BGM_TRACKS[nextIndex].id);
          }} className="p-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors" title={`BGM: ${BGM_TRACKS.find(t => t.id === bgmTrack)?.label}`}>
            <Music size={20} className={bgmTrack !== 'none' ? 'text-primary' : ''} />
          </button>
          <button onClick={() => setShowSettings(true)} className="p-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors" title="Settings">
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* 右サイドパネル */}
      <div className="flex lg:flex-col gap-4 order-3">
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Next</div>
          <div className="flex lg:flex-col gap-2">
            {nextPieces.map((_, index) => (
              <canvas key={index} id={`next-canvas-${index}`} width={56} height={56} className={`rounded ${index === 0 ? '' : 'opacity-60'}`} />
            ))}
          </div>
        </div>

        {/* スコアボード */}
        <div className="bg-card border-2 border-primary/30 rounded-lg p-3">
          <div className="text-xs text-primary uppercase tracking-wider mb-2 flex items-center gap-1 font-bold">
            <Trophy size={12} />Scoreboard
          </div>
          <div className="space-y-2">
            <div className="text-center p-2 bg-primary/10 rounded-lg">
              <div className="text-xs text-muted-foreground">Score</div>
              <div className="text-xl font-bold text-primary">{stats.score.toLocaleString()}</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-1.5 bg-muted/50 rounded">
                <div className="text-[10px] text-muted-foreground">Lines</div>
                <div className="text-sm font-bold">{stats.lines}</div>
              </div>
              <div className="p-1.5 bg-muted/50 rounded">
                <div className="text-[10px] text-muted-foreground">Level</div>
                <div className="text-sm font-bold text-cyan-500">{stats.level}</div>
              </div>
            </div>
            <div className="text-center p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
              <div className="text-[10px] text-muted-foreground">High Score</div>
              <div className="text-lg font-bold text-yellow-500">{stats.highScore.toLocaleString()}</div>
            </div>
            <button
              onClick={() => setShowLeaderboard(true)}
              className="w-full flex items-center justify-center gap-1 p-1.5 bg-muted/50 hover:bg-muted rounded text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Medal size={12} />
              ランキング
            </button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-3">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Stats</div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Speed</span><span>{getCurrentSpeed()}ms</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Combo</span><span className={stats.combo > 0 ? 'text-orange-500' : ''}>{stats.combo}x</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">T-Spins</span><span className={stats.tSpins > 0 ? 'text-purple-500' : ''}>{stats.tSpins}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Tetrises</span><span className={stats.tetrises > 0 ? 'text-cyan-500' : ''}>{stats.tetrises}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Pieces</span><span>{stats.piecesPlaced}</span></div>
            {stats.perfectClears > 0 && (
              <div className="flex justify-between gap-4"><span className="text-muted-foreground">Perfect</span><span className="text-yellow-500">{stats.perfectClears}</span></div>
            )}
            {stats.backToBack > 1 && (
              <div className="flex justify-between gap-4"><span className="text-muted-foreground">B2B</span><span className="text-yellow-500">{stats.backToBack - 1}x</span></div>
            )}
          </div>
        </div>
      </div>

      {/* モバイルコントロール */}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center gap-2 md:hidden order-4">
        <div className="bg-card/90 backdrop-blur border border-border rounded-xl p-3 flex items-center gap-3">
          <button onClick={() => handleMobileControl('hold')} className="p-3 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-colors">
            <Square size={20} className="text-purple-500" />
          </button>
          <button onClick={() => handleMobileControl('left')} className="p-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <button onClick={() => handleMobileControl('down')} className="p-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors">
            <ArrowDown size={20} />
          </button>
          <button onClick={() => handleMobileControl('right')} className="p-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors">
            <ArrowRight size={20} />
          </button>
          <button onClick={() => handleMobileControl('rotate')} className="p-3 bg-primary/20 hover:bg-primary/30 rounded-lg transition-colors">
            <RotateCw size={20} className="text-primary" />
          </button>
          <button onClick={() => handleMobileControl('hardDrop')} className="p-3 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg transition-colors">
            <ChevronsDown size={20} className="text-yellow-500" />
          </button>
        </div>
      </div>

      {/* モード選択モーダル */}
      {showModeSelect && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">ゲームモード</h3>
              <button onClick={() => setShowModeSelect(false)} className="p-1 hover:bg-muted rounded-lg"><X size={20} /></button>
            </div>
            <div className="space-y-2">
              {([
                { mode: 'endless' as GameMode, icon: Infinity, label: 'エンドレス', desc: '限界までプレイ' },
                { mode: 'sprint' as GameMode, icon: Timer, label: 'スプリント', desc: `${SPRINT_LINES}ライン最速クリア` },
              ]).map(({ mode, icon: Icon, label, desc }) => (
                <button
                  key={mode}
                  onClick={() => startGameWithCountdown(mode)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
                >
                  <Icon size={24} className="text-primary" />
                  <div>
                    <div className="font-medium">{label}</div>
                    <div className="text-xs text-muted-foreground">{desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 設定モーダル */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-sm w-full max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">設定</h3>
              <button onClick={() => setShowSettings(false)} className="p-1 hover:bg-muted rounded-lg"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Ghost size={16} />
                  <span className="font-medium">ゴーストピース</span>
                </div>
                <button
                  onClick={() => setGhostEnabled(!ghostEnabled)}
                  className={`w-full p-2 rounded-lg border transition-colors ${ghostEnabled ? 'bg-primary/20 border-primary' : 'bg-muted border-border'}`}
                >
                  {ghostEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Music size={16} />
                  <span className="font-medium">BGM</span>
                </div>
                <div className="grid grid-cols-1 gap-2 mb-3">
                  {BGM_TRACKS.map(track => (
                    <button
                      key={track.id}
                      onClick={() => handleBgmTrackChange(track.id)}
                      className={`p-2 rounded-lg border transition-colors text-left ${bgmTrack === track.id ? 'bg-primary/20 border-primary' : 'bg-muted border-border'}`}
                    >
                      {track.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Volume2 size={14} className="text-muted-foreground" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={bgmVolume * 100}
                    onChange={(e) => setBgmVolume(parseInt(e.target.value) / 100)}
                    className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <span className="text-xs text-muted-foreground w-8 text-right">{Math.round(bgmVolume * 100)}%</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Palette size={16} />
                  <span className="font-medium">テーマ</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(THEMES) as ThemeType[]).map(t => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`p-2 rounded-lg border transition-colors capitalize ${theme === t ? 'bg-primary/20 border-primary' : 'bg-muted border-border'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={() => setShowSettings(false)} className="w-full mt-4 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors">
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* ニックネーム入力モーダル */}
      {showNicknameInput && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="text-yellow-500" size={24} />
              <h3 className="text-xl font-bold">{gameComplete ? 'クリア！' : 'ランキング入り！'}</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              スコア: <span className="text-primary font-bold">{pendingScore?.score.toLocaleString()}</span>
              {pendingScore?.time && <span className="ml-2">({formatTime(pendingScore.time)})</span>}
            </p>
            <div className="mb-4">
              <label className="block text-sm text-muted-foreground mb-2">ニックネーム (最大12文字)</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitNickname()}
                maxLength={12}
                placeholder="あなたの名前"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <button onClick={submitNickname} disabled={!nickname.trim() || isSubmitting} className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                登録
              </button>
              <button onClick={() => { setShowNicknameInput(false); setPendingScore(null); }} className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg font-medium transition-colors">
                スキップ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* リーダーボードモーダル */}
      {showLeaderboard && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Medal className="text-yellow-500" size={24} />
                <h3 className="text-xl font-bold">ランキング</h3>
              </div>
              <button onClick={() => setShowLeaderboard(false)} className="p-1 hover:bg-muted rounded-lg"><X size={20} /></button>
            </div>
            {leaderboard.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">まだ記録がありません</p>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry, index) => (
                  <div key={index} className={`flex items-center gap-3 p-3 rounded-lg ${
                    index === 0 ? 'bg-yellow-500/20 border border-yellow-500/50' :
                    index === 1 ? 'bg-gray-400/20 border border-gray-400/50' :
                    index === 2 ? 'bg-orange-600/20 border border-orange-600/50' : 'bg-muted/50'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-500 text-black' :
                      index === 1 ? 'bg-gray-400 text-black' :
                      index === 2 ? 'bg-orange-600 text-white' : 'bg-muted text-muted-foreground'
                    }`}>{index + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{entry.nickname}</div>
                      <div className="text-xs text-muted-foreground">
                        Lv.{entry.level} / {entry.lines}ライン / {entry.date}
                        {entry.time && ` / ${formatTime(entry.time)}`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">{entry.score.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setShowLeaderboard(false)} className="w-full mt-4 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors">
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* ランキングボタン */}
      {leaderboard.length > 0 && !showNicknameInput && !showLeaderboard && !showModeSelect && !showSettings && (
        <button onClick={() => setShowLeaderboard(true)} className="fixed bottom-4 right-4 p-3 bg-card border border-border rounded-full shadow-lg hover:bg-muted transition-colors z-30 md:bottom-8 md:right-8" title="ランキング">
          <Medal size={24} className="text-yellow-500" />
        </button>
      )}
    </div>
  );
}
