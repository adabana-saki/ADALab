'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCcw,
  Trophy,
  Play,
  Undo2,
  Award,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Medal,
  X,
  Share2,
  Twitter,
  Link as LinkIcon,
  Check,
  Calendar,
} from 'lucide-react';
import { use2048Game, Direction, Grid, Tile } from '@/hooks/use2048Game';
import { use2048Leaderboard, LeaderboardPeriod, LEADERBOARD_PERIOD_LABELS } from '@/hooks/use2048Leaderboard';
import { use2048Achievements } from '@/hooks/use2048Achievements';
import { AchievementToast } from './AchievementToast';
import { BgmControl } from './BgmControl';
import type { GameAchievement } from '@/lib/game-achievements';
import { getSoundEngine } from '@/lib/sound-engine';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';

// タイルの色
const TILE_COLORS: Record<number, { bg: string; text: string }> = {
  2: { bg: 'bg-[#eee4da]', text: 'text-[#776e65]' },
  4: { bg: 'bg-[#ede0c8]', text: 'text-[#776e65]' },
  8: { bg: 'bg-[#f2b179]', text: 'text-white' },
  16: { bg: 'bg-[#f59563]', text: 'text-white' },
  32: { bg: 'bg-[#f67c5f]', text: 'text-white' },
  64: { bg: 'bg-[#f65e3b]', text: 'text-white' },
  128: { bg: 'bg-[#edcf72]', text: 'text-white' },
  256: { bg: 'bg-[#edcc61]', text: 'text-white' },
  512: { bg: 'bg-[#edc850]', text: 'text-white' },
  1024: { bg: 'bg-[#edc53f]', text: 'text-white' },
  2048: { bg: 'bg-[#edc22e]', text: 'text-white' },
  4096: { bg: 'bg-[#3c3a32]', text: 'text-white' },
  8192: { bg: 'bg-[#3c3a32]', text: 'text-white' },
};

const getTileStyle = (value: number) => {
  return TILE_COLORS[value] || { bg: 'bg-[#3c3a32]', text: 'text-white' };
};

const getTileFontSize = (value: number) => {
  if (value >= 1000) return 'text-xl sm:text-2xl';
  if (value >= 100) return 'text-2xl sm:text-3xl';
  return 'text-3xl sm:text-4xl';
};

// タイルコンポーネント
interface TileComponentProps {
  tile: Tile;
  cellSize: number;
}

function TileComponent({ tile, cellSize }: TileComponentProps) {
  const style = getTileStyle(tile.value);
  const fontSize = getTileFontSize(tile.value);

  return (
    <motion.div
      key={tile.id}
      initial={
        tile.isNew
          ? { scale: 0, opacity: 0 }
          : tile.mergedFrom
            ? { scale: 1.2 }
            : { scale: 1 }
      }
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
        duration: 0.15,
      }}
      className={`absolute flex items-center justify-center rounded-lg font-bold ${style.bg} ${style.text} ${fontSize}`}
      style={{
        width: cellSize,
        height: cellSize,
        left: tile.col * (cellSize + 8) + 8,
        top: tile.row * (cellSize + 8) + 8,
        zIndex: Math.log2(tile.value),
      }}
    >
      {tile.value}
    </motion.div>
  );
}

// グリッドコンポーネント
interface GridComponentProps {
  grid: Grid;
}

function GridComponent({ grid }: GridComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(80);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const newCellSize = Math.floor((containerWidth - 40) / 4);
        setCellSize(Math.min(newCellSize, 100));
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const gridSize = cellSize * 4 + 8 * 5;

  return (
    <div
      ref={containerRef}
      className="relative bg-[#bbada0] rounded-lg mx-auto"
      style={{ width: gridSize, height: gridSize }}
    >
      {/* 背景セル */}
      {Array(16)
        .fill(null)
        .map((_, i) => {
          const row = Math.floor(i / 4);
          const col = i % 4;
          return (
            <div
              key={i}
              className="absolute rounded-lg bg-[#cdc1b4]"
              style={{
                width: cellSize,
                height: cellSize,
                left: col * (cellSize + 8) + 8,
                top: row * (cellSize + 8) + 8,
              }}
            />
          );
        })}

      {/* タイル */}
      <AnimatePresence>
        {grid.flat().map(
          tile =>
            tile && <TileComponent key={tile.id} tile={tile} cellSize={cellSize} />
        )}
      </AnimatePresence>
    </div>
  );
}

// スコアボード
interface ScoreBoardProps {
  label: string;
  value: number;
  isHighlight?: boolean;
}

function ScoreBoard({ label, value, isHighlight }: ScoreBoardProps) {
  return (
    <div
      className={`flex flex-col items-center px-4 py-2 rounded-lg ${
        isHighlight ? 'bg-primary text-primary-foreground' : 'bg-muted'
      }`}
    >
      <span className="text-xs uppercase tracking-wide opacity-80">{label}</span>
      <motion.span
        key={value}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        className="text-xl sm:text-2xl font-bold"
      >
        {value.toLocaleString()}
      </motion.span>
    </div>
  );
}

// メインコンポーネント
export function Game2048() {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showNicknameInput, setShowNicknameInput] = useState(false);
  const [pendingScore, setPendingScore] = useState<{ score: number; maxTile: number; moves: number } | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [achievementQueue, setAchievementQueue] = useState<GameAchievement[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // 認証状態
  const { user, profile } = useAuth();
  const userNickname = profile?.displayName || profile?.email?.split('@')[0] || 'ゲスト';

  // サウンドエンジン
  const soundEngineRef = useRef(typeof window !== 'undefined' ? getSoundEngine() : null);

  // 実績システム
  const achievements = use2048Achievements({
    onAchievementUnlock: (achievement) => {
      setAchievementQueue(prev => [...prev, achievement]);
      soundEngineRef.current?.achievement();
    },
  });

  const {
    grid,
    score,
    bestScore,
    maxTile,
    moves,
    won,
    gameOver,
    keepPlaying,
    canUndo,
    undosRemaining,
    move: originalMove,
    newGame: originalNewGame,
    undo,
    continueGame: originalContinueGame,
  } = use2048Game({
    onScoreChange: (newScore) => {
      achievements.recordScore(newScore);
    },
    onMerge: (value) => {
      achievements.recordMerge(value);
      soundEngineRef.current?.tileMerge(value);
    },
    onWin: (finalScore, finalMaxTile, finalMoves) => {
      achievements.recordMaxTile(finalMaxTile);
      soundEngineRef.current?.win2048();
      // 勝利時はスコア登録を促す
      if (leaderboard.isRankingScore(finalScore)) {
        setPendingScore({ score: finalScore, maxTile: finalMaxTile, moves: finalMoves });
        setShowNicknameInput(true);
      }
    },
    onGameOver: (finalScore, finalMaxTile, finalMoves) => {
      achievements.recordMaxTile(finalMaxTile);
      achievements.recordGameOver(finalScore, finalMoves, finalMaxTile, 0);
      soundEngineRef.current?.gameOver();
      // ゲームオーバー時もランキング入りならスコア登録
      if (leaderboard.isRankingScore(finalScore)) {
        setPendingScore({ score: finalScore, maxTile: finalMaxTile, moves: finalMoves });
        setShowNicknameInput(true);
      }
    },
  });

  // 移動（効果音付き）
  const move = useCallback((direction: Direction) => {
    soundEngineRef.current?.tileMove();
    originalMove(direction);
  }, [originalMove]);

  // リーダーボード
  const leaderboard = use2048Leaderboard();

  // 新しいゲーム
  const newGame = useCallback(() => {
    achievements.recordGameStart();
    originalNewGame();
  }, [achievements, originalNewGame]);

  // 続けてプレイ
  const continueGame = useCallback(() => {
    achievements.recordKeepPlaying();
    originalContinueGame();
  }, [achievements, originalContinueGame]);

  // スコア送信
  const submitToLeaderboard = useCallback(async () => {
    if (!pendingScore || !user || !profile) return;

    await leaderboard.submitScore({
      nickname: userNickname.slice(0, 20),
      score: pendingScore.score,
      max_tile: pendingScore.maxTile,
      moves: pendingScore.moves,
      date: new Date().toISOString(),
    });

    setShowNicknameInput(false);
    setPendingScore(null);
    setShowLeaderboard(true);
  }, [pendingScore, user, profile, userNickname, leaderboard]);

  // スワイプ操作
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      const minSwipeDistance = 30;

      if (Math.abs(dx) < minSwipeDistance && Math.abs(dy) < minSwipeDistance) {
        touchStartRef.current = null;
        return;
      }

      let direction: Direction;

      if (Math.abs(dx) > Math.abs(dy)) {
        direction = dx > 0 ? 'right' : 'left';
      } else {
        direction = dy > 0 ? 'down' : 'up';
      }

      move(direction);
      touchStartRef.current = null;
    },
    [move]
  );

  // 共有テキスト生成
  const generateShareText = useCallback(() => {
    const text = `ADA Lab 2048 で ${score.toLocaleString()} 点を達成！\n\n最大タイル: ${maxTile}\n手数: ${moves}\n\n#ADALabGames #2048\nhttps://adalabtech.com/games/2048`;
    return text;
  }, [score, maxTile, moves]);

  // Twitter/Xで共有
  const shareToTwitter = useCallback(() => {
    const text = encodeURIComponent(generateShareText());
    const url = `https://twitter.com/intent/tweet?text=${text}`;
    window.open(url, '_blank', 'width=550,height=420');
    setShowShare(false);
  }, [generateShareText]);

  // URLをコピー
  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generateShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [generateShareText]);

  // 実績トースト表示
  const handleAchievementClose = useCallback(() => {
    setAchievementQueue(prev => prev.slice(1));
  }, []);

  // 方向ボタン
  const DirectionButton = ({
    direction,
    icon: Icon,
  }: {
    direction: Direction;
    icon: typeof ChevronUp;
  }) => (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => move(direction)}
      className="w-12 h-12 flex items-center justify-center rounded-lg bg-muted hover:bg-muted/80 transition-colors"
      disabled={gameOver || (won && !keepPlaying)}
    >
      <Icon size={24} />
    </motion.button>
  );

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto p-4">
      {/* 実績トースト */}
      {achievementQueue.length > 0 && (
        <AchievementToast
          achievement={achievementQueue[0]}
          onClose={handleAchievementClose}
        />
      )}

      {/* ヘッダー */}
      <div className="w-full flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-primary">2048</h1>
          <p className="text-sm text-muted-foreground">矢印キーまたはスワイプで操作</p>
        </div>
        <div className="flex gap-2">
          <ScoreBoard label="スコア" value={score} isHighlight />
          <ScoreBoard label="ベスト" value={bestScore} />
        </div>
      </div>

      {/* コントロール */}
      <div className="w-full flex items-center justify-between gap-2">
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={newGame}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium"
          >
            <RotateCcw size={18} />
            <span className="hidden sm:inline">新しいゲーム</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={undo}
            disabled={!canUndo}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Undo2 size={18} />
            <span className="text-xs">({undosRemaining})</span>
          </motion.button>
        </div>

        <div className="flex items-center gap-2">
          {/* BGMコントロール */}
          <BgmControl game="2048" isPlaying={!gameOver && (!won || keepPlaying)} />

          {/* ランキングボタン */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowLeaderboard(true)}
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-muted font-medium"
          >
            <Medal size={18} className="text-yellow-500" />
          </motion.button>

          {/* シェアボタン */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowShare(true)}
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-muted font-medium"
          >
            <Share2 size={18} />
          </motion.button>
        </div>
      </div>

      {/* ステータス */}
      <div className="w-full flex items-center justify-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Trophy size={16} className="text-yellow-500" />
          <span>最大: {maxTile}</span>
        </div>
        <div className="flex items-center gap-1">
          <Play size={16} />
          <span>手数: {moves}</span>
        </div>
        <div className="flex items-center gap-1">
          <Award size={16} className="text-purple-500" />
          <span>実績: {achievements.progress.unlocked}/{achievements.progress.total}</span>
        </div>
      </div>

      {/* ゲームエリア */}
      <div
        ref={gameAreaRef}
        className="relative w-full select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <GridComponent grid={grid} />

        {/* 勝利オーバーレイ */}
        <AnimatePresence>
          {won && !keepPlaying && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex items-center justify-center bg-yellow-500/80 rounded-lg"
            >
              <div className="text-center text-white">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <Award size={64} className="mx-auto mb-4" />
                </motion.div>
                <h2 className="text-3xl font-bold mb-2">2048達成!</h2>
                <p className="mb-4">スコア: {score.toLocaleString()}</p>
                <div className="flex gap-2 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={continueGame}
                    className="px-4 py-2 rounded-lg bg-white text-yellow-600 font-medium"
                  >
                    続ける
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={newGame}
                    className="px-4 py-2 rounded-lg bg-yellow-600 text-white font-medium"
                  >
                    新しいゲーム
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ゲームオーバーオーバーレイ */}
        <AnimatePresence>
          {gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 rounded-lg"
            >
              <div className="text-center text-white">
                <h2 className="text-3xl font-bold mb-2">ゲームオーバー</h2>
                <p className="text-xl mb-1">スコア: {score.toLocaleString()}</p>
                <p className="text-sm text-white/70 mb-4">最大タイル: {maxTile}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={newGame}
                  className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium"
                >
                  もう一度プレイ
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 方向ボタン（モバイル用） */}
      <div className="flex flex-col items-center gap-2 sm:hidden">
        <DirectionButton direction="up" icon={ChevronUp} />
        <div className="flex gap-8">
          <DirectionButton direction="left" icon={ChevronLeft} />
          <DirectionButton direction="right" icon={ChevronRight} />
        </div>
        <DirectionButton direction="down" icon={ChevronDown} />
      </div>

      {/* 遊び方 */}
      <div className="w-full p-4 rounded-lg bg-muted/50 text-sm">
        <h3 className="font-bold mb-2">遊び方</h3>
        <ul className="space-y-1 text-muted-foreground">
          <li>
            <strong>操作:</strong> 矢印キー / WASD / スワイプ
          </li>
          <li>
            <strong>目標:</strong> 同じ数字を合わせて2048を作る
          </li>
          <li>
            <strong>アンドゥ:</strong> 最大3回まで使用可能
          </li>
        </ul>
      </div>

      {/* ニックネーム入力モーダル */}
      <AnimatePresence>
        {showNicknameInput && pendingScore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowNicknameInput(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm"
            >
              <div className="text-center mb-6">
                <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                <h3 className="text-xl font-bold">ランキング入り!</h3>
                <p className="text-muted-foreground text-sm">
                  スコア: {pendingScore.score.toLocaleString()}
                </p>
              </div>

              {user ? (
                <div className="space-y-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">登録名</p>
                    <p className="font-medium text-lg">{userNickname}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => { setShowNicknameInput(false); setPendingScore(null); }}
                      className="flex-1 px-4 py-2 rounded-lg bg-muted font-medium"
                    >
                      スキップ
                    </button>
                    <button
                      onClick={submitToLeaderboard}
                      className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium"
                    >
                      登録
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground">
                      ランキングに登録するにはログインが必要です
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => { setShowNicknameInput(false); setPendingScore(null); }}
                      className="flex-1 px-4 py-2 rounded-lg bg-muted font-medium"
                    >
                      閉じる
                    </button>
                    <button
                      onClick={() => { setShowNicknameInput(false); setShowAuthModal(true); }}
                      className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium"
                    >
                      ログイン
                    </button>
                  </div>
                </div>
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowLeaderboard(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Medal className="w-6 h-6 text-yellow-500" />
                  <h3 className="text-xl font-bold">ランキング</h3>
                </div>
                <button
                  onClick={() => setShowLeaderboard(false)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* 期間フィルター */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {(Object.keys(LEADERBOARD_PERIOD_LABELS) as LeaderboardPeriod[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => leaderboard.setPeriod(p)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      leaderboard.period === p
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    <Calendar size={14} />
                    {LEADERBOARD_PERIOD_LABELS[p]}
                  </button>
                ))}
              </div>

              {/* ランキングリスト */}
              <div className="flex-1 overflow-y-auto space-y-2">
                {leaderboard.isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    読み込み中...
                  </div>
                ) : leaderboard.leaderboard.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    まだ記録がありません
                  </div>
                ) : (
                  leaderboard.leaderboard.map((entry, index) => (
                    <div
                      key={entry.id || index}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        index === 0
                          ? 'bg-yellow-500/20 border border-yellow-500/30'
                          : index === 1
                            ? 'bg-gray-400/20 border border-gray-400/30'
                            : index === 2
                              ? 'bg-orange-500/20 border border-orange-500/30'
                              : 'bg-muted/30'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          index === 0
                            ? 'bg-yellow-500 text-white'
                            : index === 1
                              ? 'bg-gray-400 text-white'
                              : index === 2
                                ? 'bg-orange-500 text-white'
                                : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{entry.nickname}</p>
                        <p className="text-xs text-muted-foreground">
                          最大: {entry.max_tile} / {entry.moves}手
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">
                          {entry.score.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {leaderboard.error && (
                <p className="text-center text-sm text-yellow-500 mt-2">
                  {leaderboard.error}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* シェアモーダル */}
      <AnimatePresence>
        {showShare && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowShare(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">シェアする</h3>
                <button
                  onClick={() => setShowShare(false)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3">
                <button
                  onClick={shareToTwitter}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center">
                    <Twitter size={20} className="text-white" />
                  </div>
                  <span className="font-medium">X (Twitter) でシェア</span>
                </button>

                <button
                  onClick={copyToClipboard}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    {copied ? (
                      <Check size={20} className="text-green-500" />
                    ) : (
                      <LinkIcon size={20} />
                    )}
                  </div>
                  <span className="font-medium">
                    {copied ? 'コピーしました!' : 'テキストをコピー'}
                  </span>
                </button>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground whitespace-pre-line">
                {generateShareText()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 認証モーダル */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
