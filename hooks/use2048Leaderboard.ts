'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { getDeviceId } from './useDeviceId';

export interface LeaderboardEntry {
  id?: number;
  nickname: string;
  score: number;
  max_tile: number;
  moves: number;
  date: string;
  device_id?: string;
}

export type LeaderboardPeriod = 'all' | 'daily' | 'weekly' | 'monthly';

export const LEADERBOARD_PERIOD_LABELS: Record<LeaderboardPeriod, string> = {
  all: '全期間',
  daily: '今日',
  weekly: '今週',
  monthly: '今月',
};

const LEADERBOARD_KEY = '2048-leaderboard-v1';
const API_BASE = '/api/games/2048/leaderboard';

export function use2048Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  // オンライン状態を監視
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // localStorageからローカルリーダーボードを取得
  const getLocalLeaderboard = useCallback((): LeaderboardEntry[] => {
    try {
      const stored = localStorage.getItem(LEADERBOARD_KEY);
      if (stored) {
        return JSON.parse(stored) as LeaderboardEntry[];
      }
    } catch {
      // ignore
    }
    return [];
  }, []);

  // localStorageにローカルリーダーボードを保存
  const saveLocalLeaderboard = useCallback((entries: LeaderboardEntry[]) => {
    try {
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
    } catch {
      // ignore
    }
  }, []);

  // リーダーボードを取得
  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_BASE);
      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      const entries = data.leaderboard as LeaderboardEntry[];
      setLeaderboard(entries);

      // ローカルにもキャッシュ
      saveLocalLeaderboard(entries);
    } catch (err) {
      console.warn('Failed to fetch online leaderboard, using local:', err);
      // オフラインまたはエラー時はローカルを使用
      const localEntries = getLocalLeaderboard();
      setLeaderboard(localEntries);
      setError('オフラインモード: ローカルランキングを表示中');
    } finally {
      setIsLoading(false);
    }
  }, [getLocalLeaderboard, saveLocalLeaderboard]);

  // スコアを送信
  const submitScore = useCallback(
    async (entry: Omit<LeaderboardEntry, 'id'>) => {
      setIsLoading(true);
      setError(null);

      // まずローカルに追加（オプティミスティック更新）
      const localEntries = getLocalLeaderboard();
      const newLocalEntries = [...localEntries, entry]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      saveLocalLeaderboard(newLocalEntries);
      setLeaderboard(newLocalEntries);

      if (!isOnline) {
        setError('オフラインモード: オンライン時に同期されます');
        setIsLoading(false);
        return { success: true, isLocal: true };
      }

      try {
        // デバイスIDを追加して送信
        const entryWithDeviceId = {
          ...entry,
          device_id: getDeviceId(),
        };

        const response = await fetch(API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entryWithDeviceId),
        });

        if (!response.ok) throw new Error('Failed to submit');

        const data = await response.json();
        const entries = data.leaderboard as LeaderboardEntry[];
        setLeaderboard(entries);
        saveLocalLeaderboard(entries);

        return { success: true, isLocal: false };
      } catch (err) {
        console.warn('Failed to submit score online:', err);
        setError('サーバーに接続できません。ローカルに保存されました。');
        return { success: true, isLocal: true };
      } finally {
        setIsLoading(false);
      }
    },
    [isOnline, getLocalLeaderboard, saveLocalLeaderboard]
  );

  // スコアがランキング入りするか判定
  const isRankingScore = useCallback(
    (score: number): boolean => {
      if (leaderboard.length < 10) return true;
      const minScore = leaderboard[leaderboard.length - 1]?.score || 0;
      return score > minScore;
    },
    [leaderboard]
  );

  // 期間フィルタリング
  const [period, setPeriod] = useState<LeaderboardPeriod>('all');

  const filterByPeriod = useCallback(
    (entries: LeaderboardEntry[], p: LeaderboardPeriod): LeaderboardEntry[] => {
      if (p === 'all') return entries;

      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(startOfDay);
      startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay()); // 日曜日始まり
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      return entries.filter((entry) => {
        const entryDate = new Date(entry.date);
        switch (p) {
          case 'daily':
            return entryDate >= startOfDay;
          case 'weekly':
            return entryDate >= startOfWeek;
          case 'monthly':
            return entryDate >= startOfMonth;
          default:
            return true;
        }
      });
    },
    []
  );

  const filteredLeaderboard = useMemo(() => {
    return filterByPeriod(leaderboard, period).slice(0, 10);
  }, [leaderboard, period, filterByPeriod]);

  // 初回ロード
  useEffect(() => {
    // 初回はローカルを即座に表示
    const local = getLocalLeaderboard();
    setLeaderboard(local);

    // その後APIから取得
    fetchLeaderboard();
  }, [getLocalLeaderboard, fetchLeaderboard]);

  return {
    leaderboard: filteredLeaderboard,
    allLeaderboard: leaderboard,
    period,
    setPeriod,
    isLoading,
    error,
    isOnline,
    fetchLeaderboard,
    submitScore,
    isRankingScore,
  };
}
