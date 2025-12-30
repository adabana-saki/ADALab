import { DurableObject } from 'cloudflare:workers';

// Snake Battle Types
export interface Position {
  x: number;
  y: number;
}

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface SnakePlayerState {
  id: string;
  nickname: string;
  snake: Position[];
  food: Position;
  direction: Direction;
  score: number;
  length: number;
  isReady: boolean;
  isAlive: boolean;
  pendingObstacles: Position[];
  lastUpdate: number;
}

export interface SnakeRoomState {
  roomId: string;
  roomCode?: string;
  hostId?: string;
  players: Map<string, SnakePlayerState>;
  gameStatus: 'waiting' | 'countdown' | 'playing' | 'finished';
  startTime?: number;
  seed: number;
  gridSize: number;
  timeLimit: number; // seconds, 0 = no limit
  winner?: string;
  createdAt: number;
}

// Client -> Server messages
export type SnakeClientMessage =
  | { type: 'join'; nickname: string; roomCode?: string }
  | { type: 'create_room'; nickname: string; settings?: { gridSize?: number; timeLimit?: number } }
  | { type: 'ready' }
  | { type: 'unready' }
  | { type: 'state_update'; snake: Position[]; direction: Direction; score: number }
  | { type: 'food_eaten'; newFood: Position; score: number }
  | { type: 'game_over'; score: number; length: number }
  | { type: 'leave' }
  | { type: 'ping' };

// Server -> Client messages
export type SnakeServerMessage =
  | { type: 'room_joined'; roomId: string; roomCode?: string; players: { id: string; nickname: string; isReady: boolean }[]; settings: { gridSize: number; timeLimit: number } }
  | { type: 'player_joined'; id: string; nickname: string }
  | { type: 'player_left'; id: string; nickname: string }
  | { type: 'player_ready'; id: string; isReady: boolean }
  | { type: 'countdown'; seconds: number }
  | { type: 'game_start'; seed: number; gridSize: number }
  | { type: 'opponent_update'; id: string; snake: Position[]; direction: Direction; score: number }
  | { type: 'receive_obstacle'; position: Position; senderId: string }
  | { type: 'opponent_game_over'; id: string; score: number }
  | { type: 'time_update'; remaining: number }
  | { type: 'game_end'; winner: string; winnerNickname: string; reason: 'opponent_died' | 'time_up' | 'opponent_quit'; results: { id: string; nickname: string; score: number; length: number }[] }
  | { type: 'error'; message: string }
  | { type: 'pong' };

const ROOM_CONFIG = {
  maxPlayers: 2,
  countdownSeconds: 3,
  defaultGridSize: 20,
  defaultTimeLimit: 180, // 3 minutes
};

interface Env {
  ALLOWED_ORIGINS: string;
}

interface WebSocketSession {
  ws: WebSocket;
  playerId: string;
  nickname: string;
}

export class SnakeRoom extends DurableObject<Env> {
  private sessions: Map<WebSocket, WebSocketSession> = new Map();
  private roomState: SnakeRoomState;
  private countdownInterval?: ReturnType<typeof setInterval>;
  private gameTimer?: ReturnType<typeof setInterval>;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.roomState = {
      roomId: '',
      players: new Map(),
      gameStatus: 'waiting',
      seed: 0,
      gridSize: ROOM_CONFIG.defaultGridSize,
      timeLimit: ROOM_CONFIG.defaultTimeLimit,
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
      const data = JSON.parse(message) as SnakeClientMessage;
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

  private async handleMessage(ws: WebSocket, session: WebSocketSession, data: SnakeClientMessage): Promise<void> {
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

      case 'state_update':
        await this.handleStateUpdate(session, data);
        break;

      case 'food_eaten':
        await this.handleFoodEaten(session, data);
        break;

      case 'game_over':
        await this.handleGameOver(session, data);
        break;

      case 'leave':
        await this.handleDisconnect(ws);
        break;
    }
  }

  private async handleCreateRoom(
    ws: WebSocket,
    session: WebSocketSession,
    nickname: string,
    settings?: { gridSize?: number; timeLimit?: number }
  ): Promise<void> {
    if (this.roomState.players.size >= ROOM_CONFIG.maxPlayers) {
      this.sendToSocket(ws, { type: 'error', message: 'Room is full' });
      return;
    }

    if (settings) {
      if (settings.gridSize) this.roomState.gridSize = Math.min(30, Math.max(15, settings.gridSize));
      if (settings.timeLimit !== undefined) this.roomState.timeLimit = Math.min(600, Math.max(0, settings.timeLimit));
    }

    if (!this.roomState.roomCode) {
      this.roomState.roomCode = this.generateRoomCode();
    }
    if (!this.roomState.roomId) {
      this.roomState.roomId = this.roomState.roomCode;
    }
    this.roomState.hostId = session.playerId;

    session.nickname = nickname.trim().slice(0, 12);
    const player: SnakePlayerState = {
      id: session.playerId,
      nickname: session.nickname,
      snake: [],
      food: { x: 0, y: 0 },
      direction: 'right',
      score: 0,
      length: 3,
      isReady: false,
      isAlive: true,
      pendingObstacles: [],
      lastUpdate: Date.now(),
    };
    this.roomState.players.set(session.playerId, player);

    this.sendToSocket(ws, {
      type: 'room_joined',
      roomId: this.roomState.roomId,
      roomCode: this.roomState.roomCode,
      players: [{ id: session.playerId, nickname: session.nickname, isReady: false }],
      settings: {
        gridSize: this.roomState.gridSize,
        timeLimit: this.roomState.timeLimit,
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
    const player: SnakePlayerState = {
      id: session.playerId,
      nickname: session.nickname,
      snake: [],
      food: { x: 0, y: 0 },
      direction: 'right',
      score: 0,
      length: 3,
      isReady: false,
      isAlive: true,
      pendingObstacles: [],
      lastUpdate: Date.now(),
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
        gridSize: this.roomState.gridSize,
        timeLimit: this.roomState.timeLimit,
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
      player.length = 3;
      player.isAlive = true;
      player.pendingObstacles = [];
    }

    this.broadcast({
      type: 'game_start',
      seed: this.roomState.seed,
      gridSize: this.roomState.gridSize,
    });

    // Start game timer if time limit is set
    if (this.roomState.timeLimit > 0) {
      let remaining = this.roomState.timeLimit;
      this.gameTimer = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
          clearInterval(this.gameTimer!);
          this.endGameByTime();
        } else if (remaining % 10 === 0 || remaining <= 10) {
          this.broadcast({ type: 'time_update', remaining });
        }
      }, 1000);
    }
  }

  private async handleStateUpdate(session: WebSocketSession, data: {
    snake: Position[];
    direction: Direction;
    score: number;
  }): Promise<void> {
    const player = this.roomState.players.get(session.playerId);
    if (!player || this.roomState.gameStatus !== 'playing' || !player.isAlive) return;

    player.snake = data.snake;
    player.direction = data.direction;
    player.score = data.score;
    player.lastUpdate = Date.now();

    this.broadcastExcept(session.playerId, {
      type: 'opponent_update',
      id: session.playerId,
      snake: data.snake,
      direction: data.direction,
      score: data.score,
    });
  }

  private async handleFoodEaten(session: WebSocketSession, data: {
    newFood: Position;
    score: number;
  }): Promise<void> {
    const player = this.roomState.players.get(session.playerId);
    if (!player || this.roomState.gameStatus !== 'playing') return;

    player.score = data.score;
    player.length++;

    // Send obstacle to opponent
    for (const [playerId, opponent] of this.roomState.players) {
      if (playerId !== session.playerId && opponent.isAlive) {
        // Generate random obstacle position
        const obstaclePos = {
          x: Math.floor(Math.random() * this.roomState.gridSize),
          y: Math.floor(Math.random() * this.roomState.gridSize),
        };

        this.sendToPlayer(playerId, {
          type: 'receive_obstacle',
          position: obstaclePos,
          senderId: session.playerId,
        });
        break;
      }
    }
  }

  private async handleGameOver(session: WebSocketSession, data: {
    score: number;
    length: number;
  }): Promise<void> {
    const player = this.roomState.players.get(session.playerId);
    if (!player || !player.isAlive) return;

    player.isAlive = false;
    player.score = data.score;
    player.length = data.length;

    this.broadcastExcept(session.playerId, {
      type: 'opponent_game_over',
      id: session.playerId,
      score: data.score,
    });

    // Check for winner
    const alivePlayers = Array.from(this.roomState.players.values()).filter(p => p.isAlive);
    if (alivePlayers.length <= 1) {
      const winner = alivePlayers[0] || player;
      this.endGame(winner.id, 'opponent_died');
    }
  }

  private endGameByTime(): void {
    const players = Array.from(this.roomState.players.values());
    players.sort((a, b) => b.score - a.score);
    const winner = players[0];
    this.endGame(winner.id, 'time_up');
  }

  private endGame(winnerId: string, reason: 'opponent_died' | 'time_up' | 'opponent_quit'): void {
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
      length: p.length,
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
      p.isAlive = true;
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

  private sendToSocket(ws: WebSocket, message: SnakeServerMessage): void {
    try {
      ws.send(JSON.stringify(message));
    } catch (e) {
      console.error('Failed to send message:', e);
    }
  }

  private sendToPlayer(playerId: string, message: SnakeServerMessage): void {
    for (const [ws, session] of this.sessions) {
      if (session.playerId === playerId) {
        this.sendToSocket(ws, message);
        break;
      }
    }
  }

  private broadcast(message: SnakeServerMessage): void {
    for (const ws of this.sessions.keys()) {
      this.sendToSocket(ws, message);
    }
  }

  private broadcastExcept(excludePlayerId: string, message: SnakeServerMessage): void {
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
