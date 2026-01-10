'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Gamepad2, Target, TrendingUp, Medal, ChevronDown, Lock, HelpCircle } from 'lucide-react';
import { GAME_ACHIEVEMENTS, GAME_RARITY_STYLES, type GameAchievement } from '@/lib/game-achievements';
import { GAME_2048_ACHIEVEMENTS } from '@/lib/game-2048-achievements';
import { SNAKE_ACHIEVEMENTS } from '@/lib/snake-achievements';
import { TYPING_ACHIEVEMENTS } from '@/lib/typing-achievements';

interface UnlockedAchievement {
  id: string;
  unlockedAt: string;
}

interface AchievementsOverviewProps {
  achievementCounts: Record<string, number>;
  totalAchievements: number;
  unlockedAchievements: Record<string, UnlockedAchievement[]>;
}

interface GameAchievementInfo {
  key: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  achievements: GameAchievement[];
}

const gameInfo: GameAchievementInfo[] = [
  {
    key: 'tetris',
    name: 'Tetris',
    icon: <Gamepad2 size={18} />,
    color: 'bg-cyan-500',
    bgColor: 'bg-cyan-500/10',
    achievements: GAME_ACHIEVEMENTS,
  },
  {
    key: '2048',
    name: '2048',
    icon: <Target size={18} />,
    color: 'bg-orange-500',
    bgColor: 'bg-orange-500/10',
    achievements: GAME_2048_ACHIEVEMENTS,
  },
  {
    key: 'snake',
    name: 'Snake',
    icon: <TrendingUp size={18} />,
    color: 'bg-green-500',
    bgColor: 'bg-green-500/10',
    achievements: SNAKE_ACHIEVEMENTS,
  },
  {
    key: 'typing',
    name: 'Typing',
    icon: <Medal size={18} />,
    color: 'bg-blue-500',
    bgColor: 'bg-blue-500/10',
    achievements: TYPING_ACHIEVEMENTS,
  },
];

export function AchievementsOverview({
  achievementCounts,
  totalAchievements,
  unlockedAchievements,
}: AchievementsOverviewProps) {
  const [showList, setShowList] = useState(false);

  // 全ゲームの実績を統合
  const allAchievements = gameInfo.flatMap((game) =>
    game.achievements.map((achievement) => ({
      ...achievement,
      gameKey: game.key,
      gameName: game.name,
      gameColor: game.color,
      gameBgColor: game.bgColor,
    }))
  );

  // 解除済み実績のIDセット
  const unlockedIds = new Set(
    Object.values(unlockedAchievements)
      .flat()
      .map((a) => a.id)
  );

  // 解除済み実績を上に、未解除を下に並べ替え
  const sortedAchievements = [...allAchievements].sort((a, b) => {
    const aUnlocked = unlockedIds.has(a.id);
    const bUnlocked = unlockedIds.has(b.id);
    if (aUnlocked && !bUnlocked) return -1;
    if (!aUnlocked && bUnlocked) return 1;
    return 0;
  });

  const totalMax = gameInfo.reduce((sum, game) => sum + game.achievements.length, 0);
  const overallProgress = totalMax > 0 ? (totalAchievements / totalMax) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card border border-border rounded-xl p-6"
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Award size={20} className="text-yellow-500" />
          <h3 className="font-bold">実績</h3>
        </div>
        <div className="text-sm text-muted-foreground">
          {totalAchievements} / {totalMax}
        </div>
      </div>

      {/* 全体プログレス */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">総合進捗</span>
          <span className="font-medium">{overallProgress.toFixed(1)}%</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
          />
        </div>
      </div>

      {/* ゲーム別 */}
      <div className="space-y-4">
        {gameInfo.map((game) => {
          const count = achievementCounts[game.key] || 0;
          const max = game.achievements.length;
          const progress = (count / max) * 100;

          return (
            <div key={game.key}>
              <div className="flex items-center justify-between text-sm mb-1">
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded ${game.color} text-white`}>
                    {game.icon}
                  </div>
                  <span>{game.name}</span>
                </div>
                <span className="text-muted-foreground">
                  {count} / {max}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
                  className={`h-full ${game.color}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* 実績リスト展開ボタン */}
      <button
        onClick={() => setShowList(!showList)}
        className="mt-6 w-full flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>{showList ? '実績リストを閉じる' : '実績リストを見る'}</span>
        <motion.div
          animate={{ rotate: showList ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} />
        </motion.div>
      </button>

      {/* 実績リスト */}
      <AnimatePresence>
        {showList && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {sortedAchievements.map((achievement) => {
                const isUnlocked = unlockedIds.has(achievement.id);
                const isHidden = achievement.hidden && !isUnlocked;
                const rarityStyle = GAME_RARITY_STYLES[achievement.rarity];

                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg border transition-all
                      ${isUnlocked
                        ? `${rarityStyle.bg} ${rarityStyle.border} border-opacity-50`
                        : 'bg-muted/30 border-border opacity-60'
                      }
                    `}
                  >
                    {/* アイコン */}
                    <div
                      className={`
                        w-10 h-10 rounded-lg flex items-center justify-center text-xl
                        ${isUnlocked ? achievement.gameBgColor : 'bg-muted'}
                      `}
                    >
                      {isHidden ? (
                        <HelpCircle size={20} className="text-muted-foreground" />
                      ) : (
                        achievement.icon
                      )}
                    </div>

                    {/* 情報 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`
                            font-medium text-sm truncate
                            ${isUnlocked ? '' : 'text-muted-foreground'}
                          `}
                        >
                          {isHidden ? 'シークレット実績' : achievement.name}
                        </span>
                        <span
                          className={`
                            text-xs px-1.5 py-0.5 rounded
                            ${achievement.gameColor} text-white
                          `}
                        >
                          {achievement.gameName}
                        </span>
                        {!isUnlocked && !isHidden && (
                          <Lock size={12} className="text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {isHidden
                          ? achievement.hint || '???'
                          : achievement.description}
                      </p>
                    </div>

                    {/* レアリティ */}
                    <div
                      className={`
                        text-xs px-2 py-1 rounded-full capitalize
                        ${isUnlocked ? rarityStyle.text : 'text-muted-foreground'}
                      `}
                    >
                      {achievement.rarity}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
