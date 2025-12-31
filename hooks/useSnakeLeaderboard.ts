'use client';

import { useState, useEffect, useCallback } from 'react';
import { getDeviceId } from './useDeviceId';
import { useAuth } from '@/contexts/AuthContext';

export interface SnakeLeaderboardEntry {
  id?: number;
  nickname: string;
  score: number;
  length: number;
  time_survived?: number;
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

const API_BASE = '/api/games/snake/leaderboard';
const LOCAL_STORAGE_KEY = 'snake-leaderboard-v1';

export function useSnakeLeaderboard() {
  const { user, getIdToken } = useAuth();
  const [leaderboard, setLeaderboard] = useState<SnakeLeaderboardEntry[]>([]);
  const [period, setPeriod] = useState<LeaderboardPeriod>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  // ローカルストレージからリーダーボード取得
  const getLocalLeaderboard = useCallback((): SnakeLeaderboardEntry[] => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return [];
  }, []);

  // ローカルストレージにリーダーボード保存
  const saveLocalLeaderboard = useCallback((entries: SnakeLeaderboardEntry[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // ignore
    }
  }, []);

  // 期間フィルタリング
  const filterByPeriod = useCallback(
    (entries: SnakeLeaderboardEntry[], filterPeriod: LeaderboardPeriod) => {
      if (filterPeriod === 'all') return entries;

      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const dayOfWeek = now.getDay();
      const startOfWeek = new Date(startOfDay);
      startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      return entries.filter((entry) => {
        const entryDate = new Date(entry.date);
        if (filterPeriod === 'daily') return entryDate >= startOfDay;
        if (filterPeriod === 'weekly') return entryDate >= startOfWeek;
        if (filterPeriod === 'monthly') return entryDate >= startOfMonth;
        return true;
      });
    },
    []
  );

  // リーダーボード取得
  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}?limit=100`);
      if (response.ok) {
        const data = await response.json();
        const entries = data.leaderboard as SnakeLeaderboardEntry[];
        saveLocalLeaderboard(entries);
        setLeaderboard(filterByPeriod(entries, period));
        setIsOnline(true);
      } else {
        throw new Error('Failed to fetch');
      }
    } catch {
      setError('オフラインモード: ローカルランキングを表示中');
      setIsOnline(false);
      const localEntries = getLocalLeaderboard();
      setLeaderboard(filterByPeriod(localEntries, period));
    } finally {
      setIsLoading(false);
    }
  }, [period, filterByPeriod, getLocalLeaderboard, saveLocalLeaderboard]);

  // 初回ロード
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // スコア送信
  const submitScore = useCallback(
    async (entry: Omit<SnakeLeaderboardEntry, 'device_id'>) => {
      const deviceId = getDeviceId();
      const entryWithDevice: SnakeLeaderboardEntry = {
        ...entry,
        device_id: deviceId,
      };

      // ローカルに即座に追加
      const localEntries = getLocalLeaderboard();
      const existingIndex = localEntries.findIndex(
        (e) => e.device_id === deviceId
      );

      let newLocalEntries: SnakeLeaderboardEntry[];
      if (existingIndex >= 0) {
        if (entry.score > localEntries[existingIndex].score) {
          newLocalEntries = [...localEntries];
          newLocalEntries[existingIndex] = entryWithDevice;
        } else {
          newLocalEntries = localEntries;
        }
      } else {
        newLocalEntries = [...localEntries, entryWithDevice];
      }

      newLocalEntries.sort((a, b) => b.score - a.score);
      saveLocalLeaderboard(newLocalEntries);
      setLeaderboard(filterByPeriod(newLocalEntries, period));

      // オンラインの場合、サーバーに送信
      if (isOnline) {
        try {
          // ログインユーザーの場合、認証トークンを付与
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (user) {
            const token = await getIdToken();
            if (token) {
              headers['Authorization'] = `Bearer ${token}`;
            }
          }

          const response = await fetch(API_BASE, {
            method: 'POST',
            headers,
            body: JSON.stringify(entryWithDevice),
          });
          if (response.ok) {
            const data = await response.json();
            if (data.leaderboard) {
              saveLocalLeaderboard(data.leaderboard);
              setLeaderboard(filterByPeriod(data.leaderboard, period));
            }
          }
        } catch {
          // オフライン時はローカルのみ
        }
      }
    },
    [isOnline, period, filterByPeriod, getLocalLeaderboard, saveLocalLeaderboard, user, getIdToken]
  );

  // ランキング入り判定
  const isRankingScore = useCallback(
    (score: number): boolean => {
      if (leaderboard.length < 10) return true;
      const minScore = leaderboard[leaderboard.length - 1]?.score || 0;
      return score > minScore;
    },
    [leaderboard]
  );

  return {
    leaderboard: leaderboard.slice(0, 10),
    period,
    setPeriod,
    isLoading,
    error,
    isOnline,
    submitScore,
    isRankingScore,
    refresh: fetchLeaderboard,
  };
}
