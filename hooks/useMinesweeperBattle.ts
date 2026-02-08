'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { getDeviceId } from './useDeviceId';
import { Difficulty } from './useMinesweeperGame';

export interface PlayerInfo {
  id: string;
  nickname: string;
  isReady: boolean;
}

export interface OpponentProgress {
  revealed: number;
  flagged: number;
  percentage: number;
}

export interface GameResult {
  id: string;
  nickname: string;
  time: number | null; // null means lost
  status: 'won' | 'lost' | 'timeout';
}

export type GameStatus = 'disconnected' | 'connecting' | 'waiting' | 'countdown' | 'playing' | 'finished';

interface UseMinesweeperBattleOptions {
  onGameStart?: (seed: number, difficulty: Difficulty) => void;
  onOpponentProgress?: (progress: OpponentProgress) => void;
  onOpponentLost?: () => void;
  onOpponentFinished?: (time: number) => void;
  onTimeUpdate?: (remaining: number) => void;
  onGameEnd?: (winnerId: string, winnerNickname: string, results: GameResult[]) => void;
  onError?: (message: string) => void;
}

const BATTLE_WORKER_URL = process.env.NEXT_PUBLIC_BATTLE_WORKER_URL || 'https://tetris-battle.info-adalabtech.workers.dev';

export function useMinesweeperBattle(options: UseMinesweeperBattleOptions = {}) {
  const [gameStatus, setGameStatus] = useState<GameStatus>('disconnected');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [timeRemaining, setTimeRemaining] = useState<number>(300); // 5 minutes
  const [winner, setWinner] = useState<{ id: string; nickname: string } | null>(null);
  const [results, setResults] = useState<GameResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [gameSeed, setGameSeed] = useState<number | null>(null);
  const [opponentProgress, setOpponentProgress] = useState<OpponentProgress>({
    revealed: 0,
    flagged: 0,
    percentage: 0,
  });

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
          if (data.settings?.difficulty) {
            setDifficulty(data.settings.difficulty);
          }
          if (data.players.length > 0) {
            setMyPlayerId(data.players[data.players.length - 1].id);
          }
          setGameStatus('waiting');
          break;

        case 'player_joined': {
          const p = data.player || data;
          setPlayers(prev => [...prev, { id: p.id, nickname: p.nickname, isReady: p.isReady || false }]);
          break;
        }

        case 'player_left':
          setPlayers(prev => prev.filter(p => p.id !== (data.playerId || data.id)));
          break;

        case 'player_ready':
          setPlayers(prev =>
            prev.map(p => (p.id === (data.playerId || data.id) ? { ...p, isReady: data.isReady } : p))
          );
          break;

        case 'countdown':
          setCountdown(data.seconds);
          setGameStatus('countdown');
          break;

        case 'game_start': {
          const settings = data.settings || {};
          setCountdown(null);
          setGameStatus('playing');
          setGameSeed(data.seed);
          setDifficulty(settings.difficulty || data.difficulty || 'intermediate');
          setTimeRemaining(settings.timeLimit || data.timeLimit || 300);
          setOpponentProgress({ revealed: 0, flagged: 0, percentage: 0 });
          optionsRef.current.onGameStart?.(data.seed, settings.difficulty || data.difficulty || 'intermediate');
          break;
        }

        case 'time_update':
          setTimeRemaining(data.remaining);
          optionsRef.current.onTimeUpdate?.(data.remaining);
          break;

        case 'opponent_progress': {
          const progress: OpponentProgress = {
            revealed: data.revealed,
            flagged: data.flagged,
            percentage: data.percentage || 0,
          };
          setOpponentProgress(progress);
          optionsRef.current.onOpponentProgress?.(progress);
          break;
        }

        case 'opponent_lost':
          optionsRef.current.onOpponentLost?.();
          break;

        case 'opponent_finished':
          optionsRef.current.onOpponentFinished?.(data.time);
          break;

        case 'game_end':
          setGameStatus('finished');
          setWinner({ id: data.winner, nickname: data.winnerNickname });
          setResults(data.results || []);
          optionsRef.current.onGameEnd?.(data.winner, data.winnerNickname, data.results || []);
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
  }, []);

  const connectToRoom = useCallback(async (wsUrl: string, nickname: string, isCreate: boolean, createDifficulty?: Difficulty) => {
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
            difficulty: createDifficulty || 'intermediate',
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
        setError('接続エラーが発生しました');
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
      setError('接続に失敗しました');
      setGameStatus('disconnected');
    }
  }, [cleanup, handleMessage, roomCode]);

  // Create a new room
  const createRoom = useCallback(async (nickname: string, createDifficulty?: Difficulty) => {
    try {
      const response = await fetch(`${BATTLE_WORKER_URL}/api/battle/minesweeper/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, difficulty: createDifficulty }),
      });

      const data = await response.json();

      if (data.success && data.wsUrl) {
        await connectToRoom(data.wsUrl, nickname, true, createDifficulty);
      } else {
        setError(data.error || 'ルーム作成に失敗しました');
      }
    } catch (e) {
      console.error('Create room error:', e);
      setError('ルーム作成に失敗しました');
    }
  }, [connectToRoom]);

  // Join an existing room
  const joinRoom = useCallback(async (code: string, nickname: string) => {
    try {
      setRoomCode(code.toUpperCase());

      const response = await fetch(`${BATTLE_WORKER_URL}/api/battle/minesweeper/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode: code }),
      });

      const data = await response.json();

      if (data.success && data.wsUrl) {
        await connectToRoom(data.wsUrl, nickname, false);
      } else {
        setError(data.error || 'ルーム参加に失敗しました');
      }
    } catch (e) {
      console.error('Join room error:', e);
      setError('ルーム参加に失敗しました');
    }
  }, [connectToRoom]);

  // Quick match
  const quickMatch = useCallback(async (nickname: string, matchDifficulty?: Difficulty) => {
    setGameStatus('connecting');
    setError(null);
    const playerId = getDeviceId();

    try {
      const response = await fetch(`${BATTLE_WORKER_URL}/api/battle/minesweeper/queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, playerId, difficulty: matchDifficulty }),
      });

      const data = await response.json();

      if (data.success && data.matched) {
        await connectToRoom(data.wsUrl, nickname, false);
      } else if (data.success && !data.matched) {
        // Poll for match
        const pollForMatch = async () => {
          try {
            const pollResponse = await fetch(`${BATTLE_WORKER_URL}/api/battle/minesweeper/queue`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ nickname, playerId, difficulty: matchDifficulty }),
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
        setError(data.error || 'マッチメイキングに失敗しました');
        setGameStatus('disconnected');
      }
    } catch (e) {
      console.error('Quick match error:', e);
      setError('マッチメイキングに失敗しました');
      setGameStatus('disconnected');
    }
  }, [connectToRoom]);

  // Set ready status
  const setReady = useCallback((ready: boolean) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: ready ? 'ready' : 'unready' }));
    }
  }, []);

  // Send progress update
  const sendProgress = useCallback((revealed: number, flagged: number, totalNonMines: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'progress',
        revealed,
        flagged,
        percentage: totalNonMines > 0 ? Math.round((revealed / totalNonMines) * 100) : 0,
      }));
    }
  }, []);

  // Send game finished (cleared the board)
  const sendFinished = useCallback((time: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'finished',
        time,
      }));
    }
  }, []);

  // Send game lost (hit a mine)
  const sendLost = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'lost',
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
    setWinner(null);
    setResults([]);
    setGameSeed(null);
    setOpponentProgress({ revealed: 0, flagged: 0, percentage: 0 });
  }, [cleanup]);

  // Cancel matchmaking
  const cancelMatchmaking = useCallback(() => {
    cleanup();
    setGameStatus('disconnected');
    setError(null);
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
    difficulty,
    timeRemaining,
    winner,
    results,
    error,
    myPlayerId,
    gameSeed,
    opponentProgress,

    // Actions
    createRoom,
    joinRoom,
    quickMatch,
    setReady,
    sendProgress,
    sendFinished,
    sendLost,
    leave,
    cancelMatchmaking,
  };
}
