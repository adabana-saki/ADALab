'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { getDeviceId } from './useDeviceId';
import type { Board, CellState } from '@/lib/othello-ai';

export interface PlayerInfo {
  id: string;
  nickname: string;
  isReady: boolean;
  color: CellState;
}

export interface GameResult {
  id: string;
  nickname: string;
  color: CellState;
  pieces: number;
  status: 'won' | 'lost' | 'draw';
}

export type GameStatus = 'disconnected' | 'connecting' | 'waiting' | 'countdown' | 'playing' | 'finished';

interface UseOthelloBattleOptions {
  onGameStart?: (board: Board, yourColor: CellState) => void;
  onMoveMade?: (row: number, col: number, player: CellState, flips: [number, number][], board: Board, currentPlayer: CellState, blackCount: number, whiteCount: number, validMoves: [number, number][]) => void;
  onPlayerPassed?: (player: CellState, currentPlayer: CellState, validMoves: [number, number][]) => void;
  onGameEnd?: (winnerId: string | null, winnerNickname: string | null, results: GameResult[]) => void;
  onTimeUpdate?: (remaining: number) => void;
  onError?: (message: string) => void;
}

const BATTLE_WORKER_URL = process.env.NEXT_PUBLIC_BATTLE_WORKER_URL || 'https://tetris-battle.info-adalabtech.workers.dev';

export function useOthelloBattle(options: UseOthelloBattleOptions = {}) {
  const [gameStatus, setGameStatus] = useState<GameStatus>('disconnected');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [myColor, setMyColor] = useState<CellState>(0);
  const [board, setBoard] = useState<Board | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<CellState>(1);
  const [blackCount, setBlackCount] = useState(2);
  const [whiteCount, setWhiteCount] = useState(2);
  const [validMoves, setValidMoves] = useState<[number, number][]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(600);
  const [winner, setWinner] = useState<{ id: string | null; nickname: string | null } | null>(null);
  const [results, setResults] = useState<GameResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [lastMove, setLastMove] = useState<{ row: number; col: number; player: CellState; flips: [number, number][] } | null>(null);

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
          setMyColor(data.yourColor);
          if (data.players.length > 0) {
            setMyPlayerId(data.players[data.players.length - 1].id);
          }
          setGameStatus('waiting');
          break;

        case 'player_joined': {
          const p = data.player || data;
          setPlayers(prev => [...prev, { id: p.id, nickname: p.nickname, isReady: p.isReady || false, color: p.color }]);
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

        case 'game_start':
          setCountdown(null);
          setGameStatus('playing');
          setBoard(data.board);
          setMyColor(data.yourColor);
          setCurrentPlayer(data.currentPlayer);
          setBlackCount(2);
          setWhiteCount(2);
          setLastMove(null);
          optionsRef.current.onGameStart?.(data.board, data.yourColor);
          break;

        case 'move_made':
          setBoard(data.board);
          setCurrentPlayer(data.currentPlayer);
          setBlackCount(data.blackCount);
          setWhiteCount(data.whiteCount);
          setValidMoves(data.validMoves || []);
          if (data.row >= 0 && data.col >= 0) {
            setLastMove({ row: data.row, col: data.col, player: data.player, flips: data.flips });
          }
          optionsRef.current.onMoveMade?.(data.row, data.col, data.player, data.flips, data.board, data.currentPlayer, data.blackCount, data.whiteCount, data.validMoves || []);
          break;

        case 'player_passed':
          setCurrentPlayer(data.currentPlayer);
          setValidMoves(data.validMoves || []);
          optionsRef.current.onPlayerPassed?.(data.player, data.currentPlayer, data.validMoves || []);
          break;

        case 'time_update':
          setTimeRemaining(data.remaining);
          optionsRef.current.onTimeUpdate?.(data.remaining);
          break;

        case 'game_end':
          setGameStatus('finished');
          setWinner({ id: data.winner, nickname: data.winnerNickname });
          setResults(data.results || []);
          setBlackCount(data.blackCount);
          setWhiteCount(data.whiteCount);
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

  const connectToRoom = useCallback(async (wsUrl: string, nickname: string, isCreate: boolean) => {
    cleanup();
    setGameStatus('connecting');
    setError(null);

    try {
      const fullUrl = `${BATTLE_WORKER_URL}${wsUrl}`;
      const ws = new WebSocket(fullUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (isCreate) {
          ws.send(JSON.stringify({ type: 'create_room', nickname }));
        } else {
          ws.send(JSON.stringify({ type: 'join', nickname, roomCode }));
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

  const createRoom = useCallback(async (nickname: string) => {
    try {
      const response = await fetch(`${BATTLE_WORKER_URL}/api/battle/othello/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname }),
      });

      const data = await response.json();

      if (data.success && data.wsUrl) {
        await connectToRoom(data.wsUrl, nickname, true);
      } else {
        setError(data.error || 'ルーム作成に失敗しました');
      }
    } catch (e) {
      console.error('Create room error:', e);
      setError('ルーム作成に失敗しました');
    }
  }, [connectToRoom]);

  const joinRoom = useCallback(async (code: string, nickname: string) => {
    try {
      setRoomCode(code.toUpperCase());

      const response = await fetch(`${BATTLE_WORKER_URL}/api/battle/othello/join`, {
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

  const quickMatch = useCallback(async (nickname: string) => {
    setGameStatus('connecting');
    setError(null);
    const playerId = getDeviceId();

    try {
      const response = await fetch(`${BATTLE_WORKER_URL}/api/battle/othello/queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, playerId }),
      });

      const data = await response.json();

      if (data.success && data.matched) {
        await connectToRoom(data.wsUrl, nickname, false);
      } else if (data.success && !data.matched) {
        const pollForMatch = async () => {
          try {
            const pollResponse = await fetch(`${BATTLE_WORKER_URL}/api/battle/othello/queue`, {
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
        setError(data.error || 'マッチメイキングに失敗しました');
        setGameStatus('disconnected');
      }
    } catch (e) {
      console.error('Quick match error:', e);
      setError('マッチメイキングに失敗しました');
      setGameStatus('disconnected');
    }
  }, [connectToRoom]);

  const setReady = useCallback((ready: boolean) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: ready ? 'ready' : 'unready' }));
    }
  }, []);

  const sendMove = useCallback((row: number, col: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'move', row, col }));
    }
  }, []);

  const rematch = useCallback(() => {
    setGameStatus('waiting');
    setWinner(null);
    setResults([]);
    setBoard(null);
    setValidMoves([]);
    setLastMove(null);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'unready' }));
    }
  }, []);

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
    setBoard(null);
    setValidMoves([]);
    setLastMove(null);
  }, [cleanup]);

  const cancelMatchmaking = useCallback(() => {
    cleanup();
    setGameStatus('disconnected');
    setError(null);
  }, [cleanup]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    gameStatus,
    roomId,
    roomCode,
    players,
    countdown,
    myColor,
    board,
    currentPlayer,
    blackCount,
    whiteCount,
    validMoves,
    timeRemaining,
    winner,
    results,
    error,
    myPlayerId,
    lastMove,

    createRoom,
    joinRoom,
    quickMatch,
    setReady,
    sendMove,
    rematch,
    leave,
    cancelMatchmaking,
  };
}
