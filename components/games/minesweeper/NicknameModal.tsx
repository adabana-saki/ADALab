'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { Difficulty } from '@/hooks/useMinesweeperGame';
import type { MinesweeperStats } from '@/hooks/useMinesweeperGame';

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: '初級',
  intermediate: '中級',
  expert: '上級',
};

interface NicknameModalProps {
  show: boolean;
  difficulty: Difficulty;
  pendingStats: MinesweeperStats | null;
  nickname: string;
  onNicknameChange: (value: string) => void;
  isSubmitting: boolean;
  isLoggedIn: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  onLogin: () => void;
}

export function NicknameModal({
  show,
  difficulty,
  pendingStats,
  nickname,
  onNicknameChange,
  isSubmitting,
  isLoggedIn,
  onSubmit,
  onCancel,
  onLogin,
}: NicknameModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full mx-4"
          >
            <h3 className="text-xl font-bold mb-4 text-center">ランキング登録</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              {DIFFICULTY_LABELS[difficulty]} - {pendingStats?.time}秒
            </p>

            {!isLoggedIn ? (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  ランキングに登録するにはログインが必要です
                </p>
                <button
                  onClick={onLogin}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
                >
                  ログイン
                </button>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => onNicknameChange(e.target.value)}
                  placeholder="ニックネーム"
                  maxLength={20}
                  className="w-full px-4 py-2 border rounded-lg mb-4 dark:bg-gray-700 dark:border-gray-600"
                />
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={onSubmit}
                    disabled={!nickname.trim() || isSubmitting}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
                  >
                    {isSubmitting ? '送信中...' : '登録'}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
