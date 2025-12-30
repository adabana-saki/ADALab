'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  type GameAchievement,
  type UserGameAchievements,
  type GameStats,
  GAME_ACHIEVEMENTS,
  GAME_ACHIEVEMENTS_STORAGE_KEY,
  GAME_STATS_STORAGE_KEY,
  DEFAULT_GAME_STATS,
  DEFAULT_USER_GAME_ACHIEVEMENTS,
  getGameAchievementById,
} from '@/lib/game-achievements';

export interface AchievementUnlockEvent {
  achievement: GameAchievement;
  timestamp: number;
}

export interface UseGameAchievementsReturn {
  achievements: UserGameAchievements;
  stats: GameStats;
  recentUnlocks: AchievementUnlockEvent[];
  // 実績チェック関数
  checkAchievements: (stats: Partial<GameStats>) => GameAchievement[];
  // 統計更新
  updateStats: (updates: Partial<GameStats>) => void;
  // 実績解除
  unlockAchievement: (id: string) => GameAchievement | null;
  // 最近の解除をクリア
  clearRecentUnlocks: () => void;
  // 解除済みかチェック
  isUnlocked: (id: string) => boolean;
  // 進捗取得
  getProgress: () => { unlocked: number; total: number; percentage: number };
  // 全実績リスト（解除状態含む）
  getAllAchievements: () => (GameAchievement & { unlocked: boolean; unlockedAt?: number })[];
}

export function useGameAchievements(): UseGameAchievementsReturn {
  const [achievements, setAchievements] = useState<UserGameAchievements>(DEFAULT_USER_GAME_ACHIEVEMENTS);
  const [stats, setStats] = useState<GameStats>(DEFAULT_GAME_STATS);
  const [recentUnlocks, setRecentUnlocks] = useState<AchievementUnlockEvent[]>([]);
  const isInitialized = useRef(false);

  // LocalStorageから読み込み
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const storedAchievements = localStorage.getItem(GAME_ACHIEVEMENTS_STORAGE_KEY);
      if (storedAchievements) {
        setAchievements(JSON.parse(storedAchievements));
      }

      const storedStats = localStorage.getItem(GAME_STATS_STORAGE_KEY);
      if (storedStats) {
        setStats(JSON.parse(storedStats));
      }

      isInitialized.current = true;
    } catch (error) {
      console.error('Failed to load game achievements:', error);
    }
  }, []);

  // LocalStorageに保存
  const saveAchievements = useCallback((newAchievements: UserGameAchievements) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(GAME_ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(newAchievements));
    } catch (error) {
      console.error('Failed to save achievements:', error);
    }
  }, []);

  const saveStats = useCallback((newStats: GameStats) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(GAME_STATS_STORAGE_KEY, JSON.stringify(newStats));
    } catch (error) {
      console.error('Failed to save stats:', error);
    }
  }, []);

  // 実績解除
  const unlockAchievement = useCallback((id: string): GameAchievement | null => {
    const achievement = getGameAchievementById(id);
    if (!achievement) return null;

    // 既に解除済みかチェック
    if (achievements.unlocked.some((u) => u.achievementId === id)) {
      return null;
    }

    const newProgress = {
      achievementId: id,
      unlockedAt: Date.now(),
    };

    const newAchievements: UserGameAchievements = {
      ...achievements,
      unlocked: [...achievements.unlocked, newProgress],
      totalXp: achievements.totalXp + achievement.xp,
      lastUpdated: Date.now(),
    };

    setAchievements(newAchievements);
    saveAchievements(newAchievements);

    // 最近の解除に追加
    setRecentUnlocks((prev) => [
      ...prev,
      { achievement, timestamp: Date.now() },
    ]);

    return achievement;
  }, [achievements, saveAchievements]);

  // 解除済みかチェック
  const isUnlocked = useCallback((id: string): boolean => {
    return achievements.unlocked.some((u) => u.achievementId === id);
  }, [achievements]);

  // 統計更新
  const updateStats = useCallback((updates: Partial<GameStats>) => {
    const newStats: GameStats = {
      ...stats,
      ...updates,
      lastPlayed: Date.now(),
    };

    // ハイスコア更新
    if (updates.totalScore && updates.totalScore > stats.highScore) {
      newStats.highScore = updates.totalScore;
    }

    // 最大コンボ更新
    if (updates.maxCombo && updates.maxCombo > stats.maxCombo) {
      newStats.maxCombo = updates.maxCombo;
    }

    // 最大連勝更新
    if (updates.winStreak && updates.winStreak > stats.maxWinStreak) {
      newStats.maxWinStreak = updates.winStreak;
    }

    setStats(newStats);
    saveStats(newStats);
  }, [stats, saveStats]);

  // 実績チェック
  const checkAchievements = useCallback((currentStats: Partial<GameStats>): GameAchievement[] => {
    const unlockedNow: GameAchievement[] = [];
    const mergedStats = { ...stats, ...currentStats };

    // ゲーム数系
    if (mergedStats.totalGames >= 1 && !isUnlocked('first_game')) {
      const a = unlockAchievement('first_game');
      if (a) unlockedNow.push(a);
    }
    if (mergedStats.totalGames >= 10 && !isUnlocked('games_10')) {
      const a = unlockAchievement('games_10');
      if (a) unlockedNow.push(a);
    }
    if (mergedStats.totalGames >= 50 && !isUnlocked('games_50')) {
      const a = unlockAchievement('games_50');
      if (a) unlockedNow.push(a);
    }
    if (mergedStats.totalGames >= 100 && !isUnlocked('games_100')) {
      const a = unlockAchievement('games_100');
      if (a) unlockedNow.push(a);
    }

    // ライン系
    if (mergedStats.totalLines >= 1 && !isUnlocked('first_line')) {
      const a = unlockAchievement('first_line');
      if (a) unlockedNow.push(a);
    }
    if (mergedStats.totalLines >= 100 && !isUnlocked('lines_100')) {
      const a = unlockAchievement('lines_100');
      if (a) unlockedNow.push(a);
    }
    if (mergedStats.totalLines >= 500 && !isUnlocked('lines_500')) {
      const a = unlockAchievement('lines_500');
      if (a) unlockedNow.push(a);
    }
    if (mergedStats.totalLines >= 1000 && !isUnlocked('lines_1000')) {
      const a = unlockAchievement('lines_1000');
      if (a) unlockedNow.push(a);
    }

    // スコア系
    if (mergedStats.highScore >= 1000 && !isUnlocked('score_1000')) {
      const a = unlockAchievement('score_1000');
      if (a) unlockedNow.push(a);
    }
    if (mergedStats.highScore >= 5000 && !isUnlocked('score_5000')) {
      const a = unlockAchievement('score_5000');
      if (a) unlockedNow.push(a);
    }
    if (mergedStats.highScore >= 10000 && !isUnlocked('score_10000')) {
      const a = unlockAchievement('score_10000');
      if (a) unlockedNow.push(a);
    }
    if (mergedStats.highScore >= 50000 && !isUnlocked('score_50000')) {
      const a = unlockAchievement('score_50000');
      if (a) unlockedNow.push(a);
    }
    if (mergedStats.highScore >= 100000 && !isUnlocked('score_100000')) {
      const a = unlockAchievement('score_100000');
      if (a) unlockedNow.push(a);
    }

    // コンボ系
    if (mergedStats.maxCombo >= 3 && !isUnlocked('combo_3')) {
      const a = unlockAchievement('combo_3');
      if (a) unlockedNow.push(a);
    }
    if (mergedStats.maxCombo >= 5 && !isUnlocked('combo_5')) {
      const a = unlockAchievement('combo_5');
      if (a) unlockedNow.push(a);
    }
    if (mergedStats.maxCombo >= 10 && !isUnlocked('combo_10')) {
      const a = unlockAchievement('combo_10');
      if (a) unlockedNow.push(a);
    }
    if (mergedStats.maxCombo >= 15 && !isUnlocked('combo_15')) {
      const a = unlockAchievement('combo_15');
      if (a) unlockedNow.push(a);
    }

    // テトリス系
    if (mergedStats.totalTetris >= 1 && !isUnlocked('tetris')) {
      const a = unlockAchievement('tetris');
      if (a) unlockedNow.push(a);
    }
    if (mergedStats.totalTetris >= 10 && !isUnlocked('tetris_10')) {
      const a = unlockAchievement('tetris_10');
      if (a) unlockedNow.push(a);
    }

    // T-Spin系
    if (mergedStats.totalTSpins >= 1 && !isUnlocked('t_spin')) {
      const a = unlockAchievement('t_spin');
      if (a) unlockedNow.push(a);
    }
    if (mergedStats.totalTSpins >= 10 && !isUnlocked('t_spin_10')) {
      const a = unlockAchievement('t_spin_10');
      if (a) unlockedNow.push(a);
    }

    // バトル系
    if (mergedStats.battleWins + mergedStats.battleLosses >= 1 && !isUnlocked('first_battle')) {
      const a = unlockAchievement('first_battle');
      if (a) unlockedNow.push(a);
    }
    if (mergedStats.battleWins >= 1 && !isUnlocked('first_win')) {
      const a = unlockAchievement('first_win');
      if (a) unlockedNow.push(a);
    }
    if (mergedStats.battleWins >= 10 && !isUnlocked('wins_10')) {
      const a = unlockAchievement('wins_10');
      if (a) unlockedNow.push(a);
    }
    if (mergedStats.battleWins >= 50 && !isUnlocked('wins_50')) {
      const a = unlockAchievement('wins_50');
      if (a) unlockedNow.push(a);
    }

    // 連勝系
    if (mergedStats.maxWinStreak >= 3 && !isUnlocked('win_streak_3')) {
      const a = unlockAchievement('win_streak_3');
      if (a) unlockedNow.push(a);
    }
    if (mergedStats.maxWinStreak >= 5 && !isUnlocked('win_streak_5')) {
      const a = unlockAchievement('win_streak_5');
      if (a) unlockedNow.push(a);
    }
    if (mergedStats.maxWinStreak >= 10 && !isUnlocked('win_streak_10')) {
      const a = unlockAchievement('win_streak_10');
      if (a) unlockedNow.push(a);
    }

    // ガベージ系
    if (mergedStats.garbageSent >= 100 && !isUnlocked('garbage_send_100')) {
      const a = unlockAchievement('garbage_send_100');
      if (a) unlockedNow.push(a);
    }

    // 時間系
    if (mergedStats.totalPlayTime >= 600 && !isUnlocked('survivor')) {
      const a = unlockAchievement('survivor');
      if (a) unlockedNow.push(a);
    }

    // 深夜プレイ
    const hour = new Date().getHours();
    if (hour >= 2 && hour < 5 && !isUnlocked('night_owl')) {
      const a = unlockAchievement('night_owl');
      if (a) unlockedNow.push(a);
    }

    return unlockedNow;
  }, [stats, isUnlocked, unlockAchievement]);

  // 最近の解除をクリア
  const clearRecentUnlocks = useCallback(() => {
    setRecentUnlocks([]);
  }, []);

  // 進捗取得
  const getProgress = useCallback(() => {
    const total = GAME_ACHIEVEMENTS.length;
    const unlocked = achievements.unlocked.length;
    const percentage = Math.round((unlocked / total) * 100);
    return { unlocked, total, percentage };
  }, [achievements]);

  // 全実績リスト（解除状態含む）
  const getAllAchievements = useCallback(() => {
    return GAME_ACHIEVEMENTS.map((achievement) => {
      const progress = achievements.unlocked.find((u) => u.achievementId === achievement.id);
      return {
        ...achievement,
        unlocked: !!progress,
        unlockedAt: progress?.unlockedAt,
      };
    });
  }, [achievements]);

  return {
    achievements,
    stats,
    recentUnlocks,
    checkAchievements,
    updateStats,
    unlockAchievement,
    clearRecentUnlocks,
    isUnlocked,
    getProgress,
    getAllAchievements,
  };
}
