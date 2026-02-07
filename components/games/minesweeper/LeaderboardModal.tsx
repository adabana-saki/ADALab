'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X } from 'lucide-react';
import type { Difficulty } from '@/hooks/useMinesweeperGame';
import { DIFFICULTIES } from '@/hooks/useMinesweeperGame';
import type { LeaderboardEntry, LeaderboardPeriod } from '@/hooks/useMinesweeperLeaderboard';
import { LEADERBOARD_PERIOD_LABELS } from '@/hooks/useMinesweeperLeaderboard';

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: '初級',
  intermediate: '中級',
  expert: '上級',
};

interface LeaderboardModalProps {
  show: boolean;
  onClose: () => void;
  difficulty: Difficulty;
  leaderboard: LeaderboardEntry[];
  leaderboardLoading: boolean;
  period: LeaderboardPeriod;
  onPeriodChange: (period: LeaderboardPeriod) => void;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onFetchLeaderboard: (difficulty: Difficulty) => void;
}

export function LeaderboardModal({
  show,
  onClose,
  difficulty,
  leaderboard,
  leaderboardLoading,
  period,
  onPeriodChange,
  onDifficultyChange,
  onFetchLeaderboard,
}: LeaderboardModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={onClose}
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
                onClick={onClose}
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
                  onClick={() => onPeriodChange(p)}
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
                    onDifficultyChange(diff);
                    onFetchLeaderboard(diff);
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
  );
}
