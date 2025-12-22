// Tetris Battle Types

export interface PlayerState {
  id: string;
  nickname: string;
  field: number[][];
  score: number;
  lines: number;
  level: number;
  pendingGarbage: number;
  isReady: boolean;
  isAlive: boolean;
  lastUpdate: number;
}

export interface RoomState {
  roomId: string;
  roomCode?: string; // For private rooms (e.g., "ABC123")
  hostId?: string;
  players: Map<string, PlayerState>;
  gameStatus: 'waiting' | 'countdown' | 'playing' | 'finished';
  startTime?: number;
  seed?: number;
  winner?: string;
  createdAt: number;
}

// Attack table based on Puyo Puyo Tetris
export const ATTACK_TABLE = {
  single: 0,
  double: 1,
  triple: 2,
  tetris: 4,
  tspinSingle: 2,
  tspinDouble: 4,
  tspinTriple: 6,
  perfectClear: 10,
  b2bBonus: 1,
} as const;

export type AttackType = keyof typeof ATTACK_TABLE;

// Client -> Server messages
export type ClientMessage =
  | { type: 'join'; nickname: string; roomCode?: string }
  | { type: 'create_room'; nickname: string }
  | { type: 'ready' }
  | { type: 'unready' }
  | { type: 'field_update'; field: number[][]; score: number; lines: number; level: number }
  | { type: 'attack'; lines: number; attackType: AttackType; combo: number; b2b: boolean }
  | { type: 'receive_garbage_done'; lines: number }
  | { type: 'game_over' }
  | { type: 'leave' }
  | { type: 'ping' };

// Server -> Client messages
export type ServerMessage =
  | { type: 'room_joined'; roomId: string; roomCode?: string; players: { id: string; nickname: string; isReady: boolean }[] }
  | { type: 'player_joined'; id: string; nickname: string }
  | { type: 'player_left'; id: string; nickname: string }
  | { type: 'player_ready'; id: string; isReady: boolean }
  | { type: 'countdown'; seconds: number }
  | { type: 'game_start'; seed: number }
  | { type: 'opponent_update'; id: string; field: number[][]; score: number; lines: number; level: number }
  | { type: 'receive_garbage'; lines: number; senderId: string }
  | { type: 'opponent_attacked'; senderId: string; lines: number; attackType: AttackType }
  | { type: 'opponent_game_over'; id: string }
  | { type: 'game_end'; winner: string; winnerNickname: string }
  | { type: 'error'; message: string }
  | { type: 'pong' };

// Room configuration
export const ROOM_CONFIG = {
  maxPlayers: 2,
  countdownSeconds: 3,
  roomTimeout: 10 * 60 * 1000, // 10 minutes
  idleTimeout: 5 * 60 * 1000, // 5 minutes
} as const;
