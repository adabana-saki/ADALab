import { DurableObject } from 'cloudflare:workers';
import {
  PlayerState,
  RoomState,
  ClientMessage,
  ServerMessage,
  ATTACK_TABLE,
  ROOM_CONFIG,
} from './types';

interface Env {
  ALLOWED_ORIGINS: string;
}

interface WebSocketSession {
  ws: WebSocket;
  playerId: string;
  nickname: string;
}

export class TetrisRoom extends DurableObject<Env> {
  private sessions: Map<WebSocket, WebSocketSession> = new Map();
  private roomState: RoomState;
  private countdownInterval?: ReturnType<typeof setInterval>;
  private initialized = false;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.roomState = {
      roomId: '',
      players: new Map(),
      gameStatus: 'waiting',
      createdAt: Date.now(),
    };
  }

  // ストレージからroomCodeを復元
  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;
    const stored = await this.ctx.storage.get<{ roomCode: string; createdAt: number }>('roomData');
    if (stored) {
      this.roomState.roomCode = stored.roomCode;
      this.roomState.roomId = stored.roomCode;
      this.roomState.createdAt = stored.createdAt;
    }
    this.initialized = true;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Upgrade, Connection, Sec-WebSocket-Key, Sec-WebSocket-Version',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Initialize room with code
    if (url.pathname === '/init') {
      const roomCode = url.searchParams.get('roomCode');
      if (roomCode) {
        this.roomState.roomCode = roomCode;
        this.roomState.roomId = roomCode;
        this.roomState.createdAt = Date.now();
        // 永続ストレージに保存
        await this.ctx.storage.put('roomData', {
          roomCode,
          createdAt: this.roomState.createdAt,
        });
        this.initialized = true;
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Room info endpoint
    if (url.pathname === '/info') {
      await this.ensureInitialized();
      return new Response(JSON.stringify({
        roomId: this.roomState.roomId,
        roomCode: this.roomState.roomCode,
        playerCount: this.roomState.players.size,
        gameStatus: this.roomState.gameStatus,
        createdAt: this.roomState.createdAt,
        players: Array.from(this.roomState.players.values()).map(p => ({
          id: p.id,
          nickname: p.nickname,
          isReady: p.isReady,
        })),
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // WebSocket upgrade
    const upgradeHeader = request.headers.get('Upgrade');
    if (upgradeHeader !== 'websocket') {
      return new Response('Expected WebSocket', { status: 426, headers: corsHeaders });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    // Accept the WebSocket with hibernation support
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

    // ストレージからroomCodeを復元
    await this.ensureInitialized();

    try {
      const data = JSON.parse(message) as ClientMessage;
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

  private async handleMessage(ws: WebSocket, session: WebSocketSession, data: ClientMessage): Promise<void> {
    switch (data.type) {
      case 'ping':
        this.sendToSocket(ws, { type: 'pong' });
        break;

      case 'create_room':
        await this.handleCreateRoom(ws, session, data.nickname);
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

      case 'field_update':
        await this.handleFieldUpdate(session, data);
        break;

      case 'attack':
        await this.handleAttack(session, data);
        break;

      case 'game_over':
        await this.handleGameOver(session);
        break;

      case 'leave':
        await this.handleDisconnect(ws);
        break;
    }
  }

  private async handleCreateRoom(ws: WebSocket, session: WebSocketSession, nickname: string): Promise<void> {
    if (this.roomState.players.size >= ROOM_CONFIG.maxPlayers) {
      this.sendToSocket(ws, { type: 'error', message: 'Room is full' });
      return;
    }

    // Use existing room code if set (from init), otherwise generate new one
    if (!this.roomState.roomCode) {
      this.roomState.roomCode = this.generateRoomCode();
    }
    if (!this.roomState.roomId) {
      this.roomState.roomId = this.roomState.roomCode;
    }
    this.roomState.hostId = session.playerId;

    // Add player
    session.nickname = nickname.trim().slice(0, 12);
    const player: PlayerState = {
      id: session.playerId,
      nickname: session.nickname,
      field: this.createEmptyField(),
      score: 0,
      lines: 0,
      level: 1,
      pendingGarbage: 0,
      isReady: false,
      isAlive: true,
      lastUpdate: Date.now(),
    };
    this.roomState.players.set(session.playerId, player);

    this.sendToSocket(ws, {
      type: 'room_joined',
      roomId: this.roomState.roomId,
      roomCode: this.roomState.roomCode,
      players: [{ id: session.playerId, nickname: session.nickname, isReady: false }],
    });
  }

  private async handleJoin(ws: WebSocket, session: WebSocketSession, nickname: string, roomCode?: string): Promise<void> {
    // Validate room code if provided
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

    // Add player
    session.nickname = nickname.trim().slice(0, 12);
    const player: PlayerState = {
      id: session.playerId,
      nickname: session.nickname,
      field: this.createEmptyField(),
      score: 0,
      lines: 0,
      level: 1,
      pendingGarbage: 0,
      isReady: false,
      isAlive: true,
      lastUpdate: Date.now(),
    };
    this.roomState.players.set(session.playerId, player);

    // If no room ID yet (matchmaking), set it
    if (!this.roomState.roomId) {
      this.roomState.roomId = this.ctx.id.toString();
    }

    // Notify the new player
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
    });

    // Notify other players
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

    // Notify all players
    this.broadcast({
      type: 'player_ready',
      id: session.playerId,
      isReady,
    });

    // Check if all players are ready to start
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

    // Clear any existing countdown
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    // Send initial countdown
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

    // Reset all players
    for (const player of this.roomState.players.values()) {
      player.field = this.createEmptyField();
      player.score = 0;
      player.lines = 0;
      player.level = 1;
      player.pendingGarbage = 0;
      player.isAlive = true;
    }

    this.broadcast({
      type: 'game_start',
      seed: this.roomState.seed,
    });
  }

  private async handleFieldUpdate(session: WebSocketSession, data: {
    field: number[][];
    score: number;
    lines: number;
    level: number;
  }): Promise<void> {
    const player = this.roomState.players.get(session.playerId);
    if (!player || this.roomState.gameStatus !== 'playing') return;

    player.field = data.field;
    player.score = data.score;
    player.lines = data.lines;
    player.level = data.level;
    player.lastUpdate = Date.now();

    // Broadcast to other players
    this.broadcastExcept(session.playerId, {
      type: 'opponent_update',
      id: session.playerId,
      field: data.field,
      score: data.score,
      lines: data.lines,
      level: data.level,
    });
  }

  private async handleAttack(session: WebSocketSession, data: {
    lines: number;
    attackType: keyof typeof ATTACK_TABLE;
    combo: number;
    b2b: boolean;
  }): Promise<void> {
    if (this.roomState.gameStatus !== 'playing') return;

    const attacker = this.roomState.players.get(session.playerId);
    if (!attacker) return;

    // Calculate attack lines
    let attackLines = ATTACK_TABLE[data.attackType] || 0;

    // Combo bonus
    if (data.combo > 1) {
      attackLines += data.combo - 1;
    }

    // Back-to-Back bonus
    if (data.b2b) {
      attackLines += ATTACK_TABLE.b2bBonus;
    }

    if (attackLines <= 0) return;

    // Notify about the attack
    this.broadcastExcept(session.playerId, {
      type: 'opponent_attacked',
      senderId: session.playerId,
      lines: attackLines,
      attackType: data.attackType,
    });

    // Send garbage to opponent(s)
    for (const [playerId, player] of this.roomState.players) {
      if (playerId !== session.playerId && player.isAlive) {
        // First, try to offset with attacker's pending garbage
        const offsetLines = Math.min(attackLines, attacker.pendingGarbage);
        if (offsetLines > 0) {
          attacker.pendingGarbage -= offsetLines;
          attackLines -= offsetLines;
        }

        // Then send remaining to opponent
        if (attackLines > 0) {
          player.pendingGarbage += attackLines;
          this.sendToPlayer(playerId, {
            type: 'receive_garbage',
            lines: attackLines,
            senderId: session.playerId,
          });
        }
        break; // Only one opponent in 1v1
      }
    }
  }

  private async handleGameOver(session: WebSocketSession): Promise<void> {
    const player = this.roomState.players.get(session.playerId);
    if (!player || !player.isAlive) return;

    player.isAlive = false;

    // Notify other players
    this.broadcastExcept(session.playerId, {
      type: 'opponent_game_over',
      id: session.playerId,
    });

    // Check for winner
    const alivePlayers = Array.from(this.roomState.players.values()).filter(p => p.isAlive);

    if (alivePlayers.length <= 1) {
      // Game ended
      this.roomState.gameStatus = 'finished';
      const winner = alivePlayers[0] || player; // Last alive or the one who died (if everyone died)

      this.roomState.winner = winner.id;

      this.broadcast({
        type: 'game_end',
        winner: winner.id,
        winnerNickname: winner.nickname,
      });

      // Reset ready status for rematch
      for (const p of this.roomState.players.values()) {
        p.isReady = false;
      }
      this.roomState.gameStatus = 'waiting';
    }
  }

  private async handleDisconnect(ws: WebSocket): Promise<void> {
    const session = this.sessions.get(ws);
    if (!session) return;

    this.sessions.delete(ws);
    const player = this.roomState.players.get(session.playerId);

    if (player) {
      this.roomState.players.delete(session.playerId);

      // Notify other players
      this.broadcast({
        type: 'player_left',
        id: session.playerId,
        nickname: player.nickname,
      });

      // If game was in progress, handle as game over
      if (this.roomState.gameStatus === 'playing') {
        player.isAlive = false;
        await this.handleGameOver(session);
      }

      // Cancel countdown if someone leaves during countdown
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

  private sendToSocket(ws: WebSocket, message: ServerMessage): void {
    try {
      ws.send(JSON.stringify(message));
    } catch (e) {
      console.error('Failed to send message:', e);
    }
  }

  private sendToPlayer(playerId: string, message: ServerMessage): void {
    for (const [ws, session] of this.sessions) {
      if (session.playerId === playerId) {
        this.sendToSocket(ws, message);
        break;
      }
    }
  }

  private broadcast(message: ServerMessage): void {
    for (const ws of this.sessions.keys()) {
      this.sendToSocket(ws, message);
    }
  }

  private broadcastExcept(excludePlayerId: string, message: ServerMessage): void {
    for (const [ws, session] of this.sessions) {
      if (session.playerId !== excludePlayerId) {
        this.sendToSocket(ws, message);
      }
    }
  }

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding similar chars
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  private createEmptyField(): number[][] {
    return Array(20).fill(null).map(() => Array(10).fill(0));
  }
}
