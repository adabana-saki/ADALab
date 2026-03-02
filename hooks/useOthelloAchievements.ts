'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { OTHELLO_ACHIEVEMENTS } from '@/lib/othello-achievements';
import type { GameAchievement } from '@/lib/game-achievements';
import type { Difficulty } from '@/lib/othello-ai';
import { useAchievementSync } from './useAchievementSync';

interface OthelloStats {
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  easyWins: number;
  normalWins: number;
  hardWins: number;
  currentStreak: number;
  maxStreak: number;
  bestScore: number; // 最多獲得駒数
  lastPlayed: number;
}

interface UseOthelloAchievementsOptions {
  onAchievementUnlock?: (achievement: GameAchievement) => void;
}

const STORAGE_KEY = 'othello-achievements-v1';
const STATS_KEY = 'othello-stats-v1';

const defaultStats: OthelloStats = {
  totalGames: 0,
  totalWins: 0,
  totalLosses: 0,
  totalDraws: 0,
  easyWins: 0,
  normalWins: 0,
  hardWins: 0,
  currentStreak: 0,
  maxStreak: 0,
  bestScore: 0,
  lastPlayed: 0,
};

export function useOthelloAchievements(options: UseOthelloAchievementsOptions = {}) {
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState<OthelloStats>(defaultStats);
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
        setStats({ ...defaultStats, ...JSON.parse(storedStats) });
      }
    } catch {
      // ignore
    }
  }, []);

  // 実績解除
  const unlockAchievement = useCallback(
    (id: string): GameAchievement | null => {
      const achievement = OTHELLO_ACHIEVEMENTS.find((a) => a.id === id);
      if (!achievement || unlockedIds.has(id)) return null;

      const newUnlocked = new Set(unlockedIds);
      newUnlocked.add(id);
      setUnlockedIds(newUnlocked);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...newUnlocked]));

      pendingSyncRef.current.push(id);

      options.onAchievementUnlock?.(achievement);
      return achievement;
    },
    [unlockedIds, options]
  );

  // サーバー同期
  const flushAchievementSync = useCallback(async () => {
    if (pendingSyncRef.current.length > 0) {
      const toSync = [...pendingSyncRef.current];
      pendingSyncRef.current = [];
      await syncAchievements('othello', toSync);
    }
  }, [syncAchievements]);

  const isUnlocked = useCallback((id: string) => unlockedIds.has(id), [unlockedIds]);

  // 統計更新
  const updateStats = useCallback((newStats: Partial<OthelloStats>) => {
    setStats((prev) => {
      const updated = { ...prev, ...newStats };
      localStorage.setItem(STATS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // ゲーム開始記録
  const recordGameStart = useCallback(() => {
    updateStats({ lastPlayed: Date.now() });

    const unlockedNow: GameAchievement[] = [];

    // 初めてのゲーム
    if (stats.totalGames === 0 && !isUnlocked('othello_first_game')) {
      const a = unlockAchievement('othello_first_game');
      if (a) unlockedNow.push(a);
    }

    // 夜更かし実績
    const hour = new Date().getHours();
    if (hour >= 2 && hour < 5 && !isUnlocked('othello_night_owl')) {
      const a = unlockAchievement('othello_night_owl');
      if (a) unlockedNow.push(a);
    }

    flushAchievementSync();
    return unlockedNow;
  }, [stats, updateStats, unlockAchievement, isUnlocked, flushAchievementSync]);

  // 勝利記録
  const recordGameWin = useCallback(
    (difficulty: Difficulty, blackCount: number, whiteCount: number, allCorners: boolean, wasLosingBy10: boolean) => {
      const newCurrentStreak = stats.currentStreak + 1;
      const newMaxStreak = Math.max(stats.maxStreak, newCurrentStreak);

      const newStats: Partial<OthelloStats> = {
        totalGames: stats.totalGames + 1,
        totalWins: stats.totalWins + 1,
        currentStreak: newCurrentStreak,
        maxStreak: newMaxStreak,
        bestScore: Math.max(stats.bestScore, blackCount),
        lastPlayed: Date.now(),
      };

      if (difficulty === 'easy') newStats.easyWins = stats.easyWins + 1;
      if (difficulty === 'normal') newStats.normalWins = stats.normalWins + 1;
      if (difficulty === 'hard') newStats.hardWins = stats.hardWins + 1;

      updateStats(newStats);

      const unlockedNow: GameAchievement[] = [];

      // 初勝利
      if (stats.totalWins === 0 && !isUnlocked('othello_first_win')) {
        const a = unlockAchievement('othello_first_win');
        if (a) unlockedNow.push(a);
      }

      // ゲーム数系
      const totalGames = stats.totalGames + 1;
      if (totalGames >= 10 && !isUnlocked('othello_10_games')) {
        const a = unlockAchievement('othello_10_games');
        if (a) unlockedNow.push(a);
      }
      if (totalGames >= 50 && !isUnlocked('othello_50_games')) {
        const a = unlockAchievement('othello_50_games');
        if (a) unlockedNow.push(a);
      }
      if (totalGames >= 100 && !isUnlocked('othello_100_games')) {
        const a = unlockAchievement('othello_100_games');
        if (a) unlockedNow.push(a);
      }

      // 難易度別勝利
      if (difficulty === 'easy' && !isUnlocked('othello_easy_win')) {
        const a = unlockAchievement('othello_easy_win');
        if (a) unlockedNow.push(a);
      }
      if (difficulty === 'normal' && !isUnlocked('othello_normal_win')) {
        const a = unlockAchievement('othello_normal_win');
        if (a) unlockedNow.push(a);
      }
      if (difficulty === 'hard' && !isUnlocked('othello_hard_win')) {
        const a = unlockAchievement('othello_hard_win');
        if (a) unlockedNow.push(a);
      }

      // 全難易度勝利
      const allDiffs =
        (stats.easyWins > 0 || difficulty === 'easy') &&
        (stats.normalWins > 0 || difficulty === 'normal') &&
        (stats.hardWins > 0 || difficulty === 'hard');
      if (allDiffs && !isUnlocked('othello_all_difficulties')) {
        const a = unlockAchievement('othello_all_difficulties');
        if (a) unlockedNow.push(a);
      }

      // スコア系
      if (blackCount >= 40 && !isUnlocked('othello_domination_40')) {
        const a = unlockAchievement('othello_domination_40');
        if (a) unlockedNow.push(a);
      }
      if (blackCount >= 50 && !isUnlocked('othello_domination_50')) {
        const a = unlockAchievement('othello_domination_50');
        if (a) unlockedNow.push(a);
      }
      if (blackCount === 64 && !isUnlocked('othello_perfect_64')) {
        const a = unlockAchievement('othello_perfect_64');
        if (a) unlockedNow.push(a);
      }

      // 接戦
      if (blackCount - whiteCount <= 2 && !isUnlocked('othello_close_game')) {
        const a = unlockAchievement('othello_close_game');
        if (a) unlockedNow.push(a);
      }

      // 角取り名人
      if (allCorners && !isUnlocked('othello_corner_master')) {
        const a = unlockAchievement('othello_corner_master');
        if (a) unlockedNow.push(a);
      }

      // 大逆転
      if (wasLosingBy10 && !isUnlocked('othello_comeback')) {
        const a = unlockAchievement('othello_comeback');
        if (a) unlockedNow.push(a);
      }

      // 連勝
      if (newCurrentStreak >= 3 && !isUnlocked('othello_streak_3')) {
        const a = unlockAchievement('othello_streak_3');
        if (a) unlockedNow.push(a);
      }
      if (newCurrentStreak >= 5 && !isUnlocked('othello_streak_5')) {
        const a = unlockAchievement('othello_streak_5');
        if (a) unlockedNow.push(a);
      }
      if (newCurrentStreak >= 10 && !isUnlocked('othello_streak_10')) {
        const a = unlockAchievement('othello_streak_10');
        if (a) unlockedNow.push(a);
      }

      flushAchievementSync();
      return unlockedNow;
    },
    [stats, updateStats, unlockAchievement, isUnlocked, flushAchievementSync]
  );

  // 敗北記録
  const recordGameLoss = useCallback(() => {
    const newStats: Partial<OthelloStats> = {
      totalGames: stats.totalGames + 1,
      totalLosses: stats.totalLosses + 1,
      currentStreak: 0,
      lastPlayed: Date.now(),
    };
    updateStats(newStats);

    const unlockedNow: GameAchievement[] = [];

    // ゲーム数系
    const totalGames = stats.totalGames + 1;
    if (totalGames >= 10 && !isUnlocked('othello_10_games')) {
      const a = unlockAchievement('othello_10_games');
      if (a) unlockedNow.push(a);
    }
    if (totalGames >= 50 && !isUnlocked('othello_50_games')) {
      const a = unlockAchievement('othello_50_games');
      if (a) unlockedNow.push(a);
    }
    if (totalGames >= 100 && !isUnlocked('othello_100_games')) {
      const a = unlockAchievement('othello_100_games');
      if (a) unlockedNow.push(a);
    }

    flushAchievementSync();
    return unlockedNow;
  }, [stats, updateStats, unlockAchievement, isUnlocked, flushAchievementSync]);

  // 引き分け記録
  const recordGameDraw = useCallback(() => {
    updateStats({
      totalGames: stats.totalGames + 1,
      totalDraws: stats.totalDraws + 1,
      currentStreak: 0,
      lastPlayed: Date.now(),
    });

    const unlockedNow: GameAchievement[] = [];
    const totalGames = stats.totalGames + 1;
    if (totalGames >= 10 && !isUnlocked('othello_10_games')) {
      const a = unlockAchievement('othello_10_games');
      if (a) unlockedNow.push(a);
    }
    if (totalGames >= 50 && !isUnlocked('othello_50_games')) {
      const a = unlockAchievement('othello_50_games');
      if (a) unlockedNow.push(a);
    }
    if (totalGames >= 100 && !isUnlocked('othello_100_games')) {
      const a = unlockAchievement('othello_100_games');
      if (a) unlockedNow.push(a);
    }

    flushAchievementSync();
    return unlockedNow;
  }, [stats, updateStats, unlockAchievement, isUnlocked, flushAchievementSync]);

  // 全実績取得
  const getAllAchievements = useCallback(() => {
    return OTHELLO_ACHIEVEMENTS.map((achievement) => ({
      ...achievement,
      unlocked: unlockedIds.has(achievement.id),
    }));
  }, [unlockedIds]);

  // 進捗
  const progress = {
    unlocked: unlockedIds.size,
    total: OTHELLO_ACHIEVEMENTS.length,
    percentage: Math.round((unlockedIds.size / OTHELLO_ACHIEVEMENTS.length) * 100),
  };

  return {
    stats,
    progress,
    isUnlocked,
    recordGameStart,
    recordGameWin,
    recordGameLoss,
    recordGameDraw,
    getAllAchievements,
  };
}
