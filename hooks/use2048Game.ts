'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

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

export interface GameState {
  grid: Grid;
  score: number;
  bestScore: number;
  maxTile: number;
  moves: number;
  won: boolean;
  gameOver: boolean;
  keepPlaying: boolean;
}

const GRID_SIZE = 4;
const WINNING_VALUE = 2048;
const BEST_SCORE_KEY = 'adalab-2048-best-score';

let tileIdCounter = 0;
const generateTileId = () => ++tileIdCounter;

// 空のグリッドを作成
const createEmptyGrid = (): Grid => {
  return Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill(null));
};

// グリッドをディープコピー
const cloneGrid = (grid: Grid): Grid => {
  return grid.map(row =>
    row.map(tile => (tile ? { ...tile, mergedFrom: undefined, isNew: false } : null))
  );
};

// 空のセルを取得
const getEmptyCells = (grid: Grid): { row: number; col: number }[] => {
  const cells: { row: number; col: number }[] = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (!grid[row][col]) {
        cells.push({ row, col });
      }
    }
  }
  return cells;
};

// ランダムなセルにタイルを追加
const addRandomTile = (grid: Grid): Tile | null => {
  const emptyCells = getEmptyCells(grid);
  if (emptyCells.length === 0) return null;

  const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const value = Math.random() < 0.9 ? 2 : 4;

  const tile: Tile = {
    id: generateTileId(),
    value,
    row,
    col,
    isNew: true,
  };

  grid[row][col] = tile;
  return tile;
};

// 行をスライドしてマージ（左方向）
const slideAndMergeRow = (
  row: (Tile | null)[]
): { newRow: (Tile | null)[]; scoreGained: number; merged: boolean } => {
  let scoreGained = 0;
  let merged = false;

  // 空でないタイルを抽出
  const tiles = row.filter((tile): tile is Tile => tile !== null);
  const newRow: (Tile | null)[] = Array(GRID_SIZE).fill(null);

  let writeIndex = 0;
  for (let i = 0; i < tiles.length; i++) {
    const current = tiles[i];
    const next = tiles[i + 1];

    if (next && current.value === next.value) {
      // マージ
      const newValue = current.value * 2;
      const mergedTile: Tile = {
        id: generateTileId(),
        value: newValue,
        row: current.row,
        col: writeIndex,
        mergedFrom: [current, next],
      };
      newRow[writeIndex] = mergedTile;
      scoreGained += newValue;
      merged = true;
      i++; // 次のタイルをスキップ
    } else {
      newRow[writeIndex] = { ...current, col: writeIndex, mergedFrom: undefined, isNew: false };
    }
    writeIndex++;
  }

  return { newRow, scoreGained, merged };
};

// グリッドを回転（時計回り）
const rotateGridClockwise = (grid: Grid): Grid => {
  const newGrid = createEmptyGrid();
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const tile = grid[row][col];
      if (tile) {
        newGrid[col][GRID_SIZE - 1 - row] = {
          ...tile,
          row: col,
          col: GRID_SIZE - 1 - row,
        };
      }
    }
  }
  return newGrid;
};

// グリッドを回転（反時計回り）
const rotateGridCounterClockwise = (grid: Grid): Grid => {
  const newGrid = createEmptyGrid();
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const tile = grid[row][col];
      if (tile) {
        newGrid[GRID_SIZE - 1 - col][row] = {
          ...tile,
          row: GRID_SIZE - 1 - col,
          col: row,
        };
      }
    }
  }
  return newGrid;
};

// 移動を実行
const executeMove = (
  grid: Grid,
  direction: Direction
): { newGrid: Grid; scoreGained: number; moved: boolean } => {
  let workingGrid = cloneGrid(grid);
  let totalScore = 0;
  let anyMoved = false;

  // 方向に応じてグリッドを回転
  let rotations = 0;
  switch (direction) {
    case 'up':
      rotations = 1;
      break;
    case 'right':
      rotations = 2;
      break;
    case 'down':
      rotations = 3;
      break;
    case 'left':
      rotations = 0;
      break;
  }

  for (let i = 0; i < rotations; i++) {
    workingGrid = rotateGridClockwise(workingGrid);
  }

  // 各行をスライド（すべて左方向として処理）
  for (let row = 0; row < GRID_SIZE; row++) {
    const originalRow = workingGrid[row].map(tile =>
      tile ? tile.col : null
    );
    const { newRow, scoreGained, merged } = slideAndMergeRow(workingGrid[row]);
    workingGrid[row] = newRow;
    totalScore += scoreGained;

    // 移動があったかチェック
    const newPositions = newRow.map(tile => (tile ? tile.col : null));
    if (JSON.stringify(originalRow) !== JSON.stringify(newPositions) || merged) {
      anyMoved = true;
    }
  }

  // グリッドを元の向きに戻す
  for (let i = 0; i < (4 - rotations) % 4; i++) {
    workingGrid = rotateGridClockwise(workingGrid);
  }

  // タイルの行/列を更新
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

// 移動可能かチェック
const canMove = (grid: Grid): boolean => {
  // 空のセルがあれば移動可能
  if (getEmptyCells(grid).length > 0) return true;

  // 隣接するタイルに同じ値があれば移動可能
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const tile = grid[row][col];
      if (!tile) continue;

      // 右隣をチェック
      if (col < GRID_SIZE - 1) {
        const rightTile = grid[row][col + 1];
        if (rightTile && rightTile.value === tile.value) return true;
      }

      // 下隣をチェック
      if (row < GRID_SIZE - 1) {
        const belowTile = grid[row + 1][col];
        if (belowTile && belowTile.value === tile.value) return true;
      }
    }
  }

  return false;
};

// 最大タイル値を取得
const getMaxTile = (grid: Grid): number => {
  let max = 0;
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const tile = grid[row][col];
      if (tile && tile.value > max) {
        max = tile.value;
      }
    }
  }
  return max;
};

// 勝利条件をチェック
const checkWin = (grid: Grid): boolean => {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const tile = grid[row][col];
      if (tile && tile.value >= WINNING_VALUE) {
        return true;
      }
    }
  }
  return false;
};

export interface Use2048GameOptions {
  onScoreChange?: (score: number) => void;
  onGameOver?: (score: number, maxTile: number, moves: number) => void;
  onWin?: (score: number, maxTile: number, moves: number) => void;
  onMerge?: (value: number) => void;
}

export function use2048Game(options: Use2048GameOptions = {}) {
  const { onScoreChange, onGameOver, onWin, onMerge } = options;

  const [gameState, setGameState] = useState<GameState>(() => {
    const grid = createEmptyGrid();
    addRandomTile(grid);
    addRandomTile(grid);

    let bestScore = 0;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(BEST_SCORE_KEY);
      if (stored) bestScore = parseInt(stored, 10) || 0;
    }

    return {
      grid,
      score: 0,
      bestScore,
      maxTile: getMaxTile(grid),
      moves: 0,
      won: false,
      gameOver: false,
      keepPlaying: false,
    };
  });

  const [history, setHistory] = useState<{ grid: Grid; score: number }[]>([]);
  const [undoCount, setUndoCount] = useState(0);
  const maxUndos = 3;

  const isMovingRef = useRef(false);

  // ベストスコアを保存
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(BEST_SCORE_KEY, gameState.bestScore.toString());
    }
  }, [gameState.bestScore]);

  // 新しいゲームを開始
  const newGame = useCallback(() => {
    tileIdCounter = 0;
    const grid = createEmptyGrid();
    addRandomTile(grid);
    addRandomTile(grid);

    setGameState(prev => ({
      grid,
      score: 0,
      bestScore: prev.bestScore,
      maxTile: getMaxTile(grid),
      moves: 0,
      won: false,
      gameOver: false,
      keepPlaying: false,
    }));
    setHistory([]);
    setUndoCount(0);
  }, []);

  // 移動を実行
  const move = useCallback(
    (direction: Direction) => {
      if (isMovingRef.current) return false;
      if (gameState.gameOver) return false;
      if (gameState.won && !gameState.keepPlaying) return false;

      isMovingRef.current = true;

      const { newGrid, scoreGained, moved } = executeMove(gameState.grid, direction);

      if (!moved) {
        isMovingRef.current = false;
        return false;
      }

      // 履歴に保存（アンドゥ用）
      setHistory(prev => [...prev.slice(-9), { grid: gameState.grid, score: gameState.score }]);

      // 新しいタイルを追加
      addRandomTile(newGrid);

      const newScore = gameState.score + scoreGained;
      const newBestScore = Math.max(newScore, gameState.bestScore);
      const newMaxTile = getMaxTile(newGrid);
      const newWon = !gameState.won && checkWin(newGrid);
      const newGameOver = !canMove(newGrid);

      setGameState(prev => ({
        ...prev,
        grid: newGrid,
        score: newScore,
        bestScore: newBestScore,
        maxTile: newMaxTile,
        moves: prev.moves + 1,
        won: prev.won || newWon,
        gameOver: newGameOver,
      }));

      // コールバック
      if (scoreGained > 0) {
        onScoreChange?.(newScore);
        onMerge?.(scoreGained);
      }

      if (newWon && !gameState.won) {
        onWin?.(newScore, newMaxTile, gameState.moves + 1);
      }

      if (newGameOver) {
        onGameOver?.(newScore, newMaxTile, gameState.moves + 1);
      }

      setTimeout(() => {
        isMovingRef.current = false;
      }, 100);

      return true;
    },
    [gameState, onScoreChange, onGameOver, onWin, onMerge]
  );

  // アンドゥ
  const undo = useCallback(() => {
    if (history.length === 0) return false;
    if (undoCount >= maxUndos) return false;
    if (gameState.gameOver) return false;

    const lastState = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    setUndoCount(prev => prev + 1);

    setGameState(prev => ({
      ...prev,
      grid: lastState.grid,
      score: lastState.score,
      maxTile: getMaxTile(lastState.grid),
      moves: Math.max(0, prev.moves - 1),
      gameOver: false,
    }));

    return true;
  }, [history, undoCount, maxUndos, gameState.gameOver]);

  // 続けてプレイ
  const continueGame = useCallback(() => {
    if (!gameState.won) return;
    setGameState(prev => ({
      ...prev,
      keepPlaying: true,
    }));
  }, [gameState.won]);

  // キーボード操作
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.gameOver && !gameState.won) return;
      if (gameState.won && !gameState.keepPlaying) return;

      let direction: Direction | null = null;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          direction = 'up';
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          direction = 'down';
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          direction = 'left';
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          direction = 'right';
          break;
      }

      if (direction) {
        e.preventDefault();
        move(direction);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move, gameState.gameOver, gameState.won, gameState.keepPlaying]);

  return {
    // State
    grid: gameState.grid,
    score: gameState.score,
    bestScore: gameState.bestScore,
    maxTile: gameState.maxTile,
    moves: gameState.moves,
    won: gameState.won,
    gameOver: gameState.gameOver,
    keepPlaying: gameState.keepPlaying,

    // Undo
    canUndo: history.length > 0 && undoCount < maxUndos && !gameState.gameOver,
    undosRemaining: maxUndos - undoCount,

    // Actions
    move,
    newGame,
    undo,
    continueGame,
  };
}
