'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface AchievementNotificationProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export function AchievementNotification({ achievement, onClose }: AchievementNotificationProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; angle: number; speed: number; color: string }>>([]);

  useEffect(() => {
    if (!achievement) return;

    // Create explosion particles
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: 0,
      y: 0,
      angle: (Math.PI * 2 * i) / 30,
      speed: 3 + Math.random() * 5,
      color: ['#06b6d4', '#d946ef', '#8b5cf6', '#f59e0b'][Math.floor(Math.random() * 4)],
    }));
    setParticles(newParticles);

    // Auto close after 5 seconds
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [achievement, onClose]);

  if (!achievement) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.5, y: -50 }}
        className="fixed top-20 right-4 z-[250] pointer-events-none"
      >
        {/* Particles */}
        <div className="absolute inset-0">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: Math.cos(particle.angle) * particle.speed * 30,
                y: Math.sin(particle.angle) * particle.speed * 30,
                opacity: 0,
                scale: 0,
              }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: particle.color,
                left: '50%',
                top: '50%',
                boxShadow: `0 0 10px ${particle.color}`,
              }}
            />
          ))}
        </div>

        {/* Notification card */}
        <div className="bg-black/95 backdrop-blur-xl border-2 neon-border-yellow rounded-xl p-6 min-w-[320px] shadow-2xl pointer-events-auto">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="flex-shrink-0"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-3xl shadow-lg">
                {achievement.icon}
              </div>
            </motion.div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-xs font-mono text-yellow-400 uppercase tracking-wider">
                  Achievement Unlocked!
                </span>
              </div>

              <h3 className="text-lg font-bold holographic-text mb-1">
                {achievement.title}
              </h3>

              <p className="text-sm text-muted-foreground">
                {achievement.description}
              </p>
            </div>
          </div>

          {/* Progress bar animation */}
          <motion.div
            className="mt-4 h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 5, ease: 'linear' }}
          />

          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-xl blur-xl -z-10 animate-pulse" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
