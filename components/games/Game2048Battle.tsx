'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Timer, Trophy, Target } from 'lucide-react';
import { createSeededRandom } from '@/lib/seededRandom';
import { OpponentState, GameSettings, GameResult } from '@/hooks/use2048Battle';
import { getSoundEngine } from '@/lib/sound-engine';

// Types
export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Tile {
  id: number;
  value: number;
  row: number;
  col: number;
  mergedFrom?: [Tile, Tile];
  isNew?: boolean;
}

export type Grid = (Tile | null)[][];

interface Game2048BattleProps {
  nickname: string;
  seed: number;
  settings: GameSettings;
  opponentState: OpponentState | null;
  timeRemaining: number;
  winner: { id: string; nickname: string } | null;
  myPlayerId: string | null;
  onMoveUpdate: (score: number, maxTile: number, moves: number, grid: (number | null)[][]) => void;
  onReachedTarget: (score: number, maxTile: number, moves: number) => void;
  onGameOver: (score: number, maxTile: number, moves: number) => void;
  onLeave: () => void;
  results: GameResult[];
  endReason: string;
}

// Constants
const GRID_SIZE = 4;

// Tile colors
const TILE_COLORS: Record<number, { bg: string; text: string }> = {
  2: { bg: 'bg-[#eee4da]', text: 'text-[#776e65]' },
  4: { bg: 'bg-[#ede0c8]', text: 'text-[#776e65]' },
  8: { bg: 'bg-[#f2b179]', text: 'text-white' },
  16: { bg: 'bg-[#f59563]', text: 'text-white' },
  32: { bg: 'bg-[#f67c5f]', text: 'text-white' },
  64: { bg: 'bg-[#f65e3b]', text: 'text-white' },
  128: { bg: 'bg-[#edcf72]', text: 'text-white' },
  256: { bg: 'bg-[#edcc61]', text: 'text-white' },
  512: { bg: 'bg-[#edc850]', text: 'text-white' },
  1024: { bg: 'bg-[#edc53f]', text: 'text-white' },
  2048: { bg: 'bg-[#edc22e]', text: 'text-white' },
  4096: { bg: 'bg-[#3c3a32]', text: 'text-white' },
};

const getTileStyle = (value: number) => TILE_COLORS[value] || { bg: 'bg-[#3c3a32]', text: 'text-white' };
const getTileFontSize = (value: number) => {
  if (value >= 1000) return 'text-lg';
  if (value >= 100) return 'text-xl';
  return 'text-2xl';
};

// Tile ID counter
let tileIdCounter = 0;
const generateTileId = () => ++tileIdCounter;

// Grid utilities
const createEmptyGrid = (): Grid => Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));

const cloneGrid = (grid: Grid): Grid => grid.map(row =>
  row.map(tile => (tile ? { ...tile, mergedFrom: undefined, isNew: false } : null))
);

const getEmptyCells = (grid: Grid): { row: number; col: number }[] => {
  const cells: { row: number; col: number }[] = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (!grid[row][col]) cells.push({ row, col });
    }
  }
  return cells;
};

// Seeded tile placement
const addSeededTile = (grid: Grid, rng: ReturnType<typeof createSeededRandom>): Tile | null => {
  const emptyCells = getEmptyCells(grid);
  if (emptyCells.length === 0) return null;

  const idx = rng.nextInt(0, emptyCells.length);
  const { row, col } = emptyCells[idx];
  const value = rng.next() < 0.9 ? 2 : 4;

  const tile: Tile = { id: generateTileId(), value, row, col, isNew: true };
  grid[row][col] = tile;
  return tile;
};

const slideAndMergeRow = (row: (Tile | null)[]): { newRow: (Tile | null)[]; scoreGained: number } => {
  let scoreGained = 0;
  const tiles = row.filter((tile): tile is Tile => tile !== null);
  const newRow: (Tile | null)[] = Array(GRID_SIZE).fill(null);

  let writeIndex = 0;
  for (let i = 0; i < tiles.length; i++) {
    const current = tiles[i];
    const next = tiles[i + 1];

    if (next && current.value === next.value) {
      const newValue = current.value * 2;
      newRow[writeIndex] = {
        id: generateTileId(),
        value: newValue,
        row: current.row,
        col: writeIndex,
        mergedFrom: [current, next],
      };
      scoreGained += newValue;
      i++;
    } else {
      newRow[writeIndex] = { ...current, col: writeIndex, mergedFrom: undefined, isNew: false };
    }
    writeIndex++;
  }

  return { newRow, scoreGained };
};

const rotateGridClockwise = (grid: Grid): Grid => {
  const newGrid = createEmptyGrid();
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const tile = grid[row][col];
      if (tile) {
        newGrid[col][GRID_SIZE - 1 - row] = { ...tile, row: col, col: GRID_SIZE - 1 - row };
      }
    }
  }
  return newGrid;
};

const executeMove = (grid: Grid, direction: Direction): { newGrid: Grid; scoreGained: number; moved: boolean } => {
  let workingGrid = cloneGrid(grid);
  let totalScore = 0;
  let anyMoved = false;

  // シングルプレイヤー版と同じ回転ロジック
  const rotations = { up: 3, right: 2, down: 1, left: 0 }[direction];

  for (let i = 0; i < rotations; i++) workingGrid = rotateGridClockwise(workingGrid);

  for (let row = 0; row < GRID_SIZE; row++) {
    const originalPositions = workingGrid[row].map(t => t?.col ?? null);
    const { newRow, scoreGained } = slideAndMergeRow(workingGrid[row]);
    workingGrid[row] = newRow;
    totalScore += scoreGained;

    const newPositions = newRow.map(t => t?.col ?? null);
    if (JSON.stringify(originalPositions) !== JSON.stringify(newPositions) || scoreGained > 0) {
      anyMoved = true;
    }
  }

  for (let i = 0; i < (4 - rotations) % 4; i++) workingGrid = rotateGridClockwise(workingGrid);

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const tile = workingGrid[row][col];
      if (tile) {
        tile.row = row;
        tile.col = col;
      }
    }
  }

  return { newGrid: workingGrid, scoreGained: totalScore, moved: anyMoved };
};

const canMove = (grid: Grid): boolean => {
  if (getEmptyCells(grid).length > 0) return true;

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const tile = grid[row][col];
      if (!tile) continue;
      if (col < GRID_SIZE - 1 && grid[row][col + 1]?.value === tile.value) return true;
      if (row < GRID_SIZE - 1 && grid[row + 1][col]?.value === tile.value) return true;
    }
  }
  return false;
};

const getMaxTile = (grid: Grid): number => {
  let max = 0;
  for (const row of grid) {
    for (const tile of row) {
      if (tile && tile.value > max) max = tile.value;
    }
  }
  return max;
};

// Tile Component
function TileComponent({ tile, cellSize }: { tile: Tile; cellSize: number }) {
  const style = getTileStyle(tile.value);
  const fontSize = getTileFontSize(tile.value);

  return (
    <motion.div
      key={tile.id}
      initial={tile.isNew ? { scale: 0, opacity: 0 } : tile.mergedFrom ? { scale: 1.2 } : { scale: 1 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25, duration: 0.15 }}
      className={`absolute flex items-center justify-center rounded-md font-bold ${style.bg} ${style.text} ${fontSize}`}
      style={{
        width: cellSize,
        height: cellSize,
        left: tile.col * (cellSize + 4) + 4,
        top: tile.row * (cellSize + 4) + 4,
        zIndex: tile.value,
      }}
    >
      {tile.value}
    </motion.div>
  );
}

// Grid Component
function GridComponent({ grid }: { grid: Grid }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(60);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        setCellSize(Math.min(Math.floor((containerWidth - 20) / 4), 70));
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const gridSize = cellSize * 4 + 4 * 5;

  return (
    <div
      ref={containerRef}
      className="relative bg-[#bbada0] rounded-lg mx-auto"
      style={{ width: gridSize, height: gridSize }}
    >
      {Array(16).fill(null).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-md bg-[#cdc1b4]"
          style={{
            width: cellSize,
            height: cellSize,
            left: (i % 4) * (cellSize + 4) + 4,
            top: Math.floor(i / 4) * (cellSize + 4) + 4,
          }}
        />
      ))}
      <AnimatePresence>
        {grid.flat().map(tile => tile && <TileComponent key={tile.id} tile={tile} cellSize={cellSize} />)}
      </AnimatePresence>
    </div>
  );
}

// Mini Grid Component (相手の盤面表示用)
function MiniGridComponent({ grid }: { grid?: (number | null)[][] }) {
  if (!grid) return null;

  const cellSize = 32; // セルサイズを大きく
  const gap = 3;
  const gridSize = cellSize * 4 + gap * 3; // 4x4 + gap

  return (
    <div
      className="relative bg-[#bbada0] rounded-lg mx-auto mt-3"
      style={{ width: gridSize, height: gridSize, padding: 2 }}
    >
      {grid.flat().map((value, i) => {
        const row = Math.floor(i / 4);
        const col = i % 4;
        const style = value ? getTileStyle(value) : { bg: 'bg-[#cdc1b4]', text: '' };
        const fontSize = value && value >= 1000 ? 'text-[8px]' : value && value >= 100 ? 'text-[10px]' : 'text-xs';

        return (
          <div
            key={i}
            className={`absolute flex items-center justify-center rounded font-bold ${style.bg} ${style.text} ${fontSize}`}
            style={{
              width: cellSize,
              height: cellSize,
              left: col * (cellSize + gap) + 2,
              top: row * (cellSize + gap) + 2,
            }}
          >
            {value || ''}
          </div>
        );
      })}
    </div>
  );
}

// Main Component
export function Game2048Battle({
  nickname,
  seed,
  settings,
  opponentState,
  timeRemaining,
  winner,
  myPlayerId: _myPlayerId,
  onMoveUpdate,
  onReachedTarget,
  onGameOver,
  onLeave,
  results,
  endReason,
}: Game2048BattleProps) {
  const [grid, setGrid] = useState<Grid>(createEmptyGrid());
  const [score, setScore] = useState(0);
  const [maxTile, setMaxTile] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [reachedTarget, setReachedTarget] = useState(false);
  const [localTime, setLocalTime] = useState(timeRemaining); // ローカルタイマー

  const rngRef = useRef<ReturnType<typeof createSeededRandom> | null>(null);
  const isMovingRef = useRef(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const soundEngineRef = useRef(typeof window !== 'undefined' ? getSoundEngine() : null);
  const lastCountdownRef = useRef<number | null>(null);

  // サーバーからのタイマー更新を同期
  useEffect(() => {
    setLocalTime(timeRemaining);
  }, [timeRemaining]);

  // ローカルタイマーカウントダウン（毎秒）
  useEffect(() => {
    if (gameOver || reachedTarget || winner) return;

    const interval = setInterval(() => {
      setLocalTime(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [gameOver, reachedTarget, winner]);

  // Initialize game with seeded RNG
  useEffect(() => {
    tileIdCounter = 0;
    const rng = createSeededRandom(seed);
    rngRef.current = rng;

    const newGrid = createEmptyGrid();
    addSeededTile(newGrid, rng);
    addSeededTile(newGrid, rng);

    setGrid(newGrid);
    setScore(0);
    setMaxTile(getMaxTile(newGrid));
    setMoves(0);
    setGameOver(false);
    setReachedTarget(false);
  }, [seed]);

  // Handle move
  const move = useCallback((direction: Direction) => {
    if (isMovingRef.current || gameOver || reachedTarget) return;
    if (!rngRef.current) return;

    isMovingRef.current = true;

    const { newGrid, scoreGained, moved } = executeMove(grid, direction);

    if (!moved) {
      isMovingRef.current = false;
      return;
    }

    // 効果音: タイル移動
    soundEngineRef.current?.tileMove();

    // 効果音: マージ（スコアが増えた = マージが発生）
    if (scoreGained > 0) {
      // 最も高い新しいマージ値を使用
      const mergedValue = Math.max(...newGrid.flat().filter(t => t?.mergedFrom).map(t => t!.value));
      if (mergedValue > 0) {
        soundEngineRef.current?.tileMerge(mergedValue);
      }
    }

    addSeededTile(newGrid, rngRef.current);

    const newScore = score + scoreGained;
    const newMaxTile = getMaxTile(newGrid);
    const newMoves = moves + 1;

    setGrid(newGrid);
    setScore(newScore);
    setMaxTile(newMaxTile);
    setMoves(newMoves);

    // Send update to server (グリッドを数値配列に変換)
    const simpleGrid = newGrid.map(row => row.map(tile => tile?.value || null));
    onMoveUpdate(newScore, newMaxTile, newMoves, simpleGrid);

    // Check win condition (reachedTarget is always false here due to early return guard)
    if (newMaxTile >= settings.targetTile) {
      setReachedTarget(true);
      soundEngineRef.current?.win2048();
      onReachedTarget(newScore, newMaxTile, newMoves);
    }

    // Check game over
    if (!canMove(newGrid)) {
      setGameOver(true);
      soundEngineRef.current?.gameOver();
      onGameOver(newScore, newMaxTile, newMoves);
    }

    setTimeout(() => {
      isMovingRef.current = false;
    }, 100);
  }, [grid, score, moves, gameOver, reachedTarget, settings.targetTile, onMoveUpdate, onReachedTarget, onGameOver]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver || reachedTarget) return;

      const directions: Record<string, Direction> = {
        ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
        w: 'up', W: 'up', s: 'down', S: 'down', a: 'left', A: 'left', d: 'right', D: 'right',
      };

      const direction = directions[e.key];
      if (direction) {
        e.preventDefault();
        move(direction);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move, gameOver, reachedTarget]);

  // Touch controls
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;

    if (Math.abs(dx) < 30 && Math.abs(dy) < 30) {
      touchStartRef.current = null;
      return;
    }

    const direction: Direction = Math.abs(dx) > Math.abs(dy)
      ? (dx > 0 ? 'right' : 'left')
      : (dy > 0 ? 'down' : 'up');

    move(direction);
    touchStartRef.current = null;
  }, [move]);

  // カウントダウン効果音（残り10秒以下で毎秒再生）
  useEffect(() => {
    if (localTime <= 10 && localTime > 0 && !gameOver && !reachedTarget && !winner) {
      if (lastCountdownRef.current !== localTime) {
        soundEngineRef.current?.countdown();
        lastCountdownRef.current = localTime;
      }
    }
  }, [localTime, gameOver, reachedTarget, winner]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Show results if winner is declared
  if (winner) {
    const isWinner = winner.nickname === nickname;
    const myResult = results.find(r => r.nickname === nickname);
    const opponentResult = results.find(r => r.nickname !== nickname);

    const reasonText = {
      'reached_target': '2048達成！',
      'time_up': '時間切れ',
      'opponent_quit': '相手が退出',
      'higher_score': 'スコア勝負',
    }[endReason] || '';

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-lg space-y-6 text-center">
          <div className={`text-6xl ${isWinner ? 'text-yellow-500' : 'text-muted-foreground'}`}>
            {isWinner ? '🏆' : '😢'}
          </div>
          <div>
            <h2 className={`text-3xl font-bold mb-2 ${isWinner ? 'text-yellow-500' : 'text-foreground'}`}>
              {isWinner ? 'WIN!' : 'LOSE...'}
            </h2>
            <p className="text-muted-foreground">{reasonText} - 勝者: {winner.nickname}</p>
          </div>

          {myResult && opponentResult && (
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-medium mb-3">結果</h3>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div></div>
                <div className="text-center font-medium">スコア</div>
                <div className="text-center font-medium">最大タイル</div>

                <div className="text-left font-medium">{nickname} (あなた)</div>
                <div className="text-center text-primary font-bold">{myResult?.score || score}</div>
                <div className="text-center">{myResult?.maxTile || maxTile}</div>

                <div className="text-left text-muted-foreground">{opponentResult.nickname}</div>
                <div className="text-center text-muted-foreground">{opponentResult.score}</div>
                <div className="text-center text-muted-foreground">{opponentResult.maxTile}</div>
              </div>
            </div>
          )}

          <button
            onClick={onLeave}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
          >
            ロビーに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onLeave}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          退出
        </button>
        <div className="flex items-center gap-4 text-sm">
          <div className={`flex items-center gap-2 font-mono font-bold ${localTime <= 30 ? 'text-red-500' : ''}`}>
            <Timer className="w-4 h-4" />
            {formatTime(localTime)}
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-muted-foreground" />
            <span className="font-mono">{settings.targetTile}</span>
          </div>
        </div>
      </div>

      {/* Score comparison */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">{nickname} (あなた)</p>
          <motion.p
            key={score}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="text-2xl font-bold text-primary"
          >
            {score.toLocaleString()}
          </motion.p>
          <div className="flex justify-center gap-3 text-xs text-muted-foreground">
            <span>最大: {maxTile}</span>
            <span>手数: {moves}</span>
          </div>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 text-center relative">
          <p className="text-xs text-muted-foreground mb-1">
            {opponentState?.nickname || '対戦相手'}
          </p>
          <motion.p
            key={opponentState?.score || 0}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="text-2xl font-bold text-orange-500"
          >
            {opponentState?.score.toLocaleString() || '---'}
          </motion.p>
          <div className="flex justify-center gap-3 text-xs text-muted-foreground">
            <span>最大: {opponentState?.maxTile || '---'}</span>
            <span>手数: {opponentState?.moves || '---'}</span>
          </div>
          {/* 相手のミニグリッド */}
          <MiniGridComponent grid={opponentState?.grid} />
          {/* 相手のステータスバッジ */}
          {opponentState?.reachedTarget && (
            <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              🏆 2048!
            </div>
          )}
          {opponentState?.isFinished && !opponentState?.reachedTarget && (
            <div className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs px-2 py-0.5 rounded-full">
              終了
            </div>
          )}
        </div>
      </div>

      {/* Game grid */}
      <div
        className="flex-1 flex items-center justify-center select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative">
          <GridComponent grid={grid} />

          {/* Reached target overlay */}
          <AnimatePresence>
            {reachedTarget && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-yellow-500/80 rounded-lg"
              >
                <div className="text-center text-white">
                  <Trophy className="w-12 h-12 mx-auto mb-2" />
                  <h2 className="text-2xl font-bold">2048達成!</h2>
                  <p className="text-sm">相手の結果を待っています...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Game over overlay */}
          <AnimatePresence>
            {gameOver && !reachedTarget && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 rounded-lg"
              >
                <div className="text-center text-white">
                  <h2 className="text-2xl font-bold mb-2">ゲームオーバー</h2>
                  <p className="text-sm">相手の結果を待っています...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 相手終了時のカウントダウンアラート */}
      {opponentState?.isFinished && !gameOver && !reachedTarget && opponentState?.forceEndCountdown !== undefined && opponentState.forceEndCountdown > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-500/90 text-white text-center py-2 px-4 rounded-lg mt-2"
        >
          <p className="font-bold animate-pulse">
            相手が終了しました！あと {opponentState.forceEndCountdown} 秒...
          </p>
        </motion.div>
      )}

      {/* Stats */}
      <div className="flex justify-center gap-8 text-sm text-muted-foreground mt-4">
        <div>手数: {moves}</div>
        <div>最大タイル: {maxTile}</div>
      </div>

      {/* 操作案内 */}
      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground text-center">
          <span className="hidden sm:inline">🎮 操作: 矢印キー または WASD | </span>
          <span className="sm:hidden">📱 操作: スワイプで移動 | </span>
          <span>🎯 目標: {settings.targetTile}を作れ！</span>
        </p>
      </div>
    </div>
  );
}
