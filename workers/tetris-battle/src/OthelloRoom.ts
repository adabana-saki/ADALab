import { DurableObject } from 'cloudflare:workers';

// ===== リバーシ盤面ロジック（サーバー側） =====

type CellState = 0 | 1 | 2; // 0=空, 1=黒, 2=白
type Board = CellState[][];

const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
] as const;

function createInitialBoard(): Board {
  const board: Board = Array.from({ length: 8 }, () => Array(8).fill(0) as CellState[]);
  board[3][3] = 2;
  board[3][4] = 1;
  board[4][3] = 1;
  board[4][4] = 2;
  return board;
}

function isInBounds(r: number, c: number): boolean {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function getFlips(board: Board, row: number, col: number, player: CellState): [number, number][] {
  if (!isInBounds(row, col) || board[row][col] !== 0) return [];
  const opponent = player === 1 ? 2 : 1;
  const allFlips: [number, number][] = [];

  for (const [dr, dc] of DIRECTIONS) {
    const flips: [number, number][] = [];
    let r = row + dr;
    let c = col + dc;
    while (isInBounds(r, c) && board[r][c] === opponent) {
      flips.push([r, c]);
      r += dr;
      c += dc;
    }
    if (flips.length > 0 && isInBounds(r, c) && board[r][c] === player) {
      allFlips.push(...flips);
    }
  }
  return allFlips;
}

function getValidMoves(board: Board, player: CellState): [number, number][] {
  const moves: [number, number][] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (getFlips(board, r, c, player).length > 0) {
        moves.push([r, c]);
      }
    }
  }
  return moves;
}

function applyMove(board: Board, row: number, col: number, player: CellState): Board {
  const newBoard = board.map(r => [...r]) as Board;
  const flips = getFlips(board, row, col, player);
  newBoard[row][col] = player;
  for (const [fr, fc] of flips) {
    newBoard[fr][fc] = player;
  }
  return newBoard;
}

function countPieces(board: Board): { black: number; white: number } {
  let black = 0;
  let white = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === 1) black++;
      else if (board[r][c] === 2) white++;
    }
  }
  return { black, white };
}

// ===== Durable Object =====

interface PlayerState {
  id: string;
  nickname: string;
  isReady: boolean;
  color: CellState; // 1=黒, 2=白
}

type RoomStatus = 'waiting' | 'countdown' | 'playing' | 'finished';

interface RoomState {
  roomId: string;
  roomCode: string;
  status: RoomStatus;
  board: Board;
  currentPlayer: CellState; // 1 or 2
  timeLimit: number;
  startTime: number | null;
  winner: string | null;
  winnerNickname: string | null;
}

interface WebSocketSession {
  playerId: string;
  nickname: string;
  ws: WebSocket;
}

// クライアント → サーバー
type ClientMessage =
  | { type: 'create_room'; nickname: string }
  | { type: 'join'; nickname: string; roomCode?: string }
  | { type: 'ready' }
  | { type: 'unready' }
  | { type: 'move'; row: number; col: number }
  | { type: 'leave' }
  | { type: 'ping' };

// サーバー → クライアント
type ServerMessage =
  | { type: 'room_joined'; roomId: string; roomCode: string; players: PlayerInfo[]; yourColor: CellState }
  | { type: 'player_joined'; player: PlayerInfo }
  | { type: 'player_left'; playerId: string }
  | { type: 'player_ready'; playerId: string; isReady: boolean }
  | { type: 'countdown'; seconds: number }
  | { type: 'game_start'; board: Board; yourColor: CellState; currentPlayer: CellState }
  | { type: 'move_made'; row: number; col: number; player: CellState; flips: [number, number][]; board: Board; currentPlayer: CellState; blackCount: number; whiteCount: number; validMoves: [number, number][] }
  | { type: 'player_passed'; player: CellState; currentPlayer: CellState; validMoves: [number, number][] }
  | { type: 'game_end'; winner: string | null; winnerNickname: string | null; reason: string; blackCount: number; whiteCount: number; results: Array<{ id: string; nickname: string; color: CellState; pieces: number; status: 'won' | 'lost' | 'draw' }> }
  | { type: 'time_update'; remaining: number }
  | { type: 'error'; message: string }
  | { type: 'pong' };

interface PlayerInfo {
  id: string;
  nickname: string;
  isReady: boolean;
  color: CellState;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type Env = {};

export class OthelloRoom extends DurableObject<Env> {
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
      board: createInitialBoard(),
      currentPlayer: 1,
      timeLimit: 600, // 10分
      startTime: null,
      winner: null,
      winnerNickname: null,
    };
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.headers.get('Upgrade') === 'websocket') {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      this.ctx.acceptWebSocket(server);
      return new Response(null, { status: 101, webSocket: client });
    }

    if (url.pathname.endsWith('/init')) {
      const roomCode = url.searchParams.get('roomCode');
      if (roomCode) {
        this.roomState.roomCode = roomCode;
        this.roomState.roomId = roomCode;
      }
      return new Response(JSON.stringify({ success: true, roomId: this.roomState.roomId }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (url.pathname.endsWith('/info')) {
      return new Response(
        JSON.stringify({
          roomId: this.roomState.roomId,
          roomCode: this.roomState.roomCode,
          status: this.roomState.status,
          playerCount: this.players.size,
          gameStatus: this.roomState.status,
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
      case 'create_room':
        await this.handleJoin(ws, message.nickname);
        break;
      case 'join':
        await this.handleJoin(ws, message.nickname, message.roomCode);
        break;
      case 'ready':
        this.handleReady(ws, true);
        break;
      case 'unready':
        this.handleReady(ws, false);
        break;
      case 'move':
        this.handleMove(ws, message.row, message.col);
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
    if (roomCode && roomCode !== this.roomState.roomCode) {
      this.send(ws, { type: 'error', message: 'Invalid room code' });
      return;
    }

    if (this.players.size >= 2) {
      this.send(ws, { type: 'error', message: 'Room is full' });
      return;
    }

    if (this.roomState.status !== 'waiting') {
      this.send(ws, { type: 'error', message: 'Game already started' });
      return;
    }

    const playerId = crypto.randomUUID();
    // 最初のプレイヤーは黒(1)、2番目は白(2)
    const color: CellState = this.players.size === 0 ? 1 : 2;

    const player: PlayerState = {
      id: playerId,
      nickname,
      isReady: false,
      color,
    };

    this.players.set(playerId, player);
    this.sessions.set(ws, { playerId, nickname, ws });

    this.send(ws, {
      type: 'room_joined',
      roomId: this.roomState.roomId,
      roomCode: this.roomState.roomCode,
      players: this.getPlayerInfoList(),
      yourColor: color,
    });

    this.broadcastExcept(ws, {
      type: 'player_joined',
      player: { id: playerId, nickname, isReady: false, color },
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

    if (this.players.size === 2 && this.areAllPlayersReady()) {
      this.startCountdown();
    }
  }

  private handleMove(ws: WebSocket, row: number, col: number): void {
    const session = this.sessions.get(ws);
    if (!session || this.roomState.status !== 'playing') return;

    const player = this.players.get(session.playerId);
    if (!player) return;

    // ターンチェック
    if (player.color !== this.roomState.currentPlayer) {
      this.send(ws, { type: 'error', message: 'Not your turn' });
      return;
    }

    // 範囲チェック
    if (!isInBounds(row, col)) {
      this.send(ws, { type: 'error', message: 'Invalid position' });
      return;
    }

    // 有効手チェック
    const flips = getFlips(this.roomState.board, row, col, player.color);
    if (flips.length === 0) {
      this.send(ws, { type: 'error', message: 'Invalid move' });
      return;
    }

    // 手を適用
    this.roomState.board = applyMove(this.roomState.board, row, col, player.color);
    const pieces = countPieces(this.roomState.board);

    // 次のプレイヤーを決定
    const nextPlayer: CellState = player.color === 1 ? 2 : 1;
    const nextMoves = getValidMoves(this.roomState.board, nextPlayer);
    const currentMoves = getValidMoves(this.roomState.board, player.color);

    if (nextMoves.length > 0) {
      // 相手に有効手あり → 相手のターン
      this.roomState.currentPlayer = nextPlayer;

      // 各プレイヤーに自分視点のvalidMovesを送信
      for (const [sessionWs, sess] of this.sessions.entries()) {
        const p = this.players.get(sess.playerId);
        if (!p) continue;
        const myValidMoves = p.color === nextPlayer ? nextMoves : [];
        this.send(sessionWs, {
          type: 'move_made',
          row,
          col,
          player: player.color,
          flips,
          board: this.roomState.board,
          currentPlayer: nextPlayer,
          blackCount: pieces.black,
          whiteCount: pieces.white,
          validMoves: myValidMoves,
        });
      }
    } else if (currentMoves.length > 0) {
      // 相手に有効手なし、自分にはある → 相手パス、自分が続行
      this.roomState.currentPlayer = player.color;

      // まずmove_madeを送信
      for (const [sessionWs, sess] of this.sessions.entries()) {
        const p = this.players.get(sess.playerId);
        if (!p) continue;
        const myValidMoves = p.color === player.color ? currentMoves : [];
        this.send(sessionWs, {
          type: 'move_made',
          row,
          col,
          player: player.color,
          flips,
          board: this.roomState.board,
          currentPlayer: player.color,
          blackCount: pieces.black,
          whiteCount: pieces.white,
          validMoves: myValidMoves,
        });
      }

      // パス通知
      for (const [sessionWs, sess] of this.sessions.entries()) {
        const p = this.players.get(sess.playerId);
        if (!p) continue;
        const myValidMoves = p.color === player.color ? currentMoves : [];
        this.send(sessionWs, {
          type: 'player_passed',
          player: nextPlayer,
          currentPlayer: player.color,
          validMoves: myValidMoves,
        });
      }
    } else {
      // 両者に有効手なし → ゲーム終了
      // まずmove_madeを送信
      this.broadcast({
        type: 'move_made',
        row,
        col,
        player: player.color,
        flips,
        board: this.roomState.board,
        currentPlayer: 0 as CellState,
        blackCount: pieces.black,
        whiteCount: pieces.white,
        validMoves: [],
      });

      this.endGame(pieces);
      return;
    }
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
    this.broadcast({ type: 'player_left', playerId });

    if (this.roomState.status === 'playing') {
      const remainingPlayer = Array.from(this.players.values())[0];
      if (remainingPlayer) {
        const pieces = countPieces(this.roomState.board);
        this.endGameWithWinner(remainingPlayer.id, remainingPlayer.nickname, 'opponent_left', pieces);
      }
    }

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
    this.roomState.board = createInitialBoard();
    this.roomState.currentPlayer = 1; // 黒先手

    const initialMoves = getValidMoves(this.roomState.board, 1);

    // 各プレイヤーに色と盤面を送信
    for (const [ws, session] of this.sessions.entries()) {
      const player = this.players.get(session.playerId);
      if (!player) continue;
      this.send(ws, {
        type: 'game_start',
        board: this.roomState.board,
        yourColor: player.color,
        currentPlayer: 1,
      });
      // 黒プレイヤーにvalidMovesも送信（初手のため）
      if (player.color === 1) {
        this.send(ws, {
          type: 'move_made',
          row: -1,
          col: -1,
          player: 0 as CellState,
          flips: [],
          board: this.roomState.board,
          currentPlayer: 1,
          blackCount: 2,
          whiteCount: 2,
          validMoves: initialMoves,
        });
      }
    }

    // タイマー開始
    this.gameInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.roomState.startTime!) / 1000);
      const remaining = this.roomState.timeLimit - elapsed;

      if (remaining <= 0) {
        this.handleTimeout();
      } else if (remaining <= 60 || remaining % 30 === 0) {
        this.broadcast({ type: 'time_update', remaining });
      }
    }, 1000);
  }

  private handleTimeout(): void {
    this.clearGameInterval();
    const pieces = countPieces(this.roomState.board);
    this.endGame(pieces);
  }

  private endGame(pieces: { black: number; white: number }): void {
    const players = Array.from(this.players.values());
    const blackPlayer = players.find(p => p.color === 1);
    const whitePlayer = players.find(p => p.color === 2);

    if (pieces.black > pieces.white && blackPlayer) {
      this.endGameWithWinner(blackPlayer.id, blackPlayer.nickname, 'more_pieces', pieces);
    } else if (pieces.white > pieces.black && whitePlayer) {
      this.endGameWithWinner(whitePlayer.id, whitePlayer.nickname, 'more_pieces', pieces);
    } else {
      // 引き分け
      this.endGameWithWinner(null, null, 'draw', pieces);
    }
  }

  private endGameWithWinner(
    winnerId: string | null,
    winnerNickname: string | null,
    reason: string,
    pieces: { black: number; white: number }
  ): void {
    this.clearGameInterval();

    this.roomState.status = 'finished';
    this.roomState.winner = winnerId;
    this.roomState.winnerNickname = winnerNickname;

    const results: Array<{ id: string; nickname: string; color: CellState; pieces: number; status: 'won' | 'lost' | 'draw' }> = [];
    for (const player of this.players.values()) {
      const myPieces = player.color === 1 ? pieces.black : pieces.white;
      let status: 'won' | 'lost' | 'draw';
      if (winnerId === null) {
        status = 'draw';
      } else if (player.id === winnerId) {
        status = 'won';
      } else {
        status = 'lost';
      }
      results.push({
        id: player.id,
        nickname: player.nickname,
        color: player.color,
        pieces: myPieces,
        status,
      });
    }

    this.broadcast({
      type: 'game_end',
      winner: winnerId,
      winnerNickname,
      reason,
      blackCount: pieces.black,
      whiteCount: pieces.white,
      results,
    });

    // リマッチ用にリセット
    for (const player of this.players.values()) {
      player.isReady = false;
    }
    this.roomState.status = 'waiting';
    this.roomState.board = createInitialBoard();
    this.roomState.currentPlayer = 1;
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
    return Array.from(this.players.values()).map(p => ({
      id: p.id,
      nickname: p.nickname,
      isReady: p.isReady,
      color: p.color,
    }));
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
    for (const [ws] of this.sessions.entries()) {
      if (ws !== excludeWs) {
        this.send(ws, message);
      }
    }
  }
}
