'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Sparkles, Star, PartyPopper } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SuccessCelebrationProps {
  isVisible: boolean;
  title: string;
  message: string;
  subMessage?: string;
  onComplete?: () => void;
}

// 紙吹雪のパーティクル
const ConfettiParticle = ({ index }: { index: number }) => {
  const colors = ['#00f5ff', '#ff00ff', '#a855f7', '#22c55e', '#eab308', '#f97316'];
  const color = colors[index % colors.length];
  const randomX = Math.random() * 100;
  const randomDelay = Math.random() * 0.5;
  const randomDuration = 1.5 + Math.random() * 1;
  const randomRotation = Math.random() * 720 - 360;

  return (
    <motion.div
      className="absolute w-3 h-3 rounded-sm"
      style={{
        left: `${randomX}%`,
        top: '-10px',
        backgroundColor: color,
      }}
      initial={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
      animate={{
        y: [0, 400],
        opacity: [1, 1, 0],
        rotate: randomRotation,
        scale: [1, 0.5],
        x: [0, (Math.random() - 0.5) * 200],
      }}
      transition={{
        duration: randomDuration,
        delay: randomDelay,
        ease: 'easeOut',
      }}
    />
  );
};

// 星のパーティクル
const StarParticle = ({ index }: { index: number }) => {
  const angle = (index * 45) * (Math.PI / 180);
  const distance = 80 + Math.random() * 40;

  return (
    <motion.div
      className="absolute text-yellow-400"
      style={{
        left: '50%',
        top: '50%',
      }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
      animate={{
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        opacity: [0, 1, 0],
        scale: [0, 1.5, 0],
      }}
      transition={{
        duration: 0.8,
        delay: 0.3 + index * 0.05,
        ease: 'easeOut',
      }}
    >
      <Star size={16} fill="currentColor" />
    </motion.div>
  );
};

export function SuccessCelebration({
  isVisible,
  title,
  message,
  subMessage,
  onComplete,
}: SuccessCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
        onComplete?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="relative overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* 紙吹雪 */}
          {showConfetti && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(30)].map((_, i) => (
                <ConfettiParticle key={i} index={i} />
              ))}
            </div>
          )}

          {/* メインコンテンツ */}
          <div className="relative z-10 text-center py-8">
            {/* アイコンアニメーション */}
            <div className="relative inline-block mb-6">
              {/* 背景のグロー */}
              <motion.div
                className="absolute inset-0 bg-green-500/30 rounded-full blur-xl"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 2, opacity: [0, 0.5, 0.3] }}
                transition={{ duration: 0.8 }}
              />

              {/* 星のパーティクル */}
              <div className="relative">
                {[...Array(8)].map((_, i) => (
                  <StarParticle key={i} index={i} />
                ))}
              </div>

              {/* メインアイコン */}
              <motion.div
                className="relative"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 15,
                  delay: 0.1,
                }}
              >
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 0 0 rgba(34, 197, 94, 0.4)',
                      '0 0 0 20px rgba(34, 197, 94, 0)',
                    ],
                  }}
                  transition={{
                    duration: 1,
                    repeat: 2,
                  }}
                  className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center"
                >
                  <CheckCircle className="w-10 h-10 text-white" />
                </motion.div>
              </motion.div>

              {/* スパークル */}
              <motion.div
                className="absolute -top-2 -right-2 text-yellow-400"
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: [0, 1.2, 1], rotate: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <Sparkles size={24} />
              </motion.div>

              <motion.div
                className="absolute -bottom-1 -left-3 text-neon-fuchsia"
                initial={{ scale: 0, rotate: 45 }}
                animate={{ scale: [0, 1.2, 1], rotate: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                <PartyPopper size={20} />
              </motion.div>
            </div>

            {/* タイトル */}
            <motion.h3
              className="text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-green-400 to-neon-cyan bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {title}
            </motion.h3>

            {/* メッセージ */}
            <motion.p
              className="text-muted-foreground mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {message}
            </motion.p>

            {/* サブメッセージ */}
            {subMessage && (
              <motion.p
                className="text-sm text-muted-foreground/70"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                {subMessage}
              </motion.p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
