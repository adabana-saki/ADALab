'use client';

import { useState, useEffect, useCallback } from 'react';
import { MINESWEEPER_ACHIEVEMENTS } from '@/lib/minesweeper-achievements';
import type { GameAchievement } from '@/lib/game-achievements';
import type { Difficulty } from './useMinesweeperGame';

interface MinesweeperStats {
  totalGames: number;
  totalClears: number;
  beginnerClears: number;
  intermediateClears: number;
  expertClears: number;
  bestTimesBeginner: number; // seconds
  bestTimesIntermediate: number;
  bestTimesExpert: number;
  currentStreak: number;
  maxStreak: number;
  battleWins: number;
  battleLosses: number;
  noFlagClears: number;
  perfectFlagClears: number;
  lastPlayed: number;
}

interface UseMinesweeperAchievementsOptions {
  onAchievementUnlock?: (achievement: GameAchievement) => void;
}

const STORAGE_KEY = 'minesweeper-achievements-v1';
const STATS_KEY = 'minesweeper-stats-v1';

const defaultStats: MinesweeperStats = {
  totalGames: 0,
  totalClears: 0,
  beginnerClears: 0,
  intermediateClears: 0,
  expertClears: 0,
  bestTimesBeginner: Infinity,
  bestTimesIntermediate: Infinity,
  bestTimesExpert: Infinity,
  currentStreak: 0,
  maxStreak: 0,
  battleWins: 0,
  battleLosses: 0,
  noFlagClears: 0,
  perfectFlagClears: 0,
  lastPlayed: 0,
};

export function useMinesweeperAchievements(options: UseMinesweeperAchievementsOptions = {}) {
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState<MinesweeperStats>(defaultStats);

  // 初期化
  useEffect(() => {
    try {
      const storedUnlocked = localStorage.getItem(STORAGE_KEY);
      if (storedUnlocked) {
        setUnlockedIds(new Set(JSON.parse(storedUnlocked)));
      }

      const storedStats = localStorage.getItem(STATS_KEY);
      if (storedStats) {
        const parsed = JSON.parse(storedStats);
        // Infinityはパースできないので処理
        setStats({
          ...defaultStats,
          ...parsed,
          bestTimesBeginner: parsed.bestTimesBeginner === null ? Infinity : parsed.bestTimesBeginner,
          bestTimesIntermediate: parsed.bestTimesIntermediate === null ? Infinity : parsed.bestTimesIntermediate,
          bestTimesExpert: parsed.bestTimesExpert === null ? Infinity : parsed.bestTimesExpert,
        });
      }
    } catch {
      // ignore
    }
  }, []);

  // 実績解除
  const unlockAchievement = useCallback(
    (id: string): GameAchievement | null => {
      const achievement = MINESWEEPER_ACHIEVEMENTS.find((a) => a.id === id);
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
  const isUnlocked = useCallback((id: string) => unlockedIds.has(id), [unlockedIds]);

  // 統計更新
  const updateStats = useCallback((newStats: Partial<MinesweeperStats>) => {
    setStats((prev) => {
      const updated = { ...prev, ...newStats };
      // JSONでInfinityを保存できないのでnullに変換
      const toSave = {
        ...updated,
        bestTimesBeginner: updated.bestTimesBeginner === Infinity ? null : updated.bestTimesBeginner,
        bestTimesIntermediate: updated.bestTimesIntermediate === Infinity ? null : updated.bestTimesIntermediate,
        bestTimesExpert: updated.bestTimesExpert === Infinity ? null : updated.bestTimesExpert,
      };
      localStorage.setItem(STATS_KEY, JSON.stringify(toSave));
      return updated;
    });
  }, []);

  // ゲーム開始記録
  const recordGameStart = useCallback(() => {
    updateStats({ lastPlayed: Date.now() });

    const unlockedNow: GameAchievement[] = [];

    // 初めてのゲーム
    if (stats.totalGames === 0 && !isUnlocked('minesweeper_first_game')) {
      const a = unlockAchievement('minesweeper_first_game');
      if (a) unlockedNow.push(a);
    }

    // 夜更かし実績
    const hour = new Date().getHours();
    if (hour >= 2 && hour < 5 && !isUnlocked('minesweeper_night_owl')) {
      const a = unlockAchievement('minesweeper_night_owl');
      if (a) unlockedNow.push(a);
    }

    return unlockedNow;
  }, [stats, updateStats, unlockAchievement, isUnlocked]);

  // ゲームクリア記録
  const recordGameClear = useCallback(
    (difficulty: Difficulty, timeSeconds: number, flagCount: number, mineCount: number) => {
      const newCurrentStreak = stats.currentStreak + 1;
      const newMaxStreak = Math.max(stats.maxStreak, newCurrentStreak);

      const newStats: Partial<MinesweeperStats> = {
        totalGames: stats.totalGames + 1,
        totalClears: stats.totalClears + 1,
        currentStreak: newCurrentStreak,
        maxStreak: newMaxStreak,
        lastPlayed: Date.now(),
      };

      // 難易度別クリア数とベストタイム
      if (difficulty === 'beginner') {
        newStats.beginnerClears = stats.beginnerClears + 1;
        newStats.bestTimesBeginner = Math.min(stats.bestTimesBeginner, timeSeconds);
      } else if (difficulty === 'intermediate') {
        newStats.intermediateClears = stats.intermediateClears + 1;
        newStats.bestTimesIntermediate = Math.min(stats.bestTimesIntermediate, timeSeconds);
      } else if (difficulty === 'expert') {
        newStats.expertClears = stats.expertClears + 1;
        newStats.bestTimesExpert = Math.min(stats.bestTimesExpert, timeSeconds);
      }

      // ノーフラグ/パーフェクトフラグ
      if (flagCount === 0) {
        newStats.noFlagClears = stats.noFlagClears + 1;
      }
      if (flagCount === mineCount) {
        newStats.perfectFlagClears = stats.perfectFlagClears + 1;
      }

      updateStats(newStats);

      const unlockedNow: GameAchievement[] = [];

      // 初クリア
      if (stats.totalClears === 0 && !isUnlocked('minesweeper_first_clear')) {
        const a = unlockAchievement('minesweeper_first_clear');
        if (a) unlockedNow.push(a);
      }

      // ゲーム数系
      if (stats.totalGames + 1 >= 10 && !isUnlocked('minesweeper_10_games')) {
        const a = unlockAchievement('minesweeper_10_games');
        if (a) unlockedNow.push(a);
      }
      if (stats.totalGames + 1 >= 50 && !isUnlocked('minesweeper_50_games')) {
        const a = unlockAchievement('minesweeper_50_games');
        if (a) unlockedNow.push(a);
      }
      if (stats.totalGames + 1 >= 100 && !isUnlocked('minesweeper_100_games')) {
        const a = unlockAchievement('minesweeper_100_games');
        if (a) unlockedNow.push(a);
      }

      // 難易度別クリア
      if (difficulty === 'beginner' && !isUnlocked('minesweeper_beginner_clear')) {
        const a = unlockAchievement('minesweeper_beginner_clear');
        if (a) unlockedNow.push(a);
      }
      if (difficulty === 'intermediate' && !isUnlocked('minesweeper_intermediate_clear')) {
        const a = unlockAchievement('minesweeper_intermediate_clear');
        if (a) unlockedNow.push(a);
      }
      if (difficulty === 'expert' && !isUnlocked('minesweeper_expert_clear')) {
        const a = unlockAchievement('minesweeper_expert_clear');
        if (a) unlockedNow.push(a);
      }

      // 全難易度クリア
      const allDifficultiesCleared =
        (stats.beginnerClears > 0 || difficulty === 'beginner') &&
        (stats.intermediateClears > 0 || difficulty === 'intermediate') &&
        (stats.expertClears > 0 || difficulty === 'expert');
      if (allDifficultiesCleared && !isUnlocked('minesweeper_all_difficulties')) {
        const a = unlockAchievement('minesweeper_all_difficulties');
        if (a) unlockedNow.push(a);
      }

      // タイムアタック（初級）
      if (difficulty === 'beginner') {
        if (timeSeconds <= 60 && !isUnlocked('minesweeper_beginner_60s')) {
          const a = unlockAchievement('minesweeper_beginner_60s');
          if (a) unlockedNow.push(a);
        }
        if (timeSeconds <= 30 && !isUnlocked('minesweeper_beginner_30s')) {
          const a = unlockAchievement('minesweeper_beginner_30s');
          if (a) unlockedNow.push(a);
        }
        if (timeSeconds <= 15 && !isUnlocked('minesweeper_beginner_15s')) {
          const a = unlockAchievement('minesweeper_beginner_15s');
          if (a) unlockedNow.push(a);
        }
      }

      // タイムアタック（中級）
      if (difficulty === 'intermediate') {
        if (timeSeconds <= 180 && !isUnlocked('minesweeper_intermediate_180s')) {
          const a = unlockAchievement('minesweeper_intermediate_180s');
          if (a) unlockedNow.push(a);
        }
        if (timeSeconds <= 90 && !isUnlocked('minesweeper_intermediate_90s')) {
          const a = unlockAchievement('minesweeper_intermediate_90s');
          if (a) unlockedNow.push(a);
        }
        if (timeSeconds <= 60 && !isUnlocked('minesweeper_intermediate_60s')) {
          const a = unlockAchievement('minesweeper_intermediate_60s');
          if (a) unlockedNow.push(a);
        }
      }

      // タイムアタック（上級）
      if (difficulty === 'expert') {
        if (timeSeconds <= 300 && !isUnlocked('minesweeper_expert_300s')) {
          const a = unlockAchievement('minesweeper_expert_300s');
          if (a) unlockedNow.push(a);
        }
        if (timeSeconds <= 180 && !isUnlocked('minesweeper_expert_180s')) {
          const a = unlockAchievement('minesweeper_expert_180s');
          if (a) unlockedNow.push(a);
        }
        if (timeSeconds <= 120 && !isUnlocked('minesweeper_expert_120s')) {
          const a = unlockAchievement('minesweeper_expert_120s');
          if (a) unlockedNow.push(a);
        }
      }

      // ノーフラグ
      if (flagCount === 0 && !isUnlocked('minesweeper_no_flag')) {
        const a = unlockAchievement('minesweeper_no_flag');
        if (a) unlockedNow.push(a);
      }

      // パーフェクトフラグ
      if (flagCount === mineCount && !isUnlocked('minesweeper_perfect_flag')) {
        const a = unlockAchievement('minesweeper_perfect_flag');
        if (a) unlockedNow.push(a);
      }

      // 連続クリア
      if (newCurrentStreak >= 3 && !isUnlocked('minesweeper_streak_3')) {
        const a = unlockAchievement('minesweeper_streak_3');
        if (a) unlockedNow.push(a);
      }
      if (newCurrentStreak >= 5 && !isUnlocked('minesweeper_streak_5')) {
        const a = unlockAchievement('minesweeper_streak_5');
        if (a) unlockedNow.push(a);
      }
      if (newCurrentStreak >= 10 && !isUnlocked('minesweeper_streak_10')) {
        const a = unlockAchievement('minesweeper_streak_10');
        if (a) unlockedNow.push(a);
      }

      return unlockedNow;
    },
    [stats, updateStats, unlockAchievement, isUnlocked]
  );

  // ゲームオーバー記録
  const recordGameOver = useCallback(() => {
    updateStats({
      totalGames: stats.totalGames + 1,
      currentStreak: 0, // 連続クリアリセット
      lastPlayed: Date.now(),
    });

    const unlockedNow: GameAchievement[] = [];

    // ゲーム数系
    if (stats.totalGames + 1 >= 10 && !isUnlocked('minesweeper_10_games')) {
      const a = unlockAchievement('minesweeper_10_games');
      if (a) unlockedNow.push(a);
    }
    if (stats.totalGames + 1 >= 50 && !isUnlocked('minesweeper_50_games')) {
      const a = unlockAchievement('minesweeper_50_games');
      if (a) unlockedNow.push(a);
    }
    if (stats.totalGames + 1 >= 100 && !isUnlocked('minesweeper_100_games')) {
      const a = unlockAchievement('minesweeper_100_games');
      if (a) unlockedNow.push(a);
    }

    return unlockedNow;
  }, [stats, updateStats, unlockAchievement, isUnlocked]);

  // 最初のクリックで大きく開いた記録
  const recordLargeFirstOpen = useCallback(
    (cellsOpened: number) => {
      if (cellsOpened >= 8 && !isUnlocked('minesweeper_first_click_safe')) {
        return unlockAchievement('minesweeper_first_click_safe');
      }
      return null;
    },
    [isUnlocked, unlockAchievement]
  );

  // バトル勝利記録
  const recordBattleWin = useCallback(
    (wasLosingBefore: boolean, opponentHitMine: boolean) => {
      updateStats({
        battleWins: stats.battleWins + 1,
      });

      const unlockedNow: GameAchievement[] = [];

      // 初勝利
      if (stats.battleWins === 0 && !isUnlocked('minesweeper_battle_first_win')) {
        const a = unlockAchievement('minesweeper_battle_first_win');
        if (a) unlockedNow.push(a);
      }

      // 10勝
      if (stats.battleWins + 1 >= 10 && !isUnlocked('minesweeper_battle_10_wins')) {
        const a = unlockAchievement('minesweeper_battle_10_wins');
        if (a) unlockedNow.push(a);
      }

      // 逆転勝利
      if (wasLosingBefore && !isUnlocked('minesweeper_battle_comeback')) {
        const a = unlockAchievement('minesweeper_battle_comeback');
        if (a) unlockedNow.push(a);
      }

      // パーフェクトバトル（相手が地雷を踏む前にクリア）
      if (!opponentHitMine && !isUnlocked('minesweeper_battle_perfect')) {
        const a = unlockAchievement('minesweeper_battle_perfect');
        if (a) unlockedNow.push(a);
      }

      return unlockedNow;
    },
    [stats, updateStats, unlockAchievement, isUnlocked]
  );

  // バトル敗北記録
  const recordBattleLoss = useCallback(() => {
    updateStats({
      battleLosses: stats.battleLosses + 1,
    });
    return [];
  }, [stats, updateStats]);

  // 全実績取得
  const getAllAchievements = useCallback(() => {
    return MINESWEEPER_ACHIEVEMENTS.map((achievement) => ({
      ...achievement,
      unlocked: unlockedIds.has(achievement.id),
    }));
  }, [unlockedIds]);

  // 進捗
  const progress = {
    unlocked: unlockedIds.size,
    total: MINESWEEPER_ACHIEVEMENTS.length,
    percentage: Math.round((unlockedIds.size / MINESWEEPER_ACHIEVEMENTS.length) * 100),
  };

  return {
    stats,
    progress,
    isUnlocked,
    recordGameStart,
    recordGameClear,
    recordGameOver,
    recordLargeFirstOpen,
    recordBattleWin,
    recordBattleLoss,
    getAllAchievements,
  };
}
