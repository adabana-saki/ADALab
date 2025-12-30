'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  TrendingUp,
  Trophy,
  Target,
  Clock,
  Zap,
  Gamepad2,
  Swords,
  Medal,
  Flame,
  BarChart3,
} from 'lucide-react';
import type { GameStats } from '@/lib/game-achievements';

interface StatsPanelProps {
  stats: GameStats;
  isOpen: boolean;
  onClose: () => void;
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  color?: string;
}

function StatItem({ icon, label, value, subValue, color = 'text-primary' }: StatItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
      <div className={`w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground truncate">{label}</p>
        <p className="text-lg font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      </div>
      {subValue && <span className="text-xs text-muted-foreground">{subValue}</span>}
    </div>
  );
}

export function StatsPanel({ stats, isOpen, onClose }: StatsPanelProps) {
  // 派生統計を計算
  const derivedStats = useMemo(() => {
    const winRate = stats.battleWins + stats.battleLosses > 0
      ? Math.round((stats.battleWins / (stats.battleWins + stats.battleLosses)) * 100)
      : 0;

    const avgScore = stats.totalGames > 0
      ? Math.round(stats.totalScore / stats.totalGames)
      : 0;

    const avgLines = stats.totalGames > 0
      ? Math.round(stats.totalLines / stats.totalGames)
      : 0;

    const playTimeMinutes = Math.floor(stats.totalPlayTime / 60);
    const playTimeHours = Math.floor(playTimeMinutes / 60);
    const playTimeStr = playTimeHours > 0
      ? `${playTimeHours}時間${playTimeMinutes % 60}分`
      : `${playTimeMinutes}分`;

    return {
      winRate,
      avgScore,
      avgLines,
      playTimeStr,
    };
  }, [stats]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* オーバーレイ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* パネル */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-10 lg:inset-20 z-50 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* ヘッダー */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">プレイ統計</h2>
                  <p className="text-sm text-muted-foreground">
                    最終プレイ: {stats.lastPlayed
                      ? new Date(stats.lastPlayed).toLocaleDateString('ja-JP')
                      : '未プレイ'}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* コンテンツ */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              {/* ハイライト */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-6 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30"
                >
                  <Trophy className="w-8 h-8 text-yellow-500 mb-3" />
                  <p className="text-sm text-muted-foreground">ハイスコア</p>
                  <p className="text-3xl font-bold text-yellow-500">{stats.highScore.toLocaleString()}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30"
                >
                  <Gamepad2 className="w-8 h-8 text-blue-500 mb-3" />
                  <p className="text-sm text-muted-foreground">総ゲーム数</p>
                  <p className="text-3xl font-bold text-blue-500">{stats.totalGames.toLocaleString()}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-6 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30"
                >
                  <Target className="w-8 h-8 text-green-500 mb-3" />
                  <p className="text-sm text-muted-foreground">総ライン消去</p>
                  <p className="text-3xl font-bold text-green-500">{stats.totalLines.toLocaleString()}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30"
                >
                  <Clock className="w-8 h-8 text-purple-500 mb-3" />
                  <p className="text-sm text-muted-foreground">総プレイ時間</p>
                  <p className="text-3xl font-bold text-purple-500">{derivedStats.playTimeStr}</p>
                </motion.div>
              </div>

              {/* 詳細統計 */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* ゲームプレイ統計 */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-4 rounded-xl bg-muted/20 border border-border"
                >
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <TrendingUp size={18} className="text-primary" />
                    ゲームプレイ統計
                  </h3>
                  <div className="space-y-3">
                    <StatItem
                      icon={<Target size={18} />}
                      label="累計スコア"
                      value={stats.totalScore}
                    />
                    <StatItem
                      icon={<TrendingUp size={18} />}
                      label="平均スコア"
                      value={derivedStats.avgScore}
                      subValue="/ ゲーム"
                    />
                    <StatItem
                      icon={<Zap size={18} />}
                      label="平均ライン消去"
                      value={derivedStats.avgLines}
                      subValue="/ ゲーム"
                    />
                    <StatItem
                      icon={<Flame size={18} />}
                      label="最大コンボ"
                      value={stats.maxCombo}
                      color="text-orange-500"
                    />
                  </div>
                </motion.div>

                {/* スペシャル統計 */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 }}
                  className="p-4 rounded-xl bg-muted/20 border border-border"
                >
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Zap size={18} className="text-yellow-500" />
                    スペシャル達成
                  </h3>
                  <div className="space-y-3">
                    <StatItem
                      icon={<span className="text-lg">🎉</span>}
                      label="テトリス (4ライン消し)"
                      value={stats.totalTetris}
                      color="text-cyan-500"
                    />
                    <StatItem
                      icon={<span className="text-lg">🌀</span>}
                      label="T-Spin"
                      value={stats.totalTSpins}
                      color="text-purple-500"
                    />
                    <StatItem
                      icon={<span className="text-lg">🔥</span>}
                      label="総コンボ数"
                      value={stats.totalCombo}
                      color="text-orange-500"
                    />
                  </div>
                </motion.div>

                {/* バトル統計 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="p-4 rounded-xl bg-muted/20 border border-border md:col-span-2"
                >
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Swords size={18} className="text-red-500" />
                    オンラインバトル
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <StatItem
                      icon={<Medal size={18} />}
                      label="勝利"
                      value={stats.battleWins}
                      color="text-green-500"
                    />
                    <StatItem
                      icon={<X size={18} />}
                      label="敗北"
                      value={stats.battleLosses}
                      color="text-red-500"
                    />
                    <StatItem
                      icon={<TrendingUp size={18} />}
                      label="勝率"
                      value={`${derivedStats.winRate}%`}
                      color="text-blue-500"
                    />
                    <StatItem
                      icon={<Flame size={18} />}
                      label="最大連勝"
                      value={stats.maxWinStreak}
                      color="text-orange-500"
                    />
                  </div>

                  {/* 勝率バー */}
                  {(stats.battleWins + stats.battleLosses > 0) && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-muted-foreground mb-2">
                        <span>勝利: {stats.battleWins}</span>
                        <span>敗北: {stats.battleLosses}</span>
                      </div>
                      <div className="h-2 bg-red-500/30 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-green-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${derivedStats.winRate}%` }}
                          transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                        />
                      </div>
                    </div>
                  )}

                  {/* お邪魔ブロック送信 */}
                  <div className="mt-4">
                    <StatItem
                      icon={<span className="text-lg">💣</span>}
                      label="送信したお邪魔ブロック"
                      value={stats.garbageSent}
                      subValue="ライン"
                      color="text-yellow-500"
                    />
                  </div>
                </motion.div>
              </div>

              {/* フッター */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center text-xs text-muted-foreground pt-4 border-t border-border"
              >
                統計データはブラウザのローカルストレージに保存されています
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
