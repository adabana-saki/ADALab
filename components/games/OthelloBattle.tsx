'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Timer } from 'lucide-react';
import type { Board, CellState } from '@/lib/othello-ai';
import type { GameResult } from '@/hooks/useOthelloBattle';

interface OthelloBattleProps {
  nickname: string;
  opponentNickname: string;
  board: Board;
  myColor: CellState;
  currentPlayer: CellState;
  blackCount: number;
  whiteCount: number;
  validMoves: [number, number][];
  timeRemaining: number;
  lastMove: { row: number; col: number; player: CellState; flips: [number, number][] } | null;
  winner: { id: string | null; nickname: string | null } | null;
  myPlayerId: string | null;
  results: GameResult[];
  passMessage: string | null;
  onMove: (row: number, col: number) => void;
  onLeave: () => void;
  onRematch: () => void;
}

export function OthelloBattle({
  nickname,
  opponentNickname,
  board,
  myColor,
  currentPlayer,
  blackCount,
  whiteCount,
  validMoves,
  timeRemaining,
  lastMove,
  winner,
  myPlayerId,
  results,
  passMessage,
  onMove,
  onLeave,
  onRematch,
}: OthelloBattleProps) {
  const isMyTurn = currentPlayer === myColor;
  const isFinished = !!winner;

  const validMoveSet = useMemo(
    () => new Set(validMoves.map(([r, c]) => `${r}-${c}`)),
    [validMoves]
  );
  const lastFlipSet = useMemo(
    () => new Set(lastMove?.flips.map(([r, c]) => `${r}-${c}`) || []),
    [lastMove]
  );

  // セルサイズ計算
  const getCellSize = () => {
    if (typeof window === 'undefined') return 40;
    const containerPadding = window.innerWidth < 400 ? 16 : 32;
    const boardPadding = 16;
    const gaps = 7 * 2;
    const availableWidth = Math.min(window.innerWidth, 500) - containerPadding - boardPadding - gaps;
    const maxCellSize = Math.floor(availableWidth / 8);
    return Math.min(Math.max(maxCellSize, 28), 48);
  };

  const [cellSize, setCellSize] = useState(40);

  useEffect(() => {
    const updateSize = () => setCellSize(getCellSize());
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const pieceSize = Math.max(cellSize - 10, 18);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleCellClick = (row: number, col: number) => {
    if (!isMyTurn || isFinished) return;
    if (!validMoveSet.has(`${row}-${col}`)) return;
    onMove(row, col);
  };

  const myResult = results.find(r => r.id === myPlayerId);
  const isWinner = myResult?.status === 'won';
  const isDraw = myResult?.status === 'draw';

  const myPieceStyle = myColor === 1
    ? { background: 'radial-gradient(circle at 35% 35%, #555, #111)' }
    : { background: 'radial-gradient(circle at 35% 35%, #fff, #ccc)' };
  const opponentPieceStyle = myColor === 1
    ? { background: 'radial-gradient(circle at 35% 35%, #fff, #ccc)' }
    : { background: 'radial-gradient(circle at 35% 35%, #555, #111)' };

  return (
    <div className="flex flex-col items-center gap-3 p-2 sm:p-4 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-md">
        <button
          onClick={onLeave}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          退出
        </button>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Timer size={14} />
          <span className={timeRemaining <= 60 ? 'text-red-500 font-bold' : ''}>
            {formatTime(timeRemaining)}
          </span>
        </div>
      </div>

      {/* プレイヤー情報 */}
      <div className="flex items-center justify-between w-full max-w-md bg-gray-800 rounded-lg p-2 sm:p-3">
        {/* 自分 */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
          isMyTurn && !isFinished ? 'bg-green-900/50 ring-2 ring-green-400' : ''
        }`}>
          <div className="rounded-full" style={{ width: 18, height: 18, ...myPieceStyle }} />
          <div className="text-left">
            <div className="text-white font-bold text-sm sm:text-base">
              {myColor === 1 ? blackCount : whiteCount}
            </div>
            <div className="text-gray-400 text-xs truncate max-w-[60px] sm:max-w-[80px]">
              {nickname}
            </div>
          </div>
        </div>

        {/* VS / ステータス */}
        <div className="text-center px-2">
          {isFinished ? (
            <span className="text-sm font-bold text-yellow-400">
              {isDraw ? '引き分け' : isWinner ? 'WIN!' : 'LOSE'}
            </span>
          ) : (
            <span className={`text-sm font-medium ${
              isMyTurn ? 'text-green-400' : 'text-gray-400'
            }`}>
              {isMyTurn ? 'あなたの番' : '相手の番'}
            </span>
          )}
        </div>

        {/* 相手 */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
          !isMyTurn && !isFinished ? 'bg-green-900/50 ring-2 ring-green-400' : ''
        }`}>
          <div className="text-right">
            <div className="text-white font-bold text-sm sm:text-base">
              {myColor === 1 ? whiteCount : blackCount}
            </div>
            <div className="text-gray-400 text-xs truncate max-w-[60px] sm:max-w-[80px]">
              {opponentNickname}
            </div>
          </div>
          <div className="rounded-full" style={{ width: 18, height: 18, ...opponentPieceStyle }} />
        </div>
      </div>

      {/* パス通知 */}
      <AnimatePresence>
        {passMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-yellow-400 bg-yellow-400/10 px-4 py-2 rounded-lg"
          >
            {passMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ゲーム盤 */}
      <div
        className="rounded-lg shadow-lg overflow-hidden"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(8, ${cellSize}px)`,
          gap: '2px',
          backgroundColor: '#1a5c25',
          padding: '2px',
        }}
      >
        {board.map((row, r) =>
          row.map((cell, c) => {
            const isValid = validMoveSet.has(`${r}-${c}`);
            const isLast = lastMove && lastMove.row === r && lastMove.col === c;
            const isFlipped = lastFlipSet.has(`${r}-${c}`);

            return (
              <button
                key={`${r}-${c}`}
                className={`flex items-center justify-center transition-all duration-150 ${
                  isValid && isMyTurn ? 'cursor-pointer hover:bg-green-500' : 'cursor-default'
                } ${isLast ? 'ring-2 ring-yellow-400 ring-inset' : ''}`}
                style={{
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: isValid && isMyTurn ? '#2d8c3c' : '#278535',
                }}
                onClick={() => handleCellClick(r, c)}
                disabled={!isValid || !isMyTurn || isFinished}
              >
                {cell === 1 && (
                  <motion.div
                    initial={isFlipped ? { rotateY: 180, scale: 0.5 } : { scale: 0 }}
                    animate={{ rotateY: 0, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-full shadow-md"
                    style={{
                      width: pieceSize,
                      height: pieceSize,
                      background: 'radial-gradient(circle at 35% 35%, #555, #111)',
                    }}
                  />
                )}
                {cell === 2 && (
                  <motion.div
                    initial={isFlipped ? { rotateY: 180, scale: 0.5 } : { scale: 0 }}
                    animate={{ rotateY: 0, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-full shadow-md"
                    style={{
                      width: pieceSize,
                      height: pieceSize,
                      background: 'radial-gradient(circle at 35% 35%, #fff, #ccc)',
                    }}
                  />
                )}
                {cell === 0 && isValid && isMyTurn && (
                  <div
                    className="rounded-full bg-black/25"
                    style={{
                      width: pieceSize * 0.35,
                      height: pieceSize * 0.35,
                    }}
                  />
                )}
              </button>
            );
          })
        )}
      </div>

      {/* ゲーム終了オーバーレイ */}
      <AnimatePresence>
        {isFinished && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-6xl mb-4">
                {isDraw ? '🤝' : isWinner ? '🎉' : '😵'}
              </div>
              <h2 className="text-2xl font-bold mb-2">
                {isDraw ? '引き分け' : isWinner ? '勝利！' : '敗北...'}
              </h2>
              <p className="text-muted-foreground mb-4">
                {isDraw
                  ? '互角の戦いでした'
                  : isWinner
                    ? `${opponentNickname}に勝ちました！`
                    : `${opponentNickname}に負けました`}
              </p>

              {/* スコア */}
              <div className="flex items-center justify-center gap-3 text-2xl font-bold mb-6">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full" style={{ background: 'radial-gradient(circle at 35% 35%, #555, #111)' }} />
                  <span>{blackCount}</span>
                </div>
                <span className="text-muted-foreground">-</span>
                <div className="flex items-center gap-1.5">
                  <span>{whiteCount}</span>
                  <div className="w-5 h-5 rounded-full border border-gray-300" style={{ background: 'radial-gradient(circle at 35% 35%, #fff, #ccc)' }} />
                </div>
              </div>

              {/* 結果一覧 */}
              {results.length > 0 && (
                <div className="space-y-2 mb-6">
                  {results.map((r) => (
                    <div
                      key={r.id}
                      className={`flex items-center justify-between p-2 rounded-lg ${
                        r.status === 'won' ? 'bg-yellow-500/10' : r.status === 'draw' ? 'bg-blue-500/10' : 'bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{
                            background: r.color === 1
                              ? 'radial-gradient(circle at 35% 35%, #555, #111)'
                              : 'radial-gradient(circle at 35% 35%, #fff, #ccc)',
                          }}
                        />
                        <span className="text-sm font-medium">{r.nickname}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{r.pieces}枚</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          r.status === 'won' ? 'bg-yellow-500 text-yellow-950' :
                          r.status === 'draw' ? 'bg-blue-500 text-white' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {r.status === 'won' ? 'WIN' : r.status === 'draw' ? 'DRAW' : 'LOSE'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 justify-center flex-wrap">
                <button
                  onClick={onRematch}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium"
                >
                  <RotateCcw className="w-5 h-5" />
                  もう一度
                </button>
                <button
                  onClick={onLeave}
                  className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg font-medium"
                >
                  <ArrowLeft className="w-5 h-5" />
                  ロビーに戻る
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
