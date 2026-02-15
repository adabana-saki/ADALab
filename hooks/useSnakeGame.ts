'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  snake: Position[];
  food: Position;
  direction: Direction;
  nextDirection: Direction;
  score: number;
  highScore: number;
  gameOver: boolean;
  isPaused: boolean;
  speed: number;
}

const GRID_SIZE = 20;
const INITIAL_SPEED = 150; // ms per move
const SPEED_INCREASE = 5; // ms faster per food eaten
const MIN_SPEED = 50;

const HIGH_SCORE_KEY = 'adalab-snake-high-score';

// ランダムな位置を生成
const getRandomPosition = (exclude: Position[] = []): Position => {
  let pos: Position;
  do {
    pos = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (exclude.some(p => p.x === pos.x && p.y === pos.y));
  return pos;
};

// 初期スネーク
const getInitialSnake = (): Position[] => {
  const centerX = Math.floor(GRID_SIZE / 2);
  const centerY = Math.floor(GRID_SIZE / 2);
  return [
    { x: centerX, y: centerY },
    { x: centerX - 1, y: centerY },
    { x: centerX - 2, y: centerY },
  ];
};

export interface UseSnakeGameOptions {
  onScoreChange?: (score: number) => void;
  onGameOver?: (score: number) => void;
  onEat?: () => void;
}

export function useSnakeGame(options: UseSnakeGameOptions = {}) {
  const { onScoreChange, onGameOver, onEat } = options;

  const [gameState, setGameState] = useState<GameState>(() => {
    const snake = getInitialSnake();
    let highScore = 0;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(HIGH_SCORE_KEY);
      if (stored) highScore = parseInt(stored, 10) || 0;
    }
    return {
      snake,
      food: getRandomPosition(snake),
      direction: 'right',
      nextDirection: 'right',
      score: 0,
      highScore,
      gameOver: false,
      isPaused: true,
      speed: INITIAL_SPEED,
    };
  });

  const gameLoopRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  // ハイスコアを保存
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(HIGH_SCORE_KEY, gameState.highScore.toString());
    }
  }, [gameState.highScore]);

  // ゲームループ
  const gameLoop = useCallback((timestamp: number) => {
    if (gameState.isPaused || gameState.gameOver) {
      gameLoopRef.current = null;
      return;
    }

    if (timestamp - lastUpdateRef.current < gameState.speed) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    lastUpdateRef.current = timestamp;

    setGameState(prev => {
      if (prev.gameOver || prev.isPaused) return prev;

      const head = prev.snake[0];
      const direction = prev.nextDirection;

      // 新しい頭の位置を計算
      let newHead: Position;
      switch (direction) {
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

      // 壁との衝突チェック
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        onGameOver?.(prev.score);
        return { ...prev, gameOver: true, direction };
      }

      // 自分自身との衝突チェック
      if (prev.snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        onGameOver?.(prev.score);
        return { ...prev, gameOver: true, direction };
      }

      // 新しいスネークを作成
      const newSnake = [newHead, ...prev.snake];

      // 食べ物を食べたかチェック
      let newFood = prev.food;
      let newScore = prev.score;
      let newSpeed = prev.speed;

      if (newHead.x === prev.food.x && newHead.y === prev.food.y) {
        // 食べた！
        newScore = prev.score + 10;
        newFood = getRandomPosition(newSnake);
        newSpeed = Math.max(MIN_SPEED, prev.speed - SPEED_INCREASE);
        onEat?.();
        onScoreChange?.(newScore);
      } else {
        // 食べていなければ尻尾を削除
        newSnake.pop();
      }

      const newHighScore = Math.max(prev.highScore, newScore);

      return {
        ...prev,
        snake: newSnake,
        food: newFood,
        score: newScore,
        highScore: newHighScore,
        direction,
        speed: newSpeed,
      };
    });

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState.isPaused, gameState.gameOver, gameState.speed, onGameOver, onEat, onScoreChange]);

  // ゲームループの開始/停止
  useEffect(() => {
    if (!gameState.isPaused && !gameState.gameOver) {
      lastUpdateRef.current = performance.now();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.isPaused, gameState.gameOver, gameLoop]);

  // 方向を変更
  const changeDirection = useCallback((newDirection: Direction) => {
    setGameState(prev => {
      // 反対方向への移動は無効
      const opposites: Record<Direction, Direction> = {
        up: 'down',
        down: 'up',
        left: 'right',
        right: 'left',
      };

      if (opposites[newDirection] === prev.direction) {
        return prev;
      }

      return { ...prev, nextDirection: newDirection };
    });
  }, []);

  // ゲーム開始
  const startGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: false }));
  }, []);

  // ゲーム一時停止
  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: true }));
  }, []);

  // ゲーム再開
  const resumeGame = useCallback(() => {
    setGameState(prev => {
      if (prev.gameOver) return prev;
      return { ...prev, isPaused: false };
    });
  }, []);

  // 一時停止/再開トグル
  const togglePause = useCallback(() => {
    setGameState(prev => {
      if (prev.gameOver) return prev;
      return { ...prev, isPaused: !prev.isPaused };
    });
  }, []);

  // 新しいゲーム
  const newGame = useCallback(() => {
    const snake = getInitialSnake();
    setGameState(prev => ({
      snake,
      food: getRandomPosition(snake),
      direction: 'right',
      nextDirection: 'right',
      score: 0,
      highScore: prev.highScore,
      gameOver: false,
      isPaused: true,
      speed: INITIAL_SPEED,
    }));
  }, []);

  // キーボード操作
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.gameOver) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          changeDirection('up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          changeDirection('down');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          changeDirection('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          changeDirection('right');
          break;
        case ' ':
        case 'p':
        case 'P':
          e.preventDefault();
          togglePause();
          break;
        case 'Escape':
          e.preventDefault();
          pauseGame();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.gameOver, changeDirection, togglePause, pauseGame]);

  return {
    // State
    snake: gameState.snake,
    food: gameState.food,
    direction: gameState.direction,
    score: gameState.score,
    highScore: gameState.highScore,
    gameOver: gameState.gameOver,
    isPaused: gameState.isPaused,
    gridSize: GRID_SIZE,

    // Actions
    startGame,
    pauseGame,
    resumeGame,
    togglePause,
    newGame,
    changeDirection,
  };
}
