'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import {
  RotateCcw,
  Medal,
  Flag,
  Bomb,
  Timer,
  Swords,
  Award,
  HelpCircle,
} from 'lucide-react';
import {
  useMinesweeperGame,
  Difficulty,
  DIFFICULTIES,
  Cell,
  MinesweeperStats,
} from '@/hooks/useMinesweeperGame';
import { useMinesweeperLeaderboard } from '@/hooks/useMinesweeperLeaderboard';
import { useMinesweeperAchievements } from '@/hooks/useMinesweeperAchievements';
import type { GameAchievement } from '@/lib/game-achievements';
import { getSoundEngine } from '@/lib/sound-engine';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

// 遅延読み込みコンポーネント
const AchievementToast = dynamic(
  () => import('./AchievementToast').then(m => ({ default: m.AchievementToast })),
  { ssr: false }
);
const AuthModal = dynamic(
  () => import('@/components/auth/AuthModal').then(m => ({ default: m.AuthModal })),
  { ssr: false }
);
const BgmControl = dynamic(
  () => import('./BgmControl').then(m => ({ default: m.BgmControl })),
  { ssr: false, loading: () => <div className="w-24 h-9" /> }
);
const GameOverOverlay = dynamic(
  () => import('./minesweeper/GameOverOverlay').then(m => ({ default: m.GameOverOverlay })),
  { ssr: false }
);
const NicknameModal = dynamic(
  () => import('./minesweeper/NicknameModal').then(m => ({ default: m.NicknameModal })),
  { ssr: false }
);
const LeaderboardModal = dynamic(
  () => import('./minesweeper/LeaderboardModal').then(m => ({ default: m.LeaderboardModal })),
  { ssr: false }
);
const AchievementsModal = dynamic(
  () => import('./minesweeper/AchievementsModal').then(m => ({ default: m.AchievementsModal })),
  { ssr: false }
);
const HelpModal = dynamic(
  () => import('./minesweeper/HelpModal').then(m => ({ default: m.HelpModal })),
  { ssr: false }
);

// 難易度ラベル
const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: '初級',
  intermediate: '中級',
  expert: '上級',
};

// セルの数字の色
const NUMBER_COLORS: Record<number, string> = {
  1: 'text-blue-600',
  2: 'text-green-600',
  3: 'text-red-600',
  4: 'text-purple-800',
  5: 'text-amber-800',
  6: 'text-cyan-600',
  7: 'text-gray-800',
  8: 'text-gray-600',
};

// 顔の表情
const FACE_EMOJI: Record<string, string> = {
  idle: '🙂',
  playing: '🙂',
  won: '😎',
  lost: '😵',
  pressing: '😮',
};

interface MinesweeperGameProps {
  showBattleButton?: boolean;
}

export function MinesweeperGame({ showBattleButton = true }: MinesweeperGameProps) {
  const {
    board,
    difficulty,
    width,
    height: _height,
    mineCount: _mineCount,
    remainingMines,
    gameStatus,
    elapsedTime,
    newGame,
    revealCell,
    toggleFlag,
    chord,
    setDifficulty,
  } = useMinesweeperGame({
    onWin: handleWin,
    onLose: handleLose,
  });

  const {
    leaderboard,
    isLoading: leaderboardLoading,
    submitScore,
    fetchLeaderboard,
    period,
    setPeriod,
    difficulty: leaderboardDifficulty,
    setDifficulty: setLeaderboardDifficulty,
  } = useMinesweeperLeaderboard(difficulty);

  const { user, profile, getIdToken } = useAuth();
  const userNickname = profile?.displayName || profile?.email?.split('@')[0] || 'ゲスト';

  // 実績フック
  const showAchievementToast = useCallback((ach: GameAchievement) => {
    setAchievementQueue((prev) => [...prev, ach]);
  }, []);

  const {
    stats: _achievementStats,
    progress: achievementProgress,
    recordGameStart,
    recordGameClear,
    recordGameOver: recordAchievementGameOver,
    recordLargeFirstOpen,
    getAllAchievements,
  } = useMinesweeperAchievements({
    onAchievementUnlock: showAchievementToast,
  });

  // UI状態
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [pendingStats, setPendingStats] = useState<MinesweeperStats | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  const [achievementQueue, setAchievementQueue] = useState<GameAchievement[]>([]);
  const [currentAchievement, setCurrentAchievement] = useState<GameAchievement | null>(null);
  const [firstClickCells, setFirstClickCells] = useState(0);

  // Sound
  const soundEngineRef = useRef(getSoundEngine());
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 実績キュー処理
  useEffect(() => {
    if (achievementQueue.length > 0 && !currentAchievement) {
      setCurrentAchievement(achievementQueue[0]);
      setAchievementQueue((prev) => prev.slice(1));
    }
  }, [achievementQueue, currentAchievement]);

  // 勝利時の処理
  function handleWin(stats: MinesweeperStats) {
    soundEngineRef.current?.success();
    setPendingStats(stats);

    // 実績チェック
    const flagCount = board.flat().filter((c) => c.isFlagged).length;
    recordGameClear(stats.difficulty, stats.time, flagCount, DIFFICULTIES[stats.difficulty].mines);

    // 最初のクリックで大きく開いたか
    if (firstClickCells >= 8) {
      recordLargeFirstOpen(firstClickCells);
    }

    // ランキング登録可能か確認
    if (user) {
      setShowNicknameModal(true);
    }
  }

  // 敗北時の処理
  function handleLose() {
    soundEngineRef.current?.gameOver();
    recordAchievementGameOver();
  }

  // ゲーム開始時の処理
  useEffect(() => {
    if (gameStatus === 'playing') {
      recordGameStart();
      setFirstClickCells(0);
    }
  }, [gameStatus, recordGameStart]);

  // ランキング登録
  const handleSubmitScore = async () => {
    if (!pendingStats || !user || !profile) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const token = await getIdToken();
      const success = await submitScore({
        nickname: userNickname.slice(0, 20),
        time_seconds: pendingStats.time,
        difficulty: pendingStats.difficulty,
        token,
      });
      setShowNicknameModal(false);
      setPendingStats(null);
      // サーバー送信失敗時は最新データを再取得してからモーダルを開く
      if (!success) {
        await fetchLeaderboard(pendingStats.difficulty);
      }
      setShowLeaderboard(true);
    } catch (error) {
      console.error('Failed to submit score:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // セルクリック
  const handleCellClick = (x: number, y: number) => {
    if (gameStatus === 'won' || gameStatus === 'lost') return;
    soundEngineRef.current?.click();
    revealCell(x, y);
  };

  // 右クリック（フラグ）
  const handleCellRightClick = (e: React.MouseEvent, x: number, y: number) => {
    e.preventDefault();
    if (gameStatus === 'won' || gameStatus === 'lost') return;
    soundEngineRef.current?.click();
    toggleFlag(x, y);
  };

  // ダブルクリック（コード）
  const handleCellDoubleClick = (x: number, y: number) => {
    if (gameStatus === 'won' || gameStatus === 'lost') return;
    chord(x, y);
  };

  // モバイル用長押し
  const handleTouchStart = (x: number, y: number) => {
    longPressTimerRef.current = setTimeout(() => {
      soundEngineRef.current?.click();
      toggleFlag(x, y);
    }, 500);
    setIsPressing(true);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setIsPressing(false);
  };

  // セルサイズ計算
  const getCellSize = () => {
    if (typeof window === 'undefined') return 28;
    const containerPadding = window.innerWidth < 400 ? 16 : 32;
    const boardPadding = 8;
    const gaps = width - 1;
    const availableWidth = window.innerWidth - containerPadding - boardPadding - gaps;
    const maxCellSize = Math.floor(availableWidth / width);
    return Math.min(Math.max(maxCellSize, 10), 32);
  };

  const [cellSize, setCellSize] = useState(28);

  useEffect(() => {
    const updateSize = () => setCellSize(getCellSize());
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [width]);

  // セルの描画
  const iconSize = cellSize < 18 ? Math.max(cellSize - 4, 8) : 16;
  const fontSize = cellSize < 18 ? Math.max(cellSize - 6, 8) : 14;

  const renderCell = (cell: Cell, x: number, y: number) => {
    let content: React.ReactNode = null;
    let bgClass = 'bg-gray-300 hover:bg-gray-200';
    let borderClass = cellSize < 16
      ? 'border border-t-gray-100 border-l-gray-100 border-r-gray-400 border-b-gray-400'
      : 'border-t-2 border-l-2 border-gray-100 border-r-2 border-b-2 border-r-gray-400 border-b-gray-400';

    if (cell.isRevealed) {
      bgClass = 'bg-gray-200';
      borderClass = 'border border-gray-300';

      if (cell.isMine) {
        content = <Bomb style={{ width: iconSize, height: iconSize }} className="text-black" />;
        bgClass = 'bg-red-500';
      } else if (cell.adjacentMines > 0) {
        content = (
          <span className={`font-bold ${NUMBER_COLORS[cell.adjacentMines]}`} style={{ fontSize }}>
            {cell.adjacentMines}
          </span>
        );
      }
    } else if (cell.isFlagged) {
      content = <Flag style={{ width: iconSize, height: iconSize }} className="text-red-600 fill-red-600" />;
    }

    return (
      <button
        key={`${x}-${y}`}
        className={`flex items-center justify-center ${bgClass} ${borderClass} transition-colors select-none`}
        style={{ width: cellSize, height: cellSize }}
        onClick={() => handleCellClick(x, y)}
        onContextMenu={(e) => handleCellRightClick(e, x, y)}
        onDoubleClick={() => handleCellDoubleClick(x, y)}
        onTouchStart={() => handleTouchStart(x, y)}
        onTouchEnd={handleTouchEnd}
        onMouseDown={() => setIsPressing(true)}
        onMouseUp={() => setIsPressing(false)}
        onMouseLeave={() => setIsPressing(false)}
        disabled={cell.isRevealed && !cell.isMine}
      >
        {content}
      </button>
    );
  };

  // 時間フォーマット
  const formatTime = (seconds: number) => {
    return String(Math.min(seconds, 999)).padStart(3, '0');
  };

  return (
    <div className="flex flex-col items-center gap-4 p-2 sm:p-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between w-full max-w-md bg-gray-800 rounded-lg p-2 sm:p-3">
        {/* 残り地雷数 */}
        <div className="flex items-center gap-1 sm:gap-2 bg-black px-2 sm:px-3 py-1 rounded font-mono text-red-500 text-base sm:text-xl">
          <Bomb className="w-4 h-4 sm:w-5 sm:h-5" />
          {String(Math.max(remainingMines, 0)).padStart(3, '0')}
        </div>

        {/* 顔ボタン */}
        <button
          onClick={() => newGame()}
          className="text-2xl sm:text-3xl hover:scale-110 transition-transform"
        >
          {FACE_EMOJI[isPressing ? 'pressing' : gameStatus]}
        </button>

        {/* タイマー */}
        <div className="flex items-center gap-1 sm:gap-2 bg-black px-2 sm:px-3 py-1 rounded font-mono text-red-500 text-base sm:text-xl">
          <Timer className="w-4 h-4 sm:w-5 sm:h-5" />
          {formatTime(elapsedTime)}
        </div>
      </div>

      {/* 難易度選択とBGMコントロール */}
      <div className="flex items-center gap-4 flex-wrap justify-center">
        <div className="flex gap-2">
          {(Object.keys(DIFFICULTIES) as Difficulty[]).map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficulty(diff)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                difficulty === diff
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {DIFFICULTY_LABELS[diff]}
            </button>
          ))}
        </div>
        <BgmControl game="minesweeper" isPlaying={gameStatus === 'playing'} />
      </div>

      {/* ゲーム盤 */}
      <div
        className="bg-gray-400 p-1 rounded shadow-lg"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${width}, ${cellSize}px)`,
          gap: '1px',
        }}
      >
        {board.map((row, y) =>
          row.map((cell, x) => renderCell(cell, x, y))
        )}
      </div>

      {/* 上級モード小画面警告 */}
      {difficulty === 'expert' && cellSize < 16 && (
        <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
          横画面での操作を推奨します
        </p>
      )}

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
          onClick={() => {
            fetchLeaderboard();
            setShowLeaderboard(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg font-medium"
        >
          <Medal size={18} className="text-yellow-500" />
          ランキング
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAchievements(true)}
          className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg font-medium"
        >
          <Award size={18} />
          実績
          <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs">
            {achievementProgress.unlocked}/{achievementProgress.total}
          </span>
        </motion.button>

        {showBattleButton && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/games/minesweeper/battle"
              className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg font-medium"
            >
              <Swords size={18} />
              オンライン対戦
            </Link>
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowHelp(true)}
          className="p-2 bg-muted rounded-lg"
        >
          <HelpCircle size={18} />
        </motion.button>
      </div>

      {/* ゲームオーバー/勝利オーバーレイ */}
      {(gameStatus === 'won' || gameStatus === 'lost') && (
        <GameOverOverlay
          gameStatus={gameStatus}
          difficulty={difficulty}
          elapsedTime={elapsedTime}
          onNewGame={() => newGame()}
        />
      )}

      {/* ニックネームモーダル */}
      {showNicknameModal && (
        <NicknameModal
          show={showNicknameModal}
          difficulty={difficulty}
          pendingStats={pendingStats}
          user={user}
          userNickname={userNickname}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmitScore}
          onSkip={() => {
            setShowNicknameModal(false);
            setPendingStats(null);
          }}
          onLogin={() => {
            setShowNicknameModal(false);
            setShowAuthModal(true);
          }}
        />
      )}

      {/* リーダーボードモーダル */}
      {showLeaderboard && (
        <LeaderboardModal
          show={showLeaderboard}
          onClose={() => setShowLeaderboard(false)}
          difficulty={leaderboardDifficulty}
          leaderboard={leaderboard}
          leaderboardLoading={leaderboardLoading}
          period={period}
          onPeriodChange={setPeriod}
          onDifficultyChange={setLeaderboardDifficulty}
          onFetchLeaderboard={fetchLeaderboard}
        />
      )}

      {/* 認証モーダル */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

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
        <HelpModal
          show={showHelp}
          onClose={() => setShowHelp(false)}
        />
      )}

      {/* 実績トースト */}
      {currentAchievement && (
        <AchievementToast
          achievement={currentAchievement}
          onClose={() => setCurrentAchievement(null)}
        />
      )}

      {/* 遊び方 */}
      <div className="w-full max-w-md p-4 rounded-lg bg-muted/50 text-sm">
        <h3 className="font-bold mb-2">遊び方</h3>
        <ul className="space-y-1 text-muted-foreground">
          <li><strong>操作:</strong> クリックで開く / 右クリック・長押しでフラグ</li>
          <li><strong>ダブルクリック:</strong> 数字セル周囲を一括開示</li>
          <li><strong>目標:</strong> 地雷を踏まずにすべてのセルを開けよう</li>
        </ul>
      </div>
    </div>
  );
}
