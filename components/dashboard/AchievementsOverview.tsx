'use client';

import { motion } from 'framer-motion';
import { Award, Gamepad2, Target, TrendingUp, Medal } from 'lucide-react';

interface AchievementsOverviewProps {
  achievementCounts: Record<string, number>;
  totalAchievements: number;
}

const gameInfo = [
  {
    key: 'tetris',
    name: 'Tetris',
    icon: <Gamepad2 size={18} />,
    color: 'bg-cyan-500',
    maxAchievements: 38,
  },
  {
    key: '2048',
    name: '2048',
    icon: <Target size={18} />,
    color: 'bg-orange-500',
    maxAchievements: 20,
  },
  {
    key: 'snake',
    name: 'Snake',
    icon: <TrendingUp size={18} />,
    color: 'bg-green-500',
    maxAchievements: 15,
  },
  {
    key: 'typing',
    name: 'Typing',
    icon: <Medal size={18} />,
    color: 'bg-blue-500',
    maxAchievements: 15,
  },
];

export function AchievementsOverview({
  achievementCounts,
  totalAchievements,
}: AchievementsOverviewProps) {
  const totalMax = gameInfo.reduce((sum, game) => sum + game.maxAchievements, 0);
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
          const progress = (count / game.maxAchievements) * 100;

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
                  {count} / {game.maxAchievements}
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
    </motion.div>
  );
}
