'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Award, X, Check } from 'lucide-react';
import type { GameAchievement } from '@/lib/game-achievements';

interface AchievementsModalProps {
  show: boolean;
  onClose: () => void;
  achievementProgress: { unlocked: number; total: number; percentage: number };
  achievements: (GameAchievement & { unlocked: boolean })[];
}

export function AchievementsModal({
  show,
  onClose,
  achievementProgress,
  achievements,
}: AchievementsModalProps) {
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
            className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Award className="w-6 h-6 text-blue-500" />
                実績 ({achievementProgress.unlocked}/{achievementProgress.total})
              </h3>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X size={20} />
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
              {achievements.map((ach) => (
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
  );
}
