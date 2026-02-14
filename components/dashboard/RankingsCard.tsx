'use client';

import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Target, Bomb } from 'lucide-react';

interface RankingsCardProps {
  rankings: Record<string, number | null>;
}

const gameInfo = [
  { key: 'tetris', name: 'Tetris', icon: <Trophy size={16} className="text-yellow-500" /> },
  { key: '2048', name: '2048', icon: <Target size={16} className="text-orange-500" /> },
  { key: 'snake', name: 'Snake', icon: <Medal size={16} className="text-green-500" /> },
  { key: 'typing', name: 'Typing', icon: <Award size={16} className="text-blue-500" /> },
  { key: 'minesweeper', name: 'Minesweeper', icon: <Bomb size={16} className="text-red-500" /> },
];

export function RankingsCard({ rankings }: RankingsCardProps) {
  const getRankDisplay = (rank: number | null | undefined) => {
    if (rank === null || rank === undefined) {
      return <span className="text-muted-foreground">-</span>;
    }
    if (rank <= 3) {
      const colors = ['text-yellow-500', 'text-gray-400', 'text-orange-500'];
      return <span className={`font-bold ${colors[rank - 1]}`}>#{rank}</span>;
    }
    return <span className="font-medium">#{rank}</span>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-card border border-border rounded-xl p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Trophy size={20} className="text-yellow-500" />
        <h3 className="font-bold">ランキング順位</h3>
      </div>

      <div className="space-y-3">
        {gameInfo.map((game) => (
          <div key={game.key} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {game.icon}
              <span className="text-sm">{game.name}</span>
            </div>
            <div className="text-sm">{getRankDisplay(rankings[game.key])}</div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
        ※ 各ゲームの全期間ベストスコアに基づくランキングです
      </p>
    </motion.div>
  );
}
