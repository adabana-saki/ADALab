'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCcw,
  Trophy,
  Flag,
  Bomb,
  Timer,
  X,
  Share2,
  Twitter,
  Link as LinkIcon,
  Check,
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
import { useMinesweeperLeaderboard, LeaderboardPeriod, LEADERBOARD_PERIOD_LABELS } from '@/hooks/useMinesweeperLeaderboard';
import { useMinesweeperAchievements } from '@/hooks/useMinesweeperAchievements';
import { AchievementToast } from './AchievementToast';
import { BgmControl } from './BgmControl';
import type { GameAchievement } from '@/lib/game-achievements';
import { getSoundEngine } from '@/lib/sound-engine';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import Link from 'next/link';

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
  } = useMinesweeperLeaderboard(difficulty);

  const { user, profile: _profile, getIdToken } = useAuth();

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
  const [nickname, setNickname] = useState('');
  const [pendingStats, setPendingStats] = useState<MinesweeperStats | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [achievementQueue, setAchievementQueue] = useState<GameAchievement[]>([]);
  const [currentAchievement, setCurrentAchievement] = useState<GameAchievement | null>(null);
  const [firstClickCells, setFirstClickCells] = useState(0);

  // Sound
  const soundEngineRef = useRef(getSoundEngine());
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ニックネーム初期化
  useEffect(() => {
    const savedNickname = localStorage.getItem('minesweeper_nickname');
    if (savedNickname) {
      setNickname(savedNickname);
    }
  }, []);

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
    if (!pendingStats || !nickname.trim()) return;
    if (isSubmitting) return;

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await getIdToken();
      await submitScore({
        nickname: nickname.trim(),
        time_seconds: pendingStats.time,
        difficulty: pendingStats.difficulty,
        token,
      });
      localStorage.setItem('minesweeper_nickname', nickname.trim());
      setShowNicknameModal(false);
      setPendingStats(null);
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

  // シェア
  const shareToTwitter = () => {
    const time = elapsedTime;
    const text = `マインスイーパー ${DIFFICULTY_LABELS[difficulty]} を ${time}秒 でクリア！\n\n#ADALab #マインスイーパー`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent('https://adalabtech.com/games/minesweeper')}`;
    window.open(url, '_blank');
    setShowShareMenu(false);
  };

  const copyToClipboard = () => {
    const time = elapsedTime;
    const text = `マインスイーパー ${DIFFICULTY_LABELS[difficulty]} を ${time}秒 でクリア！\nhttps://adalabtech.com/games/minesweeper`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // セルサイズ計算
  const getCellSize = () => {
    if (typeof window === 'undefined') return 28;
    const maxWidth = Math.min(window.innerWidth - 32, 600);
    const maxCellSize = Math.floor(maxWidth / width) - 2;
    return Math.min(Math.max(maxCellSize, 20), 32);
  };

  const [cellSize, setCellSize] = useState(28);

  useEffect(() => {
    const updateSize = () => setCellSize(getCellSize());
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [width]);

  // セルの描画
  const renderCell = (cell: Cell, x: number, y: number) => {
    let content: React.ReactNode = null;
    let bgClass = 'bg-gray-300 hover:bg-gray-200';
    let borderClass = 'border-t-2 border-l-2 border-gray-100 border-r-2 border-b-2 border-r-gray-400 border-b-gray-400';

    if (cell.isRevealed) {
      bgClass = 'bg-gray-200';
      borderClass = 'border border-gray-300';

      if (cell.isMine) {
        content = <Bomb className="w-4 h-4 text-black" />;
        bgClass = 'bg-red-500';
      } else if (cell.adjacentMines > 0) {
        content = (
          <span className={`font-bold text-sm ${NUMBER_COLORS[cell.adjacentMines]}`}>
            {cell.adjacentMines}
          </span>
        );
      }
    } else if (cell.isFlagged) {
      content = <Flag className="w-4 h-4 text-red-600 fill-red-600" />;
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
    <div className="flex flex-col items-center gap-4 p-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between w-full max-w-md bg-gray-800 rounded-lg p-3">
        {/* 残り地雷数 */}
        <div className="flex items-center gap-2 bg-black px-3 py-1 rounded font-mono text-red-500 text-xl">
          <Bomb className="w-5 h-5" />
          {String(Math.max(remainingMines, 0)).padStart(3, '0')}
        </div>

        {/* 顔ボタン */}
        <button
          onClick={() => newGame()}
          className="text-3xl hover:scale-110 transition-transform"
        >
          {FACE_EMOJI[isPressing ? 'pressing' : gameStatus]}
        </button>

        {/* タイマー */}
        <div className="flex items-center gap-2 bg-black px-3 py-1 rounded font-mono text-red-500 text-xl">
          <Timer className="w-5 h-5" />
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
                  : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
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

      {/* コントロールボタン */}
      <div className="flex gap-2 flex-wrap justify-center">
        <button
          onClick={() => newGame()}
          className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
        >
          <RotateCcw className="w-4 h-4" />
          New Game
        </button>

        <button
          onClick={() => setShowLeaderboard(true)}
          className="flex items-center gap-2 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
        >
          <Trophy className="w-4 h-4" />
          ランキング
        </button>

        <button
          onClick={() => setShowAchievements(true)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Award className="w-4 h-4" />
          実績
          <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">
            {achievementProgress.unlocked}/{achievementProgress.total}
          </span>
        </button>

        {showBattleButton && (
          <Link
            href="/games/minesweeper/battle"
            className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
          >
            <Swords className="w-4 h-4" />
            オンライン対戦
          </Link>
        )}

        <button
          onClick={() => setShowHelp(true)}
          className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* ゲームオーバー/勝利オーバーレイ */}
      <AnimatePresence>
        {(gameStatus === 'won' || gameStatus === 'lost') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => {}}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full mx-4 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              {gameStatus === 'won' ? (
                <>
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="text-2xl font-bold mb-2">クリア！</h2>
                  <p className="text-lg text-muted-foreground mb-4">
                    {DIFFICULTY_LABELS[difficulty]} を {elapsedTime}秒 でクリア
                  </p>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4">💥</div>
                  <h2 className="text-2xl font-bold mb-2">ゲームオーバー</h2>
                  <p className="text-lg text-muted-foreground mb-4">
                    地雷を踏んでしまいました...
                  </p>
                </>
              )}

              <div className="flex gap-3 justify-center flex-wrap">
                <button
                  onClick={() => newGame()}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <RotateCcw className="w-5 h-5" />
                  もう一度
                </button>

                {gameStatus === 'won' && (
                  <div className="relative">
                    <button
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Share2 className="w-5 h-5" />
                      シェア
                    </button>

                    {showShareMenu && (
                      <div className="absolute top-full mt-2 right-0 bg-white dark:bg-gray-700 rounded-lg shadow-lg p-2 min-w-[150px]">
                        <button
                          onClick={shareToTwitter}
                          className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                        >
                          <Twitter className="w-4 h-4" />
                          Twitter
                        </button>
                        <button
                          onClick={copyToClipboard}
                          className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                        >
                          {copied ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <LinkIcon className="w-4 h-4" />
                          )}
                          {copied ? 'コピー完了' : 'リンクをコピー'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ニックネームモーダル */}
      <AnimatePresence>
        {showNicknameModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full mx-4"
            >
              <h3 className="text-xl font-bold mb-4 text-center">ランキング登録</h3>
              <p className="text-sm text-muted-foreground mb-4 text-center">
                {DIFFICULTY_LABELS[difficulty]} - {pendingStats?.time}秒
              </p>

              {!user ? (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    ランキングに登録するにはログインが必要です
                  </p>
                  <button
                    onClick={() => {
                      setShowNicknameModal(false);
                      setShowAuthModal(true);
                    }}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
                  >
                    ログイン
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="ニックネーム"
                    maxLength={20}
                    className="w-full px-4 py-2 border rounded-lg mb-4 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => {
                        setShowNicknameModal(false);
                        setPendingStats(null);
                      }}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={handleSubmitScore}
                      disabled={!nickname.trim() || isSubmitting}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
                    >
                      {isSubmitting ? '送信中...' : '登録'}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* リーダーボードモーダル */}
      <AnimatePresence>
        {showLeaderboard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowLeaderboard(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  ランキング - {DIFFICULTY_LABELS[difficulty]}
                </h3>
                <button
                  onClick={() => setShowLeaderboard(false)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 期間フィルター */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {(Object.keys(LEADERBOARD_PERIOD_LABELS) as LeaderboardPeriod[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      period === p
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {LEADERBOARD_PERIOD_LABELS[p]}
                  </button>
                ))}
              </div>

              {/* 難易度フィルター */}
              <div className="flex gap-2 mb-4">
                {(Object.keys(DIFFICULTIES) as Difficulty[]).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => {
                      setDifficulty(diff);
                      fetchLeaderboard(diff);
                    }}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      difficulty === diff
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {DIFFICULTY_LABELS[diff]}
                  </button>
                ))}
              </div>

              {leaderboardLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                </div>
              ) : leaderboard.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  まだ記録がありません
                </p>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        index < 3
                          ? 'bg-gradient-to-r from-yellow-500/10 to-transparent'
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}
                    >
                      <span className="font-bold w-8 text-center">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                      </span>
                      <span className="flex-1 truncate">{entry.nickname}</span>
                      <span className="font-mono font-bold">{entry.time_seconds}秒</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 認証モーダル */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* 実績モーダル */}
      <AnimatePresence>
        {showAchievements && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowAchievements(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Award className="w-6 h-6 text-blue-500" />
                  実績 ({achievementProgress.unlocked}/{achievementProgress.total})
                </h3>
                <button
                  onClick={() => setShowAchievements(false)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 進捗バー */}
              <div className="mb-4">
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${achievementProgress.percentage}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-1 text-center">
                  {achievementProgress.percentage}% 達成
                </p>
              </div>

              <div className="space-y-2">
                {getAllAchievements().map((ach) => (
                  <div
                    key={ach.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      ach.unlocked
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60'
                    }`}
                  >
                    <span className="text-2xl">{ach.unlocked ? ach.icon : (ach.hidden && !ach.unlocked ? '❓' : ach.icon)}</span>
                    <div className="flex-1">
                      <div className="font-medium">
                        {ach.hidden && !ach.unlocked ? '???' : ach.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {ach.hidden && !ach.unlocked ? (ach.hint || '隠し実績') : ach.description}
                      </div>
                    </div>
                    {ach.unlocked && (
                      <Check className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ヘルプモーダル */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <HelpCircle className="w-6 h-6" />
                  遊び方
                </h3>
                <button
                  onClick={() => setShowHelp(false)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-bold mb-2">🎯 目的</h4>
                  <p className="text-muted-foreground">
                    地雷を踏まずにすべてのセルを開けましょう。
                  </p>
                </div>

                <div>
                  <h4 className="font-bold mb-2">🖱️ 操作方法</h4>
                  <ul className="text-muted-foreground space-y-1">
                    <li>・<b>左クリック</b>: セルを開く</li>
                    <li>・<b>右クリック</b>: フラグを立てる/外す</li>
                    <li>・<b>ダブルクリック</b>: 数字セルの周囲を一括開示</li>
                    <li>・<b>長押し（モバイル）</b>: フラグを立てる</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold mb-2">🔢 数字の意味</h4>
                  <p className="text-muted-foreground">
                    数字は周囲8マスにある地雷の数を示します。
                  </p>
                </div>

                <div>
                  <h4 className="font-bold mb-2">📊 難易度</h4>
                  <div className="text-muted-foreground space-y-1">
                    <p>・初級: 9×9 / 地雷10個</p>
                    <p>・中級: 16×16 / 地雷40個</p>
                    <p>・上級: 30×16 / 地雷99個</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 実績トースト */}
      <AnimatePresence>
        {currentAchievement && (
          <AchievementToast
            achievement={currentAchievement}
            onClose={() => setCurrentAchievement(null)}
          />
        )}
      </AnimatePresence>

      {/* 操作説明 */}
      <div className="text-center text-xs text-muted-foreground mt-2">
        <p>クリック: 開く | 右クリック/長押し: フラグ | ダブルクリック: 一括開示</p>
      </div>
    </div>
  );
}
