'use client';

import { useState, useCallback, useEffect } from 'react';
import { Difficulty } from './useMinesweeperGame';

export interface LeaderboardEntry {
  nickname: string;
  time_seconds: number;
  difficulty: Difficulty;
  date: string;
}

export type LeaderboardPeriod = 'all' | 'daily' | 'weekly' | 'monthly';

export const LEADERBOARD_PERIOD_LABELS: Record<LeaderboardPeriod, string> = {
  all: '全期間',
  daily: '今日',
  weekly: '今週',
  monthly: '今月',
};

interface SubmitScoreParams {
  nickname: string;
  time_seconds: number;
  difficulty: Difficulty;
  token?: string | null;
}

export function useMinesweeperLeaderboard(initialDifficulty: Difficulty = 'beginner') {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<LeaderboardPeriod>('all');
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty);

  // ローカルストレージキー
  const getLocalStorageKey = (diff: Difficulty) => `minesweeper_leaderboard_${diff}`;

  // ローカルのリーダーボードを取得
  const getLocalLeaderboard = useCallback((diff: Difficulty): LeaderboardEntry[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(getLocalStorageKey(diff));
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }, []);

  // ローカルのリーダーボードを保存
  const saveLocalLeaderboard = useCallback((diff: Difficulty, entries: LeaderboardEntry[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(getLocalStorageKey(diff), JSON.stringify(entries.slice(0, 100)));
  }, []);

  // 期間でフィルタリング
  const filterByPeriod = useCallback((entries: LeaderboardEntry[], p: LeaderboardPeriod): LeaderboardEntry[] => {
    if (p === 'all') return entries;

    const now = new Date();
    let startDate: Date;

    switch (p) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        const dayOfWeek = now.getDay();
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        return entries;
    }

    return entries.filter((entry) => new Date(entry.date) >= startDate);
  }, []);

  // リーダーボードを取得
  const fetchLeaderboard = useCallback(async (diff?: Difficulty) => {
    const targetDifficulty = diff || difficulty;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/games/minesweeper/leaderboard?difficulty=${targetDifficulty}`);

      if (response.ok) {
        const data = await response.json();
        const entries = data.leaderboard || [];
        setLeaderboard(filterByPeriod(entries, period));
        saveLocalLeaderboard(targetDifficulty, entries);
      } else {
        // APIエラー時はローカルデータを使用
        const localData = getLocalLeaderboard(targetDifficulty);
        setLeaderboard(filterByPeriod(localData, period));
      }
    } catch (err) {
      // ネットワークエラー時はローカルデータを使用
      const localData = getLocalLeaderboard(targetDifficulty);
      setLeaderboard(filterByPeriod(localData, period));
      setError('ランキングの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [difficulty, period, filterByPeriod, getLocalLeaderboard, saveLocalLeaderboard]);

  // スコアを送信
  const submitScore = useCallback(async (params: SubmitScoreParams): Promise<boolean> => {
    const { nickname, time_seconds, difficulty: diff, token } = params;

    // ローカルに保存
    const localEntries = getLocalLeaderboard(diff);
    const newEntry: LeaderboardEntry = {
      nickname,
      time_seconds,
      difficulty: diff,
      date: new Date().toISOString(),
    };

    // 挿入位置を見つける（時間が短い順）
    const insertIndex = localEntries.findIndex((e) => e.time_seconds > time_seconds);
    if (insertIndex === -1) {
      localEntries.push(newEntry);
    } else {
      localEntries.splice(insertIndex, 0, newEntry);
    }
    saveLocalLeaderboard(diff, localEntries);

    // サーバーに送信
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/games/minesweeper/leaderboard', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          nickname,
          time_seconds,
          difficulty: diff,
          date: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.leaderboard) {
          setLeaderboard(filterByPeriod(data.leaderboard, period));
          saveLocalLeaderboard(diff, data.leaderboard);
        }
        return true;
      }
    } catch (err) {
      console.error('Failed to submit score:', err);
    }

    // サーバー送信失敗時もローカルデータを更新
    setLeaderboard(filterByPeriod(localEntries, period));
    return false;
  }, [getLocalLeaderboard, saveLocalLeaderboard, filterByPeriod, period]);

  // 初回読み込み
  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // 期間変更時にフィルタリング
  useEffect(() => {
    const localData = getLocalLeaderboard(difficulty);
    setLeaderboard(filterByPeriod(localData, period));
  }, [period, difficulty, filterByPeriod, getLocalLeaderboard]);

  return {
    leaderboard,
    isLoading,
    error,
    period,
    setPeriod,
    difficulty,
    setDifficulty,
    fetchLeaderboard,
    submitScore,
  };
}
