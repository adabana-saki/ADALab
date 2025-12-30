'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  GAME_2048_ACHIEVEMENTS,
  Game2048Stats,
  DEFAULT_GAME_2048_STATS,
  GAME_2048_STATS_STORAGE_KEY,
  GAME_2048_ACHIEVEMENTS_STORAGE_KEY,
  get2048AchievementById,
} from '@/lib/game-2048-achievements';
import type { GameAchievement, GameAchievementProgress, UserGameAchievements } from '@/lib/game-achievements';
import { DEFAULT_USER_GAME_ACHIEVEMENTS } from '@/lib/game-achievements';

interface Use2048AchievementsOptions {
  onAchievementUnlock?: (achievement: GameAchievement) => void;
}

export function use2048Achievements(options: Use2048AchievementsOptions = {}) {
  const { onAchievementUnlock } = options;

  // 統計
  const [stats, setStats] = useState<Game2048Stats>(DEFAULT_GAME_2048_STATS);

  // 実績
  const [userAchievements, setUserAchievements] = useState<UserGameAchievements>(
    DEFAULT_USER_GAME_ACHIEVEMENTS
  );

  // 初回ロード
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 統計をロード
    const storedStats = localStorage.getItem(GAME_2048_STATS_STORAGE_KEY);
    if (storedStats) {
      try {
        setStats(JSON.parse(storedStats));
      } catch {
        // ignore
      }
    }

    // 実績をロード
    const storedAchievements = localStorage.getItem(GAME_2048_ACHIEVEMENTS_STORAGE_KEY);
    if (storedAchievements) {
      try {
        setUserAchievements(JSON.parse(storedAchievements));
      } catch {
        // ignore
      }
    }
  }, []);

  // 統計を保存
  const saveStats = useCallback((newStats: Game2048Stats) => {
    setStats(newStats);
    if (typeof window !== 'undefined') {
      localStorage.setItem(GAME_2048_STATS_STORAGE_KEY, JSON.stringify(newStats));
    }
  }, []);

  // 実績を保存
  const saveAchievements = useCallback((newAchievements: UserGameAchievements) => {
    setUserAchievements(newAchievements);
    if (typeof window !== 'undefined') {
      localStorage.setItem(GAME_2048_ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(newAchievements));
    }
  }, []);

  // 実績を解除
  const unlockAchievement = useCallback(
    (achievementId: string): boolean => {
      const achievement = get2048AchievementById(achievementId);
      if (!achievement) return false;

      // 既に解除済みかチェック
      if (userAchievements.unlocked.some((a) => a.achievementId === achievementId)) {
        return false;
      }

      const newProgress: GameAchievementProgress = {
        achievementId,
        unlockedAt: Date.now(),
      };

      const newAchievements: UserGameAchievements = {
        unlocked: [...userAchievements.unlocked, newProgress],
        totalXp: userAchievements.totalXp + achievement.xp,
        lastUpdated: Date.now(),
      };

      saveAchievements(newAchievements);
      onAchievementUnlock?.(achievement);

      return true;
    },
    [userAchievements, saveAchievements, onAchievementUnlock]
  );

  // 実績が解除されているかチェック
  const isAchievementUnlocked = useCallback(
    (achievementId: string): boolean => {
      return userAchievements.unlocked.some((a) => a.achievementId === achievementId);
    },
    [userAchievements]
  );

  // ゲーム開始を記録
  const recordGameStart = useCallback(() => {
    const newStats = {
      ...stats,
      totalGames: stats.totalGames + 1,
      lastPlayed: Date.now(),
    };
    saveStats(newStats);

    // 実績チェック
    if (newStats.totalGames === 1) {
      unlockAchievement('2048_first_game');
    }
    if (newStats.totalGames >= 10) {
      unlockAchievement('2048_games_10');
    }
    if (newStats.totalGames >= 50) {
      unlockAchievement('2048_games_50');
    }
    if (newStats.totalGames >= 100) {
      unlockAchievement('2048_games_100');
    }
  }, [stats, saveStats, unlockAchievement]);

  // マージを記録
  const recordMerge = useCallback(
    (value: number) => {
      const newStats = {
        ...stats,
        totalMerges: stats.totalMerges + 1,
      };
      saveStats(newStats);

      // 最初のマージ
      if (newStats.totalMerges === 1) {
        unlockAchievement('2048_first_merge');
      }
    },
    [stats, saveStats, unlockAchievement]
  );

  // タイル達成を記録
  const recordMaxTile = useCallback(
    (maxTile: number) => {
      if (maxTile <= stats.maxTile) return;

      const newStats = {
        ...stats,
        maxTile,
      };
      saveStats(newStats);

      // タイル実績
      if (maxTile >= 128) unlockAchievement('2048_tile_128');
      if (maxTile >= 256) unlockAchievement('2048_tile_256');
      if (maxTile >= 512) unlockAchievement('2048_tile_512');
      if (maxTile >= 1024) unlockAchievement('2048_tile_1024');
      if (maxTile >= 2048) unlockAchievement('2048_tile_2048');
      if (maxTile >= 4096) unlockAchievement('2048_tile_4096');
      if (maxTile >= 8192) unlockAchievement('2048_tile_8192');
    },
    [stats, saveStats, unlockAchievement]
  );

  // スコアを記録
  const recordScore = useCallback(
    (score: number) => {
      const newStats = {
        ...stats,
        totalScore: stats.totalScore + score,
        highScore: Math.max(stats.highScore, score),
      };
      saveStats(newStats);

      // スコア実績
      if (score >= 1000) unlockAchievement('2048_score_1000');
      if (score >= 5000) unlockAchievement('2048_score_5000');
      if (score >= 10000) unlockAchievement('2048_score_10000');
      if (score >= 20000) unlockAchievement('2048_score_20000');
      if (score >= 50000) unlockAchievement('2048_score_50000');
      if (score >= 100000) unlockAchievement('2048_score_100000');
    },
    [stats, saveStats, unlockAchievement]
  );

  // ゲームクリアを記録
  const recordWin = useCallback(
    (score: number, moves: number, usedUndo: boolean, timeSeconds: number) => {
      const newStats = {
        ...stats,
        wins: stats.wins + 1,
        winsWithoutUndo: usedUndo ? stats.winsWithoutUndo : stats.winsWithoutUndo + 1,
        totalMoves: stats.totalMoves + moves,
        fastestWin:
          stats.fastestWin === null ? timeSeconds : Math.min(stats.fastestWin, timeSeconds),
        lowestMoveWin:
          stats.lowestMoveWin === null ? moves : Math.min(stats.lowestMoveWin, moves),
      };
      saveStats(newStats);

      // スペシャル実績
      if (!usedUndo) {
        unlockAchievement('2048_no_undo');
      }
      if (timeSeconds <= 300) {
        // 5分以内
        unlockAchievement('2048_speedrun_5min');
      }
      if (moves <= 500) {
        unlockAchievement('2048_low_moves');
      }
    },
    [stats, saveStats, unlockAchievement]
  );

  // 続けてプレイを記録
  const recordKeepPlaying = useCallback(() => {
    unlockAchievement('2048_keep_playing');
  }, [unlockAchievement]);

  // ゲームオーバーを記録
  const recordGameOver = useCallback(
    (score: number, moves: number, maxTile: number, timeSeconds: number) => {
      const newStats = {
        ...stats,
        totalScore: stats.totalScore + score,
        highScore: Math.max(stats.highScore, score),
        totalMoves: stats.totalMoves + moves,
        maxTile: Math.max(stats.maxTile, maxTile),
        totalPlayTime: stats.totalPlayTime + timeSeconds,
      };
      saveStats(newStats);
    },
    [stats, saveStats]
  );

  // 解除された実績リスト
  const unlockedAchievements = useMemo(() => {
    return userAchievements.unlocked
      .map((progress) => {
        const achievement = get2048AchievementById(progress.achievementId);
        if (!achievement) return null;
        return { ...achievement, unlockedAt: progress.unlockedAt };
      })
      .filter((a): a is NonNullable<typeof a> => a !== null);
  }, [userAchievements]);

  // 進捗率
  const progress = useMemo(() => {
    const total = GAME_2048_ACHIEVEMENTS.length;
    const unlocked = userAchievements.unlocked.length;
    return {
      unlocked,
      total,
      percentage: Math.round((unlocked / total) * 100),
    };
  }, [userAchievements]);

  return {
    // State
    stats,
    userAchievements,
    unlockedAchievements,
    progress,
    allAchievements: GAME_2048_ACHIEVEMENTS,

    // Actions
    recordGameStart,
    recordMerge,
    recordMaxTile,
    recordScore,
    recordWin,
    recordKeepPlaying,
    recordGameOver,
    unlockAchievement,
    isAchievementUnlocked,
  };
}
