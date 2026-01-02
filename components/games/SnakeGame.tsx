'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Trophy,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Share2,
  Twitter,
  Link as LinkIcon,
  Check,
  X,
  Medal,
  Award,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { useSnakeGame, Direction } from '@/hooks/useSnakeGame';
import { useSnakeLeaderboard, LeaderboardPeriod, LEADERBOARD_PERIOD_LABELS } from '@/hooks/useSnakeLeaderboard';
import { useSnakeAchievements } from '@/hooks/useSnakeAchievements';
import { AchievementToast } from './AchievementToast';
import { BgmControl } from './BgmControl';
import { getSoundEngine } from '@/lib/sound-engine';
import type { GameAchievement } from '@/lib/game-achievements';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';

// 色定義
const COLORS = {
  background: '#1a1a2e',
  grid: '#16213e',
  snake: '#00ff88',
  snakeHead: '#00ffaa',
  food: '#ff6b6b',
  foodGlow: 'rgba(255, 107, 107, 0.5)',
};

export function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const soundEngineRef = useRef(typeof window !== 'undefined' ? getSoundEngine() : null);
  const [cellSize, setCellSize] = useState(20);
  const [showShare, setShowShare] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showNicknameInput, setShowNicknameInput] = useState(false);
  const [copied, setCopied] = useState(false);
  const [achievementQueue, setAchievementQueue] = useState<GameAchievement[]>([]);
  const [pendingScore, setPendingScore] = useState<{ score: number; length: number } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const prevScoreRef = useRef(0);
  const gameOverHandledRef = useRef(false);

  // 認証状態
  const { user, profile } = useAuth();
  const userNickname = profile?.displayName || profile?.email?.split('@')[0] || 'ゲスト';

  // リーダーボード
  const leaderboard = useSnakeLeaderboard();

  // 実績システム
  const achievements = useSnakeAchievements({
    onAchievementUnlock: (achievement) => {
      setAchievementQueue((prev) => [...prev, achievement]);
      soundEngineRef.current?.achievement();
    },
  });

  const {
    snake,
    food,
    score,
    highScore,
    gameOver,
    isPaused,
    gridSize,
    startGame: originalStartGame,
    togglePause,
    newGame: originalNewGame,
    changeDirection,
  } = useSnakeGame();

  // スコア変更時の効果音
  useEffect(() => {
    if (score > prevScoreRef.current && score > 0) {
      soundEngineRef.current?.snakeEat();

      // 10の倍数でレベルアップ音
      if (score % 10 === 0 && score > 0) {
        soundEngineRef.current?.levelUp();
      }
    }
    prevScoreRef.current = score;
  }, [score]);

  // ゲームオーバー時の処理（1回だけ実行）
  useEffect(() => {
    if (gameOver && score > 0 && !gameOverHandledRef.current) {
      gameOverHandledRef.current = true;
      soundEngineRef.current?.snakeCrash();
      // recordGameOver(score, length, survivalTime, foodEaten)
      achievements.recordGameOver(score, snake.length, 0, score);

      // ランキング入りチェック
      if (leaderboard.isRankingScore(score)) {
        setPendingScore({ score, length: snake.length });
        setShowNicknameInput(true);
      }
    }
    // gameOverがfalseになったらリセット
    if (!gameOver) {
      gameOverHandledRef.current = false;
    }
  }, [gameOver, score, snake.length, achievements, leaderboard]);

  // ゲーム開始
  const startGame = useCallback(() => {
    achievements.recordGameStart();
    originalStartGame();
  }, [achievements, originalStartGame]);

  // 新しいゲーム
  const newGame = useCallback(() => {
    achievements.recordGameStart();
    originalNewGame();
  }, [achievements, originalNewGame]);

  // スコア送信
  const submitToLeaderboard = useCallback(async () => {
    if (!pendingScore || !user) return;

    await leaderboard.submitScore({
      nickname: userNickname.slice(0, 20),
      score: pendingScore.score,
      length: pendingScore.length,
      date: new Date().toISOString(),
    });

    setShowNicknameInput(false);
    setPendingScore(null);
    setShowLeaderboard(true);
  }, [pendingScore, user, userNickname, leaderboard]);

  // 実績トースト表示
  const handleAchievementClose = useCallback(() => {
    setAchievementQueue((prev) => prev.slice(1));
  }, []);

  // サイズ計算
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const maxCellSize = Math.floor((containerWidth - 20) / gridSize);
        setCellSize(Math.min(maxCellSize, 25));
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [gridSize]);

  // キャンバス描画
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = gridSize * cellSize;
    canvas.width = size;
    canvas.height = size;

    // 背景
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, size, size);

    // グリッド
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(size, i * cellSize);
      ctx.stroke();
    }

    // 食べ物（グロー効果付き）
    const foodX = food.x * cellSize + cellSize / 2;
    const foodY = food.y * cellSize + cellSize / 2;
    const foodRadius = cellSize / 2 - 2;

    // グロー
    const gradient = ctx.createRadialGradient(
      foodX,
      foodY,
      0,
      foodX,
      foodY,
      foodRadius * 2
    );
    gradient.addColorStop(0, COLORS.food);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(foodX, foodY, foodRadius * 2, 0, Math.PI * 2);
    ctx.fill();

    // 食べ物本体
    ctx.fillStyle = COLORS.food;
    ctx.beginPath();
    ctx.arc(foodX, foodY, foodRadius, 0, Math.PI * 2);
    ctx.fill();

    // スネーク
    snake.forEach((segment, index) => {
      const x = segment.x * cellSize + 1;
      const y = segment.y * cellSize + 1;
      const segmentSize = cellSize - 2;

      if (index === 0) {
        // 頭
        ctx.fillStyle = COLORS.snakeHead;
        ctx.shadowColor = COLORS.snakeHead;
        ctx.shadowBlur = 10;
      } else {
        // 体
        const alpha = 1 - (index / snake.length) * 0.5;
        ctx.fillStyle = `rgba(0, 255, 136, ${alpha})`;
        ctx.shadowBlur = 0;
      }

      // 角丸の四角形
      const radius = cellSize / 4;
      ctx.beginPath();
      ctx.roundRect(x, y, segmentSize, segmentSize, radius);
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }, [snake, food, cellSize, gridSize]);

  // スワイプ操作
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

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

      changeDirection(direction);
      touchStartRef.current = null;
    },
    [changeDirection]
  );

  // 共有テキスト
  const generateShareText = useCallback(() => {
    return `ADA Lab Snake で ${score} 点を達成！（長さ: ${snake.length}）\n\n#ADALabGames #Snake\nhttps://adalabtech.com/games/snake`;
  }, [score, snake.length]);

  const shareToTwitter = useCallback(() => {
    const text = encodeURIComponent(generateShareText());
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
    setShowShare(false);
  }, [generateShareText]);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generateShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }, [generateShareText]);

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
      onClick={() => changeDirection(direction)}
      className="w-14 h-14 flex items-center justify-center rounded-xl bg-muted hover:bg-muted/80 transition-colors"
      disabled={gameOver || isPaused}
    >
      <Icon size={28} />
    </motion.button>
  );

  const canvasSize = gridSize * cellSize;

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-lg mx-auto p-4">
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
          <h1 className="text-3xl font-bold text-primary">Snake</h1>
          <p className="text-sm text-muted-foreground">矢印キーまたはスワイプで操作</p>
        </div>
        <div className="flex gap-2">
          <div className="flex flex-col items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground">
            <span className="text-xs uppercase opacity-80">スコア</span>
            <span className="text-2xl font-bold">{score}</span>
          </div>
          <div className="flex flex-col items-center px-4 py-2 rounded-lg bg-muted">
            <span className="text-xs uppercase opacity-80">ベスト</span>
            <span className="text-2xl font-bold">{highScore}</span>
          </div>
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
            onClick={isPaused && !gameOver ? startGame : togglePause}
            disabled={gameOver}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted font-medium disabled:opacity-50"
          >
            {isPaused ? <Play size={18} /> : <Pause size={18} />}
          </motion.button>
        </div>

        <div className="flex items-center gap-2">
          {/* BGMコントロール */}
          <BgmControl game="snake" isPlaying={!isPaused && !gameOver} />

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
          <span>長さ: {snake.length}</span>
        </div>
        <div className="flex items-center gap-1">
          <Award size={16} className="text-purple-500" />
          <span>実績: {achievements.progress.unlocked}/{achievements.progress.total}</span>
        </div>
      </div>

      {/* ゲームエリア */}
      <div
        ref={containerRef}
        className="relative w-full select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="relative mx-auto rounded-lg overflow-hidden border-2 border-primary/30"
          style={{ width: canvasSize, height: canvasSize }}
        >
          <canvas ref={canvasRef} className="block" />

          {/* 開始オーバーレイ */}
          <AnimatePresence>
            {isPaused && !gameOver && score === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black/60"
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={startGame}
                  className="flex flex-col items-center gap-2 px-8 py-6 rounded-2xl bg-primary text-primary-foreground"
                >
                  <Play size={48} />
                  <span className="text-xl font-bold">スタート</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 一時停止オーバーレイ */}
          <AnimatePresence>
            {isPaused && !gameOver && score > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black/60"
              >
                <div className="text-center text-white">
                  <Pause size={48} className="mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-4">一時停止</h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={togglePause}
                    className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium"
                  >
                    再開
                  </motion.button>
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
                className="absolute inset-0 flex items-center justify-center bg-black/70"
              >
                <div className="text-center text-white">
                  <h2 className="text-3xl font-bold mb-2">ゲームオーバー</h2>
                  <p className="text-xl mb-1">スコア: {score}</p>
                  <p className="text-sm mb-2 opacity-70">長さ: {snake.length}</p>
                  {score === highScore && score > 0 && (
                    <p className="text-yellow-400 text-sm mb-4 flex items-center justify-center gap-1">
                      <Trophy size={16} />
                      ハイスコア！
                    </p>
                  )}
                  <div className="flex gap-2 justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={newGame}
                      className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium"
                    >
                      もう一度プレイ
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowLeaderboard(true)}
                      className="px-4 py-3 rounded-lg bg-white/20 text-white font-medium"
                    >
                      <Trophy size={18} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 方向ボタン（モバイル用） */}
      <div className="flex flex-col items-center gap-2 sm:hidden">
        <DirectionButton direction="up" icon={ChevronUp} />
        <div className="flex gap-12">
          <DirectionButton direction="left" icon={ChevronLeft} />
          <DirectionButton direction="right" icon={ChevronRight} />
        </div>
        <DirectionButton direction="down" icon={ChevronDown} />
      </div>

      {/* 遊び方 */}
      <div className="w-full p-4 rounded-lg bg-muted/50 text-sm">
        <h3 className="font-bold mb-2">遊び方</h3>
        <ul className="space-y-1 text-muted-foreground">
          <li><strong>操作:</strong> 矢印キー / WASD / スワイプ</li>
          <li><strong>一時停止:</strong> スペースキー / P</li>
          <li><strong>目標:</strong> 食べ物を食べてスネークを伸ばそう</li>
          <li><strong>注意:</strong> 壁や自分自身にぶつからないように！</li>
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
                  スコア: {pendingScore.score}
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

              {!leaderboard.isOnline && (
                <div className="text-xs text-yellow-500 mb-2 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  オフライン: ローカルデータを表示中
                </div>
              )}

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
                          長さ: {entry.length}
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 認証モーダル */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
