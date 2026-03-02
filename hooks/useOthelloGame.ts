'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Board,
  CellState,
  Difficulty,
  createInitialBoard,
  getValidMoves,
  getFlips,
  applyMove,
  countPieces,
  getAIMove,
} from '@/lib/othello-ai';

export type { Board, CellState, Difficulty } from '@/lib/othello-ai';

export type GameStatus = 'idle' | 'playing' | 'won' | 'lost' | 'draw';

export interface OthelloGameState {
  board: Board;
  currentPlayer: CellState; // 1=黒(人間), 2=白(AI)
  gameStatus: GameStatus;
  blackCount: number;
  whiteCount: number;
  validMoves: [number, number][];
  lastMove: [number, number] | null;
  lastFlips: [number, number][];
  difficulty: Difficulty;
  isAIThinking: boolean;
  passCount: number;
}

interface UseOthelloGameOptions {
  onWin?: () => void;
  onLose?: () => void;
  onDraw?: () => void;
}

export function useOthelloGame(options: UseOthelloGameOptions = {}) {
  const [board, setBoard] = useState<Board>(createInitialBoard);
  const [currentPlayer, setCurrentPlayer] = useState<CellState>(1);
  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const [difficulty, setDifficultyState] = useState<Difficulty>('normal');
  const [lastMove, setLastMove] = useState<[number, number] | null>(null);
  const [lastFlips, setLastFlips] = useState<[number, number][]>([]);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [passCount, setPassCount] = useState(0);

  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const pieces = countPieces(board);
  const validMoves = currentPlayer === 1 && gameStatus === 'playing'
    ? getValidMoves(board, 1)
    : [];

  // ゲーム終了判定
  const checkGameEnd = useCallback((b: Board) => {
    const blackMoves = getValidMoves(b, 1);
    const whiteMoves = getValidMoves(b, 2);

    if (blackMoves.length === 0 && whiteMoves.length === 0) {
      const { black, white } = countPieces(b);
      if (black > white) {
        setGameStatus('won');
        optionsRef.current.onWin?.();
      } else if (white > black) {
        setGameStatus('lost');
        optionsRef.current.onLose?.();
      } else {
        setGameStatus('draw');
        optionsRef.current.onDraw?.();
      }
      return true;
    }
    return false;
  }, []);

  // AI の手番を実行
  const executeAIMove = useCallback((b: Board, diff: Difficulty, consecutivePasses: number) => {
    setIsAIThinking(true);

    // AIの思考にわずかな遅延を入れてUXを改善
    const delay = diff === 'hard' ? 200 : 100;
    aiTimerRef.current = setTimeout(() => {
      const aiMoves = getValidMoves(b, 2);

      if (aiMoves.length === 0) {
        // AIパス
        const newPassCount = consecutivePasses + 1;
        setPassCount(newPassCount);
        if (newPassCount >= 2) {
          // 連続パス2回 → ゲーム終了
          checkGameEnd(b);
          setIsAIThinking(false);
          return;
        }
        // 人間のターンに戻す
        setCurrentPlayer(1);
        setIsAIThinking(false);
        return;
      }

      const move = getAIMove(b, 2, diff);
      if (!move) {
        setCurrentPlayer(1);
        setIsAIThinking(false);
        return;
      }

      const [r, c] = move;
      const flips = getFlips(b, r, c, 2);
      const newBoard = applyMove(b, r, c, 2);

      setBoard(newBoard);
      setLastMove([r, c]);
      setLastFlips(flips);
      setPassCount(0);

      if (checkGameEnd(newBoard)) {
        setIsAIThinking(false);
        return;
      }

      // 人間に有効手があるかチェック
      const humanMoves = getValidMoves(newBoard, 1);
      if (humanMoves.length === 0) {
        // 人間パス → AIがもう一回
        setPassCount(1);
        setIsAIThinking(false);
        // 次のAIターンをスケジュール
        setTimeout(() => {
          executeAIMove(newBoard, diff, 1);
        }, 300);
        return;
      }

      setCurrentPlayer(1);
      setIsAIThinking(false);
    }, delay);
  }, [checkGameEnd]);

  // 人間が駒を置く
  const placePiece = useCallback((row: number, col: number) => {
    if (gameStatus !== 'playing' && gameStatus !== 'idle') return false;
    if (currentPlayer !== 1) return false;
    if (isAIThinking) return false;

    const currentBoard = board;
    const flips = getFlips(currentBoard, row, col, 1);
    if (flips.length === 0) return false;

    // ゲーム開始
    const newStatus = gameStatus === 'idle' ? 'playing' : gameStatus;
    if (newStatus !== gameStatus) setGameStatus('playing');

    const newBoard = applyMove(currentBoard, row, col, 1);
    setBoard(newBoard);
    setLastMove([row, col]);
    setLastFlips(flips);
    setPassCount(0);

    if (checkGameEnd(newBoard)) return true;

    // AIのターン
    setCurrentPlayer(2);
    executeAIMove(newBoard, difficulty, 0);
    return true;
  }, [board, gameStatus, currentPlayer, isAIThinking, difficulty, checkGameEnd, executeAIMove]);

  // 新しいゲーム
  const newGame = useCallback((diff?: Difficulty) => {
    if (aiTimerRef.current) {
      clearTimeout(aiTimerRef.current);
      aiTimerRef.current = null;
    }
    const d = diff ?? difficulty;
    setDifficultyState(d);
    setBoard(createInitialBoard());
    setCurrentPlayer(1);
    setGameStatus('idle');
    setLastMove(null);
    setLastFlips([]);
    setIsAIThinking(false);
    setPassCount(0);
  }, [difficulty]);

  // 難易度変更
  const setDifficulty = useCallback((diff: Difficulty) => {
    newGame(diff);
  }, [newGame]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (aiTimerRef.current) {
        clearTimeout(aiTimerRef.current);
      }
    };
  }, []);

  return {
    board,
    currentPlayer,
    gameStatus,
    blackCount: pieces.black,
    whiteCount: pieces.white,
    validMoves,
    lastMove,
    lastFlips,
    difficulty,
    isAIThinking,
    passCount,
    placePiece,
    newGame,
    setDifficulty,
  };
}
