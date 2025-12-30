'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  X,
  Lock,
  Star,
  Filter,
  Gamepad2,
  Target,
  Zap,
  Sparkles,
  Swords,
  TrendingUp,
} from 'lucide-react';
import type { GameAchievement, GameAchievementCategory, GameAchievementRarity } from '@/lib/game-achievements';
import {
  GAME_RARITY_STYLES,
  GAME_CATEGORY_LABELS,
} from '@/lib/game-achievements';

interface AchievementPanelProps {
  achievements: (GameAchievement & { unlocked: boolean; unlockedAt?: number })[];
  progress: { unlocked: number; total: number; percentage: number };
  totalXp: number;
  isOpen: boolean;
  onClose: () => void;
}

type FilterType = 'all' | GameAchievementCategory;

const CATEGORY_ICONS: Record<GameAchievementCategory, React.ReactNode> = {
  gameplay: <Gamepad2 size={14} />,
  score: <Target size={14} />,
  combo: <Zap size={14} />,
  special: <Sparkles size={14} />,
  battle: <Swords size={14} />,
  milestone: <TrendingUp size={14} />,
};

export function AchievementPanel({
  achievements,
  progress,
  totalXp,
  isOpen,
  onClose,
}: AchievementPanelProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);

  // フィルター適用
  const filteredAchievements = useMemo(() => {
    return achievements.filter((a) => {
      if (filter !== 'all' && a.category !== filter) return false;
      if (showUnlockedOnly && !a.unlocked) return false;
      // 隠し実績は解除されるまで表示しない（ただしヒント付きの場合はヒント表示）
      if (a.hidden && !a.unlocked) return false;
      return true;
    });
  }, [achievements, filter, showUnlockedOnly]);

  // カテゴリー別カウント
  const categoryCounts = useMemo(() => {
    const counts: Record<FilterType, { total: number; unlocked: number }> = {
      all: { total: achievements.length, unlocked: achievements.filter((a) => a.unlocked).length },
      gameplay: { total: 0, unlocked: 0 },
      score: { total: 0, unlocked: 0 },
      combo: { total: 0, unlocked: 0 },
      special: { total: 0, unlocked: 0 },
      battle: { total: 0, unlocked: 0 },
      milestone: { total: 0, unlocked: 0 },
    };

    achievements.forEach((a) => {
      if (!a.hidden || a.unlocked) {
        counts[a.category].total++;
        if (a.unlocked) counts[a.category].unlocked++;
      }
    });

    return counts;
  }, [achievements]);

  // レアリティでソート
  const sortedAchievements = useMemo(() => {
    const rarityOrder: Record<GameAchievementRarity, number> = {
      legendary: 0,
      epic: 1,
      rare: 2,
      uncommon: 3,
      common: 4,
    };

    return [...filteredAchievements].sort((a, b) => {
      // 解除済みを先に
      if (a.unlocked && !b.unlocked) return -1;
      if (!a.unlocked && b.unlocked) return 1;
      // レアリティ順
      return rarityOrder[a.rarity] - rarityOrder[b.rarity];
    });
  }, [filteredAchievements]);

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
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">実績</h2>
                  <p className="text-sm text-muted-foreground">
                    {progress.unlocked} / {progress.total} 解除済み ({progress.percentage}%)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* 合計XP */}
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-yellow-500/20 rounded-lg">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="font-bold text-yellow-500">{totalXp.toLocaleString()} XP</span>
                </div>

                {/* 閉じるボタン */}
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* プログレスバー */}
            <div className="px-4 md:px-6 py-3 bg-muted/20">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-secondary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.percentage}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* フィルター */}
            <div className="p-4 border-b border-border bg-muted/10">
              <div className="flex flex-wrap items-center gap-2">
                <Filter size={16} className="text-muted-foreground" />

                {/* カテゴリーフィルター */}
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    filter === 'all'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  すべて ({categoryCounts.all.unlocked}/{categoryCounts.all.total})
                </button>

                {(Object.keys(GAME_CATEGORY_LABELS) as GameAchievementCategory[]).map((category) => (
                  <button
                    key={category}
                    onClick={() => setFilter(category)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      filter === category
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {CATEGORY_ICONS[category]}
                    <span className="hidden sm:inline">{GAME_CATEGORY_LABELS[category]}</span>
                    <span>({categoryCounts[category].unlocked}/{categoryCounts[category].total})</span>
                  </button>
                ))}

                {/* 解除済みのみ */}
                <button
                  onClick={() => setShowUnlockedOnly(!showUnlockedOnly)}
                  className={`ml-auto px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    showUnlockedOnly
                      ? 'bg-green-500/20 text-green-500'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  解除済みのみ
                </button>
              </div>
            </div>

            {/* 実績リスト */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {sortedAchievements.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Lock size={48} className="mb-4 opacity-50" />
                  <p>該当する実績がありません</p>
                </div>
              ) : (
                <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {sortedAchievements.map((achievement, index) => {
                    const rarityStyle = GAME_RARITY_STYLES[achievement.rarity];

                    return (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={`
                          relative p-4 rounded-xl border-2 transition-all
                          ${
                            achievement.unlocked
                              ? `${rarityStyle.bg} ${rarityStyle.border} shadow-lg ${rarityStyle.glow}`
                              : 'bg-muted/30 border-muted opacity-60'
                          }
                        `}
                      >
                        <div className="flex items-start gap-3">
                          {/* アイコン */}
                          <div
                            className={`
                              flex-shrink-0 w-12 h-12 rounded-lg
                              flex items-center justify-center text-2xl
                              ${
                                achievement.unlocked
                                  ? `${rarityStyle.bg} border ${rarityStyle.border}`
                                  : 'bg-muted border border-muted-foreground/20'
                              }
                            `}
                          >
                            {achievement.unlocked ? (
                              achievement.icon
                            ) : (
                              <Lock size={20} className="text-muted-foreground" />
                            )}
                          </div>

                          {/* コンテンツ */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3
                                className={`font-bold truncate ${
                                  achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'
                                }`}
                              >
                                {achievement.unlocked ? achievement.name : '???'}
                              </h3>
                            </div>

                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                              {achievement.unlocked
                                ? achievement.description
                                : achievement.hint || '実績を解除して確認しよう'}
                            </p>

                            <div className="flex items-center gap-2 flex-wrap">
                              {/* レアリティバッジ */}
                              <span
                                className={`
                                  text-[10px] px-2 py-0.5 rounded-full font-medium
                                  ${achievement.unlocked ? `${rarityStyle.bg} ${rarityStyle.text} border ${rarityStyle.border}` : 'bg-muted text-muted-foreground'}
                                `}
                              >
                                {achievement.rarity === 'common' && 'コモン'}
                                {achievement.rarity === 'uncommon' && 'アンコモン'}
                                {achievement.rarity === 'rare' && 'レア'}
                                {achievement.rarity === 'epic' && 'エピック'}
                                {achievement.rarity === 'legendary' && 'レジェンダリー'}
                              </span>

                              {/* XP */}
                              <span className="text-[10px] text-muted-foreground">
                                +{achievement.xp} XP
                              </span>

                              {/* 解除日時 */}
                              {achievement.unlocked && achievement.unlockedAt && (
                                <span className="text-[10px] text-muted-foreground ml-auto">
                                  {new Date(achievement.unlockedAt).toLocaleDateString('ja-JP')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 解除済みチェック */}
                        {achievement.unlocked && (
                          <div className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center ${rarityStyle.bg} ${rarityStyle.border} border`}>
                            <svg
                              className={`w-3 h-3 ${rarityStyle.text}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
