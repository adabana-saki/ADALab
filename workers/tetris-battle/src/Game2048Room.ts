import { DurableObject } from 'cloudflare:workers';

// 2048 Attack Types
export type Attack2048Type = 'lockTile' | 'shuffleTiles' | 'addBlocker' | 'freezeInput';

// Attack table based on tile merges
const ATTACK_TABLE_2048: Record<number, { type: Attack2048Type; description: string }> = {
  256: { type: 'lockTile', description: 'Lock a random tile for 5 seconds' },
  512: { type: 'shuffleTiles', description: 'Shuffle opponent tiles' },
  1024: { type: 'addBlocker', description: 'Add a blocker tile' },
  2048: { type: 'freezeInput', description: 'Freeze opponent input for 2 seconds' },
};

// 2048 Battle Types
export interface Game2048PlayerState {
  id: string;
  nickname: string;
  score: number;
  maxTile: number;
  moves: number;
  isReady: boolean;
  isFinished: boolean;
  finishTime?: number;
  reachedTarget: boolean;
  lastUpdate: number;
  // Attack-related state
  pendingAttacks: { type: Attack2048Type; data?: unknown }[];
  lockedTiles: { position: number; unlockTime: number }[];
  blockerTiles: number[];
  frozenUntil?: number;
}

export interface Game2048RoomState {
  roomId: string;
  roomCode?: string;
  hostId?: string;
  players: Map<string, Game2048PlayerState>;
  gameStatus: 'waiting' | 'countdown' | 'playing' | 'finished';
  startTime?: number;
  seed: number;
  timeLimit: number; // seconds
  targetTile: number; // 2048 by default
  winner?: string;
  createdAt: number;
}

// Client -> Server messages
export type Game2048ClientMessage =
  | { type: 'join'; nickname: string; roomCode?: string }
  | { type: 'create_room'; nickname: string; settings?: { timeLimit?: number; targetTile?: number } }
  | { type: 'ready' }
  | { type: 'unready' }
  | { type: 'move_update'; score: number; maxTile: number; moves: number }
  | { type: 'tile_merged'; mergedValue: number; score: number; maxTile: number; moves: number }
  | { type: 'reached_target'; score: number; maxTile: number; moves: number }
  | { type: 'game_over'; score: number; maxTile: number; moves: number }
  | { type: 'leave' }
  | { type: 'ping' };

// Server -> Client messages
export type Game2048ServerMessage =
  | { type: 'room_joined'; roomId: string; roomCode?: string; players: { id: string; nickname: string; isReady: boolean }[]; settings: { timeLimit: number; targetTile: number } }
  | { type: 'player_joined'; id: string; nickname: string }
  | { type: 'player_left'; id: string; nickname: string }
  | { type: 'player_ready'; id: string; isReady: boolean }
  | { type: 'countdown'; seconds: number }
  | { type: 'game_start'; seed: number; timeLimit: number; targetTile: number }
  | { type: 'time_update'; remaining: number }
  | { type: 'opponent_update'; id: string; score: number; maxTile: number; moves: number }
  | { type: 'opponent_reached_target'; id: string; score: number }
  | { type: 'opponent_game_over'; id: string; score: number }
  | { type: 'receive_attack'; attackType: Attack2048Type; data?: { position?: number; duration?: number } }
  | { type: 'opponent_attacked'; attackerId: string; attackType: Attack2048Type }
  | { type: 'game_end'; winner: string; winnerNickname: string; reason: 'reached_target' | 'time_up' | 'opponent_quit' | 'higher_score'; results: { id: string; nickname: string; score: number; maxTile: number }[] }
  | { type: 'error'; message: string }
  | { type: 'pong' };

const ROOM_CONFIG = {
  maxPlayers: 2,
  countdownSeconds: 3,
  defaultTimeLimit: 180, // 3 minutes
  defaultTargetTile: 2048,
};

interface Env {
  ALLOWED_ORIGINS: string;
}

interface WebSocketSession {
  ws: WebSocket;
  playerId: string;
  nickname: string;
}

export class Game2048Room extends DurableObject<Env> {
  private sessions: Map<WebSocket, WebSocketSession> = new Map();
  private roomState: Game2048RoomState;
  private countdownInterval?: ReturnType<typeof setInterval>;
  private gameTimer?: ReturnType<typeof setInterval>;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.roomState = {
      roomId: '',
      players: new Map(),
      gameStatus: 'waiting',
      seed: 0,
      timeLimit: ROOM_CONFIG.defaultTimeLimit,
      targetTile: ROOM_CONFIG.defaultTargetTile,
      createdAt: Date.now(),
    };
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Upgrade, Connection, Sec-WebSocket-Key, Sec-WebSocket-Version',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === '/init') {
      const roomCode = url.searchParams.get('roomCode');
      if (roomCode) {
        this.roomState.roomCode = roomCode;
        this.roomState.roomId = roomCode;
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (url.pathname === '/info') {
      return new Response(JSON.stringify({
        roomId: this.roomState.roomId,
        roomCode: this.roomState.roomCode,
        playerCount: this.roomState.players.size,
        gameStatus: this.roomState.gameStatus,
        players: Array.from(this.roomState.players.values()).map(p => ({
          id: p.id,
          nickname: p.nickname,
          isReady: p.isReady,
        })),
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const upgradeHeader = request.headers.get('Upgrade');
    if (upgradeHeader !== 'websocket') {
      return new Response('Expected WebSocket', { status: 426, headers: corsHeaders });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    this.ctx.acceptWebSocket(server);

    const playerId = crypto.randomUUID();
    this.sessions.set(server, { ws: server, playerId, nickname: '' });

    return new Response(null, {
      status: 101,
      webSocket: client,
      headers: corsHeaders,
    });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    if (typeof message !== 'string') return;

    const session = this.sessions.get(ws);
    if (!session) return;

    try {
      const data = JSON.parse(message) as Game2048ClientMessage;
      await this.handleMessage(ws, session, data);
    } catch (e) {
      console.error('WebSocket message error:', e);
      this.sendToSocket(ws, { type: 'error', message: 'Invalid message format' });
    }
  }

  async webSocketClose(ws: WebSocket): Promise<void> {
    await this.handleDisconnect(ws);
  }

  async webSocketError(ws: WebSocket): Promise<void> {
    await this.handleDisconnect(ws);
  }

  private async handleMessage(ws: WebSocket, session: WebSocketSession, data: Game2048ClientMessage): Promise<void> {
    switch (data.type) {
      case 'ping':
        this.sendToSocket(ws, { type: 'pong' });
        break;

      case 'create_room':
        await this.handleCreateRoom(ws, session, data.nickname, data.settings);
        break;

      case 'join':
        await this.handleJoin(ws, session, data.nickname, data.roomCode);
        break;

      case 'ready':
        await this.handleReady(ws, session, true);
        break;

      case 'unready':
        await this.handleReady(ws, session, false);
        break;

      case 'move_update':
        await this.handleMoveUpdate(session, data);
        break;

      case 'tile_merged':
        await this.handleTileMerged(session, data);
        break;

      case 'reached_target':
        await this.handleReachedTarget(session, data);
        break;

      case 'game_over':
        await this.handleGameOver(session, data);
        break;

      case 'leave':
        await this.handleDisconnect(ws);
        break;
    }
  }

  // Handle tile merge and trigger attacks
  private async handleTileMerged(
    session: WebSocketSession,
    data: { mergedValue: number; score: number; maxTile: number; moves: number }
  ): Promise<void> {
    if (this.roomState.gameStatus !== 'playing') return;

    const player = this.roomState.players.get(session.playerId);
    if (!player) return;

    // Update player state
    player.score = data.score;
    player.maxTile = Math.max(player.maxTile, data.maxTile);
    player.moves = data.moves;
    player.lastUpdate = Date.now();

    // Check if this merge triggers an attack
    const attackInfo = ATTACK_TABLE_2048[data.mergedValue];
    if (attackInfo) {
      // Find opponent
      for (const [opponentId, opponent] of this.roomState.players) {
        if (opponentId !== session.playerId && !opponent.isFinished) {
          // Generate attack data based on type
          let attackData: { position?: number; duration?: number } = {};

          switch (attackInfo.type) {
            case 'lockTile':
              // Lock a random tile position (0-15 for 4x4 grid)
              attackData = { position: Math.floor(Math.random() * 16), duration: 5000 };
              break;
            case 'freezeInput':
              attackData = { duration: 2000 };
              break;
            case 'addBlocker':
              // Random position for blocker
              attackData = { position: Math.floor(Math.random() * 16) };
              break;
            case 'shuffleTiles':
              // No additional data needed
              break;
          }

          // Send attack to opponent
          for (const [ws, sess] of this.sessions) {
            if (sess.playerId === opponentId) {
              this.sendToSocket(ws, {
                type: 'receive_attack',
                attackType: attackInfo.type,
                data: attackData,
              });
              break;
            }
          }

          // Notify all players about the attack
          this.broadcast({
            type: 'opponent_attacked',
            attackerId: session.playerId,
            attackType: attackInfo.type,
          });

          break;
        }
      }
    }

    // Broadcast updated state to opponent
    this.broadcastExcept(session.playerId, {
      type: 'opponent_update',
      id: session.playerId,
      score: player.score,
      maxTile: player.maxTile,
      moves: player.moves,
    });
  }

  private async handleCreateRoom(
    ws: WebSocket,
    session: WebSocketSession,
    nickname: string,
    settings?: { timeLimit?: number; targetTile?: number }
  ): Promise<void> {
    if (this.roomState.players.size >= ROOM_CONFIG.maxPlayers) {
      this.sendToSocket(ws, { type: 'error', message: 'Room is full' });
      return;
    }

    if (settings) {
      if (settings.timeLimit) this.roomState.timeLimit = Math.min(600, Math.max(60, settings.timeLimit));
      if (settings.targetTile) this.roomState.targetTile = settings.targetTile;
    }

    if (!this.roomState.roomCode) {
      this.roomState.roomCode = this.generateRoomCode();
    }
    if (!this.roomState.roomId) {
      this.roomState.roomId = this.roomState.roomCode;
    }
    this.roomState.hostId = session.playerId;

    session.nickname = nickname.trim().slice(0, 12);
    const player: Game2048PlayerState = {
      id: session.playerId,
      nickname: session.nickname,
      score: 0,
      maxTile: 0,
      moves: 0,
      isReady: false,
      isFinished: false,
      reachedTarget: false,
      lastUpdate: Date.now(),
      pendingAttacks: [],
      lockedTiles: [],
      blockerTiles: [],
    };
    this.roomState.players.set(session.playerId, player);

    this.sendToSocket(ws, {
      type: 'room_joined',
      roomId: this.roomState.roomId,
      roomCode: this.roomState.roomCode,
      players: [{ id: session.playerId, nickname: session.nickname, isReady: false }],
      settings: {
        timeLimit: this.roomState.timeLimit,
        targetTile: this.roomState.targetTile,
      },
    });
  }

  private async handleJoin(ws: WebSocket, session: WebSocketSession, nickname: string, roomCode?: string): Promise<void> {
    if (roomCode && this.roomState.roomCode && roomCode.toUpperCase() !== this.roomState.roomCode) {
      this.sendToSocket(ws, { type: 'error', message: 'Invalid room code' });
      return;
    }

    if (this.roomState.players.size >= ROOM_CONFIG.maxPlayers) {
      this.sendToSocket(ws, { type: 'error', message: 'Room is full' });
      return;
    }

    if (this.roomState.gameStatus !== 'waiting') {
      this.sendToSocket(ws, { type: 'error', message: 'Game already in progress' });
      return;
    }

    session.nickname = nickname.trim().slice(0, 12);
    const player: Game2048PlayerState = {
      id: session.playerId,
      nickname: session.nickname,
      score: 0,
      maxTile: 0,
      moves: 0,
      isReady: false,
      isFinished: false,
      reachedTarget: false,
      lastUpdate: Date.now(),
      pendingAttacks: [],
      lockedTiles: [],
      blockerTiles: [],
    };
    this.roomState.players.set(session.playerId, player);

    if (!this.roomState.roomId) {
      this.roomState.roomId = this.ctx.id.toString();
    }

    const existingPlayers = Array.from(this.roomState.players.values()).map(p => ({
      id: p.id,
      nickname: p.nickname,
      isReady: p.isReady,
    }));

    this.sendToSocket(ws, {
      type: 'room_joined',
      roomId: this.roomState.roomId,
      roomCode: this.roomState.roomCode,
      players: existingPlayers,
      settings: {
        timeLimit: this.roomState.timeLimit,
        targetTile: this.roomState.targetTile,
      },
    });

    this.broadcastExcept(session.playerId, {
      type: 'player_joined',
      id: session.playerId,
      nickname: session.nickname,
    });
  }

  private async handleReady(ws: WebSocket, session: WebSocketSession, isReady: boolean): Promise<void> {
    const player = this.roomState.players.get(session.playerId);
    if (!player) return;

    player.isReady = isReady;

    this.broadcast({
      type: 'player_ready',
      id: session.playerId,
      isReady,
    });

    if (this.roomState.players.size === ROOM_CONFIG.maxPlayers) {
      const allReady = Array.from(this.roomState.players.values()).every(p => p.isReady);
      if (allReady) {
        await this.startCountdown();
      }
    }
  }

  private async startCountdown(): Promise<void> {
    this.roomState.gameStatus = 'countdown';
    let seconds = ROOM_CONFIG.countdownSeconds;

    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    this.broadcast({ type: 'countdown', seconds });

    this.countdownInterval = setInterval(() => {
      seconds--;
      if (seconds > 0) {
        this.broadcast({ type: 'countdown', seconds });
      } else {
        clearInterval(this.countdownInterval!);
        this.startGame();
      }
    }, 1000);
  }

  private startGame(): void {
    this.roomState.gameStatus = 'playing';
    this.roomState.startTime = Date.now();
    this.roomState.seed = Math.floor(Math.random() * 2147483647);

    for (const player of this.roomState.players.values()) {
      player.score = 0;
      player.maxTile = 0;
      player.moves = 0;
      player.isFinished = false;
      player.reachedTarget = false;
      player.finishTime = undefined;
    }

    this.broadcast({
      type: 'game_start',
      seed: this.roomState.seed,
      timeLimit: this.roomState.timeLimit,
      targetTile: this.roomState.targetTile,
    });

    // Start game timer - 毎秒更新を送信
    let remaining = this.roomState.timeLimit;
    this.gameTimer = setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        clearInterval(this.gameTimer!);
        this.endGameByTime();
      } else {
        // 毎秒タイマー更新を送信
        this.broadcast({ type: 'time_update', remaining });
      }
    }, 1000);
  }

  private async handleMoveUpdate(session: WebSocketSession, data: {
    score: number;
    maxTile: number;
    moves: number;
  }): Promise<void> {
    const player = this.roomState.players.get(session.playerId);
    if (!player || this.roomState.gameStatus !== 'playing') return;

    player.score = data.score;
    player.maxTile = data.maxTile;
    player.moves = data.moves;
    player.lastUpdate = Date.now();

    this.broadcastExcept(session.playerId, {
      type: 'opponent_update',
      id: session.playerId,
      score: data.score,
      maxTile: data.maxTile,
      moves: data.moves,
    });
  }

  private async handleReachedTarget(session: WebSocketSession, data: {
    score: number;
    maxTile: number;
    moves: number;
  }): Promise<void> {
    const player = this.roomState.players.get(session.playerId);
    if (!player || player.reachedTarget) return;

    player.reachedTarget = true;
    player.score = data.score;
    player.maxTile = data.maxTile;
    player.moves = data.moves;
    player.finishTime = Date.now() - (this.roomState.startTime || Date.now());

    this.broadcastExcept(session.playerId, {
      type: 'opponent_reached_target',
      id: session.playerId,
      score: data.score,
    });

    // First to reach target wins
    this.endGame(player.id, 'reached_target');
  }

  private async handleGameOver(session: WebSocketSession, data: {
    score: number;
    maxTile: number;
    moves: number;
  }): Promise<void> {
    const player = this.roomState.players.get(session.playerId);
    if (!player || player.isFinished) return;

    player.isFinished = true;
    player.score = data.score;
    player.maxTile = data.maxTile;
    player.moves = data.moves;

    this.broadcastExcept(session.playerId, {
      type: 'opponent_game_over',
      id: session.playerId,
      score: data.score,
    });

    // Check if all players finished
    const allFinished = Array.from(this.roomState.players.values()).every(p => p.isFinished);
    if (allFinished) {
      this.endGameByScore();
    }
  }

  private endGameByTime(): void {
    this.endGameByScore();
  }

  private endGameByScore(): void {
    const players = Array.from(this.roomState.players.values());
    players.sort((a, b) => b.score - a.score);
    const winner = players[0];
    this.endGame(winner.id, 'higher_score');
  }

  private endGame(winnerId: string, reason: 'reached_target' | 'time_up' | 'opponent_quit' | 'higher_score'): void {
    if (this.roomState.gameStatus === 'finished') return;

    this.roomState.gameStatus = 'finished';
    this.roomState.winner = winnerId;

    if (this.gameTimer) {
      clearInterval(this.gameTimer);
    }

    const winner = this.roomState.players.get(winnerId);
    const results = Array.from(this.roomState.players.values()).map(p => ({
      id: p.id,
      nickname: p.nickname,
      score: p.score,
      maxTile: p.maxTile,
    }));

    this.broadcast({
      type: 'game_end',
      winner: winnerId,
      winnerNickname: winner?.nickname || '',
      reason,
      results,
    });

    // Reset for rematch
    for (const p of this.roomState.players.values()) {
      p.isReady = false;
    }
    this.roomState.gameStatus = 'waiting';
  }

  private async handleDisconnect(ws: WebSocket): Promise<void> {
    const session = this.sessions.get(ws);
    if (!session) return;

    this.sessions.delete(ws);
    const player = this.roomState.players.get(session.playerId);

    if (player) {
      this.roomState.players.delete(session.playerId);

      this.broadcast({
        type: 'player_left',
        id: session.playerId,
        nickname: player.nickname,
      });

      if (this.roomState.gameStatus === 'playing') {
        const remaining = Array.from(this.roomState.players.values())[0];
        if (remaining) {
          this.endGame(remaining.id, 'opponent_quit');
        }
      }

      if (this.roomState.gameStatus === 'countdown') {
        if (this.countdownInterval) {
          clearInterval(this.countdownInterval);
        }
        this.roomState.gameStatus = 'waiting';
      }
    }

    try {
      ws.close();
    } catch {
      // Ignore close errors
    }
  }

  private sendToSocket(ws: WebSocket, message: Game2048ServerMessage): void {
    try {
      ws.send(JSON.stringify(message));
    } catch (e) {
      console.error('Failed to send message:', e);
    }
  }

  private broadcast(message: Game2048ServerMessage): void {
    for (const ws of this.sessions.keys()) {
      this.sendToSocket(ws, message);
    }
  }

  private broadcastExcept(excludePlayerId: string, message: Game2048ServerMessage): void {
    for (const [ws, session] of this.sessions) {
      if (session.playerId !== excludePlayerId) {
        this.sendToSocket(ws, message);
      }
    }
  }

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
