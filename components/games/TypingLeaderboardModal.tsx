'use client';

import { motion } from 'framer-motion';
import { Medal, X, AlertTriangle } from 'lucide-react';
import type { GameMode, TypingLanguage } from '@/hooks/useTypingGame';
import type { LeaderboardPeriod, TypingLeaderboardEntry } from '@/hooks/useTypingLeaderboard';
import { MODE_LABELS, LANGUAGE_LABELS, LEADERBOARD_PERIOD_LABELS } from '@/hooks/useTypingLeaderboard';

interface TypingLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaderboard: TypingLeaderboardEntry[];
  leaderboardMode: GameMode;
  setLeaderboardMode: (mode: GameMode) => void;
  leaderboardLanguage: TypingLanguage;
  setLeaderboardLanguage: (lang: TypingLanguage) => void;
  period: LeaderboardPeriod;
  setPeriod: (period: LeaderboardPeriod) => void;
  isLoading: boolean;
  isOnline: boolean;
}

export function TypingLeaderboardModal({
  isOpen,
  onClose,
  leaderboard,
  leaderboardMode,
  setLeaderboardMode,
  leaderboardLanguage,
  setLeaderboardLanguage,
  period,
  setPeriod,
  isLoading,
  isOnline,
}: TypingLeaderboardModalProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Medal className="w-6 h-6 text-yellow-500" />
            <h3 className="text-xl font-bold">ランキング</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filters */}
        <div className="space-y-2 mb-4">
          <div className="flex gap-2">
            {(Object.keys(MODE_LABELS) as GameMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setLeaderboardMode(m)}
                className={`flex-1 px-2 py-1 rounded-full text-xs transition-colors ${
                  leaderboardMode === m
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {MODE_LABELS[m].replace('モード', '')}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {(Object.keys(LANGUAGE_LABELS) as TypingLanguage[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLeaderboardLanguage(lang)}
                className={`flex-1 px-2 py-1 rounded-full text-xs transition-colors ${
                  leaderboardLanguage === lang
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {LANGUAGE_LABELS[lang]}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {(Object.keys(LEADERBOARD_PERIOD_LABELS) as LeaderboardPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`flex-1 px-2 py-1 rounded-full text-xs transition-colors ${
                  period === p
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {LEADERBOARD_PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        {!isOnline && (
          <div className="text-xs text-yellow-500 mb-2 flex items-center gap-1">
            <AlertTriangle size={12} />
            オフライン: ローカルデータを表示中
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">読み込み中...</div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            まだ記録がありません
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry, index) => (
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
                  <div className="font-medium truncate">{entry.nickname}</div>
                  <div className="text-xs text-muted-foreground">
                    {entry.words_typed}語 / 正確率 {entry.accuracy}%
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary">{entry.wpm}</div>
                  <div className="text-xs text-muted-foreground">WPM</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
