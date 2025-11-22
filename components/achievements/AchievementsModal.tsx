'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Lock } from 'lucide-react';
import { getAchievements, getCompletionPercentage, type Achievement } from '@/lib/achievements';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AchievementsModal({ isOpen, onClose }: AchievementsModalProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setAchievements(getAchievements());
      setCompletion(getCompletionPercentage());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-4xl max-h-[80vh] bg-black/95 backdrop-blur-xl border-2 neon-border-cyan rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="relative border-b border-neon-cyan/30 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-yellow-400" />
                <div>
                  <h2 className="text-2xl font-bold holographic-text">Achievements</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {achievements.filter((a) => a.unlocked).length} / {achievements.length} unlocked
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Progress ring */}
            <div className="mt-6 flex items-center justify-center">
              <div className="relative w-32 h-32">
                {/* Background ring */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="rgba(6, 182, 212, 0.2)"
                    strokeWidth="8"
                    fill="none"
                  />
                  {/* Progress ring */}
                  <motion.circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="url(#progress-gradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: 352 }}
                    animate={{ strokeDashoffset: 352 - (352 * completion) / 100 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    style={{
                      strokeDasharray: 352,
                    }}
                  />
                  <defs>
                    <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="50%" stopColor="#d946ef" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Percentage */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                    className="text-center"
                  >
                    <div className="text-3xl font-bold holographic-text">{completion}%</div>
                    <div className="text-xs text-muted-foreground">Complete</div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

          {/* Achievement list */}
          <div className="overflow-y-auto max-h-[calc(80vh-280px)] p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    achievement.unlocked
                      ? 'bg-gradient-to-br from-yellow-400/10 to-orange-500/10 border-yellow-400/30 hover:border-yellow-400/50'
                      : 'bg-black/40 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                        achievement.unlocked
                          ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg'
                          : 'bg-gray-700'
                      }`}
                    >
                      {achievement.unlocked ? achievement.icon : <Lock className="w-6 h-6 text-gray-400" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-bold mb-1 ${achievement.unlocked ? 'holographic-text' : 'text-gray-400'}`}>
                        {achievement.unlocked ? achievement.title : '???'}
                      </h3>

                      <p className="text-sm text-muted-foreground mb-2">
                        {achievement.unlocked ? achievement.description : 'Hidden achievement'}
                      </p>

                      {/* Progress bar for progressive achievements */}
                      {achievement.maxProgress && !achievement.unlocked && achievement.progress !== undefined && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>Progress</span>
                            <span>
                              {achievement.progress} / {achievement.maxProgress}
                            </span>
                          </div>
                          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple"
                              initial={{ width: 0 }}
                              animate={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Unlock date */}
                      {achievement.unlocked && achievement.unlockedAt && (
                        <div className="mt-2 text-xs text-yellow-400/70">
                          Unlocked: {formatDate(achievement.unlockedAt)}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Scanline effect */}
          <div className="absolute inset-0 scanlines opacity-20 pointer-events-none" />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
