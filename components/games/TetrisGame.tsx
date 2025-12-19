'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
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
} from 'lucide-react';

// ゲーム設定
const FIELD_COL = 10;
const FIELD_ROW = 20;
const BLOCK_SIZE = 28;
const TETRO_SIZE = 4;
const PREVIEW_BLOCK_SIZE = 16;
const NEXT_COUNT = 3; // 表示するネクストの数

// 時間経過による加速設定
const TIME_ACCELERATION_INTERVAL = 30000; // 30秒ごとに加速
const TIME_ACCELERATION_AMOUNT = 50; // 50msずつ速くなる
const MIN_SPEED = 50; // 最低速度

// レベルごとの落下速度（ミリ秒）
const LEVEL_SPEEDS = [800, 720, 640, 560, 480, 400, 320, 240, 160, 100, 80, 60, 50, 40, 30];

const TETRO_COLORS = [
  '#1a1a2e', // 0: 空
  '#06b6d4', // 1: シアン (I)
  '#f97316', // 2: オレンジ (L)
  '#3b82f6', // 3: 青 (J)
  '#a855f7', // 4: 紫 (T)
  '#eab308', // 5: 黄 (O)
  '#ef4444', // 6: 赤 (Z)
  '#22c55e', // 7: 緑 (S)
];

const TETRO_TYPES = [
  [], // 0: 空
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
}

interface LeaderboardEntry {
  nickname: string;
  score: number;
  lines: number;
  level: number;
  date: string;
}

const LEADERBOARD_KEY = 'tetris-leaderboard-v1';
const MAX_LEADERBOARD_ENTRIES = 10;

// サウンドエンジン
class SoundEngine {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  init() {
    if (typeof window !== 'undefined' && !this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
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

  move() {
    this.playTone(200, 0.05, 'square', 0.05);
  }

  rotate() {
    this.playTone(300, 0.08, 'square', 0.08);
  }

  drop() {
    this.playTone(150, 0.1, 'square', 0.1);
  }

  lineClear(lines: number) {
    const baseFreq = 400;
    for (let i = 0; i < lines; i++) {
      setTimeout(() => {
        this.playTone(baseFreq + i * 100, 0.15, 'sine', 0.15);
      }, i * 50);
    }
  }

  tetris() {
    // 特別なサウンド
    [523, 659, 784, 1047].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, 'sine', 0.2), i * 80);
    });
  }

  tSpin() {
    this.playTone(600, 0.1, 'sine', 0.15);
    setTimeout(() => this.playTone(800, 0.15, 'sine', 0.15), 100);
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

  hold() {
    this.playTone(250, 0.08, 'triangle', 0.1);
  }
}

const soundEngine = new SoundEngine();

export function TetrisGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    lines: 0,
    level: 1,
    combo: 0,
    highScore: 0,
    backToBack: 0,
    tSpins: 0,
    tetrises: 0,
    playTime: 0,
  });
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [nextPieces, setNextPieces] = useState<number[]>([1, 2, 3]);
  const [holdPiece, setHoldPiece] = useState<number | null>(null);
  const [canHold, setCanHold] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastAction, setLastAction] = useState<string>('');
  const [timeBonus, setTimeBonus] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showNicknameInput, setShowNicknameInput] = useState(false);
  const [nickname, setNickname] = useState('');
  const [pendingScore, setPendingScore] = useState<{ score: number; lines: number; level: number } | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // ゲーム状態をrefで管理
  const gameState = useRef({
    field: [] as number[][],
    tetro: [] as TetroType,
    tetroType: 0,
    tetroX: 0,
    tetroY: 0,
    nextQueue: [] as number[],
    holdType: null as number | null,
    canHold: true,
    stats: { score: 0, lines: 0, level: 1, combo: 0, highScore: 0, backToBack: 0, tSpins: 0, tetrises: 0, playTime: 0 },
    gameOver: false,
    isPaused: false,
    lastRotation: false, // T-Spin検出用
    lastKick: false, // T-Spin検出用
    startTime: 0,
    timeAcceleration: 0,
  });

  // ハイスコア・リーダーボード読み込み
  useEffect(() => {
    const savedHighScore = localStorage.getItem('tetris-highscore-v2');
    if (savedHighScore) {
      const highScore = parseInt(savedHighScore, 10);
      gameState.current.stats.highScore = highScore;
      setStats((s) => ({ ...s, highScore }));
    }

    const savedLeaderboard = localStorage.getItem(LEADERBOARD_KEY);
    if (savedLeaderboard) {
      try {
        setLeaderboard(JSON.parse(savedLeaderboard));
      } catch {
        setLeaderboard([]);
      }
    }

    const savedNickname = localStorage.getItem('tetris-nickname');
    if (savedNickname) {
      setNickname(savedNickname);
    }

    soundEngine.init();
  }, []);

  // リーダーボードにスコアを追加
  const addToLeaderboard = useCallback((entry: LeaderboardEntry) => {
    setLeaderboard(prev => {
      const newLeaderboard = [...prev, entry]
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_LEADERBOARD_ENTRIES);
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(newLeaderboard));
      return newLeaderboard;
    });
  }, []);

  // スコアがランキング入りするかチェック
  const isRankingScore = useCallback((score: number) => {
    if (leaderboard.length < MAX_LEADERBOARD_ENTRIES) return true;
    return score > (leaderboard[leaderboard.length - 1]?.score || 0);
  }, [leaderboard]);

  // ニックネーム送信
  const submitNickname = useCallback(() => {
    if (!pendingScore || !nickname.trim()) return;

    const entry: LeaderboardEntry = {
      nickname: nickname.trim().slice(0, 12),
      score: pendingScore.score,
      lines: pendingScore.lines,
      level: pendingScore.level,
      date: new Date().toISOString().split('T')[0],
    };

    addToLeaderboard(entry);
    localStorage.setItem('tetris-nickname', nickname.trim().slice(0, 12));
    setShowNicknameInput(false);
    setPendingScore(null);
    setShowLeaderboard(true);
  }, [pendingScore, nickname, addToLeaderboard]);

  // サウンド設定
  useEffect(() => {
    soundEngine.setEnabled(soundEnabled);
  }, [soundEnabled]);

  // フィールド初期化
  const initField = useCallback(() => {
    const field: number[][] = [];
    for (let y = 0; y < FIELD_ROW; y++) {
      field[y] = Array(FIELD_COL).fill(0);
    }
    return field;
  }, []);

  // 7-bag方式でピースを生成
  const generateBag = useCallback(() => {
    const bag = [1, 2, 3, 4, 5, 6, 7];
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    return bag;
  }, []);

  // ネクストキューを補充
  const refillQueue = useCallback(() => {
    while (gameState.current.nextQueue.length < NEXT_COUNT + 1) {
      gameState.current.nextQueue.push(...generateBag());
    }
  }, [generateBag]);

  // 新しいテトロミノを生成
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

  // ゴーストピースのY座標を計算
  const getGhostY = useCallback(() => {
    let ghostY = gameState.current.tetroY;
    while (!checkCollision(0, ghostY - gameState.current.tetroY + 1)) {
      ghostY++;
    }
    return ghostY;
  }, [checkCollision]);

  // 回転
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

  // T-Spin検出
  const detectTSpin = useCallback(() => {
    const { tetroType, tetroX, tetroY, field, lastRotation } = gameState.current;

    // T-pieceでない場合はfalse
    if (tetroType !== 4 || !lastRotation) return false;

    // Tピースの4つのコーナーをチェック
    const corners = [
      [tetroY, tetroX],
      [tetroY, tetroX + 2],
      [tetroY + 2, tetroX],
      [tetroY + 2, tetroX + 2],
    ];

    let filledCorners = 0;
    for (const [cy, cx] of corners) {
      if (cy < 0 || cy >= FIELD_ROW || cx < 0 || cx >= FIELD_COL || field[cy]?.[cx]) {
        filledCorners++;
      }
    }

    // 3つ以上のコーナーが埋まっていればT-Spin
    return filledCorners >= 3;
  }, []);

  // ウォールキック（回転時の壁蹴り）
  const tryRotate = useCallback(() => {
    const rotated = rotate(gameState.current.tetro);
    const kicks = [0, -1, 1, -2, 2];
    for (const kick of kicks) {
      if (!checkCollision(kick, 0, rotated)) {
        gameState.current.tetro = rotated;
        gameState.current.tetroX += kick;
        gameState.current.lastRotation = true;
        gameState.current.lastKick = kick !== 0;
        soundEngine.rotate();
        return true;
      }
    }
    return false;
  }, [rotate, checkCollision]);

  // テトロミノを固定
  const fixTetro = useCallback(() => {
    const { field, tetro, tetroType, tetroX, tetroY } = gameState.current;
    for (let y = 0; y < TETRO_SIZE; y++) {
      for (let x = 0; x < TETRO_SIZE; x++) {
        if (tetro[y]?.[x]) {
          field[tetroY + y][tetroX + x] = tetroType;
        }
      }
    }
    soundEngine.drop();
  }, []);

  // ライン消去チェック
  const checkLines = useCallback(() => {
    const { field, stats } = gameState.current;
    let lineCount = 0;
    const linesToClear: number[] = [];

    for (let y = 0; y < FIELD_ROW; y++) {
      if (field[y].every((cell) => cell !== 0)) {
        linesToClear.push(y);
        lineCount++;
      }
    }

    // T-Spin検出
    const isTSpin = detectTSpin();

    if (lineCount > 0) {
      // ラインを消去
      for (const y of linesToClear) {
        field.splice(y, 1);
        field.unshift(Array(FIELD_COL).fill(0));
      }

      // アクション表示
      let action = '';
      let basePoints = 0;

      if (isTSpin) {
        stats.tSpins++;
        if (lineCount === 1) {
          action = 'T-SPIN SINGLE!';
          basePoints = 800;
        } else if (lineCount === 2) {
          action = 'T-SPIN DOUBLE!';
          basePoints = 1200;
        } else if (lineCount === 3) {
          action = 'T-SPIN TRIPLE!';
          basePoints = 1600;
        }
        soundEngine.tSpin();
      } else if (lineCount === 4) {
        action = 'TETRIS!';
        basePoints = 800;
        stats.tetrises++;
        soundEngine.tetris();
      } else {
        basePoints = [0, 100, 300, 500][lineCount] || 0;
        if (lineCount >= 2) {
          action = ['', 'SINGLE', 'DOUBLE', 'TRIPLE'][lineCount];
        }
        soundEngine.lineClear(lineCount);
      }

      // Back-to-Back判定（テトリスまたはT-Spin）
      const isSpecial = lineCount === 4 || isTSpin;
      if (isSpecial && stats.backToBack > 0) {
        basePoints = Math.floor(basePoints * 1.5);
        action = 'B2B ' + action;
      }
      if (isSpecial) {
        stats.backToBack++;
      } else {
        stats.backToBack = 0;
      }

      // スコア計算
      const levelBonus = stats.level;
      const comboBonus = stats.combo * 50;
      const points = (basePoints + comboBonus) * levelBonus;

      stats.score += points;
      stats.lines += lineCount;
      stats.combo++;

      if (action) {
        setLastAction(action);
        setTimeout(() => setLastAction(''), 1500);
      }

      // レベルアップ（10ライン毎）
      const newLevel = Math.floor(stats.lines / 10) + 1;
      if (newLevel > stats.level) {
        stats.level = Math.min(newLevel, LEVEL_SPEEDS.length);
        soundEngine.levelUp();
      }

      // ハイスコア更新
      if (stats.score > stats.highScore) {
        stats.highScore = stats.score;
        localStorage.setItem('tetris-highscore-v2', stats.score.toString());
      }

      setStats({ ...stats });
    } else {
      // コンボリセット
      if (stats.combo > 0) {
        stats.combo = 0;
        setStats({ ...stats });
      }
    }

    return lineCount;
  }, [detectTSpin]);

  // ホールド機能
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
      // ホールドから取り出し
      gameState.current.tetroType = holdType;
      gameState.current.tetro = TETRO_TYPES[holdType].map((row) => [...row]);
      gameState.current.tetroX = Math.floor(FIELD_COL / 2 - TETRO_SIZE / 2);
      gameState.current.tetroY = 0;
      gameState.current.lastRotation = false;
    } else {
      spawnTetro();
    }
  }, [spawnTetro]);

  // ハードドロップ
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
      gameState.current.gameOver = true;
      setGameOver(true);
      soundEngine.gameOver();
      // ランキング入りチェック
      const finalScore = gameState.current.stats.score;
      if (isRankingScore(finalScore)) {
        setPendingScore({
          score: finalScore,
          lines: gameState.current.stats.lines,
          level: gameState.current.stats.level,
        });
        setShowNicknameInput(true);
      }
    }
  }, [getGhostY, fixTetro, checkLines, spawnTetro, checkCollision, isRankingScore]);

  // 現在のゲームスピードを計算
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

    const { field, tetro, tetroType, tetroX, tetroY, gameOver } = gameState.current;

    // 背景
    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // グリッド
    ctx.strokeStyle = '#1a1a2e';
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

    // フィールド
    for (let y = 0; y < FIELD_ROW; y++) {
      for (let x = 0; x < FIELD_COL; x++) {
        if (field[y][x]) {
          drawBlock(ctx, x, y, field[y][x], BLOCK_SIZE);
        }
      }
    }

    // ゴーストピース
    if (!gameOver) {
      const ghostY = getGhostY();
      ctx.globalAlpha = 0.3;
      for (let y = 0; y < TETRO_SIZE; y++) {
        for (let x = 0; x < TETRO_SIZE; x++) {
          if (tetro[y]?.[x]) {
            drawBlock(ctx, tetroX + x, ghostY + y, tetroType, BLOCK_SIZE);
          }
        }
      }
      ctx.globalAlpha = 1;
    }

    // 現在のテトロミノ
    for (let y = 0; y < TETRO_SIZE; y++) {
      for (let x = 0; x < TETRO_SIZE; x++) {
        if (tetro[y]?.[x]) {
          drawBlock(ctx, tetroX + x, tetroY + y, tetroType, BLOCK_SIZE);
        }
      }
    }

    // ゲームオーバー
    if (gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = 'bold 28px sans-serif';
      ctx.fillStyle = '#ef4444';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 30);
      ctx.font = '18px sans-serif';
      ctx.fillStyle = '#eab308';
      ctx.fillText(`Score: ${gameState.current.stats.score.toLocaleString()}`, canvas.width / 2, canvas.height / 2 + 10);
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Press SPACE to restart', canvas.width / 2, canvas.height / 2 + 45);
    }
  }, [getGhostY]);

  // ブロック描画
  const drawBlock = (ctx: CanvasRenderingContext2D, x: number, y: number, color: number, size: number) => {
    const px = x * size;
    const py = y * size;
    const inset = size === BLOCK_SIZE ? 2 : 1;

    ctx.fillStyle = TETRO_COLORS[color];
    ctx.fillRect(px + inset, py + inset, size - inset * 2, size - inset * 2);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(px + inset, py + inset, size - inset * 2, 3);
    ctx.fillRect(px + inset, py + inset, 3, size - inset * 2);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(px + size - inset - 3, py + inset, 3, size - inset * 2);
    ctx.fillRect(px + inset, py + size - inset - 3, size - inset * 2, 3);
  };

  // ミニプレビュー描画
  const drawPreview = useCallback((canvasId: string, type: number | null, size: number = PREVIEW_BLOCK_SIZE) => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas || type === null) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (type > 0) {
      const tetro = TETRO_TYPES[type];
      const offsetX = type === 1 ? 0 : type === 5 ? 0.5 : 0.5;
      const offsetY = type === 1 ? 0.5 : type === 5 ? 1 : 0.5;

      for (let y = 0; y < TETRO_SIZE; y++) {
        for (let x = 0; x < TETRO_SIZE; x++) {
          if (tetro[y][x]) {
            const px = (x + offsetX) * size;
            const py = (y + offsetY) * size;
            ctx.fillStyle = TETRO_COLORS[type];
            ctx.fillRect(px + 1, py + 1, size - 2, size - 2);
          }
        }
      }
    }
  }, []);

  // プレビュー更新
  useEffect(() => {
    drawPreview('hold-canvas', holdPiece, 18);
    nextPieces.forEach((piece, index) => {
      drawPreview(`next-canvas-${index}`, piece, 14);
    });
  }, [holdPiece, nextPieces, drawPreview]);

  // 落下処理
  const drop = useCallback(() => {
    if (gameState.current.gameOver || gameState.current.isPaused) return;

    if (!checkCollision(0, 1)) {
      gameState.current.tetroY++;
      gameState.current.lastRotation = false;
    } else {
      fixTetro();
      checkLines();
      spawnTetro();

      if (checkCollision(0, 0)) {
        gameState.current.gameOver = true;
        setGameOver(true);
        soundEngine.gameOver();
        // ランキング入りチェック
        const finalScore = gameState.current.stats.score;
        if (isRankingScore(finalScore)) {
          setPendingScore({
            score: finalScore,
            lines: gameState.current.stats.lines,
            level: gameState.current.stats.level,
          });
          setShowNicknameInput(true);
        }
      }
    }
    draw();
  }, [checkCollision, fixTetro, checkLines, spawnTetro, draw, isRankingScore]);

  // キー入力
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isStarted) {
        if (e.code === 'Space') {
          e.preventDefault();
          startGame();
        }
        return;
      }

      if (gameState.current.gameOver) {
        if (e.code === 'Space') {
          e.preventDefault();
          startGame();
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

      switch (e.code) {
        case 'ArrowLeft':
          if (!checkCollision(-1, 0)) {
            gameState.current.tetroX--;
            gameState.current.lastRotation = false;
            soundEngine.move();
          }
          break;
        case 'ArrowRight':
          if (!checkCollision(1, 0)) {
            gameState.current.tetroX++;
            gameState.current.lastRotation = false;
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
          tryRotate();
          tryRotate();
          tryRotate();
          break;
      }
      draw();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isStarted, checkCollision, tryRotate, hardDrop, holdTetro, draw]
  );

  // ゲーム開始
  const startGame = useCallback(() => {
    gameState.current.field = initField();
    gameState.current.stats = {
      score: 0,
      lines: 0,
      level: 1,
      combo: 0,
      highScore: gameState.current.stats.highScore,
      backToBack: 0,
      tSpins: 0,
      tetrises: 0,
      playTime: 0,
    };
    gameState.current.holdType = null;
    gameState.current.canHold = true;
    gameState.current.gameOver = false;
    gameState.current.isPaused = false;
    gameState.current.nextQueue = [];
    gameState.current.startTime = Date.now();
    gameState.current.timeAcceleration = 0;

    setStats({ ...gameState.current.stats });
    setHoldPiece(null);
    setCanHold(true);
    setGameOver(false);
    setIsPaused(false);
    setIsStarted(true);
    setLastAction('');
    setTimeBonus(0);

    refillQueue();
    spawnTetro();
    draw();
  }, [initField, refillQueue, spawnTetro, draw]);

  // Canvas初期化
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = FIELD_COL * BLOCK_SIZE;
    canvas.height = FIELD_ROW * BLOCK_SIZE;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0f0f1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = 'bold 24px sans-serif';
      ctx.fillStyle = '#06b6d4';
      ctx.textAlign = 'center';
      ctx.fillText('TETRIS', canvas.width / 2, canvas.height / 2 - 30);
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Press SPACE to start', canvas.width / 2, canvas.height / 2 + 10);
    }
  }, []);

  // キーイベント
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // ゲームループ
  useEffect(() => {
    if (!isStarted || gameOver || isPaused) return;

    const speed = getCurrentSpeed();
    const interval = setInterval(drop, speed);
    return () => clearInterval(interval);
  }, [isStarted, gameOver, isPaused, stats.level, timeBonus, drop, getCurrentSpeed]);

  // 時間経過による加速
  useEffect(() => {
    if (!isStarted || gameOver || isPaused) return;

    const timer = setInterval(() => {
      const elapsed = Date.now() - gameState.current.startTime;
      const newAcceleration = Math.floor(elapsed / TIME_ACCELERATION_INTERVAL) * TIME_ACCELERATION_AMOUNT;

      if (newAcceleration !== gameState.current.timeAcceleration) {
        gameState.current.timeAcceleration = newAcceleration;
        setTimeBonus(newAcceleration);
      }

      // プレイ時間更新
      gameState.current.stats.playTime = Math.floor(elapsed / 1000);
      setStats({ ...gameState.current.stats });
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, gameOver, isPaused]);

  // モバイルコントロール
  const handleMobileControl = (action: string) => {
    if (!isStarted || gameState.current.gameOver || gameState.current.isPaused) return;

    switch (action) {
      case 'left':
        if (!checkCollision(-1, 0)) {
          gameState.current.tetroX--;
          gameState.current.lastRotation = false;
          soundEngine.move();
        }
        break;
      case 'right':
        if (!checkCollision(1, 0)) {
          gameState.current.tetroX++;
          gameState.current.lastRotation = false;
          soundEngine.move();
        }
        break;
      case 'down':
        if (!checkCollision(0, 1)) {
          gameState.current.tetroY++;
          gameState.current.lastRotation = false;
        }
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

  // 時間フォーマット
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
      {/* 左サイドパネル */}
      <div className="flex lg:flex-col gap-4 order-2 lg:order-1">
        {/* ホールド */}
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
            <Square size={12} />
            Hold
          </div>
          <canvas
            id="hold-canvas"
            width={72}
            height={72}
            className={`rounded ${!canHold ? 'opacity-40' : ''}`}
          />
        </div>

        {/* レベル */}
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
            <Zap size={12} />
            Level
          </div>
          <div className="text-2xl font-bold text-primary">{stats.level}</div>
        </div>

        {/* 時間 */}
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
            <Clock size={12} />
            Time
          </div>
          <div className="text-lg font-mono text-foreground">{formatTime(stats.playTime)}</div>
          {timeBonus > 0 && (
            <div className="text-xs text-red-500">+{timeBonus}ms</div>
          )}
        </div>
      </div>

      {/* メインゲーム */}
      <div className="flex flex-col items-center gap-4 order-1 lg:order-2">
        {/* スコアボード */}
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
              <Trophy size={12} />
              Best
            </div>
            <div className="text-xl font-bold text-yellow-500">{stats.highScore.toLocaleString()}</div>
          </div>
        </div>

        {/* アクション表示 */}
        {(lastAction || stats.combo > 1) && (
          <div className="flex flex-col items-center gap-1">
            {lastAction && (
              <div className="text-lg font-bold text-cyan-400 animate-pulse">{lastAction}</div>
            )}
            {stats.combo > 1 && (
              <div className="flex items-center gap-2 text-orange-500">
                <Flame size={16} />
                <span className="font-bold">{stats.combo}x COMBO</span>
              </div>
            )}
          </div>
        )}

        {/* ゲームキャンバス */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="border-4 border-border rounded-lg shadow-2xl"
            style={{ imageRendering: 'pixelated' }}
          />
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

        {/* 操作説明 */}
        <div className="text-center text-xs text-muted-foreground hidden md:block">
          <p className="flex flex-wrap justify-center gap-x-3 gap-y-1">
            <span><kbd className="px-1.5 py-0.5 bg-muted rounded">←→</kbd> Move</span>
            <span><kbd className="px-1.5 py-0.5 bg-muted rounded">↓</kbd> Soft</span>
            <span><kbd className="px-1.5 py-0.5 bg-muted rounded">Space</kbd> Hard</span>
            <span><kbd className="px-1.5 py-0.5 bg-muted rounded">↑</kbd> Rotate</span>
            <span><kbd className="px-1.5 py-0.5 bg-muted rounded">C</kbd> Hold</span>
          </p>
        </div>

        {/* コントロールボタン */}
        <div className="flex gap-2">
          {(!isStarted || gameOver) && (
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
            >
              {gameOver ? <RotateCcw size={20} /> : <Play size={20} />}
              {gameOver ? 'Retry' : 'Start'}
            </button>
          )}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
            title={soundEnabled ? 'Mute' : 'Unmute'}
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
      </div>

      {/* 右サイドパネル */}
      <div className="flex lg:flex-col gap-4 order-3">
        {/* ネクスト */}
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Next</div>
          <div className="flex lg:flex-col gap-2">
            {nextPieces.map((_, index) => (
              <canvas
                key={index}
                id={`next-canvas-${index}`}
                width={56}
                height={56}
                className={`rounded ${index === 0 ? '' : 'opacity-60'}`}
              />
            ))}
          </div>
        </div>

        {/* 統計 */}
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Stats</div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Speed</span>
              <span>{getCurrentSpeed()}ms</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Combo</span>
              <span className={stats.combo > 0 ? 'text-orange-500' : ''}>{stats.combo}x</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">T-Spins</span>
              <span className={stats.tSpins > 0 ? 'text-purple-500' : ''}>{stats.tSpins}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Tetrises</span>
              <span className={stats.tetrises > 0 ? 'text-cyan-500' : ''}>{stats.tetrises}</span>
            </div>
            {stats.backToBack > 1 && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">B2B</span>
                <span className="text-yellow-500">{stats.backToBack - 1}x</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* モバイルコントロール */}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center gap-2 md:hidden order-4">
        <div className="bg-card/90 backdrop-blur border border-border rounded-xl p-3 flex items-center gap-3">
          <button
            onClick={() => handleMobileControl('hold')}
            className="p-3 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-colors"
          >
            <Square size={20} className="text-purple-500" />
          </button>
          <button
            onClick={() => handleMobileControl('left')}
            className="p-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <button
            onClick={() => handleMobileControl('down')}
            className="p-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
          >
            <ArrowDown size={20} />
          </button>
          <button
            onClick={() => handleMobileControl('right')}
            className="p-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
          >
            <ArrowRight size={20} />
          </button>
          <button
            onClick={() => handleMobileControl('rotate')}
            className="p-3 bg-primary/20 hover:bg-primary/30 rounded-lg transition-colors"
          >
            <RotateCw size={20} className="text-primary" />
          </button>
          <button
            onClick={() => handleMobileControl('hardDrop')}
            className="p-3 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg transition-colors"
          >
            <ChevronsDown size={20} className="text-yellow-500" />
          </button>
        </div>
      </div>

      {/* ニックネーム入力モーダル */}
      {showNicknameInput && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="text-yellow-500" size={24} />
              <h3 className="text-xl font-bold">ランキング入り！</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              スコア: <span className="text-primary font-bold">{pendingScore?.score.toLocaleString()}</span>
            </p>
            <div className="mb-4">
              <label className="block text-sm text-muted-foreground mb-2">
                ニックネームを入力 (最大12文字)
              </label>
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
              <button
                onClick={submitNickname}
                disabled={!nickname.trim()}
                className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                登録
              </button>
              <button
                onClick={() => {
                  setShowNicknameInput(false);
                  setPendingScore(null);
                }}
                className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg font-medium transition-colors"
              >
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
              <button
                onClick={() => setShowLeaderboard(false)}
                className="p-1 hover:bg-muted rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            {leaderboard.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                まだ記録がありません
              </p>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      index === 0
                        ? 'bg-yellow-500/20 border border-yellow-500/50'
                        : index === 1
                        ? 'bg-gray-400/20 border border-gray-400/50'
                        : index === 2
                        ? 'bg-orange-600/20 border border-orange-600/50'
                        : 'bg-muted/50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0
                        ? 'bg-yellow-500 text-black'
                        : index === 1
                        ? 'bg-gray-400 text-black'
                        : index === 2
                        ? 'bg-orange-600 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{entry.nickname}</div>
                      <div className="text-xs text-muted-foreground">
                        Lv.{entry.level} / {entry.lines}ライン / {entry.date}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">{entry.score.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowLeaderboard(false)}
              className="w-full mt-4 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* ランキング表示ボタン */}
      {leaderboard.length > 0 && !showNicknameInput && !showLeaderboard && (
        <button
          onClick={() => setShowLeaderboard(true)}
          className="fixed bottom-4 right-4 p-3 bg-card border border-border rounded-full shadow-lg hover:bg-muted transition-colors z-30 md:bottom-8 md:right-8"
          title="ランキングを見る"
        >
          <Medal size={24} className="text-yellow-500" />
        </button>
      )}
    </div>
  );
}
