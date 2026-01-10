import { DurableObject } from 'cloudflare:workers';

// 難易度設定
type Difficulty = 'beginner' | 'intermediate' | 'expert';

const DIFFICULTIES: Record<Difficulty, { width: number; height: number; mines: number }> = {
  beginner: { width: 9, height: 9, mines: 10 },
  intermediate: { width: 16, height: 16, mines: 40 },
  expert: { width: 30, height: 16, mines: 99 },
};

// プレイヤー状態
interface PlayerState {
  id: string;
  nickname: string;
  isReady: boolean;
  isAlive: boolean;
  revealedCount: number;
  flaggedCount: number;
  finishTime: number | null;
  lastUpdate: number;
}

// ルーム状態
type RoomStatus = 'waiting' | 'countdown' | 'playing' | 'finished';

interface RoomState {
  roomId: string;
  roomCode: string;
  status: RoomStatus;
  seed: number;
  difficulty: Difficulty;
  timeLimit: number; // 秒
  startTime: number | null;
  endTime: number | null;
  winner: string | null;
  winnerNickname: string | null;
}

// WebSocketセッション
interface WebSocketSession {
  playerId: string;
  nickname: string;
  ws: WebSocket;
}

// クライアント → サーバー メッセージ
type ClientMessage =
  | { type: 'join'; nickname: string; roomCode?: string }
  | { type: 'ready' }
  | { type: 'unready' }
  | { type: 'progress'; revealed: number; flagged: number }
  | { type: 'finished'; time: number }
  | { type: 'lost' }
  | { type: 'leave' }
  | { type: 'ping' };

// サーバー → クライアント メッセージ
type ServerMessage =
  | { type: 'room_joined'; roomId: string; roomCode: string; players: PlayerInfo[]; settings: GameSettings }
  | { type: 'player_joined'; player: PlayerInfo }
  | { type: 'player_left'; playerId: string }
  | { type: 'player_ready'; playerId: string; isReady: boolean }
  | { type: 'countdown'; seconds: number }
  | { type: 'game_start'; seed: number; settings: GameSettings }
  | { type: 'opponent_progress'; playerId: string; revealed: number; flagged: number }
  | { type: 'opponent_lost'; playerId: string }
  | { type: 'opponent_finished'; playerId: string; time: number }
  | { type: 'game_end'; winner: string; winnerNickname: string; reason: string; times: Record<string, number | null> }
  | { type: 'time_update'; remaining: number }
  | { type: 'error'; message: string }
  | { type: 'pong' };

interface PlayerInfo {
  id: string;
  nickname: string;
  isReady: boolean;
}

interface GameSettings {
  difficulty: Difficulty;
  timeLimit: number;
  width: number;
  height: number;
  mines: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type Env = {
  // D1 database binding (if needed)
};

export class MinesweeperRoom extends DurableObject<Env> {
  private sessions: Map<WebSocket, WebSocketSession> = new Map();
  private players: Map<string, PlayerState> = new Map();
  private roomState: RoomState;
  private countdownInterval: ReturnType<typeof setInterval> | null = null;
  private gameInterval: ReturnType<typeof setInterval> | null = null;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.roomState = {
      roomId: '',
      roomCode: '',
      status: 'waiting',
      seed: 0,
      difficulty: 'beginner',
      timeLimit: 300, // 5分
      startTime: null,
      endTime: null,
      winner: null,
      winnerNickname: null,
    };
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // WebSocket接続
    if (request.headers.get('Upgrade') === 'websocket') {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      this.ctx.acceptWebSocket(server);

      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }

    // REST: ルーム初期化
    if (url.pathname.endsWith('/init') && request.method === 'POST') {
      const body = await request.json() as { roomCode: string; difficulty?: Difficulty; timeLimit?: number };
      this.roomState.roomId = this.ctx.id.toString();
      this.roomState.roomCode = body.roomCode;
      this.roomState.difficulty = body.difficulty || 'beginner';
      this.roomState.timeLimit = body.timeLimit || 300;
      this.roomState.seed = Math.floor(Math.random() * 2147483647);

      return new Response(JSON.stringify({ success: true, roomId: this.roomState.roomId }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // REST: ルーム情報取得
    if (url.pathname.endsWith('/info')) {
      return new Response(
        JSON.stringify({
          roomId: this.roomState.roomId,
          roomCode: this.roomState.roomCode,
          status: this.roomState.status,
          playerCount: this.players.size,
          settings: this.getGameSettings(),
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response('Not found', { status: 404 });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    try {
      const data: ClientMessage = JSON.parse(message as string);
      await this.handleMessage(ws, data);
    } catch (error) {
      console.error('WebSocket message error:', error);
      this.send(ws, { type: 'error', message: 'Invalid message format' });
    }
  }

  async webSocketClose(ws: WebSocket): Promise<void> {
    const session = this.sessions.get(ws);
    if (session) {
      this.handlePlayerLeave(session.playerId);
      this.sessions.delete(ws);
    }
  }

  async webSocketError(ws: WebSocket, error: unknown): Promise<void> {
    console.error('WebSocket error:', error);
    const session = this.sessions.get(ws);
    if (session) {
      this.handlePlayerLeave(session.playerId);
      this.sessions.delete(ws);
    }
  }

  private async handleMessage(ws: WebSocket, message: ClientMessage): Promise<void> {
    switch (message.type) {
      case 'join':
        await this.handleJoin(ws, message.nickname, message.roomCode);
        break;
      case 'ready':
        this.handleReady(ws, true);
        break;
      case 'unready':
        this.handleReady(ws, false);
        break;
      case 'progress':
        this.handleProgress(ws, message.revealed, message.flagged);
        break;
      case 'finished':
        this.handleFinished(ws, message.time);
        break;
      case 'lost':
        this.handleLost(ws);
        break;
      case 'leave':
        this.handleLeave(ws);
        break;
      case 'ping':
        this.send(ws, { type: 'pong' });
        break;
    }
  }

  private async handleJoin(ws: WebSocket, nickname: string, roomCode?: string): Promise<void> {
    // ルームコード確認
    if (roomCode && roomCode !== this.roomState.roomCode) {
      this.send(ws, { type: 'error', message: 'Invalid room code' });
      return;
    }

    // 満員チェック
    if (this.players.size >= 2) {
      this.send(ws, { type: 'error', message: 'Room is full' });
      return;
    }

    // ゲーム中は参加不可
    if (this.roomState.status !== 'waiting') {
      this.send(ws, { type: 'error', message: 'Game already started' });
      return;
    }

    const playerId = crypto.randomUUID();
    const player: PlayerState = {
      id: playerId,
      nickname,
      isReady: false,
      isAlive: true,
      revealedCount: 0,
      flaggedCount: 0,
      finishTime: null,
      lastUpdate: Date.now(),
    };

    this.players.set(playerId, player);
    this.sessions.set(ws, { playerId, nickname, ws });

    // 参加者に通知
    this.send(ws, {
      type: 'room_joined',
      roomId: this.roomState.roomId,
      roomCode: this.roomState.roomCode,
      players: this.getPlayerInfoList(),
      settings: this.getGameSettings(),
    });

    // 他のプレイヤーに通知
    this.broadcastExcept(ws, {
      type: 'player_joined',
      player: { id: playerId, nickname, isReady: false },
    });
  }

  private handleReady(ws: WebSocket, isReady: boolean): void {
    const session = this.sessions.get(ws);
    if (!session) return;

    const player = this.players.get(session.playerId);
    if (!player) return;

    player.isReady = isReady;

    this.broadcast({
      type: 'player_ready',
      playerId: session.playerId,
      isReady,
    });

    // 全員準備完了でカウントダウン開始
    if (this.players.size === 2 && this.areAllPlayersReady()) {
      this.startCountdown();
    }
  }

  private handleProgress(ws: WebSocket, revealed: number, flagged: number): void {
    const session = this.sessions.get(ws);
    if (!session || this.roomState.status !== 'playing') return;

    const player = this.players.get(session.playerId);
    if (!player || !player.isAlive) return;

    player.revealedCount = revealed;
    player.flaggedCount = flagged;
    player.lastUpdate = Date.now();

    // 相手に進捗を通知
    this.broadcastExcept(ws, {
      type: 'opponent_progress',
      playerId: session.playerId,
      revealed,
      flagged,
    });
  }

  private handleFinished(ws: WebSocket, time: number): void {
    const session = this.sessions.get(ws);
    if (!session || this.roomState.status !== 'playing') return;

    const player = this.players.get(session.playerId);
    if (!player || !player.isAlive) return;

    player.finishTime = time;

    // 相手に通知
    this.broadcastExcept(ws, {
      type: 'opponent_finished',
      playerId: session.playerId,
      time,
    });

    // 勝利判定
    this.checkWinner();
  }

  private handleLost(ws: WebSocket): void {
    const session = this.sessions.get(ws);
    if (!session || this.roomState.status !== 'playing') return;

    const player = this.players.get(session.playerId);
    if (!player) return;

    player.isAlive = false;

    // 相手に通知
    this.broadcastExcept(ws, {
      type: 'opponent_lost',
      playerId: session.playerId,
    });

    // 勝利判定
    this.checkWinner();
  }

  private handleLeave(ws: WebSocket): void {
    const session = this.sessions.get(ws);
    if (!session) return;

    this.handlePlayerLeave(session.playerId);
    this.sessions.delete(ws);
    ws.close();
  }

  private handlePlayerLeave(playerId: string): void {
    const player = this.players.get(playerId);
    if (!player) return;

    this.players.delete(playerId);

    this.broadcast({
      type: 'player_left',
      playerId,
    });

    // ゲーム中なら相手の勝利
    if (this.roomState.status === 'playing') {
      const remainingPlayer = Array.from(this.players.values())[0];
      if (remainingPlayer) {
        this.endGame(remainingPlayer.id, remainingPlayer.nickname, 'opponent_left');
      }
    }

    // カウントダウン中ならキャンセル
    if (this.roomState.status === 'countdown') {
      this.cancelCountdown();
    }
  }

  private startCountdown(): void {
    this.roomState.status = 'countdown';
    let seconds = 3;

    this.broadcast({ type: 'countdown', seconds });

    this.countdownInterval = setInterval(() => {
      seconds--;
      if (seconds > 0) {
        this.broadcast({ type: 'countdown', seconds });
      } else {
        this.clearCountdownInterval();
        this.startGame();
      }
    }, 1000);
  }

  private cancelCountdown(): void {
    this.clearCountdownInterval();
    this.roomState.status = 'waiting';
  }

  private clearCountdownInterval(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  private startGame(): void {
    this.roomState.status = 'playing';
    this.roomState.startTime = Date.now();

    // プレイヤー状態をリセット
    for (const player of this.players.values()) {
      player.isAlive = true;
      player.revealedCount = 0;
      player.flaggedCount = 0;
      player.finishTime = null;
    }

    this.broadcast({
      type: 'game_start',
      seed: this.roomState.seed,
      settings: this.getGameSettings(),
    });

    // タイマー開始
    this.gameInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.roomState.startTime!) / 1000);
      const remaining = this.roomState.timeLimit - elapsed;

      if (remaining <= 0) {
        this.handleTimeout();
      } else if (remaining <= 60 || remaining % 30 === 0) {
        // 残り1分以下または30秒ごとに通知
        this.broadcast({ type: 'time_update', remaining });
      }
    }, 1000);
  }

  private handleTimeout(): void {
    this.clearGameInterval();

    // タイムアウト時の勝者決定
    // クリアした人がいればその人の勝ち
    // いなければ開示数が多い人の勝ち
    const players = Array.from(this.players.values());
    const finished = players.filter((p) => p.finishTime !== null);

    if (finished.length > 0) {
      // クリアした人がいる場合、タイムが短い方の勝ち
      finished.sort((a, b) => (a.finishTime || Infinity) - (b.finishTime || Infinity));
      this.endGame(finished[0].id, finished[0].nickname, 'fastest_clear');
    } else {
      // 誰もクリアしていない場合、開示数が多い方の勝ち
      players.sort((a, b) => b.revealedCount - a.revealedCount);
      if (players[0].revealedCount > players[1]?.revealedCount) {
        this.endGame(players[0].id, players[0].nickname, 'most_revealed');
      } else {
        // 同点の場合は引き分け（最初のプレイヤーを勝者とする）
        this.endGame(players[0].id, players[0].nickname, 'timeout_draw');
      }
    }
  }

  private checkWinner(): void {
    const players = Array.from(this.players.values());
    const alive = players.filter((p) => p.isAlive);
    const finished = players.filter((p) => p.finishTime !== null);

    // 一人だけ生存で、もう一人が失格
    if (alive.length === 1 && players.length === 2) {
      const alivePlayer = alive[0];
      const deadPlayer = players.find((p) => !p.isAlive);
      if (deadPlayer) {
        this.endGame(alivePlayer.id, alivePlayer.nickname, 'opponent_exploded');
        return;
      }
    }

    // 両方クリアした場合、タイムが短い方の勝ち
    if (finished.length === 2) {
      finished.sort((a, b) => (a.finishTime || Infinity) - (b.finishTime || Infinity));
      this.endGame(finished[0].id, finished[0].nickname, 'fastest_clear');
      return;
    }

    // 一人だけクリアで、もう一人がまだプレイ中
    if (finished.length === 1 && alive.length === 2) {
      // まだ待つ（もう一人もクリアするかもしれない）
      return;
    }
  }

  private endGame(winnerId: string, winnerNickname: string, reason: string): void {
    this.clearGameInterval();

    this.roomState.status = 'finished';
    this.roomState.endTime = Date.now();
    this.roomState.winner = winnerId;
    this.roomState.winnerNickname = winnerNickname;

    const times: Record<string, number | null> = {};
    for (const player of this.players.values()) {
      times[player.id] = player.finishTime;
    }

    this.broadcast({
      type: 'game_end',
      winner: winnerId,
      winnerNickname,
      reason,
      times,
    });
  }

  private clearGameInterval(): void {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
      this.gameInterval = null;
    }
  }

  private areAllPlayersReady(): boolean {
    for (const player of this.players.values()) {
      if (!player.isReady) return false;
    }
    return true;
  }

  private getPlayerInfoList(): PlayerInfo[] {
    return Array.from(this.players.values()).map((p) => ({
      id: p.id,
      nickname: p.nickname,
      isReady: p.isReady,
    }));
  }

  private getGameSettings(): GameSettings {
    const diff = DIFFICULTIES[this.roomState.difficulty];
    return {
      difficulty: this.roomState.difficulty,
      timeLimit: this.roomState.timeLimit,
      width: diff.width,
      height: diff.height,
      mines: diff.mines,
    };
  }

  private send(ws: WebSocket, message: ServerMessage): void {
    try {
      ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }

  private broadcast(message: ServerMessage): void {
    for (const session of this.sessions.values()) {
      this.send(session.ws, message);
    }
  }

  private broadcastExcept(excludeWs: WebSocket, message: ServerMessage): void {
    for (const [ws, session] of this.sessions.entries()) {
      if (ws !== excludeWs) {
        this.send(session.ws, message);
      }
    }
  }
}
