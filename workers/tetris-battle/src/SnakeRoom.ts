import { DurableObject } from 'cloudflare:workers';

// Snake Battle Types
export interface Position {
  x: number;
  y: number;
}

export type Direction = 'up' | 'down' | 'left' | 'right';

// プレイヤーの色
const PLAYER_COLORS = ['#22c55e', '#f97316']; // green, orange

// Power-up types
export type SnakePowerUpType = 'shield' | 'ghost' | 'speed' | 'magnet';

// Attack types based on food eaten
export type SnakeAttackType = 'addObstacle' | 'speedUp' | 'reverseControls' | 'shrinkBoard';

// Food types with different effects
export type FoodType = 'normal' | 'golden' | 'poison' | 'mega';

// Power-up definitions
const POWER_UPS: Record<SnakePowerUpType, { duration: number; description: string }> = {
  shield: { duration: 5000, description: 'Block next attack' },
  ghost: { duration: 3000, description: 'Pass through walls temporarily' },
  speed: { duration: 5000, description: 'Speed up your snake' },
  magnet: { duration: 5000, description: 'Attract nearby food' },
};

// Attack based on food type eaten
const FOOD_ATTACKS: Record<FoodType, { attackType: SnakeAttackType | null; probability: number }> = {
  normal: { attackType: 'addObstacle', probability: 0.3 },
  golden: { attackType: 'speedUp', probability: 0.8 },
  poison: { attackType: 'reverseControls', probability: 1.0 },
  mega: { attackType: 'shrinkBoard', probability: 0.5 },
};

export interface SnakePlayerState {
  id: string;
  nickname: string;
  snake: Position[];
  direction: Direction;
  nextDirection: Direction; // 次のティックで適用される方向
  score: number;
  isReady: boolean;
  isAlive: boolean;
  color: string;
}

export interface SnakeRoomState {
  roomId: string;
  roomCode?: string;
  hostId?: string;
  players: Map<string, SnakePlayerState>;
  gameStatus: 'waiting' | 'countdown' | 'playing' | 'finished';
  startTime?: number;
  food: Position; // 共有フード
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
  | { type: 'direction_change'; direction: Direction } // 新: 方向変更のみ送信
  | { type: 'leave' }
  | { type: 'ping' };

// Server -> Client messages
export type SnakeServerMessage =
  | { type: 'room_joined'; roomId: string; roomCode?: string; players: { id: string; nickname: string; isReady: boolean }[]; settings: { gridSize: number; timeLimit: number } }
  | { type: 'player_joined'; id: string; nickname: string }
  | { type: 'player_left'; id: string; nickname: string }
  | { type: 'player_ready'; id: string; isReady: boolean }
  | { type: 'countdown'; seconds: number }
  | { type: 'game_start'; gridSize: number; players: { id: string; nickname: string; color: string; snake: Position[]; score: number; isAlive: boolean }[]; food: Position }
  | { type: 'game_state'; players: { id: string; snake: Position[]; direction: Direction; score: number; isAlive: boolean }[]; food: Position } // 新: 全状態配信
  | { type: 'player_died'; id: string; nickname: string; killedBy: 'wall' | 'self' | 'opponent' | 'opponent_body' }
  | { type: 'time_update'; remaining: number }
  | { type: 'game_end'; winner: string; winnerNickname: string; reason: 'opponent_died' | 'time_up' | 'opponent_quit'; results: { id: string; nickname: string; score: number; length: number }[] }
  | { type: 'error'; message: string }
  | { type: 'pong' };

const ROOM_CONFIG = {
  maxPlayers: 2,
  countdownSeconds: 3,
  defaultGridSize: 30, // 30x30に拡大
  defaultTimeLimit: 180, // 3 minutes
  gameTickMs: 100, // 100msごとにティック（10 FPS）
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
  private gameLoopInterval?: ReturnType<typeof setInterval>;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.roomState = {
      roomId: '',
      players: new Map(),
      gameStatus: 'waiting',
      food: { x: 15, y: 15 },
      gridSize: ROOM_CONFIG.defaultGridSize,
      timeLimit: ROOM_CONFIG.defaultTimeLimit,
      createdAt: Date.now(),
    };
  }

  // ランダムなフード位置を生成（全スネークを避ける）
  private generateFood(): Position {
    const occupied = new Set<string>();
    for (const player of this.roomState.players.values()) {
      for (const seg of player.snake) {
        occupied.add(`${seg.x},${seg.y}`);
      }
    }

    let attempts = 0;
    while (attempts < 100) {
      const x = Math.floor(Math.random() * this.roomState.gridSize);
      const y = Math.floor(Math.random() * this.roomState.gridSize);
      if (!occupied.has(`${x},${y}`)) {
        return { x, y };
      }
      attempts++;
    }
    return { x: 0, y: 0 };
  }

  // ゲームティック（サーバー側でスネーク移動・衝突判定）
  private gameTick(): void {
    if (this.roomState.gameStatus !== 'playing') return;

    const players = Array.from(this.roomState.players.values());
    const alivePlayers = players.filter(p => p.isAlive);

    // 各プレイヤーのスネークを移動
    for (const player of alivePlayers) {
      // 方向を適用（180度反転は禁止）
      const opposite: Record<Direction, Direction> = { up: 'down', down: 'up', left: 'right', right: 'left' };
      if (player.nextDirection !== opposite[player.direction]) {
        player.direction = player.nextDirection;
      }

      const head = player.snake[0];
      let newHead: Position;
      switch (player.direction) {
        case 'up': newHead = { x: head.x, y: head.y - 1 }; break;
        case 'down': newHead = { x: head.x, y: head.y + 1 }; break;
        case 'left': newHead = { x: head.x - 1, y: head.y }; break;
        case 'right': newHead = { x: head.x + 1, y: head.y }; break;
      }

      // 壁衝突判定
      if (newHead.x < 0 || newHead.x >= this.roomState.gridSize ||
          newHead.y < 0 || newHead.y >= this.roomState.gridSize) {
        player.isAlive = false;
        this.broadcast({ type: 'player_died', id: player.id, nickname: player.nickname, killedBy: 'wall' });
        continue;
      }

      // 自分の体への衝突
      if (player.snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
        player.isAlive = false;
        this.broadcast({ type: 'player_died', id: player.id, nickname: player.nickname, killedBy: 'self' });
        continue;
      }

      // 相手のスネークへの衝突
      let hitOpponent = false;
      for (const other of alivePlayers) {
        if (other.id === player.id) continue;
        // 頭同士の衝突（両者死亡）
        const otherHead = other.snake[0];
        const otherNewHead = this.getNewHead(other);
        if (newHead.x === otherNewHead.x && newHead.y === otherNewHead.y) {
          player.isAlive = false;
          other.isAlive = false;
          this.broadcast({ type: 'player_died', id: player.id, nickname: player.nickname, killedBy: 'opponent' });
          this.broadcast({ type: 'player_died', id: other.id, nickname: other.nickname, killedBy: 'opponent' });
          hitOpponent = true;
          break;
        }
        // 相手の体への衝突
        if (other.snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
          player.isAlive = false;
          this.broadcast({ type: 'player_died', id: player.id, nickname: player.nickname, killedBy: 'opponent_body' });
          hitOpponent = true;
          break;
        }
      }
      if (hitOpponent || !player.isAlive) continue;

      // スネークを移動
      player.snake.unshift(newHead);

      // フード食べた？
      if (newHead.x === this.roomState.food.x && newHead.y === this.roomState.food.y) {
        player.score += 10;
        this.roomState.food = this.generateFood();
        // 尻尾を残す（成長）
      } else {
        player.snake.pop(); // 尻尾を削除
      }
    }

    // 勝敗判定
    const stillAlive = Array.from(this.roomState.players.values()).filter(p => p.isAlive);
    if (stillAlive.length <= 1) {
      if (stillAlive.length === 1) {
        this.endGame(stillAlive[0].id, 'opponent_died');
      } else {
        // 両者死亡 → スコアで判定（同点ならスネークの長さで判定）
        const sorted = players.sort((a, b) => {
          if (a.score !== b.score) return b.score - a.score;
          return b.snake.length - a.snake.length;
        });
        this.endGame(sorted[0].id, 'opponent_died');
      }
      return;
    }

    // 状態をブロードキャスト
    this.broadcast({
      type: 'game_state',
      players: Array.from(this.roomState.players.values()).map(p => ({
        id: p.id,
        snake: p.snake,
        direction: p.direction,
        score: p.score,
        isAlive: p.isAlive,
      })),
      food: this.roomState.food,
    });
  }

  private getNewHead(player: SnakePlayerState): Position {
    const head = player.snake[0];
    const dir = player.nextDirection;
    switch (dir) {
      case 'up': return { x: head.x, y: head.y - 1 };
      case 'down': return { x: head.x, y: head.y + 1 };
      case 'left': return { x: head.x - 1, y: head.y };
      case 'right': return { x: head.x + 1, y: head.y };
    }
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

      case 'direction_change':
        await this.handleDirectionChange(session, data.direction);
        break;

      case 'leave':
        await this.handleDisconnect(ws);
        break;
    }
  }

  // 方向変更のハンドリング
  private async handleDirectionChange(session: WebSocketSession, direction: Direction): Promise<void> {
    const player = this.roomState.players.get(session.playerId);
    if (!player || !player.isAlive || this.roomState.gameStatus !== 'playing') return;

    // 180度反転は禁止（次のティックでチェック）
    player.nextDirection = direction;
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
      if (settings.gridSize) this.roomState.gridSize = Math.min(40, Math.max(20, settings.gridSize));
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
    const playerIndex = this.roomState.players.size;
    const player: SnakePlayerState = {
      id: session.playerId,
      nickname: session.nickname,
      snake: [],
      direction: 'right',
      nextDirection: 'right',
      score: 0,
      isReady: false,
      isAlive: true,
      color: PLAYER_COLORS[playerIndex] || '#22c55e',
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
    const playerIndex = this.roomState.players.size;
    const player: SnakePlayerState = {
      id: session.playerId,
      nickname: session.nickname,
      snake: [],
      direction: playerIndex === 0 ? 'right' : 'left', // 2人目は左向きスタート
      nextDirection: playerIndex === 0 ? 'right' : 'left',
      score: 0,
      isReady: false,
      isAlive: true,
      color: PLAYER_COLORS[playerIndex] || '#f97316',
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

    // プレイヤーの初期位置を設定（対角線上に配置）
    const gridSize = this.roomState.gridSize;
    const players = Array.from(this.roomState.players.values());

    players.forEach((player, index) => {
      player.score = 0;
      player.isAlive = true;

      // 初期スネーク位置（3セグメント）
      if (index === 0) {
        // プレイヤー1: 左上から右向き
        player.snake = [
          { x: 5, y: 5 },
          { x: 4, y: 5 },
          { x: 3, y: 5 },
        ];
        player.direction = 'right';
        player.nextDirection = 'right';
      } else {
        // プレイヤー2: 右下から左向き
        player.snake = [
          { x: gridSize - 6, y: gridSize - 6 },
          { x: gridSize - 5, y: gridSize - 6 },
          { x: gridSize - 4, y: gridSize - 6 },
        ];
        player.direction = 'left';
        player.nextDirection = 'left';
      }
    });

    // 初期フード生成
    this.roomState.food = this.generateFood();

    // ゲーム開始メッセージ送信
    this.broadcast({
      type: 'game_start',
      gridSize: this.roomState.gridSize,
      players: players.map(p => ({
        id: p.id,
        nickname: p.nickname,
        color: p.color,
        snake: p.snake,
        score: p.score,
        isAlive: p.isAlive,
      })),
      food: this.roomState.food,
    });

    // ゲームループ開始（100msごと）
    this.gameLoopInterval = setInterval(() => {
      this.gameTick();
    }, ROOM_CONFIG.gameTickMs);

    // タイマー開始
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

  private endGameByTime(): void {
    const players = Array.from(this.roomState.players.values());
    // Sort by: 1. Higher score wins, 2. Longer snake wins (tiebreaker)
    players.sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score;
      return b.snake.length - a.snake.length;
    });
    const winner = players[0];
    this.endGame(winner.id, 'time_up');
  }

  private endGame(winnerId: string, reason: 'opponent_died' | 'time_up' | 'opponent_quit'): void {
    if (this.roomState.gameStatus === 'finished') return;

    this.roomState.gameStatus = 'finished';
    this.roomState.winner = winnerId;

    // ゲームループ停止
    if (this.gameLoopInterval) {
      clearInterval(this.gameLoopInterval);
      this.gameLoopInterval = undefined;
    }
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
      this.gameTimer = undefined;
    }

    const winner = this.roomState.players.get(winnerId);
    const results = Array.from(this.roomState.players.values()).map(p => ({
      id: p.id,
      nickname: p.nickname,
      score: p.score,
      length: p.snake.length,
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
      p.snake = [];
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
        // ゲームループ停止
        if (this.gameLoopInterval) {
          clearInterval(this.gameLoopInterval);
          this.gameLoopInterval = undefined;
        }
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
