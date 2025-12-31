import { DurableObject } from 'cloudflare:workers';

// Streak attack types
export type TypingAttackType = 'blurWord' | 'scrambleWord' | 'addExtraWord' | 'speedUpTimer' | 'hideLetters';

// Streak attack definitions
const STREAK_ATTACKS: Record<number, { type: TypingAttackType; duration?: number; description: string }> = {
  3: { type: 'blurWord', duration: 2000, description: 'Blur the current word for 2 seconds' },
  5: { type: 'scrambleWord', description: 'Scramble the next word letters' },
  7: { type: 'hideLetters', duration: 3000, description: 'Hide random letters for 3 seconds' },
  10: { type: 'addExtraWord', description: 'Add an extra word to opponent' },
};

// Typing Battle Types
export interface TypingPlayerState {
  id: string;
  nickname: string;
  currentWordIndex: number;
  correctWords: number;
  correctChars: number;
  totalChars: number;
  wpm: number;
  accuracy: number;
  isReady: boolean;
  isFinished: boolean;
  finishTime?: number;
  lastUpdate: number;
  // Streak system
  currentStreak: number;
  maxStreak: number;
  attacksSent: number;
  // Active effects from opponent attacks
  activeEffects: { type: TypingAttackType; expiresAt?: number }[];
  extraWordsAdded: number;
}

export interface TypingRoomState {
  roomId: string;
  roomCode?: string;
  hostId?: string;
  players: Map<string, TypingPlayerState>;
  gameStatus: 'waiting' | 'countdown' | 'playing' | 'finished';
  startTime?: number;
  seed: number;
  wordCount: number;
  language: 'en' | 'ja';
  difficulty: 'easy' | 'medium' | 'hard';
  winner?: string;
  createdAt: number;
}

// Client -> Server messages
export type TypingClientMessage =
  | { type: 'join'; nickname: string; roomCode?: string }
  | { type: 'create_room'; nickname: string; settings?: { wordCount?: number; language?: 'en' | 'ja'; difficulty?: 'easy' | 'medium' | 'hard' } }
  | { type: 'ready' }
  | { type: 'unready' }
  | { type: 'word_complete'; wordIndex: number; correct: boolean; wpm: number; accuracy: number; correctChars: number; totalChars: number }
  | { type: 'game_finished'; finalWpm: number; finalAccuracy: number; finishTime: number }
  | { type: 'leave' }
  | { type: 'ping' };

// Server -> Client messages
export type TypingServerMessage =
  | { type: 'room_joined'; roomId: string; roomCode?: string; players: { id: string; nickname: string; isReady: boolean }[]; settings: { wordCount: number; language: string; difficulty: string } }
  | { type: 'player_joined'; id: string; nickname: string }
  | { type: 'player_left'; id: string; nickname: string }
  | { type: 'player_ready'; id: string; isReady: boolean }
  | { type: 'countdown'; seconds: number }
  | { type: 'game_start'; seed: number; wordCount: number; language: string; difficulty: string }
  | { type: 'opponent_progress'; id: string; wordIndex: number; wpm: number; accuracy: number; streak: number }
  | { type: 'opponent_finished'; id: string; finalWpm: number; finalAccuracy: number; finishTime: number }
  | { type: 'game_end'; winner: string; winnerNickname: string; results: { id: string; nickname: string; wpm: number; accuracy: number; finishTime?: number; maxStreak: number; attacksSent: number }[] }
  | { type: 'streak_attack'; attackType: TypingAttackType; duration?: number; senderId: string; senderStreak: number }
  | { type: 'streak_milestone'; playerId: string; streak: number }
  | { type: 'streak_broken'; playerId: string; previousStreak: number }
  | { type: 'error'; message: string }
  | { type: 'pong' };

const ROOM_CONFIG = {
  maxPlayers: 2,
  countdownSeconds: 3,
  defaultWordCount: 20,
  defaultLanguage: 'en' as const,
  defaultDifficulty: 'medium' as const,
};

interface Env {
  ALLOWED_ORIGINS: string;
}

interface WebSocketSession {
  ws: WebSocket;
  playerId: string;
  nickname: string;
}

export class TypingRoom extends DurableObject<Env> {
  private sessions: Map<WebSocket, WebSocketSession> = new Map();
  private roomState: TypingRoomState;
  private countdownInterval?: ReturnType<typeof setInterval>;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.roomState = {
      roomId: '',
      players: new Map(),
      gameStatus: 'waiting',
      seed: 0,
      wordCount: ROOM_CONFIG.defaultWordCount,
      language: ROOM_CONFIG.defaultLanguage,
      difficulty: ROOM_CONFIG.defaultDifficulty,
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

    // Initialize room with code
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

    // Room info endpoint
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

    // WebSocket upgrade
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
      const data = JSON.parse(message) as TypingClientMessage;
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

  private async handleMessage(ws: WebSocket, session: WebSocketSession, data: TypingClientMessage): Promise<void> {
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

      case 'word_complete':
        await this.handleWordComplete(session, data);
        break;

      case 'game_finished':
        await this.handleGameFinished(session, data);
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
    settings?: { wordCount?: number; language?: 'en' | 'ja'; difficulty?: 'easy' | 'medium' | 'hard' }
  ): Promise<void> {
    if (this.roomState.players.size >= ROOM_CONFIG.maxPlayers) {
      this.sendToSocket(ws, { type: 'error', message: 'Room is full' });
      return;
    }

    // Apply settings
    if (settings) {
      if (settings.wordCount) this.roomState.wordCount = Math.min(50, Math.max(10, settings.wordCount));
      if (settings.language) this.roomState.language = settings.language;
      if (settings.difficulty) this.roomState.difficulty = settings.difficulty;
    }

    if (!this.roomState.roomCode) {
      this.roomState.roomCode = this.generateRoomCode();
    }
    if (!this.roomState.roomId) {
      this.roomState.roomId = this.roomState.roomCode;
    }
    this.roomState.hostId = session.playerId;

    session.nickname = nickname.trim().slice(0, 12);
    const player: TypingPlayerState = {
      id: session.playerId,
      nickname: session.nickname,
      currentWordIndex: 0,
      correctWords: 0,
      correctChars: 0,
      totalChars: 0,
      wpm: 0,
      accuracy: 100,
      isReady: false,
      isFinished: false,
      lastUpdate: Date.now(),
      currentStreak: 0,
      maxStreak: 0,
      attacksSent: 0,
      activeEffects: [],
      extraWordsAdded: 0,
    };
    this.roomState.players.set(session.playerId, player);

    this.sendToSocket(ws, {
      type: 'room_joined',
      roomId: this.roomState.roomId,
      roomCode: this.roomState.roomCode,
      players: [{ id: session.playerId, nickname: session.nickname, isReady: false }],
      settings: {
        wordCount: this.roomState.wordCount,
        language: this.roomState.language,
        difficulty: this.roomState.difficulty,
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
    const player: TypingPlayerState = {
      id: session.playerId,
      nickname: session.nickname,
      currentWordIndex: 0,
      correctWords: 0,
      correctChars: 0,
      totalChars: 0,
      wpm: 0,
      accuracy: 100,
      isReady: false,
      isFinished: false,
      lastUpdate: Date.now(),
      currentStreak: 0,
      maxStreak: 0,
      attacksSent: 0,
      activeEffects: [],
      extraWordsAdded: 0,
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
        wordCount: this.roomState.wordCount,
        language: this.roomState.language,
        difficulty: this.roomState.difficulty,
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

    // Reset all players
    for (const player of this.roomState.players.values()) {
      player.currentWordIndex = 0;
      player.correctWords = 0;
      player.correctChars = 0;
      player.totalChars = 0;
      player.wpm = 0;
      player.accuracy = 100;
      player.isFinished = false;
      player.finishTime = undefined;
      // Reset streak fields
      player.currentStreak = 0;
      player.maxStreak = 0;
      player.attacksSent = 0;
      player.activeEffects = [];
      player.extraWordsAdded = 0;
    }

    this.broadcast({
      type: 'game_start',
      seed: this.roomState.seed,
      wordCount: this.roomState.wordCount,
      language: this.roomState.language,
      difficulty: this.roomState.difficulty,
    });
  }

  private async handleWordComplete(session: WebSocketSession, data: {
    wordIndex: number;
    correct: boolean;
    wpm: number;
    accuracy: number;
    correctChars: number;
    totalChars: number;
  }): Promise<void> {
    const player = this.roomState.players.get(session.playerId);
    if (!player || this.roomState.gameStatus !== 'playing') return;

    player.currentWordIndex = data.wordIndex + 1;
    if (data.correct) player.correctWords++;
    player.wpm = data.wpm;
    player.accuracy = data.accuracy;
    player.correctChars = data.correctChars;
    player.totalChars = data.totalChars;
    player.lastUpdate = Date.now();

    // Handle streak system
    if (data.correct) {
      const previousStreak = player.currentStreak;
      player.currentStreak++;

      // Update max streak
      if (player.currentStreak > player.maxStreak) {
        player.maxStreak = player.currentStreak;
      }

      // Check for streak milestone attacks
      const attackInfo = STREAK_ATTACKS[player.currentStreak];
      if (attackInfo) {
        // Notify everyone about streak milestone
        this.broadcast({
          type: 'streak_milestone',
          playerId: session.playerId,
          streak: player.currentStreak,
        });

        // Send attack to opponent
        for (const [playerId, opponent] of this.roomState.players) {
          if (playerId !== session.playerId && !opponent.isFinished) {
            // Add effect to opponent
            if (attackInfo.duration) {
              opponent.activeEffects.push({
                type: attackInfo.type,
                expiresAt: Date.now() + attackInfo.duration,
              });
            } else {
              opponent.activeEffects.push({
                type: attackInfo.type,
              });
            }

            // Track extra words added
            if (attackInfo.type === 'addExtraWord') {
              opponent.extraWordsAdded++;
            }

            // Send attack message to opponent
            this.sendToPlayer(playerId, {
              type: 'streak_attack',
              attackType: attackInfo.type,
              duration: attackInfo.duration,
              senderId: session.playerId,
              senderStreak: player.currentStreak,
            });

            player.attacksSent++;
            break;
          }
        }
      }
    } else {
      // Streak broken
      if (player.currentStreak >= 3) {
        this.broadcast({
          type: 'streak_broken',
          playerId: session.playerId,
          previousStreak: player.currentStreak,
        });
      }
      player.currentStreak = 0;
    }

    this.broadcastExcept(session.playerId, {
      type: 'opponent_progress',
      id: session.playerId,
      wordIndex: player.currentWordIndex,
      wpm: player.wpm,
      accuracy: player.accuracy,
      streak: player.currentStreak,
    });
  }

  // Send message to specific player
  private sendToPlayer(playerId: string, message: TypingServerMessage): void {
    for (const [ws, session] of this.sessions) {
      if (session.playerId === playerId) {
        this.sendToSocket(ws, message);
        break;
      }
    }
  }

  private async handleGameFinished(session: WebSocketSession, data: {
    finalWpm: number;
    finalAccuracy: number;
    finishTime: number;
  }): Promise<void> {
    const player = this.roomState.players.get(session.playerId);
    if (!player || player.isFinished) return;

    player.isFinished = true;
    player.finishTime = data.finishTime;
    player.wpm = data.finalWpm;
    player.accuracy = data.finalAccuracy;

    this.broadcastExcept(session.playerId, {
      type: 'opponent_finished',
      id: session.playerId,
      finalWpm: data.finalWpm,
      finalAccuracy: data.finalAccuracy,
      finishTime: data.finishTime,
    });

    // Check if all players finished
    const allFinished = Array.from(this.roomState.players.values()).every(p => p.isFinished);
    if (allFinished) {
      this.endGame();
    }
  }

  private endGame(): void {
    this.roomState.gameStatus = 'finished';

    // Determine winner (fastest finish time, or highest WPM if same time)
    const players = Array.from(this.roomState.players.values());
    players.sort((a, b) => {
      if (a.finishTime && b.finishTime) {
        if (a.finishTime !== b.finishTime) return a.finishTime - b.finishTime;
      }
      return b.wpm - a.wpm; // Higher WPM wins if tie
    });

    const winner = players[0];
    this.roomState.winner = winner.id;

    const results = players.map(p => ({
      id: p.id,
      nickname: p.nickname,
      wpm: p.wpm,
      accuracy: p.accuracy,
      finishTime: p.finishTime,
      maxStreak: p.maxStreak,
      attacksSent: p.attacksSent,
    }));

    this.broadcast({
      type: 'game_end',
      winner: winner.id,
      winnerNickname: winner.nickname,
      results,
    });

    // Reset for rematch
    for (const p of this.roomState.players.values()) {
      p.isReady = false;
      p.currentStreak = 0;
      p.maxStreak = 0;
      p.attacksSent = 0;
      p.activeEffects = [];
      p.extraWordsAdded = 0;
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

      // If game was in progress, other player wins
      if (this.roomState.gameStatus === 'playing') {
        const remaining = Array.from(this.roomState.players.values())[0];
        if (remaining) {
          remaining.isFinished = true;
          remaining.finishTime = Date.now() - (this.roomState.startTime || Date.now());
          this.endGame();
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

  private sendToSocket(ws: WebSocket, message: TypingServerMessage): void {
    try {
      ws.send(JSON.stringify(message));
    } catch (e) {
      console.error('Failed to send message:', e);
    }
  }

  private broadcast(message: TypingServerMessage): void {
    for (const ws of this.sessions.keys()) {
      this.sendToSocket(ws, message);
    }
  }

  private broadcastExcept(excludePlayerId: string, message: TypingServerMessage): void {
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
