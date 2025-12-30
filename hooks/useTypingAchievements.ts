'use client';

import { useState, useEffect, useCallback } from 'react';
import { TYPING_ACHIEVEMENTS } from '@/lib/typing-achievements';
import type { GameAchievement } from '@/lib/game-achievements';
import type { TypingLanguage, TypingMode } from './useTypingLeaderboard';

interface TypingStats {
  totalGames: number;
  totalWordsTyped: number;
  highWpm: number;
  highAccuracy: number;
  totalTimeTyped: number; // seconds
  lastPlayed: number;
  englishHighWpm: number;
  japaneseHighWpm: number;
  mixedHighWpm: number;
}

interface UseTypingAchievementsOptions {
  onAchievementUnlock?: (achievement: GameAchievement) => void;
}

const STORAGE_KEY = 'typing-achievements-v1';
const STATS_KEY = 'typing-stats-v1';

const defaultStats: TypingStats = {
  totalGames: 0,
  totalWordsTyped: 0,
  highWpm: 0,
  highAccuracy: 0,
  totalTimeTyped: 0,
  lastPlayed: 0,
  englishHighWpm: 0,
  japaneseHighWpm: 0,
  mixedHighWpm: 0,
};

export function useTypingAchievements(options: UseTypingAchievementsOptions = {}) {
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState<TypingStats>(defaultStats);

  // 初期化
  useEffect(() => {
    try {
      const storedUnlocked = localStorage.getItem(STORAGE_KEY);
      if (storedUnlocked) {
        setUnlockedIds(new Set(JSON.parse(storedUnlocked)));
      }

      const storedStats = localStorage.getItem(STATS_KEY);
      if (storedStats) {
        setStats(JSON.parse(storedStats));
      }
    } catch {
      // ignore
    }
  }, []);

  // 実績解除
  const unlockAchievement = useCallback(
    (id: string): GameAchievement | null => {
      const achievement = TYPING_ACHIEVEMENTS.find((a) => a.id === id);
      if (!achievement || unlockedIds.has(id)) return null;

      const newUnlocked = new Set(unlockedIds);
      newUnlocked.add(id);
      setUnlockedIds(newUnlocked);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...newUnlocked]));

      options.onAchievementUnlock?.(achievement);
      return achievement;
    },
    [unlockedIds, options]
  );

  // 実績解除チェック
  const isUnlocked = useCallback(
    (id: string) => unlockedIds.has(id),
    [unlockedIds]
  );

  // 統計更新
  const updateStats = useCallback((newStats: Partial<TypingStats>) => {
    setStats((prev) => {
      const updated = { ...prev, ...newStats };
      localStorage.setItem(STATS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // ゲーム開始記録
  const recordGameStart = useCallback(() => {
    updateStats({ lastPlayed: Date.now() });
  }, [updateStats]);

  // ゲーム終了記録
  const recordGameOver = useCallback(
    (
      wpm: number,
      accuracy: number,
      wordsTyped: number,
      timeSeconds: number,
      language: TypingLanguage,
      _mode: TypingMode
    ) => {
      const newStats: Partial<TypingStats> = {
        totalGames: stats.totalGames + 1,
        totalWordsTyped: stats.totalWordsTyped + wordsTyped,
        highWpm: Math.max(stats.highWpm, wpm),
        highAccuracy: Math.max(stats.highAccuracy, accuracy),
        totalTimeTyped: stats.totalTimeTyped + timeSeconds,
        lastPlayed: Date.now(),
      };

      // 言語別ハイスコア
      if (language === 'en') {
        newStats.englishHighWpm = Math.max(stats.englishHighWpm, wpm);
      } else if (language === 'ja') {
        newStats.japaneseHighWpm = Math.max(stats.japaneseHighWpm, wpm);
      } else {
        newStats.mixedHighWpm = Math.max(stats.mixedHighWpm, wpm);
      }

      updateStats(newStats);

      const unlockedNow: GameAchievement[] = [];

      // ゲーム数系
      if (stats.totalGames === 0) {
        const a = unlockAchievement('typing_first_game');
        if (a) unlockedNow.push(a);
      }
      if (stats.totalGames + 1 >= 10 && !isUnlocked('typing_10_games')) {
        const a = unlockAchievement('typing_10_games');
        if (a) unlockedNow.push(a);
      }
      if (stats.totalGames + 1 >= 50 && !isUnlocked('typing_50_games')) {
        const a = unlockAchievement('typing_50_games');
        if (a) unlockedNow.push(a);
      }

      // WPM系
      if (wpm >= 30 && !isUnlocked('typing_wpm_30')) {
        const a = unlockAchievement('typing_wpm_30');
        if (a) unlockedNow.push(a);
      }
      if (wpm >= 50 && !isUnlocked('typing_wpm_50')) {
        const a = unlockAchievement('typing_wpm_50');
        if (a) unlockedNow.push(a);
      }
      if (wpm >= 80 && !isUnlocked('typing_wpm_80')) {
        const a = unlockAchievement('typing_wpm_80');
        if (a) unlockedNow.push(a);
      }
      if (wpm >= 100 && !isUnlocked('typing_wpm_100')) {
        const a = unlockAchievement('typing_wpm_100');
        if (a) unlockedNow.push(a);
      }
      if (wpm >= 120 && !isUnlocked('typing_wpm_120')) {
        const a = unlockAchievement('typing_wpm_120');
        if (a) unlockedNow.push(a);
      }

      // 正確率系
      if (accuracy >= 90 && !isUnlocked('typing_accuracy_90')) {
        const a = unlockAchievement('typing_accuracy_90');
        if (a) unlockedNow.push(a);
      }
      if (accuracy >= 95 && !isUnlocked('typing_accuracy_95')) {
        const a = unlockAchievement('typing_accuracy_95');
        if (a) unlockedNow.push(a);
      }
      if (accuracy >= 100 && !isUnlocked('typing_accuracy_100')) {
        const a = unlockAchievement('typing_accuracy_100');
        if (a) unlockedNow.push(a);
      }

      // 言語系
      if (language === 'en' && wpm >= 50 && !isUnlocked('typing_english_master')) {
        const a = unlockAchievement('typing_english_master');
        if (a) unlockedNow.push(a);
      }
      if (language === 'ja' && wpm >= 40 && !isUnlocked('typing_japanese_master')) {
        const a = unlockAchievement('typing_japanese_master');
        if (a) unlockedNow.push(a);
      }
      if (language === 'mixed' && wpm >= 50 && !isUnlocked('typing_bilingual')) {
        const a = unlockAchievement('typing_bilingual');
        if (a) unlockedNow.push(a);
      }

      // 夜更かし実績
      const hour = new Date().getHours();
      if (hour >= 2 && hour < 5 && !isUnlocked('typing_night_owl')) {
        const a = unlockAchievement('typing_night_owl');
        if (a) unlockedNow.push(a);
      }

      return unlockedNow;
    },
    [stats, updateStats, unlockAchievement, isUnlocked]
  );

  // 全実績取得
  const getAllAchievements = useCallback(() => {
    return TYPING_ACHIEVEMENTS.map((achievement) => ({
      ...achievement,
      unlocked: unlockedIds.has(achievement.id),
    }));
  }, [unlockedIds]);

  // 進捗
  const progress = {
    unlocked: unlockedIds.size,
    total: TYPING_ACHIEVEMENTS.length,
    percentage: Math.round((unlockedIds.size / TYPING_ACHIEVEMENTS.length) * 100),
  };

  return {
    stats,
    progress,
    isUnlocked,
    recordGameStart,
    recordGameOver,
    getAllAchievements,
  };
}
