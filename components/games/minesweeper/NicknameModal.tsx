'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';
import type { Difficulty } from '@/hooks/useMinesweeperGame';
import type { MinesweeperStats } from '@/hooks/useMinesweeperGame';
import type { User } from 'firebase/auth';

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: '初級',
  intermediate: '中級',
  expert: '上級',
};

interface NicknameModalProps {
  show: boolean;
  difficulty: Difficulty;
  pendingStats: MinesweeperStats | null;
  user: User | null;
  userNickname: string;
  isSubmitting: boolean;
  onSubmit: () => void;
  onSkip: () => void;
  onLogin: () => void;
}

export function NicknameModal({
  show,
  difficulty,
  pendingStats,
  user,
  userNickname,
  isSubmitting,
  onSubmit,
  onSkip,
  onLogin,
}: NicknameModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onSkip}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
              <h3 className="text-xl font-bold">ランキング入り!</h3>
              <p className="text-muted-foreground text-sm">
                {DIFFICULTY_LABELS[difficulty]} - {pendingStats?.time}秒
              </p>
            </div>

            {user ? (
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">登録名</p>
                  <p className="font-medium text-lg">{userNickname}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={onSkip}
                    className="flex-1 px-4 py-2 rounded-lg bg-muted font-medium"
                  >
                    スキップ
                  </button>
                  <button
                    onClick={onSubmit}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? '送信中...' : '登録'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">
                    ランキングに登録するにはログインが必要です
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={onSkip}
                    className="flex-1 px-4 py-2 rounded-lg bg-muted font-medium"
                  >
                    閉じる
                  </button>
                  <button
                    onClick={onLogin}
                    className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium"
                  >
                    ログイン
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
