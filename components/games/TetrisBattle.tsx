'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AttackType, OpponentState } from '@/hooks/useTetrisBattle';
import { TetrisOpponentField } from './TetrisOpponentField';
import { TetrisGarbageMeter } from './TetrisGarbageMeter';
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';

// ゲーム設定
const FIELD_COL = 10;
const FIELD_ROW = 20;
const BLOCK_SIZE = 24; // 対戦用に少し小さく
const TETRO_SIZE = 4;
const LOCK_DELAY = 500;
const PREVIEW_BLOCK_SIZE = 14;

// レベル速度
const LEVEL_SPEEDS = [800, 720, 640, 560, 480, 400, 320, 240, 160, 100, 80, 60, 50, 40, 30];

// テトロミノ定義
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

// カラー
const COLORS = [
  '#1a1a2e', '#06b6d4', '#f97316', '#3b82f6', '#a855f7', '#eab308', '#ef4444', '#22c55e', '#6b7280'
];

// 攻撃テーブル
const ATTACK_TABLE: Record<string, number> = {
  single: 0,
  double: 1,
  triple: 2,
  tetris: 4,
  tspinSingle: 2,
  tspinDouble: 4,
  tspinTriple: 6,
  perfectClear: 10,
};

export interface TetrisBattleProps {
  roomId: string;
  nickname: string;
  seed: number;
  onLeave: () => void;
  onRematch: () => void;
  sendFieldUpdate: (field: number[][], score: number, lines: number, level: number) => void;
  sendAttack: (attackType: AttackType, combo: number, b2b: boolean) => void;
  consumeGarbage: (lines: number) => void;
  sendGameOver: () => void;
  pendingGarbageFromServer: number;
  opponentFromServer: OpponentState | null;
  opponentAliveFromServer: boolean;
  winnerFromServer: { id: string; nickname: string } | null;
}

type TetroType = number[][];

// シード付き乱数生成
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// 7-bag生成
function generateBag(random: () => number): number[] {
  const bag = [1, 2, 3, 4, 5, 6, 7];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

export function TetrisBattle({
  roomId,
  nickname,
  seed,
  onLeave,
  onRematch,
  sendFieldUpdate,
  sendAttack,
  consumeGarbage,
  sendGameOver,
  pendingGarbageFromServer,
  opponentFromServer,
  opponentAliveFromServer,
  winnerFromServer,
}: TetrisBattleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [ghostEnabled, setGhostEnabled] = useState(true);
  const hasInitialized = useRef(false);

  // ゲーム状態
  const gameStateRef = useRef({
    field: Array(FIELD_ROW).fill(null).map(() => Array(FIELD_COL).fill(0)),
    tetro: TETRO_TYPES[1] as TetroType,
    tetroType: 1,
    tetroX: 3,
    tetroY: 0,
    score: 0,
    lines: 0,
    level: 1,
    combo: 0,
    b2b: false,
    bag: [] as number[],
    nextQueue: [] as number[],
    holdPiece: null as number | null,
    canHold: true,
    gameOver: false,
    seed: 0,
    random: (() => Math.random()) as () => number,
    lockTimer: null as ReturnType<typeof setTimeout> | null,
    lockMoves: 0,
    lastClearWasTetris: false,
  });

  const [localPendingGarbage, setLocalPendingGarbage] = useState(0);
  const [, forceUpdate] = useState({});
  const [nextPieces, setNextPieces] = useState<number[]>([]);
  const [holdPieceDisplay, setHoldPieceDisplay] = useState<number | null>(null);
  const [canHoldDisplay, setCanHoldDisplay] = useState(true);

  // サーバーからのpendingGarbageを同期
  useEffect(() => {
    setLocalPendingGarbage(pendingGarbageFromServer);
  }, [pendingGarbageFromServer]);

  // 初期化（seedを受け取ったら一度だけ実行）
  useEffect(() => {
    if (seed && !hasInitialized.current) {
      hasInitialized.current = true;
      initGame(seed);
      setIsPlaying(true);
    }
  }, [seed]);

  // ゲーム初期化
  const initGame = useCallback((seed: number) => {
    const random = seededRandom(seed);
    const state = gameStateRef.current;

    state.field = Array(FIELD_ROW).fill(null).map(() => Array(FIELD_COL).fill(0));
    state.score = 0;
    state.lines = 0;
    state.level = 1;
    state.combo = 0;
    state.b2b = false;
    state.holdPiece = null;
    state.canHold = true;
    state.gameOver = false;
    state.seed = seed;
    state.random = random;
    state.lockMoves = 0;
    state.lastClearWasTetris = false;

    // 7-bag初期化
    state.bag = generateBag(random);
    state.nextQueue = [];
    for (let i = 0; i < 3; i++) {
      if (state.bag.length === 0) {
        state.bag = generateBag(random);
      }
      state.nextQueue.push(state.bag.pop()!);
    }

    // 最初のピース
    spawnPiece();
    setLocalPendingGarbage(0);
    forceUpdate({});
  }, []);

  // ピース生成
  const spawnPiece = useCallback(() => {
    const state = gameStateRef.current;

    if (state.bag.length === 0) {
      state.bag = generateBag(state.random);
    }
    state.nextQueue.push(state.bag.pop()!);
    const nextType = state.nextQueue.shift()!;

    state.tetroType = nextType;
    state.tetro = TETRO_TYPES[nextType].map((row) => [...row]);
    state.tetroX = 3;
    state.tetroY = 0;
    state.canHold = true;
    state.lockMoves = 0;

    // NEXT表示を更新
    setNextPieces([...state.nextQueue.slice(0, 3)]);
    setCanHoldDisplay(true);

    // 衝突チェック
    if (checkCollision(0, 0)) {
      state.gameOver = true;
      sendGameOver();
    }
  }, [sendGameOver]);

  // 衝突判定
  const checkCollision = useCallback((mx: number, my: number, newTetro?: TetroType): boolean => {
    const state = gameStateRef.current;
    const tetro = newTetro || state.tetro;

    for (let y = 0; y < TETRO_SIZE; y++) {
      for (let x = 0; x < TETRO_SIZE; x++) {
        if (tetro[y]?.[x]) {
          const nx = state.tetroX + x + mx;
          const ny = state.tetroY + y + my;
          if (ny < 0 || nx < 0 || ny >= FIELD_ROW || nx >= FIELD_COL) return true;
          if (state.field[ny]?.[nx]) return true;
        }
      }
    }
    return false;
  }, []);

  // ピース移動
  const movePiece = useCallback((dx: number, dy: number): boolean => {
    if (!checkCollision(dx, dy)) {
      gameStateRef.current.tetroX += dx;
      gameStateRef.current.tetroY += dy;
      gameStateRef.current.lockMoves++;
      forceUpdate({});
      return true;
    }
    return false;
  }, [checkCollision]);

  // 回転
  const rotatePiece = useCallback((clockwise: boolean) => {
    const state = gameStateRef.current;
    const newTetro: TetroType = Array(TETRO_SIZE).fill(null).map(() => Array(TETRO_SIZE).fill(0));

    for (let y = 0; y < TETRO_SIZE; y++) {
      for (let x = 0; x < TETRO_SIZE; x++) {
        if (clockwise) {
          newTetro[x][TETRO_SIZE - 1 - y] = state.tetro[y][x];
        } else {
          newTetro[TETRO_SIZE - 1 - x][y] = state.tetro[y][x];
        }
      }
    }

    // 壁蹴り
    const kicks = [[0, 0], [-1, 0], [1, 0], [0, -1], [-1, -1], [1, -1]];
    for (const [kx, ky] of kicks) {
      if (!checkCollision(kx, ky, newTetro)) {
        state.tetro = newTetro;
        state.tetroX += kx;
        state.tetroY += ky;
        state.lockMoves++;
        forceUpdate({});
        return true;
      }
    }
    return false;
  }, [checkCollision]);

  // ハードドロップ
  const hardDrop = useCallback(() => {
    const state = gameStateRef.current;
    let dropDistance = 0;

    while (!checkCollision(0, 1)) {
      state.tetroY++;
      dropDistance++;
    }

    state.score += dropDistance * 2;
    lockPiece();
  }, [checkCollision]);

  // ピース固定
  const lockPiece = useCallback(() => {
    const state = gameStateRef.current;

    // フィールドに固定
    for (let y = 0; y < TETRO_SIZE; y++) {
      for (let x = 0; x < TETRO_SIZE; x++) {
        if (state.tetro[y]?.[x]) {
          const ny = state.tetroY + y;
          const nx = state.tetroX + x;
          if (ny >= 0 && ny < FIELD_ROW && nx >= 0 && nx < FIELD_COL) {
            state.field[ny][nx] = state.tetroType;
          }
        }
      }
    }

    // ライン消去チェック（昇順で収集 - splice/unshiftが正しく動作するため）
    const clearedLines: number[] = [];
    for (let y = 0; y < FIELD_ROW; y++) {
      if (state.field[y].every((cell) => cell !== 0)) {
        clearedLines.push(y);
      }
    }

    if (clearedLines.length > 0) {
      // ライン消去
      for (const line of clearedLines) {
        state.field.splice(line, 1);
        state.field.unshift(Array(FIELD_COL).fill(0));
      }

      // スコア計算
      const lineScores = [0, 100, 300, 500, 800];
      let points = lineScores[clearedLines.length] || 0;

      // Tスピン判定（簡易版）
      const isTSpin = state.tetroType === 4 && state.lockMoves > 0;
      let attackType: AttackType = 'single';

      if (clearedLines.length === 1) attackType = isTSpin ? 'tspinSingle' : 'single';
      else if (clearedLines.length === 2) attackType = isTSpin ? 'tspinDouble' : 'double';
      else if (clearedLines.length === 3) attackType = isTSpin ? 'tspinTriple' : 'triple';
      else if (clearedLines.length === 4) attackType = 'tetris';

      // B2Bチェック
      const isTetrisOrTSpin = clearedLines.length === 4 || isTSpin;
      if (isTetrisOrTSpin && state.lastClearWasTetris) {
        points = Math.floor(points * 1.5);
        state.b2b = true;
      } else {
        state.b2b = false;
      }
      state.lastClearWasTetris = isTetrisOrTSpin;

      // コンボ
      state.combo++;
      points += state.combo * 50;

      // パーフェクトクリア
      const isPerfectClear = state.field.every((row) => row.every((cell) => cell === 0));
      if (isPerfectClear) {
        points += 3000;
        attackType = 'perfectClear';
      }

      state.score += points * state.level;
      state.lines += clearedLines.length;

      // レベルアップ
      const newLevel = Math.floor(state.lines / 10) + 1;
      if (newLevel > state.level && newLevel <= 15) {
        state.level = newLevel;
      }

      // 攻撃送信
      sendAttack(attackType, state.combo, state.b2b);

      // おじゃま相殺
      const attackLines = ATTACK_TABLE[attackType] + (state.combo > 1 ? state.combo - 1 : 0) + (state.b2b ? 1 : 0);
      if (localPendingGarbage > 0 && attackLines > 0) {
        const offset = Math.min(localPendingGarbage, attackLines);
        const remaining = localPendingGarbage - offset;
        setLocalPendingGarbage(0);
        consumeGarbage(offset);
        // 相殺後に残ったお邪魔を即座に追加
        if (remaining > 0) {
          addGarbageLines(remaining);
          consumeGarbage(remaining);
        }
      }
    } else {
      state.combo = 0;

      // おじゃまブロック追加
      if (localPendingGarbage > 0) {
        const linesToAdd = localPendingGarbage;  // 先に値を保存
        addGarbageLines(linesToAdd);
        setLocalPendingGarbage(0);
        consumeGarbage(linesToAdd);  // 保存した値を使用
      }
    }

    // フィールド更新を送信
    sendFieldUpdate(state.field, state.score, state.lines, state.level);

    // ゲームオーバー判定: 一番上の行(row 0)にブロックがあったら負け
    if (state.field[0].some((cell) => cell !== 0)) {
      state.gameOver = true;
      sendGameOver();
      return;
    }

    // 次のピース
    spawnPiece();
    forceUpdate({});
  }, [sendAttack, sendFieldUpdate, consumeGarbage, spawnPiece, localPendingGarbage, sendGameOver]);

  // おじゃまブロック追加（ぷよテト仕様: 70%で同じ穴位置を継続）
  const addGarbageLines = useCallback((lines: number) => {
    const state = gameStateRef.current;
    let holePos = Math.floor(state.random() * FIELD_COL);

    for (let i = 0; i < lines; i++) {
      state.field.shift();
      const garbageLine = Array(FIELD_COL).fill(8); // 8 = garbage color
      garbageLine[holePos] = 0;
      state.field.push(garbageLine);

      // ぷよテト仕様: 70%の確率で同じ穴位置、30%で変更
      if (state.random() > 0.7) {
        holePos = Math.floor(state.random() * FIELD_COL);
      }
    }
  }, []);

  // ホールド
  const holdPiece = useCallback(() => {
    const state = gameStateRef.current;
    if (!state.canHold) return;

    const currentType = state.tetroType;
    if (state.holdPiece === null) {
      state.holdPiece = currentType;
      spawnPiece();
    } else {
      const holdType = state.holdPiece;
      state.holdPiece = currentType;
      state.tetroType = holdType;
      state.tetro = TETRO_TYPES[holdType].map((row) => [...row]);
      state.tetroX = 3;
      state.tetroY = 0;
    }
    state.canHold = false;
    setHoldPieceDisplay(state.holdPiece);
    setCanHoldDisplay(false);
    forceUpdate({});
  }, [spawnPiece]);

  // キー入力（ソロモードと同じe.codeを使用）
  useEffect(() => {
    if (!isPlaying || gameStateRef.current.gameOver) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // ゲーム操作キーはすべてデフォルト動作を防止（スクロール等）
      const gameKeys = ['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', 'Space', 'KeyX', 'KeyZ', 'KeyC', 'ShiftLeft', 'ShiftRight'];
      if (gameKeys.includes(e.code)) {
        e.preventDefault();
      }

      switch (e.code) {
        case 'ArrowLeft':
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
          movePiece(1, 0);
          break;
        case 'ArrowDown':
          // ソフトドロップ: スコア+1（ソロモードと同じ）
          if (movePiece(0, 1)) {
            gameStateRef.current.score += 1;
          }
          break;
        case 'ArrowUp':
        case 'KeyX':
          rotatePiece(true);
          break;
        case 'KeyZ':
          rotatePiece(false);
          break;
        case 'Space':
          hardDrop();
          break;
        case 'KeyC':
        case 'ShiftLeft':
        case 'ShiftRight':
          holdPiece();
          break;
        case 'KeyG':
          setGhostEnabled(g => !g);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, movePiece, rotatePiece, hardDrop, holdPiece]);

  // 自動落下
  useEffect(() => {
    if (!isPlaying || gameStateRef.current.gameOver) return;

    const speed = LEVEL_SPEEDS[Math.min(gameStateRef.current.level - 1, LEVEL_SPEEDS.length - 1)];
    const interval = setInterval(() => {
      if (!movePiece(0, 1)) {
        // 接地
        if (!gameStateRef.current.lockTimer) {
          gameStateRef.current.lockTimer = setTimeout(() => {
            if (checkCollision(0, 1)) {
              lockPiece();
            }
            gameStateRef.current.lockTimer = null;
          }, LOCK_DELAY);
        }
      } else {
        if (gameStateRef.current.lockTimer) {
          clearTimeout(gameStateRef.current.lockTimer);
          gameStateRef.current.lockTimer = null;
        }
      }
    }, speed);

    return () => clearInterval(interval);
  }, [isPlaying, movePiece, checkCollision, lockPiece]);

  // 描画
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = gameStateRef.current;
    canvas.width = FIELD_COL * BLOCK_SIZE;
    canvas.height = FIELD_ROW * BLOCK_SIZE;

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

    // 危険ライン
    ctx.save();
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    ctx.beginPath();
    ctx.moveTo(0, 2 * BLOCK_SIZE);
    ctx.lineTo(FIELD_COL * BLOCK_SIZE, 2 * BLOCK_SIZE);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // フィールド
    for (let y = 0; y < FIELD_ROW; y++) {
      for (let x = 0; x < FIELD_COL; x++) {
        if (state.field[y][x]) {
          drawBlock(ctx, x, y, state.field[y][x]);
        }
      }
    }

    // ゴーストピース
    if (ghostEnabled) {
      let ghostY = state.tetroY;
      while (!checkCollisionAt(state.tetroX, ghostY + 1, state.tetro)) {
        ghostY++;
      }
      ctx.globalAlpha = 0.3;
      for (let y = 0; y < TETRO_SIZE; y++) {
        for (let x = 0; x < TETRO_SIZE; x++) {
          if (state.tetro[y]?.[x]) {
            drawBlock(ctx, state.tetroX + x, ghostY + y, state.tetroType);
          }
        }
      }
      ctx.globalAlpha = 1;
    }

    // 現在のピース
    for (let y = 0; y < TETRO_SIZE; y++) {
      for (let x = 0; x < TETRO_SIZE; x++) {
        if (state.tetro[y]?.[x]) {
          drawBlock(ctx, state.tetroX + x, state.tetroY + y, state.tetroType);
        }
      }
    }

    // ゲームオーバー
    if (state.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('K.O.', canvas.width / 2, canvas.height / 2);
    }

    function drawBlock(ctx: CanvasRenderingContext2D, x: number, y: number, type: number) {
      const color = COLORS[type] || COLORS[8];
      ctx.fillStyle = color;
      ctx.fillRect(x * BLOCK_SIZE + 1, y * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(x * BLOCK_SIZE + 1, y * BLOCK_SIZE + 1, BLOCK_SIZE - 2, 2);
      ctx.fillRect(x * BLOCK_SIZE + 1, y * BLOCK_SIZE + 1, 2, BLOCK_SIZE - 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(x * BLOCK_SIZE + 1, y * BLOCK_SIZE + BLOCK_SIZE - 3, BLOCK_SIZE - 2, 2);
      ctx.fillRect(x * BLOCK_SIZE + BLOCK_SIZE - 3, y * BLOCK_SIZE + 1, 2, BLOCK_SIZE - 2);
    }

    function checkCollisionAt(x: number, y: number, tetro: TetroType): boolean {
      for (let ty = 0; ty < TETRO_SIZE; ty++) {
        for (let tx = 0; tx < TETRO_SIZE; tx++) {
          if (tetro[ty]?.[tx]) {
            const nx = x + tx;
            const ny = y + ty;
            if (ny < 0 || nx < 0 || ny >= FIELD_ROW || nx >= FIELD_COL) return true;
            if (state.field[ny]?.[nx]) return true;
          }
        }
      }
      return false;
    }
  });

  // HOLD/NEXT描画
  const drawPreview = useCallback((canvasId: string, type: number | null, size: number = PREVIEW_BLOCK_SIZE) => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (type === null || type === 0) return;

    const tetro = TETRO_TYPES[type];
    const color = COLORS[type];

    for (let y = 0; y < TETRO_SIZE; y++) {
      for (let x = 0; x < TETRO_SIZE; x++) {
        if (tetro[y]?.[x]) {
          ctx.fillStyle = color;
          ctx.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.fillRect(x * size + 1, y * size + 1, size - 2, 2);
          ctx.fillRect(x * size + 1, y * size + 1, 2, size - 2);
        }
      }
    }
  }, []);

  // HOLD/NEXT描画更新
  useEffect(() => {
    drawPreview('battle-hold-canvas', holdPieceDisplay, 16);
    nextPieces.forEach((piece, index) => {
      drawPreview(`battle-next-canvas-${index}`, piece, 14);
    });
  }, [holdPieceDisplay, nextPieces, drawPreview]);

  const handleLeave = () => {
    onLeave();
  };

  // 相手がゲームオーバーになったらisPlayingをfalseに
  useEffect(() => {
    if (!opponentAliveFromServer && isPlaying && !gameStateRef.current.gameOver) {
      // 相手が負けたので勝利
      setIsPlaying(false);
    }
  }, [opponentAliveFromServer, isPlaying]);

  // 勝敗が決まったら
  useEffect(() => {
    if (winnerFromServer) {
      setIsPlaying(false);
    }
  }, [winnerFromServer]);

  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-4">
      {/* ヘッダー */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-4">
        <button
          onClick={handleLeave}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          退出
        </button>
        <div className="text-sm text-muted-foreground">
          Room: {roomId.slice(0, 8)}...
        </div>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 hover:bg-accent rounded"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* 勝敗表示 */}
      {winnerFromServer && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center space-y-6">
            <div className="text-6xl">
              {winnerFromServer.nickname === nickname ? '🏆' : '😢'}
            </div>
            <h2 className={`text-4xl font-bold ${winnerFromServer.nickname === nickname ? 'text-yellow-500' : 'text-foreground'}`}>
              {winnerFromServer.nickname === nickname ? 'WIN!' : 'LOSE'}
            </h2>
            <p className="text-muted-foreground">勝者: {winnerFromServer.nickname}</p>
            <div className="space-y-3">
              <button
                onClick={onRematch}
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
              >
                再戦する
              </button>
              <button
                onClick={handleLeave}
                className="w-full px-6 py-3 bg-card border border-border rounded-lg font-medium hover:bg-accent"
              >
                ロビーに戻る
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ゲームエリア */}
      <div className="flex items-start gap-4">
        {/* 左パネル - HOLD */}
        <div className="flex flex-col gap-2">
          <div className="bg-card border border-border rounded-lg p-2">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">HOLD</div>
            <canvas
              id="battle-hold-canvas"
              width={64}
              height={64}
              className={`rounded ${!canHoldDisplay ? 'opacity-40' : ''}`}
            />
          </div>
        </div>

        {/* 自分のフィールド */}
        <div className="flex gap-2">
          <TetrisGarbageMeter
            pendingGarbage={localPendingGarbage}
            height={FIELD_ROW * BLOCK_SIZE}
          />
          <div className="flex flex-col items-center gap-2">
            <div className="text-lg font-bold">{nickname} (あなた)</div>
            <canvas
              ref={canvasRef}
              className="border-4 border-primary rounded-lg"
              style={{ imageRendering: 'pixelated' }}
            />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs text-muted-foreground">SCORE</div>
                <div className="font-mono font-bold">{gameStateRef.current.score.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">LINES</div>
                <div className="font-mono font-bold">{gameStateRef.current.lines}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">LEVEL</div>
                <div className="font-mono font-bold">{gameStateRef.current.level}</div>
              </div>
            </div>
          </div>
        </div>

        {/* NEXTパネル */}
        <div className="flex flex-col gap-2">
          <div className="bg-card border border-border rounded-lg p-2">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">NEXT</div>
            <div className="flex flex-col gap-1">
              {[0, 1, 2].map((index) => (
                <canvas
                  key={index}
                  id={`battle-next-canvas-${index}`}
                  width={56}
                  height={56}
                  className={`rounded ${index === 0 ? '' : 'opacity-60'}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* VS */}
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-4xl font-bold text-primary">VS</div>
        </div>

        {/* 相手のフィールド */}
        <div className="flex flex-col items-center">
          {opponentFromServer ? (
            <TetrisOpponentField
              field={opponentFromServer.field}
              nickname={opponentFromServer.nickname}
              score={opponentFromServer.score}
              lines={opponentFromServer.lines}
              level={opponentFromServer.level}
              isAlive={opponentAliveFromServer}
              scale={0.7}
            />
          ) : (
            <div className="flex items-center justify-center w-48 h-80 border-2 border-dashed border-border rounded-lg">
              <span className="text-muted-foreground">相手を待っています...</span>
            </div>
          )}
        </div>
      </div>

      {/* 操作説明 */}
      <div className="mt-6 text-xs text-muted-foreground text-center">
        ← → 移動 | ↓ 落下 | ↑/X 回転 | Z 逆回転 | SPACE ハードドロップ | C/Shift ホールド | G ゴースト
      </div>
    </div>
  );
}
