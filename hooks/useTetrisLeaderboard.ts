import { useState, useCallback, useEffect, useMemo } from 'react';
import { getDeviceId } from './useDeviceId';
import { useAuth } from '@/contexts/AuthContext';

export interface LeaderboardEntry {
  id?: number;
  nickname: string;
  score: number;
  lines: number;
  level: number;
  date: string;
  mode: 'endless' | 'sprint' | 'timeAttack';
  time?: number;
  device_id?: string;
}

export type LeaderboardPeriod = 'all' | 'daily' | 'weekly' | 'monthly';

export const LEADERBOARD_PERIOD_LABELS: Record<LeaderboardPeriod, string> = {
  all: '全期間',
  daily: '今日',
  weekly: '今週',
  monthly: '今月',
};

interface UseTetrisLeaderboardOptions {
  mode: 'endless' | 'sprint' | 'timeAttack';
}

const LEADERBOARD_KEY = 'tetris-leaderboard-v2';
const API_BASE = '/api/games/tetris/leaderboard';

export function useTetrisLeaderboard({ mode }: UseTetrisLeaderboardOptions) {
  const { user, getIdToken } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        const all = JSON.parse(stored) as LeaderboardEntry[];
        return all.filter(entry => entry.mode === mode);
      }
    } catch {
      // ignore
    }
    return [];
  }, [mode]);

  // localStorageにローカルリーダーボードを保存
  const saveLocalLeaderboard = useCallback((entries: LeaderboardEntry[]) => {
    try {
      // 既存のエントリを取得（他のモードのエントリを保持）
      const stored = localStorage.getItem(LEADERBOARD_KEY);
      let allEntries: LeaderboardEntry[] = [];
      if (stored) {
        allEntries = JSON.parse(stored) as LeaderboardEntry[];
        // 現在のモード以外のエントリを保持
        allEntries = allEntries.filter(entry => entry.mode !== mode);
      }
      // 新しいエントリを追加
      allEntries = [...allEntries, ...entries];
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(allEntries));
    } catch {
      // ignore
    }
  }, [mode]);

  // リーダーボードを取得
  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}?mode=${mode}`);
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
  }, [mode, getLocalLeaderboard, saveLocalLeaderboard]);

  // スコアを送信
  const submitScore = useCallback(async (entry: Omit<LeaderboardEntry, 'id'>) => {
    // 送信中の場合は早期リターン（連打防止）
    if (isSubmitting) return { success: false, isLocal: false };
    setIsSubmitting(true);
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
      setIsSubmitting(false);
      return { success: true, isLocal: true };
    }

    try {
      // デバイスIDを追加して送信
      const entryWithDeviceId = {
        ...entry,
        device_id: getDeviceId(),
      };

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
      setIsSubmitting(false);
    }
  }, [isOnline, isSubmitting, getLocalLeaderboard, saveLocalLeaderboard, user, getIdToken]);

  // スコアがランキング入りするか判定
  const isRankingScore = useCallback((score: number): boolean => {
    if (leaderboard.length < 10) return true;
    const minScore = leaderboard[leaderboard.length - 1]?.score || 0;
    return score > minScore;
  }, [leaderboard]);

  // 期間フィルタリング
  const [period, setPeriod] = useState<LeaderboardPeriod>('all');

  const filterByPeriod = useCallback((entries: LeaderboardEntry[], p: LeaderboardPeriod): LeaderboardEntry[] => {
    if (p === 'all') return entries;

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay()); // 日曜日始まり
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return entries.filter(entry => {
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
  }, []);

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
  }, [mode, getLocalLeaderboard, fetchLeaderboard]);

  return {
    leaderboard: filteredLeaderboard,
    allLeaderboard: leaderboard,
    period,
    setPeriod,
    isLoading,
    isSubmitting,
    error,
    isOnline,
    fetchLeaderboard,
    submitScore,
    isRankingScore,
  };
}
