import { useState, useCallback, useRef, useEffect } from 'react';
import { getDeviceId } from './useDeviceId';

// Types matching the server
export interface PlayerInfo {
  id: string;
  nickname: string;
  isReady: boolean;
}

export interface OpponentState {
  id: string;
  nickname: string;
  field: number[][];
  score: number;
  lines: number;
  level: number;
}

export type GameStatus = 'disconnected' | 'connecting' | 'waiting' | 'countdown' | 'playing' | 'finished';

export type AttackType =
  | 'single'
  | 'double'
  | 'triple'
  | 'tetris'
  | 'tspinSingle'
  | 'tspinDouble'
  | 'tspinTriple'
  | 'perfectClear';

interface UseTetrisBattleOptions {
  onGameStart?: (seed: number) => void;
  onReceiveGarbage?: (lines: number) => void;
  onOpponentUpdate?: (state: OpponentState) => void;
  onOpponentAttack?: (lines: number, attackType: AttackType) => void;
  onOpponentGameOver?: () => void;
  onGameEnd?: (winnerId: string, winnerNickname: string) => void;
  onError?: (message: string) => void;
}

// Worker URL - will be configured based on environment
const BATTLE_WORKER_URL = process.env.NEXT_PUBLIC_BATTLE_WORKER_URL || 'https://tetris-battle.info-adalabtech.workers.dev';

export function useTetrisBattle(options: UseTetrisBattleOptions = {}) {
  const [gameStatus, setGameStatus] = useState<GameStatus>('disconnected');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [opponent, setOpponent] = useState<OpponentState | null>(null);
  const [pendingGarbage, setPendingGarbage] = useState(0);
  const [winner, setWinner] = useState<{ id: string; nickname: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const optionsRef = useRef(options);
  const gameStatusRef = useRef(gameStatus);

  // Keep refs updated
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    gameStatusRef.current = gameStatus;
  }, [gameStatus]);

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
          setGameStatus('waiting');
          break;

        case 'player_joined':
          setPlayers(prev => [...prev, { id: data.id, nickname: data.nickname, isReady: false }]);
          break;

        case 'player_left':
          setPlayers(prev => prev.filter(p => p.id !== data.id));
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
          setPendingGarbage(0);
          optionsRef.current.onGameStart?.(data.seed);
          break;

        case 'opponent_update':
          setOpponent({
            id: data.id,
            nickname: players.find(p => p.id === data.id)?.nickname || 'Opponent',
            field: data.field,
            score: data.score,
            lines: data.lines,
            level: data.level,
          });
          optionsRef.current.onOpponentUpdate?.(data);
          break;

        case 'receive_garbage':
          setPendingGarbage(prev => prev + data.lines);
          optionsRef.current.onReceiveGarbage?.(data.lines);
          break;

        case 'opponent_attacked':
          optionsRef.current.onOpponentAttack?.(data.lines, data.attackType);
          break;

        case 'opponent_game_over':
          optionsRef.current.onOpponentGameOver?.();
          break;

        case 'game_end':
          setGameStatus('finished');
          setWinner({ id: data.winner, nickname: data.winnerNickname });
          optionsRef.current.onGameEnd?.(data.winner, data.winnerNickname);
          break;

        case 'error':
          setError(data.message);
          optionsRef.current.onError?.(data.message);
          break;

        case 'pong':
          // Heartbeat response received
          break;
      }
    } catch (e) {
      console.error('Failed to parse message:', e);
    }
  }, [players]);

  const connect = useCallback((wsUrl: string, nickname: string, action: 'create' | 'join', roomCodeToJoin?: string) => {
    cleanup();
    setGameStatus('connecting');
    setError(null);

    const fullUrl = `${BATTLE_WORKER_URL}${wsUrl}`;
    const ws = new WebSocket(fullUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      // Send join/create message
      if (action === 'create') {
        ws.send(JSON.stringify({ type: 'create_room', nickname }));
      } else {
        ws.send(JSON.stringify({ type: 'join', nickname, roomCode: roomCodeToJoin }));
      }

      // Start ping interval
      pingIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000);
    };

    ws.onmessage = handleMessage;

    ws.onclose = () => {
      setGameStatus('disconnected');
      cleanup();
    };

    ws.onerror = () => {
      setError('Connection failed');
      setGameStatus('disconnected');
    };
  }, [cleanup, handleMessage]);

  // Create a private room
  const createRoom = useCallback(async (nickname: string) => {
    try {
      const response = await fetch(`${BATTLE_WORKER_URL}/api/battle/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname }),
      });

      const data = await response.json();
      if (data.success) {
        connect(data.wsUrl, nickname, 'create');
      } else {
        setError(data.error || 'Failed to create room');
      }
    } catch (e) {
      setError('Failed to create room');
    }
  }, [connect]);

  // Join a room by code
  const joinRoom = useCallback(async (roomCodeInput: string, nickname: string) => {
    try {
      const response = await fetch(`${BATTLE_WORKER_URL}/api/battle/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode: roomCodeInput, nickname }),
      });

      const data = await response.json();
      if (data.success) {
        connect(data.wsUrl, nickname, 'join', roomCodeInput);
      } else {
        setError(data.error || 'Failed to join room');
      }
    } catch (e) {
      setError('Failed to join room');
    }
  }, [connect]);

  // Quick match (random matchmaking)
  const quickMatch = useCallback(async (nickname: string) => {
    setGameStatus('connecting');
    setError(null);

    try {
      const playerId = getDeviceId();
      const response = await fetch(`${BATTLE_WORKER_URL}/api/battle/queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, playerId }),
      });

      const data = await response.json();
      if (data.success) {
        if (data.matched) {
          // Matched! Connect to room
          connect(data.wsUrl, nickname, 'join');
        } else {
          // Still waiting, poll for match
          setGameStatus('waiting');
          pollForMatch(nickname, playerId);
        }
      } else {
        setError(data.error || 'Matchmaking failed');
        setGameStatus('disconnected');
      }
    } catch (e) {
      setError('Matchmaking failed');
      setGameStatus('disconnected');
    }
  }, [connect]);

  // Poll for matchmaking result (1秒間隔でポーリング)
  const pollForMatch = useCallback((nickname: string, playerId: string) => {
    const poll = async () => {
      // Use ref to get latest gameStatus (avoids stale closure)
      if (gameStatusRef.current !== 'waiting') {
        return;
      }

      try {
        const response = await fetch(`${BATTLE_WORKER_URL}/api/battle/queue`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nickname, playerId }),
        });

        const data = await response.json();
        if (data.success && data.matched) {
          connect(data.wsUrl, nickname, 'join');
        } else if (gameStatusRef.current === 'waiting') {
          reconnectTimeoutRef.current = setTimeout(poll, 1000);
        }
      } catch (e) {
        if (gameStatusRef.current === 'waiting') {
          reconnectTimeoutRef.current = setTimeout(poll, 1000);
        }
      }
    };

    // 最初のポーリングを即座に開始
    reconnectTimeoutRef.current = setTimeout(poll, 500);
  }, [connect]);

  // Send ready status
  const setReady = useCallback((ready: boolean) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: ready ? 'ready' : 'unready' }));
    }
  }, []);

  // Send field update to opponent
  const sendFieldUpdate = useCallback((field: number[][], score: number, lines: number, level: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && gameStatus === 'playing') {
      wsRef.current.send(JSON.stringify({
        type: 'field_update',
        field,
        score,
        lines,
        level,
      }));
    }
  }, [gameStatus]);

  // Send attack to opponent
  const sendAttack = useCallback((attackType: AttackType, combo: number, b2b: boolean) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && gameStatus === 'playing') {
      wsRef.current.send(JSON.stringify({
        type: 'attack',
        attackType,
        combo,
        b2b,
      }));
    }
  }, [gameStatus]);

  // Consume pending garbage (after adding to field)
  const consumeGarbage = useCallback((lines: number) => {
    setPendingGarbage(prev => Math.max(0, prev - lines));
  }, []);

  // Send game over
  const sendGameOver = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'game_over' }));
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
    setPendingGarbage(0);
    setWinner(null);
  }, [cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    // State
    gameStatus,
    roomId,
    roomCode,
    players,
    countdown,
    opponent,
    pendingGarbage,
    winner,
    error,

    // Actions
    createRoom,
    joinRoom,
    quickMatch,
    setReady,
    sendFieldUpdate,
    sendAttack,
    consumeGarbage,
    sendGameOver,
    leave,
  };
}
