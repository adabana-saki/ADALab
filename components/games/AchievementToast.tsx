'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Sparkles } from 'lucide-react';
import type { GameAchievement } from '@/lib/game-achievements';
import { GAME_RARITY_STYLES } from '@/lib/game-achievements';

interface AchievementToastProps {
  achievement: GameAchievement;
  onClose: () => void;
  autoCloseDuration?: number;
}

export function AchievementToast({
  achievement,
  onClose,
  autoCloseDuration = 5000,
}: AchievementToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const rarityStyle = GAME_RARITY_STYLES[achievement.rarity];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, autoCloseDuration);

    return () => clearTimeout(timer);
  }, [autoCloseDuration, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className={`
            fixed top-4 right-4 z-[100]
            max-w-sm w-full
            p-4 rounded-xl
            border-2 ${rarityStyle.border}
            ${rarityStyle.bg}
            backdrop-blur-md
            shadow-2xl ${rarityStyle.glow}
          `}
        >
          {/* 背景エフェクト */}
          <div className="absolute inset-0 overflow-hidden rounded-xl">
            <motion.div
              className={`absolute inset-0 ${rarityStyle.bg} opacity-50`}
              animate={{
                background: [
                  `radial-gradient(circle at 0% 0%, ${rarityStyle.border.replace('border-', '')}40 0%, transparent 50%)`,
                  `radial-gradient(circle at 100% 100%, ${rarityStyle.border.replace('border-', '')}40 0%, transparent 50%)`,
                  `radial-gradient(circle at 0% 0%, ${rarityStyle.border.replace('border-', '')}40 0%, transparent 50%)`,
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>

          <div className="relative flex items-start gap-4">
            {/* アイコン */}
            <motion.div
              className={`
                flex-shrink-0
                w-14 h-14 rounded-xl
                flex items-center justify-center
                text-3xl
                border ${rarityStyle.border}
                ${rarityStyle.bg}
              `}
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', damping: 10, delay: 0.2 }}
            >
              {achievement.icon}
            </motion.div>

            {/* コンテンツ */}
            <div className="flex-1 min-w-0">
              {/* ヘッダー */}
              <motion.div
                className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${rarityStyle.text} mb-1`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Trophy size={12} />
                <span>実績解除</span>
                <Sparkles size={12} className="text-yellow-400" />
              </motion.div>

              {/* タイトル */}
              <motion.h4
                className="text-lg font-bold text-foreground truncate"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {achievement.name}
              </motion.h4>

              {/* 説明 */}
              <motion.p
                className="text-sm text-muted-foreground line-clamp-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                {achievement.description}
              </motion.p>

              {/* XP */}
              <motion.div
                className="flex items-center gap-2 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <span className={`text-xs font-bold ${rarityStyle.text}`}>
                  +{achievement.xp} XP
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${rarityStyle.bg} ${rarityStyle.text} border ${rarityStyle.border}`}>
                  {achievement.rarity === 'common' && 'コモン'}
                  {achievement.rarity === 'uncommon' && 'アンコモン'}
                  {achievement.rarity === 'rare' && 'レア'}
                  {achievement.rarity === 'epic' && 'エピック'}
                  {achievement.rarity === 'legendary' && 'レジェンダリー'}
                </span>
              </motion.div>
            </div>

            {/* 閉じるボタン */}
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="flex-shrink-0 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* プログレスバー */}
          <motion.div
            className={`absolute bottom-0 left-0 h-1 ${rarityStyle.border.replace('border-', 'bg-')} rounded-b-xl`}
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: autoCloseDuration / 1000, ease: 'linear' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// 複数の実績を表示するコンテナ
interface AchievementToastContainerProps {
  achievements: { achievement: GameAchievement; timestamp: number }[];
  onRemove: (timestamp: number) => void;
}

export function AchievementToastContainer({
  achievements,
  onRemove,
}: AchievementToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-[100] space-y-3">
      <AnimatePresence>
        {achievements.slice(0, 3).map(({ achievement, timestamp }) => (
          <motion.div
            key={timestamp}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            layout
          >
            <AchievementToast
              achievement={achievement}
              onClose={() => onRemove(timestamp)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
