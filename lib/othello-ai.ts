/**
 * リバーシ AI ロジック
 * Easy: ランダム / Normal: 位置評価ヒューリスティック / Hard: Minimax + αβ枝刈り
 */

export type CellState = 0 | 1 | 2; // 0=空, 1=黒, 2=白
export type Board = CellState[][];
export type Difficulty = 'easy' | 'normal' | 'hard';

const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
] as const;

// 位置評価マトリクス（Normal/Hard共通）
const POSITION_WEIGHTS = [
  [100, -20,  10,   5,   5,  10, -20, 100],
  [-20, -40,  -5,  -5,  -5,  -5, -40, -20],
  [ 10,  -5,   4,   2,   2,   4,  -5,  10],
  [  5,  -5,   2,   1,   1,   2,  -5,   5],
  [  5,  -5,   2,   1,   1,   2,  -5,   5],
  [ 10,  -5,   4,   2,   2,   4,  -5,  10],
  [-20, -40,  -5,  -5,  -5,  -5, -40, -20],
  [100, -20,  10,   5,   5,  10, -20, 100],
];

export function createInitialBoard(): Board {
  const board: Board = Array.from({ length: 8 }, () => Array(8).fill(0) as CellState[]);
  board[3][3] = 2; // 白
  board[3][4] = 1; // 黒
  board[4][3] = 1; // 黒
  board[4][4] = 2; // 白
  return board;
}

function isInBounds(r: number, c: number): boolean {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

/** 指定位置に駒を置いた場合に反転できる駒のリストを返す */
export function getFlips(board: Board, row: number, col: number, player: CellState): [number, number][] {
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

/** プレイヤーの有効手一覧を返す */
export function getValidMoves(board: Board, player: CellState): [number, number][] {
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

/** 盤面に駒を配置して反転を適用し、新しい盤面を返す */
export function applyMove(board: Board, row: number, col: number, player: CellState): Board {
  const newBoard = board.map(r => [...r]) as Board;
  const flips = getFlips(board, row, col, player);
  newBoard[row][col] = player;
  for (const [fr, fc] of flips) {
    newBoard[fr][fc] = player;
  }
  return newBoard;
}

/** 駒数を数える */
export function countPieces(board: Board): { black: number; white: number } {
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

// ===== AI =====

/** Easy: ランダムに有効手を選択 */
function aiEasy(board: Board, player: CellState): [number, number] | null {
  const moves = getValidMoves(board, player);
  if (moves.length === 0) return null;
  return moves[Math.floor(Math.random() * moves.length)];
}

/** Normal: 位置評価 + 反転枚数 */
function aiNormal(board: Board, player: CellState): [number, number] | null {
  const moves = getValidMoves(board, player);
  if (moves.length === 0) return null;

  let bestScore = -Infinity;
  let bestMove = moves[0];

  for (const [r, c] of moves) {
    const flips = getFlips(board, r, c, player);
    const score = POSITION_WEIGHTS[r][c] + flips.length * 2;
    if (score > bestScore) {
      bestScore = score;
      bestMove = [r, c];
    }
  }
  return bestMove;
}

/** Hard: Minimax + αβ枝刈り */
function evaluate(board: Board, player: CellState): number {
  const opponent = player === 1 ? 2 : 1;
  let score = 0;

  // 位置評価
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === player) score += POSITION_WEIGHTS[r][c];
      else if (board[r][c] === opponent) score -= POSITION_WEIGHTS[r][c];
    }
  }

  // 角占有ボーナス
  const corners: [number, number][] = [[0, 0], [0, 7], [7, 0], [7, 7]];
  for (const [cr, cc] of corners) {
    if (board[cr][cc] === player) score += 50;
    else if (board[cr][cc] === opponent) score -= 50;
  }

  // 機動力（有効手数）
  const myMoves = getValidMoves(board, player).length;
  const oppMoves = getValidMoves(board, opponent).length;
  score += (myMoves - oppMoves) * 5;

  // 駒差（終盤重視）
  const { black, white } = countPieces(board);
  const total = black + white;
  const myPieces = player === 1 ? black : white;
  const oppPieces = player === 1 ? white : black;
  if (total > 50) {
    score += (myPieces - oppPieces) * 3;
  }

  return score;
}

function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  player: CellState,
  opponent: CellState,
): number {
  const moves = getValidMoves(board, isMaximizing ? player : opponent);
  const oppMoves = getValidMoves(board, isMaximizing ? opponent : player);

  if (depth === 0 || (moves.length === 0 && oppMoves.length === 0)) {
    return evaluate(board, player);
  }

  if (moves.length === 0) {
    // パス
    return minimax(board, depth - 1, alpha, beta, !isMaximizing, player, opponent);
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const [r, c] of moves) {
      const newBoard = applyMove(board, r, c, player);
      const eval_ = minimax(newBoard, depth - 1, alpha, beta, false, player, opponent);
      maxEval = Math.max(maxEval, eval_);
      alpha = Math.max(alpha, eval_);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const [r, c] of moves) {
      const newBoard = applyMove(board, r, c, opponent);
      const eval_ = minimax(newBoard, depth - 1, alpha, beta, true, player, opponent);
      minEval = Math.min(minEval, eval_);
      beta = Math.min(beta, eval_);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function aiHard(board: Board, player: CellState): [number, number] | null {
  const moves = getValidMoves(board, player);
  if (moves.length === 0) return null;

  const opponent: CellState = player === 1 ? 2 : 1;
  let bestScore = -Infinity;
  let bestMove = moves[0];

  // 残りマス数に応じてdepthを調整
  const { black, white } = countPieces(board);
  const empty = 64 - black - white;
  const depth = empty <= 12 ? Math.min(empty, 10) : 5;

  for (const [r, c] of moves) {
    const newBoard = applyMove(board, r, c, player);
    const score = minimax(newBoard, depth - 1, -Infinity, Infinity, false, player, opponent);
    if (score > bestScore) {
      bestScore = score;
      bestMove = [r, c];
    }
  }
  return bestMove;
}

/** AI手を取得 */
export function getAIMove(board: Board, player: CellState, difficulty: Difficulty): [number, number] | null {
  switch (difficulty) {
    case 'easy':
      return aiEasy(board, player);
    case 'normal':
      return aiNormal(board, player);
    case 'hard':
      return aiHard(board, player);
  }
}
