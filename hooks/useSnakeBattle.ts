'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { getDeviceId } from './useDeviceId';

// Types matching the server
export interface Position {
  x: number;
  y: number;
}

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface PlayerInfo {
  id: string;
  nickname: string;
  isReady: boolean;
}

// 同一フィールド上のプレイヤー状態
export interface BattlePlayerState {
  id: string;
  nickname: string;
  snake: Position[];
  score: number;
  isAlive: boolean;
  color: string;
}

// 旧: 相手状態（後方互換性のため残す）
export interface OpponentState {
  id: string;
  nickname: string;
  snake: Position[];
  direction: Direction;
  score: number;
  isAlive: boolean;
}

export interface GameSettings {
  gridSize: number;
  timeLimit: number;
}

export interface GameResult {
  id: string;
  nickname: string;
  score: number;
  length: number;
}

// プレイヤー死亡情報
export interface PlayerDiedInfo {
  id: string;
  nickname: string;
  killedBy: 'wall' | 'self' | 'opponent' | 'opponent_body';
}

export type GameStatus = 'disconnected' | 'connecting' | 'waiting' | 'countdown' | 'playing' | 'finished';

interface UseSnakeBattleOptions {
  onGameStart?: (seed: number, settings: GameSettings) => void;
  onGameStateUpdate?: (players: BattlePlayerState[], food: Position) => void;
  onPlayerDied?: (info: PlayerDiedInfo) => void;
  onOpponentUpdate?: (state: OpponentState) => void;
  onReceiveObstacle?: (position: Position, senderId: string) => void;
  onOpponentGameOver?: (id: string, score: number) => void;
  onTimeUpdate?: (remaining: number) => void;
  onGameEnd?: (winnerId: string, winnerNickname: string, reason: string, results: GameResult[]) => void;
  onError?: (message: string) => void;
}

const BATTLE_WORKER_URL = process.env.NEXT_PUBLIC_BATTLE_WORKER_URL || 'https://tetris-battle.info-adalabtech.workers.dev';

export function useSnakeBattle(options: UseSnakeBattleOptions = {}) {
  const [gameStatus, setGameStatus] = useState<GameStatus>('disconnected');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [opponent, setOpponent] = useState<OpponentState | null>(null);
  const [settings, setSettings] = useState<GameSettings>({
    gridSize: 30, // 30x30に拡大
    timeLimit: 180,
  });
  const [timeRemaining, setTimeRemaining] = useState<number>(180);
  const [winner, setWinner] = useState<{ id: string; nickname: string } | null>(null);
  const [results, setResults] = useState<GameResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [pendingObstacles, setPendingObstacles] = useState<Position[]>([]);

  // 同一フィールドバトル用の新しい状態
  const [battlePlayers, setBattlePlayers] = useState<BattlePlayerState[]>([]);
  const [food, setFood] = useState<Position | null>(null);
  const [lastDeath, setLastDeath] = useState<PlayerDiedInfo | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const cleanup = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  }, []);

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'room_joined':
          setRoomId(data.roomId);
          setRoomCode(data.roomCode || null);
          setPlayers(data.players);
          if (data.settings) {
            setSettings(data.settings);
            setTimeRemaining(data.settings.timeLimit);
          }
          if (data.players.length > 0) {
            setMyPlayerId(data.players[data.players.length - 1].id);
          }
          setGameStatus('waiting');
          break;

        case 'player_joined':
          setPlayers(prev => [...prev, { id: data.id, nickname: data.nickname, isReady: false }]);
          break;

        case 'player_left':
          setPlayers(prev => prev.filter(p => p.id !== data.id));
          setOpponent(null);
          break;

        case 'player_ready':
          setPlayers(prev =>
            prev.map(p => (p.id === data.id ? { ...p, isReady: data.isReady } : p))
          );
          break;

        case 'countdown':
          setCountdown(data.seconds);
          setGameStatus('countdown');
          break;

        case 'game_start':
          setCountdown(null);
          setGameStatus('playing');
          setPendingObstacles([]);
          setLastDeath(null);
          // 同一フィールドバトル: 初期状態を設定
          if (data.players && data.food) {
            setBattlePlayers(data.players.map((p: { id: string; nickname: string; snake: Position[]; score: number; isAlive: boolean; color: string }) => ({
              id: p.id,
              nickname: p.nickname,
              snake: p.snake,
              score: p.score,
              isAlive: p.isAlive,
              color: p.color,
            })));
            setFood(data.food);
          }
          setOpponent(prev => prev ? {
            ...prev,
            score: 0,
            isAlive: true,
            snake: [],
          } : null);
          const gameSettings: GameSettings = {
            gridSize: data.gridSize || 30,
            timeLimit: settings.timeLimit,
          };
          setSettings(gameSettings);
          setTimeRemaining(settings.timeLimit);
          optionsRef.current.onGameStart?.(data.seed, gameSettings);
          break;

        case 'time_update':
          setTimeRemaining(data.remaining);
          optionsRef.current.onTimeUpdate?.(data.remaining);
          break;

        case 'opponent_update':
          setOpponent({
            id: data.id,
            nickname: players.find(p => p.id === data.id)?.nickname || 'Opponent',
            snake: data.snake,
            direction: data.direction,
            score: data.score,
            isAlive: true,
          });
          optionsRef.current.onOpponentUpdate?.({
            id: data.id,
            nickname: players.find(p => p.id === data.id)?.nickname || 'Opponent',
            snake: data.snake,
            direction: data.direction,
            score: data.score,
            isAlive: true,
          });
          break;

        case 'receive_obstacle':
          setPendingObstacles(prev => [...prev, data.position]);
          optionsRef.current.onReceiveObstacle?.(data.position, data.senderId);
          break;

        case 'opponent_game_over':
          setOpponent(prev => prev ? { ...prev, isAlive: false, score: data.score } : null);
          optionsRef.current.onOpponentGameOver?.(data.id, data.score);
          break;

        // 同一フィールドバトル: サーバーからのゲーム状態更新
        case 'game_state':
          setBattlePlayers(data.players.map((p: { id: string; nickname: string; snake: Position[]; score: number; isAlive: boolean; color: string }) => ({
            id: p.id,
            nickname: p.nickname,
            snake: p.snake,
            score: p.score,
            isAlive: p.isAlive,
            color: p.color,
          })));
          setFood(data.food);
          optionsRef.current.onGameStateUpdate?.(data.players, data.food);
          break;

        // プレイヤー死亡通知
        case 'player_died':
          setLastDeath({
            id: data.id,
            nickname: data.nickname,
            killedBy: data.killedBy,
          });
          // battlePlayersの該当プレイヤーのisAliveをfalseに
          setBattlePlayers(prev => prev.map(p =>
            p.id === data.id ? { ...p, isAlive: false } : p
          ));
          optionsRef.current.onPlayerDied?.({
            id: data.id,
            nickname: data.nickname,
            killedBy: data.killedBy,
          });
          break;

        case 'game_end':
          setGameStatus('finished');
          setWinner({ id: data.winner, nickname: data.winnerNickname });
          setResults(data.results);
          optionsRef.current.onGameEnd?.(data.winner, data.winnerNickname, data.reason, data.results);
          break;

        case 'error':
          setError(data.message);
          optionsRef.current.onError?.(data.message);
          break;

        case 'pong':
          break;
      }
    } catch (e) {
      console.error('Failed to parse message:', e);
    }
  }, [players, settings.timeLimit]);

  const connectToRoom = useCallback(async (wsUrl: string, nickname: string, isCreate: boolean, createSettings?: Partial<GameSettings>) => {
    cleanup();
    setGameStatus('connecting');
    setError(null);

    try {
      const fullUrl = `${BATTLE_WORKER_URL}${wsUrl}`;
      const ws = new WebSocket(fullUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (isCreate) {
          ws.send(JSON.stringify({
            type: 'create_room',
            nickname,
            settings: createSettings,
          }));
        } else {
          ws.send(JSON.stringify({
            type: 'join',
            nickname,
            roomCode: roomCode,
          }));
        }

        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000);
      };

      ws.onmessage = handleMessage;

      ws.onerror = () => {
        setError('Connection error');
        setGameStatus('disconnected');
      };

      ws.onclose = () => {
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
        }
        setGameStatus('disconnected');
      };
    } catch (e) {
      console.error('WebSocket connection error:', e);
      setError('Failed to connect');
      setGameStatus('disconnected');
    }
  }, [cleanup, handleMessage, roomCode]);

  // Create a new room
  const createRoom = useCallback(async (nickname: string, createSettings?: Partial<GameSettings>) => {
    try {
      const response = await fetch(`${BATTLE_WORKER_URL}/api/battle/snake/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname }),
      });

      const data = await response.json();

      if (data.success && data.wsUrl) {
        await connectToRoom(data.wsUrl, nickname, true, createSettings);
      } else {
        setError(data.error || 'Failed to create room');
      }
    } catch (e) {
      console.error('Create room error:', e);
      setError('Failed to create room');
    }
  }, [connectToRoom]);

  // Join an existing room
  const joinRoom = useCallback(async (code: string, nickname: string) => {
    try {
      setRoomCode(code.toUpperCase());

      const response = await fetch(`${BATTLE_WORKER_URL}/api/battle/snake/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode: code }),
      });

      const data = await response.json();

      if (data.success && data.wsUrl) {
        await connectToRoom(data.wsUrl, nickname, false);
      } else {
        setError(data.error || 'Failed to join room');
      }
    } catch (e) {
      console.error('Join room error:', e);
      setError('Failed to join room');
    }
  }, [connectToRoom]);

  // Quick match
  const quickMatch = useCallback(async (nickname: string) => {
    setGameStatus('connecting');
    setError(null);
    const playerId = getDeviceId();

    try {
      const response = await fetch(`${BATTLE_WORKER_URL}/api/battle/snake/queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, playerId }),
      });

      const data = await response.json();

      if (data.success && data.matched) {
        await connectToRoom(data.wsUrl, nickname, false);
      } else if (data.success && !data.matched) {
        // ポーリング開始
        const pollForMatch = async () => {
          try {
            const pollResponse = await fetch(`${BATTLE_WORKER_URL}/api/battle/snake/queue`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ nickname, playerId }),
            });

            const pollData = await pollResponse.json();

            if (pollData.success && pollData.matched) {
              await connectToRoom(pollData.wsUrl, nickname, false);
            } else {
              reconnectTimeoutRef.current = setTimeout(pollForMatch, 1000);
            }
          } catch {
            reconnectTimeoutRef.current = setTimeout(pollForMatch, 1000);
          }
        };

        reconnectTimeoutRef.current = setTimeout(pollForMatch, 500);
      } else {
        setError(data.error || 'Matchmaking failed');
        setGameStatus('disconnected');
      }
    } catch (e) {
      console.error('Quick match error:', e);
      setError('Matchmaking failed');
      setGameStatus('disconnected');
    }
  }, [connectToRoom]);

  // Set ready status
  const setReady = useCallback((ready: boolean) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: ready ? 'ready' : 'unready' }));
    }
  }, []);

  // Send state update (旧: 後方互換性のため残す)
  const sendStateUpdate = useCallback((snake: Position[], direction: Direction, score: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'state_update',
        snake,
        direction,
        score,
      }));
    }
  }, []);

  // Send food eaten event (旧: 後方互換性のため残す)
  const sendFoodEaten = useCallback((newFood: Position, score: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'food_eaten',
        newFood,
        score,
      }));
    }
  }, []);

  // Send game over event (旧: 後方互換性のため残す)
  const sendGameOver = useCallback((score: number, length: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'game_over',
        score,
        length,
      }));
    }
  }, []);

  // 同一フィールドバトル: 方向変更のみ送信
  const sendDirectionChange = useCallback((direction: Direction) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'direction_change',
        direction,
      }));
    }
  }, []);

  // Consume pending obstacles
  const consumeObstacles = useCallback(() => {
    const obstacles = [...pendingObstacles];
    setPendingObstacles([]);
    return obstacles;
  }, [pendingObstacles]);

  // Leave room
  const leave = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'leave' }));
    }
    cleanup();
    setGameStatus('disconnected');
    setRoomId(null);
    setRoomCode(null);
    setPlayers([]);
    setOpponent(null);
    setWinner(null);
    setResults([]);
    setPendingObstacles([]);
  }, [cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    // State
    gameStatus,
    roomId,
    roomCode,
    players,
    countdown,
    opponent,
    settings,
    timeRemaining,
    winner,
    results,
    error,
    myPlayerId,
    pendingObstacles,

    // 同一フィールドバトル用
    battlePlayers,
    food,
    lastDeath,

    // Actions
    createRoom,
    joinRoom,
    quickMatch,
    setReady,
    sendStateUpdate,
    sendFoodEaten,
    sendGameOver,
    consumeObstacles,
    leave,

    // 同一フィールドバトル用
    sendDirectionChange,
  };
}
