'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { SNAKE_ACHIEVEMENTS } from '@/lib/snake-achievements';
import type { GameAchievement } from '@/lib/game-achievements';
import { useAchievementSync } from './useAchievementSync';

interface SnakeStats {
  totalGames: number;
  totalScore: number;
  highScore: number;
  maxLength: number;
  totalFoodEaten: number;
  longestSurvival: number; // seconds
  lastPlayed: number;
}

interface UseSnakeAchievementsOptions {
  onAchievementUnlock?: (achievement: GameAchievement) => void;
}

const STORAGE_KEY = 'snake-achievements-v1';
const STATS_KEY = 'snake-stats-v1';

const defaultStats: SnakeStats = {
  totalGames: 0,
  totalScore: 0,
  highScore: 0,
  maxLength: 0,
  totalFoodEaten: 0,
  longestSurvival: 0,
  lastPlayed: 0,
};

export function useSnakeAchievements(options: UseSnakeAchievementsOptions = {}) {
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState<SnakeStats>(defaultStats);
  const { syncAchievements } = useAchievementSync();
  const pendingSyncRef = useRef<string[]>([]);

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
      const achievement = SNAKE_ACHIEVEMENTS.find((a) => a.id === id);
      if (!achievement || unlockedIds.has(id)) return null;

      const newUnlocked = new Set(unlockedIds);
      newUnlocked.add(id);
      setUnlockedIds(newUnlocked);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...newUnlocked]));

      // 同期待ちリストに追加
      pendingSyncRef.current.push(id);

      options.onAchievementUnlock?.(achievement);
      return achievement;
    },
    [unlockedIds, options]
  );

  // 実績をサーバーに同期
  const flushAchievementSync = useCallback(async () => {
    if (pendingSyncRef.current.length > 0) {
      const toSync = [...pendingSyncRef.current];
      pendingSyncRef.current = [];
      await syncAchievements('snake', toSync);
    }
  }, [syncAchievements]);

  // 実績解除チェック
  const isUnlocked = useCallback(
    (id: string) => unlockedIds.has(id),
    [unlockedIds]
  );

  // 統計更新
  const updateStats = useCallback((newStats: Partial<SnakeStats>) => {
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

  // ゲームオーバー記録
  const recordGameOver = useCallback(
    (score: number, length: number, survivalTime: number, foodEaten: number) => {
      const newStats: Partial<SnakeStats> = {
        totalGames: stats.totalGames + 1,
        totalScore: stats.totalScore + score,
        highScore: Math.max(stats.highScore, score),
        maxLength: Math.max(stats.maxLength, length),
        totalFoodEaten: stats.totalFoodEaten + foodEaten,
        longestSurvival: Math.max(stats.longestSurvival, survivalTime),
        lastPlayed: Date.now(),
      };

      updateStats(newStats);

      const unlockedNow: GameAchievement[] = [];

      // ゲーム数系
      if (stats.totalGames === 0) {
        const a = unlockAchievement('snake_first_game');
        if (a) unlockedNow.push(a);
      }
      if (stats.totalGames + 1 >= 10 && !isUnlocked('snake_10_games')) {
        const a = unlockAchievement('snake_10_games');
        if (a) unlockedNow.push(a);
      }
      if (stats.totalGames + 1 >= 50 && !isUnlocked('snake_50_games')) {
        const a = unlockAchievement('snake_50_games');
        if (a) unlockedNow.push(a);
      }

      // 最初のエサ
      if (foodEaten >= 1 && !isUnlocked('snake_first_food')) {
        const a = unlockAchievement('snake_first_food');
        if (a) unlockedNow.push(a);
      }

      // スコア系
      if (score >= 100 && !isUnlocked('snake_score_100')) {
        const a = unlockAchievement('snake_score_100');
        if (a) unlockedNow.push(a);
      }
      if (score >= 500 && !isUnlocked('snake_score_500')) {
        const a = unlockAchievement('snake_score_500');
        if (a) unlockedNow.push(a);
      }
      if (score >= 1000 && !isUnlocked('snake_score_1000')) {
        const a = unlockAchievement('snake_score_1000');
        if (a) unlockedNow.push(a);
      }

      // 長さ系
      if (length >= 10 && !isUnlocked('snake_length_10')) {
        const a = unlockAchievement('snake_length_10');
        if (a) unlockedNow.push(a);
      }
      if (length >= 25 && !isUnlocked('snake_length_25')) {
        const a = unlockAchievement('snake_length_25');
        if (a) unlockedNow.push(a);
      }
      if (length >= 50 && !isUnlocked('snake_length_50')) {
        const a = unlockAchievement('snake_length_50');
        if (a) unlockedNow.push(a);
      }

      // 生存時間系
      if (survivalTime >= 60 && !isUnlocked('snake_survive_60')) {
        const a = unlockAchievement('snake_survive_60');
        if (a) unlockedNow.push(a);
      }
      if (survivalTime >= 180 && !isUnlocked('snake_survive_180')) {
        const a = unlockAchievement('snake_survive_180');
        if (a) unlockedNow.push(a);
      }
      if (survivalTime >= 300 && !isUnlocked('snake_survive_300')) {
        const a = unlockAchievement('snake_survive_300');
        if (a) unlockedNow.push(a);
      }

      // 夜更かし実績
      const hour = new Date().getHours();
      if (hour >= 2 && hour < 5 && !isUnlocked('snake_night_owl')) {
        const a = unlockAchievement('snake_night_owl');
        if (a) unlockedNow.push(a);
      }

      // 新しく解除された実績をサーバーに同期
      flushAchievementSync();

      return unlockedNow;
    },
    [stats, updateStats, unlockAchievement, isUnlocked, flushAchievementSync]
  );

  // パーフェクトラン記録（壁に触れずに30点）
  const recordPerfectRun = useCallback(
    (score: number) => {
      if (score >= 30 && !isUnlocked('snake_perfect_run')) {
        return unlockAchievement('snake_perfect_run');
      }
      return null;
    },
    [isUnlocked, unlockAchievement]
  );

  // 全実績取得
  const getAllAchievements = useCallback(() => {
    return SNAKE_ACHIEVEMENTS.map((achievement) => ({
      ...achievement,
      unlocked: unlockedIds.has(achievement.id),
    }));
  }, [unlockedIds]);

  // 進捗
  const progress = {
    unlocked: unlockedIds.size,
    total: SNAKE_ACHIEVEMENTS.length,
    percentage: Math.round((unlockedIds.size / SNAKE_ACHIEVEMENTS.length) * 100),
  };

  return {
    stats,
    progress,
    isUnlocked,
    recordGameStart,
    recordGameOver,
    recordPerfectRun,
    getAllAchievements,
  };
}
