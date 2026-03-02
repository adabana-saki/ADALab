'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { RotateCcw, HelpCircle, Award } from 'lucide-react';
import { useOthelloGame, Difficulty, CellState } from '@/hooks/useOthelloGame';
import { useOthelloAchievements } from '@/hooks/useOthelloAchievements';
import type { GameAchievement } from '@/lib/game-achievements';
import { getSoundEngine } from '@/lib/sound-engine';

const AchievementToast = dynamic(
  () => import('./AchievementToast').then((m) => ({ default: m.AchievementToast })),
  { ssr: false }
);
const BgmControl = dynamic(
  () => import('./BgmControl').then((m) => ({ default: m.BgmControl })),
  { ssr: false, loading: () => <div className="w-24 h-9" /> }
);
const GameOverOverlay = dynamic(
  () => import('./othello/GameOverOverlay').then((m) => ({ default: m.GameOverOverlay })),
  { ssr: false }
);
const HelpModal = dynamic(
  () => import('./othello/HelpModal').then((m) => ({ default: m.HelpModal })),
  { ssr: false }
);
const AchievementsModal = dynamic(
  () => import('./othello/AchievementsModal').then((m) => ({ default: m.AchievementsModal })),
  { ssr: false }
);

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'かんたん',
  normal: 'ふつう',
  hard: 'むずかしい',
};

export function OthelloGame() {
  const soundEngineRef = useRef(getSoundEngine());
  const [showHelp, setShowHelp] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [achievementQueue, setAchievementQueue] = useState<GameAchievement[]>([]);
  const [currentAchievement, setCurrentAchievement] = useState<GameAchievement | null>(null);

  // 実績フック
  const showAchievementToast = useCallback((ach: GameAchievement) => {
    setAchievementQueue((prev) => [...prev, ach]);
  }, []);

  const {
    progress: achievementProgress,
    recordGameStart,
    recordGameWin,
    recordGameLoss,
    recordGameDraw,
    getAllAchievements,
  } = useOthelloAchievements({
    onAchievementUnlock: showAchievementToast,
  });

  // 実績キュー処理
  useEffect(() => {
    if (achievementQueue.length > 0 && !currentAchievement) {
      setCurrentAchievement(achievementQueue[0]);
      setAchievementQueue((prev) => prev.slice(1));
    }
  }, [achievementQueue, currentAchievement]);

  const difficultyRef = useRef<Difficulty>('normal');

  const handleWin = useCallback(({ allCorners, wasLosingBy10 }: { allCorners: boolean; wasLosingBy10: boolean }) => {
    soundEngineRef.current?.success();
    // recordGameWin is called in effect based on gameStatus change
    // but we need difficulty and board info, so store in ref and call from effect
    winInfoRef.current = { allCorners, wasLosingBy10 };
  }, []);

  const handleLose = useCallback(() => {
    soundEngineRef.current?.gameOver();
  }, []);

  const handleDraw = useCallback(() => {
    soundEngineRef.current?.success();
  }, []);

  const winInfoRef = useRef<{ allCorners: boolean; wasLosingBy10: boolean } | null>(null);

  const {
    board,
    currentPlayer,
    gameStatus,
    blackCount,
    whiteCount,
    validMoves,
    lastMove,
    lastFlips,
    difficulty,
    isAIThinking,
    placePiece,
    newGame,
    setDifficulty,
  } = useOthelloGame({
    onWin: handleWin,
    onLose: handleLose,
    onDraw: handleDraw,
  });

  // difficulty の ref を最新に保つ
  difficultyRef.current = difficulty;

  // ゲーム開始時の処理
  useEffect(() => {
    if (gameStatus === 'playing') {
      recordGameStart();
    }
  }, [gameStatus, recordGameStart]);

  // ゲーム終了時の実績記録
  const prevGameStatusRef = useRef(gameStatus);
  useEffect(() => {
    const prev = prevGameStatusRef.current;
    prevGameStatusRef.current = gameStatus;

    if (prev === 'playing' || prev === 'idle') {
      if (gameStatus === 'won') {
        const info = winInfoRef.current;
        recordGameWin(
          difficultyRef.current,
          blackCount,
          whiteCount,
          info?.allCorners ?? false,
          info?.wasLosingBy10 ?? false
        );
        winInfoRef.current = null;
      } else if (gameStatus === 'lost') {
        recordGameLoss();
      } else if (gameStatus === 'draw') {
        recordGameDraw();
      }
    }
  }, [gameStatus, blackCount, whiteCount, recordGameWin, recordGameLoss, recordGameDraw]);

  // 有効手のセットを高速ルックアップ用に作成
  const validMoveSet = new Set(validMoves.map(([r, c]) => `${r}-${c}`));
  const lastFlipSet = new Set(lastFlips.map(([r, c]) => `${r}-${c}`));

  // セルサイズ計算
  const getCellSize = () => {
    if (typeof window === 'undefined') return 48;
    const containerPadding = window.innerWidth < 400 ? 16 : 32;
    const boardPadding = 16;
    const gaps = 7 * 2; // 7 gaps, 2px each
    const availableWidth = Math.min(window.innerWidth, 600) - containerPadding - boardPadding - gaps;
    const maxCellSize = Math.floor(availableWidth / 8);
    return Math.min(Math.max(maxCellSize, 32), 56);
  };

  const [cellSize, setCellSize] = useState(48);

  useEffect(() => {
    const updateSize = () => setCellSize(getCellSize());
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleCellClick = (row: number, col: number) => {
    if (!validMoveSet.has(`${row}-${col}`)) return;
    soundEngineRef.current?.click();
    placePiece(row, col);
  };

  const statusText = () => {
    if (gameStatus === 'idle') return 'クリックで開始';
    if (gameStatus === 'won') return '勝利！';
    if (gameStatus === 'lost') return '敗北...';
    if (gameStatus === 'draw') return '引き分け';
    if (isAIThinking) return 'AI思考中...';
    if (currentPlayer === 1) return 'あなたの番';
    return '相手の番';
  };

  const pieceSize = Math.max(cellSize - 12, 20);

  const renderCell = (cellValue: CellState, row: number, col: number) => {
    const isValid = validMoveSet.has(`${row}-${col}`);
    const isLast = lastMove && lastMove[0] === row && lastMove[1] === col;
    const isFlipped = lastFlipSet.has(`${row}-${col}`);

    return (
      <button
        key={`${row}-${col}`}
        className={`flex items-center justify-center transition-all duration-150 ${
          isValid ? 'cursor-pointer hover:bg-green-500' : 'cursor-default'
        } ${isLast ? 'ring-2 ring-yellow-400 ring-inset' : ''}`}
        style={{
          width: cellSize,
          height: cellSize,
          backgroundColor: isValid ? '#2d8c3c' : '#278535',
        }}
        onClick={() => handleCellClick(row, col)}
        disabled={!isValid}
      >
        {cellValue === 1 && (
          <motion.div
            initial={isFlipped ? { rotateY: 180, scale: 0.5 } : { scale: 0 }}
            animate={{ rotateY: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="rounded-full bg-gray-900 shadow-md"
            style={{
              width: pieceSize,
              height: pieceSize,
              background: 'radial-gradient(circle at 35% 35%, #555, #111)',
            }}
          />
        )}
        {cellValue === 2 && (
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
        {cellValue === 0 && isValid && (
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
  };

  return (
    <div className="flex flex-col items-center gap-4 p-2 sm:p-4">
      {/* スコアバー */}
      <div className="flex items-center justify-between w-full max-w-md bg-gray-800 rounded-lg p-2 sm:p-3">
        {/* 黒 (人間) */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
          currentPlayer === 1 && gameStatus === 'playing' ? 'bg-green-900/50 ring-2 ring-green-400' : ''
        }`}>
          <div
            className="rounded-full"
            style={{
              width: 20,
              height: 20,
              background: 'radial-gradient(circle at 35% 35%, #555, #111)',
            }}
          />
          <span className="text-white font-bold text-lg sm:text-xl">{blackCount}</span>
        </div>

        {/* ステータス */}
        <div className="text-center">
          <span className={`text-sm sm:text-base font-medium ${
            isAIThinking ? 'text-yellow-400 animate-pulse' : 'text-gray-300'
          }`}>
            {statusText()}
          </span>
        </div>

        {/* 白 (AI) */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
          currentPlayer === 2 && gameStatus === 'playing' ? 'bg-green-900/50 ring-2 ring-green-400' : ''
        }`}>
          <span className="text-white font-bold text-lg sm:text-xl">{whiteCount}</span>
          <div
            className="rounded-full"
            style={{
              width: 20,
              height: 20,
              background: 'radial-gradient(circle at 35% 35%, #fff, #ccc)',
            }}
          />
        </div>
      </div>

      {/* 難易度選択とBGMコントロール */}
      <div className="flex items-center gap-4 flex-wrap justify-center">
        <div className="flex gap-2">
          {(['easy', 'normal', 'hard'] as Difficulty[]).map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficulty(diff)}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                difficulty === diff
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {DIFFICULTY_LABELS[diff]}
            </button>
          ))}
        </div>
        <BgmControl game="othello" isPlaying={gameStatus === 'playing'} />
      </div>

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
          row.map((cell, c) => renderCell(cell, r, c))
        )}
      </div>

      {/* コントロールボタン */}
      <div className="flex gap-2 flex-wrap justify-center max-w-md w-full">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => newGame()}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium"
        >
          <RotateCcw size={18} />
          <span className="hidden sm:inline">新しいゲーム</span>
          <span className="sm:hidden">リセット</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAchievements(true)}
          className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg font-medium"
        >
          <Award size={18} />
          <span className="hidden sm:inline">実績</span>
          <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs">
            {achievementProgress.unlocked}/{achievementProgress.total}
          </span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowHelp(true)}
          className="p-2 bg-muted rounded-lg"
        >
          <HelpCircle size={18} />
        </motion.button>
      </div>

      {/* ゲームオーバーオーバーレイ */}
      {(gameStatus === 'won' || gameStatus === 'lost' || gameStatus === 'draw') && (
        <GameOverOverlay
          gameStatus={gameStatus}
          difficulty={difficulty}
          blackCount={blackCount}
          whiteCount={whiteCount}
          onNewGame={() => newGame()}
        />
      )}

      {/* 実績モーダル */}
      {showAchievements && (
        <AchievementsModal
          show={showAchievements}
          onClose={() => setShowAchievements(false)}
          achievementProgress={achievementProgress}
          achievements={getAllAchievements()}
        />
      )}

      {/* ヘルプモーダル */}
      {showHelp && (
        <HelpModal show={showHelp} onClose={() => setShowHelp(false)} />
      )}

      {/* 実績トースト */}
      {currentAchievement && (
        <AchievementToast
          achievement={currentAchievement}
          onClose={() => setCurrentAchievement(null)}
        />
      )}
    </div>
  );
}
