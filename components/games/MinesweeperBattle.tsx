'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Timer, Flag, Bomb, Trophy, XCircle, Skull, Zap } from 'lucide-react';
import { Difficulty, DIFFICULTIES, Cell } from '@/hooks/useMinesweeperGame';
import { OpponentProgress, GameResult } from '@/hooks/useMinesweeperBattle';

// Mulberry32 seeded random (must match useMinesweeperGame.ts)
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface MinesweeperBattleProps {
  nickname: string;
  opponentNickname: string;
  difficulty: Difficulty;
  seed: number;
  timeRemaining: number;
  opponentProgress: OpponentProgress;
  opponentStatus: 'playing' | 'lost' | 'finished';
  opponentFinishTime: number | null;
  winner: { id: string; nickname: string } | null;
  myPlayerId: string | null;
  onProgress: (revealed: number, flagged: number, totalNonMines: number) => void;
  onFinished: (time: number) => void;
  onLost: () => void;
  onLeave: () => void;
  onRematch: () => void;
  results: GameResult[];
}

export function MinesweeperBattle({
  nickname,
  opponentNickname,
  difficulty,
  seed,
  timeRemaining,
  opponentProgress,
  opponentStatus,
  opponentFinishTime,
  winner,
  myPlayerId,
  onProgress,
  onFinished,
  onLost,
  onLeave,
  onRematch,
  results,
}: MinesweeperBattleProps) {
  const config = DIFFICULTIES[difficulty];
  const { width, height, mines } = config;
  const totalCells = width * height;
  const totalNonMines = totalCells - mines;

  // Game state
  const [board, setBoard] = useState<Cell[][]>([]);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [revealedCount, setRevealedCount] = useState(0);
  const [flagCount, setFlagCount] = useState(0);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isLongPress, setIsLongPress] = useState(false);

  // Initialize board with seed
  useEffect(() => {
    const random = mulberry32(seed);

    // Create empty board
    const newBoard: Cell[][] = Array(height)
      .fill(null)
      .map(() =>
        Array(width)
          .fill(null)
          .map(() => ({
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            adjacentMines: 0,
          }))
      );

    // Place mines randomly using seeded random
    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const x = Math.floor(random() * width);
      const y = Math.floor(random() * height);

      if (!newBoard[y][x].isMine) {
        newBoard[y][x].isMine = true;
        minesPlaced++;
      }
    }

    // Calculate adjacent mines
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (!newBoard[y][x].isMine) {
          let count = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const ny = y + dy;
              const nx = x + dx;
              if (ny >= 0 && ny < height && nx >= 0 && nx < width && newBoard[ny][nx].isMine) {
                count++;
              }
            }
          }
          newBoard[y][x].adjacentMines = count;
        }
      }
    }

    setBoard(newBoard);
  }, [seed, width, height, mines]);

  // Timer
  useEffect(() => {
    if (gameStatus !== 'playing') return;

    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 100);

    return () => clearInterval(timer);
  }, [gameStatus, startTime]);

  // Report progress
  useEffect(() => {
    if (gameStatus === 'playing') {
      onProgress(revealedCount, flagCount, totalNonMines);
    }
  }, [revealedCount, flagCount, totalNonMines, gameStatus, onProgress]);

  const revealCell = useCallback(
    (x: number, y: number) => {
      if (gameStatus !== 'playing' || board.length === 0) return;
      const cell = board[y]?.[x];
      if (!cell || cell.isRevealed || cell.isFlagged) return;

      const newBoard = board.map((row) => row.map((c) => ({ ...c })));

      if (cell.isMine) {
        // Hit a mine - lose
        newBoard[y][x].isRevealed = true;
        // Reveal all mines
        for (const row of newBoard) {
          for (const c of row) {
            if (c.isMine) c.isRevealed = true;
          }
        }
        setBoard(newBoard);
        setGameStatus('lost');
        onLost();
        return;
      }

      // Flood fill for empty cells
      const reveal = (rx: number, ry: number) => {
        if (rx < 0 || rx >= width || ry < 0 || ry >= height) return;
        const c = newBoard[ry][rx];
        if (c.isRevealed || c.isFlagged || c.isMine) return;

        c.isRevealed = true;

        if (c.adjacentMines === 0) {
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              reveal(rx + dx, ry + dy);
            }
          }
        }
      };

      reveal(x, y);
      setBoard(newBoard);

      // Count revealed
      let count = 0;
      for (const row of newBoard) {
        for (const c of row) {
          if (c.isRevealed && !c.isMine) count++;
        }
      }
      setRevealedCount(count);

      // Check win
      if (count === totalNonMines) {
        setGameStatus('won');
        onFinished(elapsedTime);
      }
    },
    [board, gameStatus, width, height, totalNonMines, elapsedTime, onLost, onFinished]
  );

  const toggleFlag = useCallback(
    (x: number, y: number, e?: React.MouseEvent) => {
      e?.preventDefault();
      if (gameStatus !== 'playing' || board.length === 0) return;
      const cell = board[y]?.[x];
      if (!cell || cell.isRevealed) return;

      const newBoard = board.map((row) => row.map((c) => ({ ...c })));
      newBoard[y][x].isFlagged = !newBoard[y][x].isFlagged;
      setBoard(newBoard);

      let count = 0;
      for (const row of newBoard) {
        for (const c of row) {
          if (c.isFlagged) count++;
        }
      }
      setFlagCount(count);
    },
    [board, gameStatus]
  );

  const chord = useCallback(
    (x: number, y: number) => {
      if (gameStatus !== 'playing' || board.length === 0) return;
      const cell = board[y]?.[x];
      if (!cell || !cell.isRevealed || cell.adjacentMines === 0) return;

      // Count adjacent flags
      let flagged = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const ny = y + dy;
          const nx = x + dx;
          if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
            if (board[ny][nx].isFlagged) flagged++;
          }
        }
      }

      // If flag count matches, reveal surrounding cells
      if (flagged === cell.adjacentMines) {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const ny = y + dy;
            const nx = x + dx;
            if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
              revealCell(nx, ny);
            }
          }
        }
      }
    },
    [board, gameStatus, height, width, revealCell]
  );

  const handleCellClick = (x: number, y: number) => {
    if (isLongPress) {
      setIsLongPress(false);
      return;
    }
    revealCell(x, y);
  };

  const handleCellDoubleClick = (x: number, y: number) => {
    chord(x, y);
  };

  const handleTouchStart = (x: number, y: number) => {
    setIsLongPress(false);
    longPressTimerRef.current = setTimeout(() => {
      setIsLongPress(true);
      toggleFlag(x, y);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate cell size (SSR-safe)
  const [cellSize, setCellSize] = useState(20);

  useEffect(() => {
    const calculateCellSize = () => {
      const maxWidth = Math.min(window.innerWidth, 600) - 32;
      const maxHeight = window.innerHeight - 280;
      const size = Math.floor(Math.min(maxWidth / width, maxHeight / height, 24));
      setCellSize(size);
    };

    calculateCellSize();
    window.addEventListener('resize', calculateCellSize);
    return () => window.removeEventListener('resize', calculateCellSize);
  }, [width, height]);

  const getCellColor = (cell: Cell) => {
    if (!cell.isRevealed) {
      return cell.isFlagged ? 'bg-yellow-500/20' : 'bg-muted hover:bg-muted/80';
    }
    if (cell.isMine) {
      return 'bg-red-500';
    }
    return 'bg-card';
  };

  const getNumberColor = (num: number) => {
    const colors = ['', 'text-blue-500', 'text-green-500', 'text-red-500', 'text-purple-500', 'text-orange-500', 'text-cyan-500', 'text-pink-500', 'text-gray-500'];
    return colors[num] || '';
  };

  const myProgress = Math.round((revealedCount / totalNonMines) * 100);

  // Result screen
  if (winner) {
    const isWinner = winner.nickname === nickname;
    const myResult = results.find((r) => r.id === myPlayerId);
    const opponentResult = results.find((r) => r.id !== myPlayerId);

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className={`text-6xl ${isWinner ? 'text-yellow-500' : 'text-muted-foreground'}`}>{isWinner ? '🏆' : '😢'}</div>
          <div>
            <h2 className={`text-3xl font-bold mb-2 ${isWinner ? 'text-yellow-500' : 'text-foreground'}`}>{isWinner ? 'WIN!' : 'LOSE...'}</h2>
            <p className="text-muted-foreground">勝者: {winner.nickname}</p>
          </div>

          {myResult && opponentResult && (
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-medium mb-3">結果</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-left">
                  <div className="font-medium">{nickname} (あなた)</div>
                  <div className={myResult.status === 'won' ? 'text-green-500' : 'text-red-500'}>
                    {myResult.status === 'won' ? `${myResult.time?.toFixed(1)}秒 🏆` : myResult.status === 'lost' ? '💀 地雷を踏んだ' : '⏰ タイムアップ'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-muted-foreground">{opponentResult.nickname}</div>
                  <div className={opponentResult.status === 'won' ? 'text-green-500' : 'text-red-500'}>
                    {opponentResult.status === 'won' ? `${opponentResult.time?.toFixed(1)}秒 🏆` : opponentResult.status === 'lost' ? '💀 地雷を踏んだ' : '⏰ タイムアップ'}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button onClick={onRematch} className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">
              再戦する
            </button>
            <button onClick={onLeave} className="w-full px-6 py-3 bg-card border border-border rounded-lg font-medium hover:bg-accent">
              ロビーに戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-4">
      {/* Header */}
      <div className="w-full max-w-lg mb-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onLeave} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            退出
          </button>
          <div className="flex items-center gap-2 text-lg font-mono">
            <Timer className="w-5 h-5 text-muted-foreground" />
            <span className={timeRemaining <= 30 ? 'text-red-500' : ''}>{formatTime(timeRemaining)}</span>
          </div>
        </div>

        {/* Progress comparison */}
        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
          {/* 自分の進捗 */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">{nickname}</span>
              <span className="text-xs text-muted-foreground">(あなた)</span>
              {gameStatus === 'lost' && <Skull className="w-3.5 h-3.5 text-red-500" />}
              {gameStatus === 'won' && <Trophy className="w-3.5 h-3.5 text-yellow-500" />}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{revealedCount}/{totalNonMines}</span>
              <span className="text-primary font-bold">{myProgress}%</span>
            </div>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div className="h-full bg-primary" initial={{ width: 0 }} animate={{ width: `${myProgress}%` }} transition={{ duration: 0.3 }} />
          </div>

          <div className="border-t border-border/50 my-1" />

          {/* 相手の進捗 */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium text-orange-400">{opponentNickname}</span>
              {opponentStatus === 'lost' && (
                <span className="flex items-center gap-1 text-xs text-red-500">
                  <Skull className="w-3.5 h-3.5" />
                  地雷を踏んだ
                </span>
              )}
              {opponentStatus === 'finished' && (
                <span className="flex items-center gap-1 text-xs text-yellow-500">
                  <Zap className="w-3.5 h-3.5" />
                  クリア{opponentFinishTime !== null ? ` (${opponentFinishTime.toFixed(1)}秒)` : ''}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {opponentStatus === 'playing' && (
                <span className="text-xs text-muted-foreground">
                  {opponentProgress.revealed > 0 && <><Flag className="w-3 h-3 inline" /> {opponentProgress.flagged}</>}
                </span>
              )}
              <span className={`font-bold ${opponentStatus === 'lost' ? 'text-red-500 line-through' : 'text-orange-400'}`}>
                {opponentProgress.percentage}%
              </span>
            </div>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${opponentStatus === 'lost' ? 'bg-red-500/50' : opponentStatus === 'finished' ? 'bg-yellow-500' : 'bg-orange-500'}`}
              initial={{ width: 0 }}
              animate={{ width: `${opponentProgress.percentage}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Game status */}
      <AnimatePresence>
        {gameStatus === 'lost' && !winner && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="fixed inset-0 flex items-center justify-center bg-black/50 z-10">
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-500 mb-2">GAME OVER</h2>
              <p className="text-muted-foreground">地雷を踏んでしまいました...</p>
              <p className="text-sm text-muted-foreground mt-2">
                {opponentStatus === 'finished' ? `${opponentNickname}はクリア済み` :
                 opponentStatus === 'lost' ? `${opponentNickname}も地雷を踏みました` :
                 `${opponentNickname}の結果を待っています...`}
              </p>
            </div>
          </motion.div>
        )}
        {gameStatus === 'won' && !winner && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="fixed inset-0 flex items-center justify-center bg-black/50 z-10">
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-yellow-500 mb-2">CLEAR!</h2>
              <p className="text-muted-foreground">タイム: {elapsedTime}秒</p>
              <p className="text-sm text-muted-foreground mt-2">
                {opponentStatus === 'finished' ? `${opponentNickname}もクリア済み - 判定中...` :
                 opponentStatus === 'lost' ? '勝利確定！' :
                 `${opponentNickname}の結果を待っています...`}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mine counter and timer */}
      <div className="flex items-center justify-between w-full max-w-lg mb-2 px-2">
        <div className="flex items-center gap-2 text-lg font-mono">
          <Bomb className="w-5 h-5" />
          {mines - flagCount}
        </div>
        <div className="flex items-center gap-2 text-lg font-mono">
          <Timer className="w-5 h-5" />
          {formatTime(elapsedTime)}
        </div>
      </div>

      {/* Board */}
      <div
        className="grid gap-[1px] bg-border p-[1px] rounded-lg select-none"
        style={{
          gridTemplateColumns: `repeat(${width}, ${cellSize}px)`,
        }}
      >
        {board.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className={`flex items-center justify-center border border-border/50 cursor-pointer transition-colors ${getCellColor(cell)}`}
              style={{ width: cellSize, height: cellSize, fontSize: Math.max(cellSize - 6, 8) }}
              onClick={() => handleCellClick(x, y)}
              onDoubleClick={() => handleCellDoubleClick(x, y)}
              onContextMenu={(e) => toggleFlag(x, y, e)}
              onTouchStart={() => handleTouchStart(x, y)}
              onTouchEnd={handleTouchEnd}
              onTouchMove={handleTouchEnd}
            >
              {cell.isRevealed ? (
                cell.isMine ? (
                  <Bomb className="w-3/4 h-3/4 text-white" />
                ) : cell.adjacentMines > 0 ? (
                  <span className={`font-bold ${getNumberColor(cell.adjacentMines)}`}>{cell.adjacentMines}</span>
                ) : null
              ) : cell.isFlagged ? (
                <Flag className="w-3/4 h-3/4 text-red-500" />
              ) : null}
            </div>
          ))
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 text-xs text-muted-foreground text-center">
        <p>クリック: セルを開く | 右クリック/長押し: 旗を立てる | ダブルクリック: 周囲を開く</p>
      </div>
    </div>
  );
}
