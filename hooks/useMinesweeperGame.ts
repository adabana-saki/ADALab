'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

// セルの状態
export interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
}

// 難易度設定
export type Difficulty = 'beginner' | 'intermediate' | 'expert';

export const DIFFICULTIES: Record<Difficulty, { width: number; height: number; mines: number }> = {
  beginner: { width: 9, height: 9, mines: 10 },
  intermediate: { width: 16, height: 16, mines: 40 },
  expert: { width: 30, height: 16, mines: 99 },
};

// ゲーム状態
export type GameStatus = 'idle' | 'playing' | 'won' | 'lost';

export interface GameState {
  board: Cell[][];
  difficulty: Difficulty;
  width: number;
  height: number;
  mineCount: number;
  flagCount: number;
  revealedCount: number;
  gameStatus: GameStatus;
  startTime: number | null;
  endTime: number | null;
  isFirstClick: boolean;
}

export interface MinesweeperStats {
  time: number;
  difficulty: Difficulty;
  flagsUsed: number;
  cellsRevealed: number;
}

interface UseMinesweeperGameOptions {
  initialDifficulty?: Difficulty;
  seed?: number; // 対戦モード用シード値
  onWin?: (stats: MinesweeperStats) => void;
  onLose?: () => void;
  onReveal?: (x: number, y: number) => void;
  onFlag?: (x: number, y: number) => void;
}

// シード付き乱数生成器 (Mulberry32)
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 空のセルを作成
function createEmptyCell(): Cell {
  return {
    isMine: false,
    isRevealed: false,
    isFlagged: false,
    adjacentMines: 0,
  };
}

// 空の盤面を作成
function createEmptyBoard(width: number, height: number): Cell[][] {
  return Array.from({ length: height }, () =>
    Array.from({ length: width }, () => createEmptyCell())
  );
}

// 隣接セルの座標を取得
function getNeighbors(
  x: number,
  y: number,
  width: number,
  height: number
): [number, number][] {
  const neighbors: [number, number][] = [];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        neighbors.push([nx, ny]);
      }
    }
  }
  return neighbors;
}

// 地雷を配置（最初にクリックしたセルとその周囲には配置しない）
function placeMines(
  board: Cell[][],
  width: number,
  height: number,
  mineCount: number,
  safeX: number,
  safeY: number,
  random: () => number
): void {
  // 安全なセル（クリック位置とその周囲）
  const safeCells = new Set<string>();
  safeCells.add(`${safeX},${safeY}`);
  for (const [nx, ny] of getNeighbors(safeX, safeY, width, height)) {
    safeCells.add(`${nx},${ny}`);
  }

  // 配置可能なセル
  const availableCells: [number, number][] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!safeCells.has(`${x},${y}`)) {
        availableCells.push([x, y]);
      }
    }
  }

  // シャッフルして地雷を配置
  for (let i = availableCells.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [availableCells[i], availableCells[j]] = [availableCells[j], availableCells[i]];
  }

  for (let i = 0; i < Math.min(mineCount, availableCells.length); i++) {
    const [x, y] = availableCells[i];
    board[y][x].isMine = true;
  }

  // 隣接地雷数を計算
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!board[y][x].isMine) {
        let count = 0;
        for (const [nx, ny] of getNeighbors(x, y, width, height)) {
          if (board[ny][nx].isMine) count++;
        }
        board[y][x].adjacentMines = count;
      }
    }
  }
}

export function useMinesweeperGame(options: UseMinesweeperGameOptions = {}) {
  const {
    initialDifficulty = 'beginner',
    seed,
    onWin,
    onLose,
    onReveal,
    onFlag,
  } = options;

  const [state, setState] = useState<GameState>(() => {
    const { width, height, mines } = DIFFICULTIES[initialDifficulty];
    return {
      board: createEmptyBoard(width, height),
      difficulty: initialDifficulty,
      width,
      height,
      mineCount: mines,
      flagCount: 0,
      revealedCount: 0,
      gameStatus: 'idle',
      startTime: null,
      endTime: null,
      isFirstClick: true,
    };
  });

  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const randomRef = useRef<() => number>(seed ? mulberry32(seed) : Math.random);

  // タイマー管理
  useEffect(() => {
    if (state.gameStatus === 'playing' && state.startTime) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - state.startTime!) / 1000));
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [state.gameStatus, state.startTime]);

  // 新しいゲームを開始
  const newGame = useCallback((difficulty?: Difficulty) => {
    const diff = difficulty || state.difficulty;
    const { width, height, mines } = DIFFICULTIES[diff];

    // シードをリセット（対戦モードでない場合）
    if (!seed) {
      randomRef.current = Math.random;
    } else {
      randomRef.current = mulberry32(seed);
    }

    setState({
      board: createEmptyBoard(width, height),
      difficulty: diff,
      width,
      height,
      mineCount: mines,
      flagCount: 0,
      revealedCount: 0,
      gameStatus: 'idle',
      startTime: null,
      endTime: null,
      isFirstClick: true,
    });
    setElapsedTime(0);
  }, [state.difficulty, seed]);

  // セルを開示（連鎖開示含む）
  const revealCell = useCallback((x: number, y: number) => {
    setState((prev) => {
      if (prev.gameStatus === 'won' || prev.gameStatus === 'lost') return prev;
      if (x < 0 || x >= prev.width || y < 0 || y >= prev.height) return prev;

      const cell = prev.board[y][x];
      if (cell.isRevealed || cell.isFlagged) return prev;

      // 新しい盤面をコピー
      const newBoard = prev.board.map((row) => row.map((c) => ({ ...c })));
      let newRevealedCount = prev.revealedCount;
      let newGameStatus: GameStatus = prev.gameStatus;
      let startTime = prev.startTime;
      let endTime = prev.endTime;
      let isFirstClick = prev.isFirstClick;

      // 最初のクリック時に地雷を配置
      if (isFirstClick) {
        placeMines(newBoard, prev.width, prev.height, prev.mineCount, x, y, randomRef.current);
        startTime = Date.now();
        newGameStatus = 'playing';
        isFirstClick = false;
      }

      // 地雷を踏んだ場合
      if (newBoard[y][x].isMine) {
        // すべての地雷を表示
        for (let ny = 0; ny < prev.height; ny++) {
          for (let nx = 0; nx < prev.width; nx++) {
            if (newBoard[ny][nx].isMine) {
              newBoard[ny][nx].isRevealed = true;
            }
          }
        }
        newGameStatus = 'lost';
        endTime = Date.now();
        onLose?.();
      } else {
        // 連鎖開示（BFS）
        const queue: [number, number][] = [[x, y]];
        const visited = new Set<string>();

        while (queue.length > 0) {
          const [cx, cy] = queue.shift()!;
          const key = `${cx},${cy}`;
          if (visited.has(key)) continue;
          visited.add(key);

          const currentCell = newBoard[cy][cx];
          if (currentCell.isRevealed || currentCell.isFlagged || currentCell.isMine) continue;

          currentCell.isRevealed = true;
          newRevealedCount++;

          // 空白セル（隣接地雷0）なら周囲も開示
          if (currentCell.adjacentMines === 0) {
            for (const [nx, ny] of getNeighbors(cx, cy, prev.width, prev.height)) {
              if (!visited.has(`${nx},${ny}`)) {
                queue.push([nx, ny]);
              }
            }
          }
        }

        // 勝利判定
        const totalSafeCells = prev.width * prev.height - prev.mineCount;
        if (newRevealedCount === totalSafeCells) {
          newGameStatus = 'won';
          endTime = Date.now();
          const time = Math.floor((endTime - startTime!) / 1000);
          onWin?.({
            time,
            difficulty: prev.difficulty,
            flagsUsed: prev.flagCount,
            cellsRevealed: newRevealedCount,
          });
        }
      }

      onReveal?.(x, y);

      return {
        ...prev,
        board: newBoard,
        revealedCount: newRevealedCount,
        gameStatus: newGameStatus,
        startTime,
        endTime,
        isFirstClick,
      };
    });
  }, [onWin, onLose, onReveal]);

  // フラグを切り替え
  const toggleFlag = useCallback((x: number, y: number) => {
    setState((prev) => {
      if (prev.gameStatus === 'won' || prev.gameStatus === 'lost') return prev;
      if (prev.gameStatus === 'idle') return prev; // 最初のクリック前はフラグ不可
      if (x < 0 || x >= prev.width || y < 0 || y >= prev.height) return prev;

      const cell = prev.board[y][x];
      if (cell.isRevealed) return prev;

      const newBoard = prev.board.map((row) => row.map((c) => ({ ...c })));
      newBoard[y][x].isFlagged = !newBoard[y][x].isFlagged;

      const newFlagCount = prev.flagCount + (newBoard[y][x].isFlagged ? 1 : -1);

      onFlag?.(x, y);

      return {
        ...prev,
        board: newBoard,
        flagCount: newFlagCount,
      };
    });
  }, [onFlag]);

  // コード（ダブルクリック）：周囲のフラグ数が隣接地雷数と一致したら周囲を開示
  const chord = useCallback((x: number, y: number) => {
    setState((prev) => {
      if (prev.gameStatus !== 'playing') return prev;
      if (x < 0 || x >= prev.width || y < 0 || y >= prev.height) return prev;

      const cell = prev.board[y][x];
      if (!cell.isRevealed || cell.adjacentMines === 0) return prev;

      // 周囲のフラグ数をカウント
      const neighbors = getNeighbors(x, y, prev.width, prev.height);
      const flaggedCount = neighbors.filter(
        ([nx, ny]) => prev.board[ny][nx].isFlagged
      ).length;

      // フラグ数が隣接地雷数と一致しない場合は何もしない
      if (flaggedCount !== cell.adjacentMines) return prev;

      // 周囲の未開示・未フラグセルは外部で順次開示するため、ここでは何もしない
      return prev;
    });

    // 周囲のセルを開示
    const neighbors = getNeighbors(x, y, state.width, state.height);
    const cell = state.board[y]?.[x];
    if (!cell?.isRevealed || cell.adjacentMines === 0) return;

    const flaggedCount = neighbors.filter(
      ([nx, ny]) => state.board[ny][nx].isFlagged
    ).length;

    if (flaggedCount === cell.adjacentMines) {
      for (const [nx, ny] of neighbors) {
        const neighborCell = state.board[ny][nx];
        if (!neighborCell.isRevealed && !neighborCell.isFlagged) {
          revealCell(nx, ny);
        }
      }
    }
  }, [state.board, state.width, state.height, revealCell]);

  // 難易度変更
  const setDifficulty = useCallback((difficulty: Difficulty) => {
    newGame(difficulty);
  }, [newGame]);

  // シード値を設定（対戦モード用）
  const setSeed = useCallback((newSeed: number) => {
    randomRef.current = mulberry32(newSeed);
  }, []);

  return {
    // 状態
    board: state.board,
    difficulty: state.difficulty,
    width: state.width,
    height: state.height,
    mineCount: state.mineCount,
    flagCount: state.flagCount,
    remainingMines: state.mineCount - state.flagCount,
    revealedCount: state.revealedCount,
    gameStatus: state.gameStatus,
    elapsedTime,
    isFirstClick: state.isFirstClick,

    // アクション
    newGame,
    revealCell,
    toggleFlag,
    chord,
    setDifficulty,
    setSeed,
  };
}
