'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Medal, Calendar, X } from 'lucide-react';
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card border border-border rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Medal className="w-6 h-6 text-yellow-500" />
                <h3 className="text-xl font-bold">ランキング - {DIFFICULTY_LABELS[difficulty]}</h3>
              </div>
              <button
                onClick={onClose}
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
                  onClick={() => onPeriodChange(p)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    period === p
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <Calendar size={14} />
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
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {DIFFICULTY_LABELS[diff]}
                </button>
              ))}
            </div>

            {leaderboardLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                読み込み中...
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                まだ記録がありません
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry, index) => (
                  <div
                    key={index}
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
