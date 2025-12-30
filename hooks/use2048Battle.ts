'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

// Types matching the server
export interface PlayerInfo {
  id: string;
  nickname: string;
  isReady: boolean;
}

export interface OpponentState {
  id: string;
  nickname: string;
  score: number;
  maxTile: number;
  moves: number;
  isFinished: boolean;
  reachedTarget: boolean;
}

export interface GameSettings {
  timeLimit: number;
  targetTile: number;
}

export interface GameResult {
  id: string;
  nickname: string;
  score: number;
  maxTile: number;
}

export type GameStatus = 'disconnected' | 'connecting' | 'waiting' | 'countdown' | 'playing' | 'finished';

interface Use2048BattleOptions {
  onGameStart?: (seed: number, settings: GameSettings) => void;
  onOpponentUpdate?: (state: OpponentState) => void;
  onOpponentReachedTarget?: (id: string, score: number) => void;
  onOpponentGameOver?: (id: string, score: number) => void;
  onTimeUpdate?: (remaining: number) => void;
  onGameEnd?: (winnerId: string, winnerNickname: string, reason: string, results: GameResult[]) => void;
  onError?: (message: string) => void;
}

const BATTLE_WORKER_URL = process.env.NEXT_PUBLIC_BATTLE_WORKER_URL || 'https://tetris-battle.info-adalabtech.workers.dev';

export function use2048Battle(options: Use2048BattleOptions = {}) {
  const [gameStatus, setGameStatus] = useState<GameStatus>('disconnected');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [opponent, setOpponent] = useState<OpponentState | null>(null);
  const [settings, setSettings] = useState<GameSettings>({
    timeLimit: 180,
    targetTile: 2048,
  });
  const [timeRemaining, setTimeRemaining] = useState<number>(180);
  const [winner, setWinner] = useState<{ id: string; nickname: string } | null>(null);
  const [results, setResults] = useState<GameResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);

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
          setTimeRemaining(data.timeLimit);
          setOpponent(prev => prev ? {
            ...prev,
            score: 0,
            maxTile: 0,
            moves: 0,
            isFinished: false,
            reachedTarget: false,
          } : null);
          const gameSettings: GameSettings = {
            timeLimit: data.timeLimit,
            targetTile: data.targetTile,
          };
          setSettings(gameSettings);
          optionsRef.current.onGameStart?.(data.seed, gameSettings);
          break;

        case 'time_update':
          setTimeRemaining(data.remaining);
          optionsRef.current.onTimeUpdate?.(data.remaining);
          break;

        case 'opponent_update':
          setOpponent(prev => ({
            id: data.id,
            nickname: prev?.nickname || players.find(p => p.id === data.id)?.nickname || 'Opponent',
            score: data.score,
            maxTile: data.maxTile,
            moves: data.moves,
            isFinished: prev?.isFinished || false,
            reachedTarget: prev?.reachedTarget || false,
          }));
          optionsRef.current.onOpponentUpdate?.({
            id: data.id,
            nickname: players.find(p => p.id === data.id)?.nickname || 'Opponent',
            score: data.score,
            maxTile: data.maxTile,
            moves: data.moves,
            isFinished: false,
            reachedTarget: false,
          });
          break;

        case 'opponent_reached_target':
          setOpponent(prev => prev ? { ...prev, reachedTarget: true, score: data.score } : null);
          optionsRef.current.onOpponentReachedTarget?.(data.id, data.score);
          break;

        case 'opponent_game_over':
          setOpponent(prev => prev ? { ...prev, isFinished: true, score: data.score } : null);
          optionsRef.current.onOpponentGameOver?.(data.id, data.score);
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
  }, [players]);

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
      const response = await fetch(`${BATTLE_WORKER_URL}/api/battle/2048/create`, {
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

      const response = await fetch(`${BATTLE_WORKER_URL}/api/battle/2048/join`, {
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

    try {
      const response = await fetch(`${BATTLE_WORKER_URL}/api/battle/2048/queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, action: 'join' }),
      });

      const data = await response.json();

      if (data.matched && data.wsUrl) {
        await connectToRoom(data.wsUrl, nickname, false);
      } else if (data.queued) {
        const pollForMatch = async () => {
          const pollResponse = await fetch(`${BATTLE_WORKER_URL}/api/battle/2048/queue`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nickname, action: 'poll', queueId: data.queueId }),
          });

          const pollData = await pollResponse.json();

          if (pollData.matched && pollData.wsUrl) {
            await connectToRoom(pollData.wsUrl, nickname, false);
          } else if (pollData.queued) {
            reconnectTimeoutRef.current = setTimeout(pollForMatch, 2000);
          } else {
            setError('Matchmaking failed');
            setGameStatus('disconnected');
          }
        };

        reconnectTimeoutRef.current = setTimeout(pollForMatch, 2000);
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

  // Send move update
  const sendMoveUpdate = useCallback((score: number, maxTile: number, moves: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'move_update',
        score,
        maxTile,
        moves,
      }));
    }
  }, []);

  // Send reached target event
  const sendReachedTarget = useCallback((score: number, maxTile: number, moves: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'reached_target',
        score,
        maxTile,
        moves,
      }));
    }
  }, []);

  // Send game over event
  const sendGameOver = useCallback((score: number, maxTile: number, moves: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'game_over',
        score,
        maxTile,
        moves,
      }));
    }
  }, []);

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

    // Actions
    createRoom,
    joinRoom,
    quickMatch,
    setReady,
    sendMoveUpdate,
    sendReachedTarget,
    sendGameOver,
    leave,
  };
}
