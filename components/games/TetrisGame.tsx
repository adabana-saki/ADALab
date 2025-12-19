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
} from 'lucide-react';

// ゲーム設定
const FIELD_COL = 10;
const FIELD_ROW = 20;
const BLOCK_SIZE = 28;
const TETRO_SIZE = 4;
const PREVIEW_BLOCK_SIZE = 18;

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
}

export function TetrisGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    lines: 0,
    level: 1,
    combo: 0,
    highScore: 0,
  });
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [nextPiece, setNextPiece] = useState<number>(1);
  const [holdPiece, setHoldPiece] = useState<number | null>(null);
  const [canHold, setCanHold] = useState(true);

  // ゲーム状態をrefで管理
  const gameState = useRef({
    field: [] as number[][],
    tetro: [] as TetroType,
    tetroType: 0,
    tetroX: 0,
    tetroY: 0,
    nextType: 0,
    holdType: null as number | null,
    canHold: true,
    stats: { score: 0, lines: 0, level: 1, combo: 0, highScore: 0 },
    gameOver: false,
    isPaused: false,
    lastDrop: 0,
  });

  // ハイスコア読み込み
  useEffect(() => {
    const saved = localStorage.getItem('tetris-highscore');
    if (saved) {
      const highScore = parseInt(saved, 10);
      gameState.current.stats.highScore = highScore;
      setStats((s) => ({ ...s, highScore }));
    }
  }, []);

  // フィールド初期化
  const initField = useCallback(() => {
    const field: number[][] = [];
    for (let y = 0; y < FIELD_ROW; y++) {
      field[y] = Array(FIELD_COL).fill(0);
    }
    return field;
  }, []);

  // ランダムなテトロミノタイプを取得
  const getRandomType = useCallback(() => {
    return Math.floor(Math.random() * (TETRO_TYPES.length - 1)) + 1;
  }, []);

  // 新しいテトロミノを生成
  const spawnTetro = useCallback((type?: number) => {
    const t = type ?? gameState.current.nextType;
    gameState.current.tetroType = t;
    gameState.current.tetro = TETRO_TYPES[t].map((row) => [...row]);
    gameState.current.tetroX = Math.floor(FIELD_COL / 2 - TETRO_SIZE / 2);
    gameState.current.tetroY = 0;
    gameState.current.nextType = getRandomType();
    gameState.current.canHold = true;
    setNextPiece(gameState.current.nextType);
    setCanHold(true);
  }, [getRandomType]);

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

  // ウォールキック（回転時の壁蹴り）
  const tryRotate = useCallback(() => {
    const rotated = rotate(gameState.current.tetro);
    const kicks = [0, -1, 1, -2, 2];
    for (const kick of kicks) {
      if (!checkCollision(kick, 0, rotated)) {
        gameState.current.tetro = rotated;
        gameState.current.tetroX += kick;
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

    if (lineCount > 0) {
      // ラインを消去
      for (const y of linesToClear) {
        field.splice(y, 1);
        field.unshift(Array(FIELD_COL).fill(0));
      }

      // スコア計算（コンボボーナス付き）
      const basePoints = [0, 100, 300, 500, 800][lineCount] || 0;
      const levelBonus = stats.level;
      const comboBonus = stats.combo * 50;
      const points = (basePoints + comboBonus) * levelBonus;

      stats.score += points;
      stats.lines += lineCount;
      stats.combo++;

      // レベルアップ（10ライン毎）
      const newLevel = Math.floor(stats.lines / 10) + 1;
      if (newLevel > stats.level) {
        stats.level = Math.min(newLevel, LEVEL_SPEEDS.length);
      }

      // ハイスコア更新
      if (stats.score > stats.highScore) {
        stats.highScore = stats.score;
        localStorage.setItem('tetris-highscore', stats.score.toString());
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
  }, []);

  // ホールド機能
  const holdTetro = useCallback(() => {
    if (!gameState.current.canHold) return;

    const currentType = gameState.current.tetroType;
    const holdType = gameState.current.holdType;

    gameState.current.holdType = currentType;
    gameState.current.canHold = false;
    setHoldPiece(currentType);
    setCanHold(false);

    if (holdType) {
      spawnTetro(holdType);
    } else {
      spawnTetro();
    }
  }, [spawnTetro]);

  // ハードドロップ
  const hardDrop = useCallback(() => {
    const ghostY = getGhostY();
    const dropDistance = ghostY - gameState.current.tetroY;
    gameState.current.tetroY = ghostY;
    gameState.current.stats.score += dropDistance * 2; // ハードドロップボーナス
    setStats({ ...gameState.current.stats });

    fixTetro();
    checkLines();
    spawnTetro();

    if (checkCollision(0, 0)) {
      gameState.current.gameOver = true;
      setGameOver(true);
    }
  }, [getGhostY, fixTetro, checkLines, spawnTetro, checkCollision]);

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

    // 3D効果
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(px + inset, py + inset, size - inset * 2, 3);
    ctx.fillRect(px + inset, py + inset, 3, size - inset * 2);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(px + size - inset - 3, py + inset, 3, size - inset * 2);
    ctx.fillRect(px + inset, py + size - inset - 3, size - inset * 2, 3);
  };

  // ミニプレビュー描画
  const drawPreview = (canvasId: string, type: number | null) => {
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
            const px = (x + offsetX) * PREVIEW_BLOCK_SIZE;
            const py = (y + offsetY) * PREVIEW_BLOCK_SIZE;
            ctx.fillStyle = TETRO_COLORS[type];
            ctx.fillRect(px + 1, py + 1, PREVIEW_BLOCK_SIZE - 2, PREVIEW_BLOCK_SIZE - 2);
          }
        }
      }
    }
  };

  // プレビュー更新
  useEffect(() => {
    drawPreview('next-canvas', nextPiece);
  }, [nextPiece]);

  useEffect(() => {
    drawPreview('hold-canvas', holdPiece);
  }, [holdPiece]);

  // 落下処理
  const drop = useCallback(() => {
    if (gameState.current.gameOver || gameState.current.isPaused) return;

    if (!checkCollision(0, 1)) {
      gameState.current.tetroY++;
    } else {
      fixTetro();
      checkLines();
      spawnTetro();

      if (checkCollision(0, 0)) {
        gameState.current.gameOver = true;
        setGameOver(true);
      }
    }
    draw();
  }, [checkCollision, fixTetro, checkLines, spawnTetro, draw]);

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
          if (!checkCollision(-1, 0)) gameState.current.tetroX--;
          break;
        case 'ArrowRight':
          if (!checkCollision(1, 0)) gameState.current.tetroX++;
          break;
        case 'ArrowDown':
          if (!checkCollision(0, 1)) {
            gameState.current.tetroY++;
            gameState.current.stats.score += 1; // ソフトドロップボーナス
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
          // 逆回転（3回回転）
          tryRotate();
          tryRotate();
          tryRotate();
          break;
      }
      draw();
    },
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
    };
    gameState.current.holdType = null;
    gameState.current.canHold = true;
    gameState.current.gameOver = false;
    gameState.current.isPaused = false;
    gameState.current.nextType = getRandomType();

    setStats({ ...gameState.current.stats });
    setHoldPiece(null);
    setCanHold(true);
    setGameOver(false);
    setIsPaused(false);
    setIsStarted(true);

    spawnTetro();
    draw();
  }, [initField, getRandomType, spawnTetro, draw]);

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

    const speed = LEVEL_SPEEDS[Math.min(stats.level - 1, LEVEL_SPEEDS.length - 1)];
    const interval = setInterval(drop, speed);
    return () => clearInterval(interval);
  }, [isStarted, gameOver, isPaused, stats.level, drop]);

  // モバイルコントロール
  const handleMobileControl = (action: string) => {
    if (!isStarted || gameState.current.gameOver || gameState.current.isPaused) return;

    switch (action) {
      case 'left':
        if (!checkCollision(-1, 0)) gameState.current.tetroX--;
        break;
      case 'right':
        if (!checkCollision(1, 0)) gameState.current.tetroX++;
        break;
      case 'down':
        if (!checkCollision(0, 1)) gameState.current.tetroY++;
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
            width={PREVIEW_BLOCK_SIZE * 4}
            height={PREVIEW_BLOCK_SIZE * 4}
            className={`rounded ${!canHold ? 'opacity-40' : ''}`}
          />
          <div className="text-[10px] text-muted-foreground mt-1 text-center">C / Shift</div>
        </div>

        {/* レベル */}
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
            <Zap size={12} />
            Level
          </div>
          <div className="text-2xl font-bold text-primary">{stats.level}</div>
        </div>
      </div>

      {/* メインゲーム */}
      <div className="flex flex-col items-center gap-4 order-1 lg:order-2">
        {/* スコアボード */}
        <div className="flex gap-4">
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

        {/* コンボ表示 */}
        {stats.combo > 1 && (
          <div className="flex items-center gap-2 text-orange-500 animate-pulse">
            <Flame size={20} />
            <span className="font-bold">{stats.combo}x COMBO!</span>
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
                <div className="text-sm text-gray-400">Press P or ESC to resume</div>
              </div>
            </div>
          )}
        </div>

        {/* 操作説明 */}
        <div className="text-center text-xs text-muted-foreground hidden md:block">
          <p className="flex flex-wrap justify-center gap-x-3 gap-y-1">
            <span><kbd className="px-1.5 py-0.5 bg-muted rounded">←→</kbd> Move</span>
            <span><kbd className="px-1.5 py-0.5 bg-muted rounded">↓</kbd> Soft Drop</span>
            <span><kbd className="px-1.5 py-0.5 bg-muted rounded">Space</kbd> Hard Drop</span>
            <span><kbd className="px-1.5 py-0.5 bg-muted rounded">↑/X</kbd> Rotate</span>
            <span><kbd className="px-1.5 py-0.5 bg-muted rounded">C</kbd> Hold</span>
            <span><kbd className="px-1.5 py-0.5 bg-muted rounded">P</kbd> Pause</span>
          </p>
        </div>

        {/* スタート/リスタートボタン */}
        {(!isStarted || gameOver) && (
          <button
            onClick={startGame}
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
          >
            {gameOver ? <RotateCcw size={20} /> : <Play size={20} />}
            {gameOver ? 'Play Again' : 'Start Game'}
          </button>
        )}
      </div>

      {/* 右サイドパネル */}
      <div className="flex lg:flex-col gap-4 order-3">
        {/* ネクスト */}
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Next</div>
          <canvas
            id="next-canvas"
            width={PREVIEW_BLOCK_SIZE * 4}
            height={PREVIEW_BLOCK_SIZE * 4}
            className="rounded"
          />
        </div>

        {/* 統計 */}
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Stats</div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Speed</span>
              <span>{LEVEL_SPEEDS[Math.min(stats.level - 1, LEVEL_SPEEDS.length - 1)]}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Combo</span>
              <span className={stats.combo > 0 ? 'text-orange-500' : ''}>{stats.combo}x</span>
            </div>
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
    </div>
  );
}
