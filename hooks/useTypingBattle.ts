'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { getDeviceId } from './useDeviceId';

// Streak attack types
export type TypingAttackType = 'blurWord' | 'scrambleWord' | 'addExtraWord' | 'speedUpTimer' | 'hideLetters';

// Types matching the server
export interface PlayerInfo {
  id: string;
  nickname: string;
  isReady: boolean;
}

export interface OpponentProgress {
  id: string;
  nickname: string;
  wordIndex: number;
  wpm: number;
  accuracy: number;
  isFinished: boolean;
  streak?: number;
}

export interface GameSettings {
  wordCount: number;
  language: 'en' | 'ja';
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface GameResult {
  id: string;
  nickname: string;
  wpm: number;
  accuracy: number;
  finishTime?: number;
  maxStreak?: number;
  attacksSent?: number;
}

export interface StreakAttack {
  type: TypingAttackType;
  duration?: number;
  senderId: string;
  senderStreak: number;
  receivedAt: number;
}

export type GameStatus = 'disconnected' | 'connecting' | 'waiting' | 'countdown' | 'playing' | 'finished';

interface UseTypingBattleOptions {
  onGameStart?: (seed: number, settings: GameSettings) => void;
  onOpponentProgress?: (progress: OpponentProgress) => void;
  onOpponentFinished?: (id: string, wpm: number, accuracy: number) => void;
  onGameEnd?: (winnerId: string, winnerNickname: string, results: GameResult[]) => void;
  onStreakAttack?: (attack: StreakAttack) => void;
  onStreakMilestone?: (playerId: string, streak: number) => void;
  onStreakBroken?: (playerId: string, previousStreak: number) => void;
  onError?: (message: string) => void;
}

const BATTLE_WORKER_URL = process.env.NEXT_PUBLIC_BATTLE_WORKER_URL || 'https://tetris-battle.info-adalabtech.workers.dev';

export function useTypingBattle(options: UseTypingBattleOptions = {}) {
  const [gameStatus, setGameStatus] = useState<GameStatus>('disconnected');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [opponent, setOpponent] = useState<OpponentProgress | null>(null);
  const [settings, setSettings] = useState<GameSettings>({
    wordCount: 20,
    language: 'en',
    difficulty: 'medium',
  });
  const [winner, setWinner] = useState<{ id: string; nickname: string } | null>(null);
  const [results, setResults] = useState<GameResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [activeAttacks, setActiveAttacks] = useState<StreakAttack[]>([]);
  const [myStreak, setMyStreak] = useState(0);

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
          }
          // First player in list that matches our ws is us
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
          setOpponent(prev => prev ? { ...prev, wordIndex: 0, wpm: 0, accuracy: 100, isFinished: false } : null);
          const gameSettings: GameSettings = {
            wordCount: data.wordCount,
            language: data.language,
            difficulty: data.difficulty,
          };
          setSettings(gameSettings);
          optionsRef.current.onGameStart?.(data.seed, gameSettings);
          break;

        case 'opponent_progress':
          setOpponent(prev => ({
            id: data.id,
            nickname: prev?.nickname || players.find(p => p.id === data.id)?.nickname || 'Opponent',
            wordIndex: data.wordIndex,
            wpm: data.wpm,
            accuracy: data.accuracy,
            isFinished: false,
            streak: data.streak,
          }));
          optionsRef.current.onOpponentProgress?.({
            id: data.id,
            nickname: players.find(p => p.id === data.id)?.nickname || 'Opponent',
            wordIndex: data.wordIndex,
            wpm: data.wpm,
            accuracy: data.accuracy,
            isFinished: false,
            streak: data.streak,
          });
          break;

        case 'opponent_finished':
          setOpponent(prev => prev ? { ...prev, isFinished: true, wpm: data.finalWpm, accuracy: data.finalAccuracy } : null);
          optionsRef.current.onOpponentFinished?.(data.id, data.finalWpm, data.finalAccuracy);
          break;

        case 'streak_attack': {
          const attack: StreakAttack = {
            type: data.attackType,
            duration: data.duration,
            senderId: data.senderId,
            senderStreak: data.senderStreak,
            receivedAt: Date.now(),
          };
          setActiveAttacks(prev => [...prev, attack]);
          optionsRef.current.onStreakAttack?.(attack);

          // Auto-remove timed attacks
          if (data.duration) {
            setTimeout(() => {
              setActiveAttacks(prev => prev.filter(a => a.receivedAt !== attack.receivedAt));
            }, data.duration);
          }
          break;
        }

        case 'streak_milestone':
          optionsRef.current.onStreakMilestone?.(data.playerId, data.streak);
          break;

        case 'streak_broken':
          optionsRef.current.onStreakBroken?.(data.playerId, data.previousStreak);
          break;

        case 'game_end':
          setGameStatus('finished');
          setWinner({ id: data.winner, nickname: data.winnerNickname });
          setResults(data.results);
          setActiveAttacks([]);
          setMyStreak(0);
          optionsRef.current.onGameEnd?.(data.winner, data.winnerNickname, data.results);
          break;

        case 'error':
          setError(data.message);
          optionsRef.current.onError?.(data.message);
          break;

        case 'pong':
          // Connection alive
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
        // Send join or create message
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

        // Start ping interval
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
      const response = await fetch(`${BATTLE_WORKER_URL}/api/battle/typing/create`, {
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

      const response = await fetch(`${BATTLE_WORKER_URL}/api/battle/typing/join`, {
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
      const response = await fetch(`${BATTLE_WORKER_URL}/api/battle/typing/queue`, {
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
            const pollResponse = await fetch(`${BATTLE_WORKER_URL}/api/battle/typing/queue`, {
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

  // Send word complete event
  const sendWordComplete = useCallback((wordIndex: number, correct: boolean, wpm: number, accuracy: number, correctChars: number, totalChars: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'word_complete',
        wordIndex,
        correct,
        wpm,
        accuracy,
        correctChars,
        totalChars,
      }));
    }
  }, []);

  // Send game finished event
  const sendGameFinished = useCallback((finalWpm: number, finalAccuracy: number, finishTime: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'game_finished',
        finalWpm,
        finalAccuracy,
        finishTime,
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
    winner,
    results,
    error,
    myPlayerId,
    activeAttacks,
    myStreak,

    // Actions
    createRoom,
    joinRoom,
    quickMatch,
    setReady,
    sendWordComplete,
    sendGameFinished,
    leave,
  };
}
