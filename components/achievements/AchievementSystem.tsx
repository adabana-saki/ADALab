'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { AchievementTracker } from './AchievementTracker';
import { AchievementNotification } from './AchievementNotification';
import { AchievementsModal } from './AchievementsModal';
import { getCompletionPercentage, type Achievement } from '@/lib/achievements';

export function AchievementSystem() {
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    setCompletion(getCompletionPercentage());

    // Update completion when achievements change
    const interval = setInterval(() => {
      setCompletion(getCompletionPercentage());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Keyboard shortcut: Ctrl+Shift+A to open achievements
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleUnlock = (achievement: Achievement) => {
    setCurrentAchievement(achievement);
    setCompletion(getCompletionPercentage());

    // Play sound effect if enabled
    const soundEvent = new CustomEvent('achievement-unlocked');
    window.dispatchEvent(soundEvent);
  };

  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (completion / 100) * circumference;

  return (
    <>
      {/* Achievement tracker (invisible) */}
      <AchievementTracker onUnlock={handleUnlock} />

      {/* Floating achievement button with progress ring */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-40 right-4 z-[150] w-14 h-14 rounded-full bg-black/80 backdrop-blur-xl border-2 neon-border-yellow hover:scale-110 transition-all shadow-2xl flex items-center justify-center group"
        aria-label="View achievements"
      >
        {/* Progress ring */}
        <svg className="absolute w-full h-full transform -rotate-90">
          <circle
            cx="28"
            cy="28"
            r={radius}
            stroke="rgba(234, 179, 8, 0.2)"
            strokeWidth="3"
            fill="none"
          />
          <motion.circle
            cx="28"
            cy="28"
            r={radius}
            stroke="url(#achievement-gradient)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{
              strokeDasharray: circumference,
            }}
          />
          <defs>
            <linearGradient id="achievement-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
        </svg>

        {/* Trophy icon */}
        <Trophy className="w-6 h-6 text-yellow-400 relative z-10" />

        {/* Completion percentage */}
        {completion > 0 && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-black">
            {completion}
          </div>
        )}

        {/* Tooltip */}
        <div className="absolute right-full mr-2 px-3 py-1 bg-black/90 backdrop-blur-md border border-yellow-400/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          <span className="text-xs text-yellow-400 font-mono">
            Achievements ({completion}%) - Ctrl+Shift+A
          </span>
        </div>

        {/* Glow effect */}
        <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
      </button>

      {/* Achievement unlock notification */}
      <AchievementNotification
        achievement={currentAchievement}
        onClose={() => setCurrentAchievement(null)}
      />

      {/* Achievements modal */}
      <AchievementsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
