'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Timer, Skull } from 'lucide-react';
import { createSeededRandom } from '@/lib/seededRandom';
import { OpponentState, GameSettings, GameResult, Position, Direction } from '@/hooks/useSnakeBattle';

interface SnakeBattleProps {
  nickname: string;
  seed: number;
  settings: GameSettings;
  opponentState: OpponentState | null;
  timeRemaining: number;
  winner: { id: string; nickname: string } | null;
  myPlayerId: string | null;
  obstacles: Position[];
  onStateUpdate: (snake: Position[], direction: Direction, score: number) => void;
  onFoodEaten: (newFood: Position, score: number) => void;
  onGameOver: (score: number, length: number) => void;
  onLeave: () => void;
  results: GameResult[];
  endReason: string;
}

const INITIAL_SPEED = 150;
const SPEED_INCREASE = 5;
const MIN_SPEED = 50;

// Get initial snake position
const getInitialSnake = (gridSize: number): Position[] => {
  const centerX = Math.floor(gridSize / 2);
  const centerY = Math.floor(gridSize / 2);
  return [
    { x: centerX, y: centerY },
    { x: centerX - 1, y: centerY },
    { x: centerX - 2, y: centerY },
  ];
};

// Generate random food position
const getRandomFood = (
  gridSize: number,
  snake: Position[],
  obstacles: Position[],
  rng: ReturnType<typeof createSeededRandom>
): Position => {
  const exclude = [...snake, ...obstacles];
  let pos: Position;
  let attempts = 0;
  const maxAttempts = 100;

  do {
    pos = {
      x: rng.nextInt(0, gridSize),
      y: rng.nextInt(0, gridSize),
    };
    attempts++;
  } while (
    exclude.some(p => p.x === pos.x && p.y === pos.y) &&
    attempts < maxAttempts
  );

  return pos;
};

export function SnakeBattle({
  nickname,
  seed,
  settings,
  opponentState,
  timeRemaining,
  winner,
  myPlayerId: _myPlayerId,
  obstacles,
  onStateUpdate,
  onFoodEaten,
  onGameOver,
  onLeave,
  results,
  endReason,
}: SnakeBattleProps) {
  const [snake, setSnake] = useState<Position[]>([]);
  const [food, setFood] = useState<Position>({ x: 0, y: 0 });
  const [direction, setDirection] = useState<Direction>('right');
  const [nextDirection, setNextDirection] = useState<Direction>('right');
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [localObstacles, setLocalObstacles] = useState<Position[]>([]);

  const rngRef = useRef<ReturnType<typeof createSeededRandom> | null>(null);
  const gameLoopRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const updateIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize game
  useEffect(() => {
    const rng = createSeededRandom(seed);
    rngRef.current = rng;

    const initialSnake = getInitialSnake(settings.gridSize);
    const initialFood = getRandomFood(settings.gridSize, initialSnake, [], rng);

    setSnake(initialSnake);
    setFood(initialFood);
    setDirection('right');
    setNextDirection('right');
    setScore(0);
    setGameOver(false);
    setSpeed(INITIAL_SPEED);
    setLocalObstacles([]);
  }, [seed, settings.gridSize]);

  // Handle incoming obstacles
  useEffect(() => {
    if (obstacles.length > localObstacles.length) {
      const newObstacles = obstacles.slice(localObstacles.length);
      setLocalObstacles(obstacles);
    }
  }, [obstacles, localObstacles.length]);

  // Game loop
  const gameLoop = useCallback((timestamp: number) => {
    if (gameOver) {
      gameLoopRef.current = null;
      return;
    }

    if (timestamp - lastUpdateRef.current < speed) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    lastUpdateRef.current = timestamp;

    setSnake(prevSnake => {
      if (gameOver || !rngRef.current) return prevSnake;

      const head = prevSnake[0];
      const currentDirection = nextDirection;
      setDirection(currentDirection);

      // Calculate new head position
      let newHead: Position;
      switch (currentDirection) {
        case 'up':
          newHead = { x: head.x, y: head.y - 1 };
          break;
        case 'down':
          newHead = { x: head.x, y: head.y + 1 };
          break;
        case 'left':
          newHead = { x: head.x - 1, y: head.y };
          break;
        case 'right':
          newHead = { x: head.x + 1, y: head.y };
          break;
      }

      // Wall collision
      if (
        newHead.x < 0 ||
        newHead.x >= settings.gridSize ||
        newHead.y < 0 ||
        newHead.y >= settings.gridSize
      ) {
        setGameOver(true);
        onGameOver(score, prevSnake.length);
        return prevSnake;
      }

      // Self collision
      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        onGameOver(score, prevSnake.length);
        return prevSnake;
      }

      // Obstacle collision
      if (localObstacles.some(obs => obs.x === newHead.x && obs.y === newHead.y)) {
        setGameOver(true);
        onGameOver(score, prevSnake.length);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check if food eaten
      if (newHead.x === food.x && newHead.y === food.y) {
        const newScore = score + 10;
        setScore(newScore);
        setSpeed(prev => Math.max(MIN_SPEED, prev - SPEED_INCREASE));

        const newFood = getRandomFood(settings.gridSize, newSnake, localObstacles, rngRef.current!);
        setFood(newFood);
        onFoodEaten(newFood, newScore);

        return newSnake;
      } else {
        newSnake.pop();
      }

      return newSnake;
    });

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameOver, speed, nextDirection, food, score, settings.gridSize, localObstacles, onGameOver, onFoodEaten]);

  // Start game loop
  useEffect(() => {
    if (!gameOver && snake.length > 0) {
      lastUpdateRef.current = performance.now();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameOver, snake.length, gameLoop]);

  // Send state updates periodically
  useEffect(() => {
    if (!gameOver && snake.length > 0) {
      updateIntervalRef.current = setInterval(() => {
        onStateUpdate(snake, direction, score);
      }, 500);
    }

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [gameOver, snake, direction, score, onStateUpdate]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;

      const opposites: Record<Direction, Direction> = {
        up: 'down',
        down: 'up',
        left: 'right',
        right: 'left',
      };

      let newDirection: Direction | null = null;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          newDirection = 'up';
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          newDirection = 'down';
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          newDirection = 'left';
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          newDirection = 'right';
          break;
      }

      if (newDirection && opposites[newDirection] !== direction) {
        e.preventDefault();
        setNextDirection(newDirection);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, direction]);

  // Touch controls
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current || gameOver) return;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;

    if (Math.abs(dx) < 30 && Math.abs(dy) < 30) {
      touchStartRef.current = null;
      return;
    }

    const opposites: Record<Direction, Direction> = {
      up: 'down',
      down: 'up',
      left: 'right',
      right: 'left',
    };

    let newDirection: Direction;
    if (Math.abs(dx) > Math.abs(dy)) {
      newDirection = dx > 0 ? 'right' : 'left';
    } else {
      newDirection = dy > 0 ? 'down' : 'up';
    }

    if (opposites[newDirection] !== direction) {
      setNextDirection(newDirection);
    }

    touchStartRef.current = null;
  }, [gameOver, direction]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const cellSize = Math.min(Math.floor(300 / settings.gridSize), 15);
  const gridPixelSize = cellSize * settings.gridSize;

  // Show results if winner is declared
  if (winner) {
    const isWinner = winner.nickname === nickname;
    const myResult = results.find(r => r.nickname === nickname);
    const opponentResult = results.find(r => r.nickname !== nickname);

    const reasonText = {
      'opponent_died': '相手がゲームオーバー',
      'time_up': '時間切れ',
      'opponent_quit': '相手が退出',
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
                <div className="text-center font-medium">長さ</div>

                <div className="text-left font-medium">{nickname} (あなた)</div>
                <div className="text-center text-primary font-bold">{myResult?.score || score}</div>
                <div className="text-center">{myResult?.length || snake.length}</div>

                <div className="text-left text-muted-foreground">{opponentResult.nickname}</div>
                <div className="text-center text-muted-foreground">{opponentResult.score}</div>
                <div className="text-center text-muted-foreground">{opponentResult.length}</div>
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
        <div className={`flex items-center gap-2 font-mono font-bold ${timeRemaining <= 30 ? 'text-red-500' : ''}`}>
          <Timer className="w-4 h-4" />
          {formatTime(timeRemaining)}
        </div>
      </div>

      {/* Score comparison */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">{nickname} (あなた)</p>
          <p className="text-2xl font-bold text-green-500">{score}</p>
          <p className="text-xs text-muted-foreground">長さ: {snake.length}</p>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">
            {opponentState?.nickname || '対戦相手'}
            {opponentState && !opponentState.isAlive && ' (ゲームオーバー)'}
          </p>
          <p className="text-2xl font-bold text-orange-500">
            {opponentState?.score ?? '---'}
          </p>
          <p className="text-xs text-muted-foreground">
            長さ: {opponentState?.snake.length ?? '---'}
          </p>
        </div>
      </div>

      {/* Obstacle warning */}
      {localObstacles.length > 0 && (
        <div className="mb-2 text-center text-sm text-red-500 flex items-center justify-center gap-2">
          <Skull className="w-4 h-4" />
          障害物: {localObstacles.length}個
        </div>
      )}

      {/* Game grids */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-4">
        {/* My grid */}
        <div
          className="relative select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <p className="text-center text-sm text-muted-foreground mb-2">あなた</p>
          <div
            className="relative bg-muted/30 border border-border rounded-lg overflow-hidden"
            style={{ width: gridPixelSize, height: gridPixelSize }}
          >
            {/* Snake */}
            {snake.map((segment, index) => (
              <motion.div
                key={`snake-${index}`}
                className={`absolute ${index === 0 ? 'bg-green-500' : 'bg-green-400'} rounded-sm`}
                style={{
                  width: cellSize - 1,
                  height: cellSize - 1,
                  left: segment.x * cellSize,
                  top: segment.y * cellSize,
                }}
                initial={{ scale: index === 0 ? 1 : 0.8 }}
                animate={{ scale: 1 }}
              />
            ))}

            {/* Food */}
            <motion.div
              className="absolute bg-yellow-500 rounded-full"
              style={{
                width: cellSize - 1,
                height: cellSize - 1,
                left: food.x * cellSize,
                top: food.y * cellSize,
              }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
            />

            {/* Obstacles */}
            {localObstacles.map((obs, index) => (
              <motion.div
                key={`obstacle-${index}`}
                className="absolute bg-red-500 rounded-sm"
                style={{
                  width: cellSize - 1,
                  height: cellSize - 1,
                  left: obs.x * cellSize,
                  top: obs.y * cellSize,
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              />
            ))}

            {/* Game over overlay */}
            {gameOver && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <div className="text-center text-white">
                  <Skull className="w-12 h-12 mx-auto mb-2" />
                  <p className="font-bold">ゲームオーバー</p>
                  <p className="text-sm">待機中...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Opponent's grid */}
        {opponentState && (
          <div>
            <p className="text-center text-sm text-muted-foreground mb-2">
              {opponentState.nickname}
            </p>
            <div
              className="relative bg-muted/30 border border-border rounded-lg overflow-hidden opacity-75"
              style={{ width: gridPixelSize, height: gridPixelSize }}
            >
              {/* Opponent snake */}
              {opponentState.snake.map((segment, index) => (
                <div
                  key={`opp-snake-${index}`}
                  className={`absolute ${index === 0 ? 'bg-orange-500' : 'bg-orange-400'} rounded-sm`}
                  style={{
                    width: cellSize - 1,
                    height: cellSize - 1,
                    left: segment.x * cellSize,
                    top: segment.y * cellSize,
                  }}
                />
              ))}

              {/* Opponent game over */}
              {!opponentState.isAlive && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Skull className="w-12 h-12 mx-auto mb-2" />
                    <p className="font-bold">ゲームオーバー</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Controls hint */}
      <div className="text-center text-xs text-muted-foreground mt-4">
        矢印キー / WASD / スワイプで操作
      </div>
    </div>
  );
}
