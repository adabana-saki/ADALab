'use client';

import { useState, useEffect, useCallback } from 'react';
import { getDeviceId } from './useDeviceId';

// ゲームモードと言語モード（useTypingGameと共有）
export type TypingMode = 'time' | 'sudden_death' | 'word_count';
export type TypingLanguage = 'en' | 'ja' | 'mixed';

export interface TypingLeaderboardEntry {
  id?: number;
  nickname: string;
  wpm: number;
  accuracy: number;
  mode: TypingMode;
  language: TypingLanguage;
  words_typed: number;
  time_seconds?: number;
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

export const MODE_LABELS: Record<TypingMode, string> = {
  time: 'タイムモード',
  sudden_death: '即終了モード',
  word_count: '文字数モード',
};

export const LANGUAGE_LABELS: Record<TypingLanguage, string> = {
  en: 'English',
  ja: '日本語',
  mixed: '両方',
};

const API_BASE = '/api/games/typing/leaderboard';
const LOCAL_STORAGE_KEY = 'typing-leaderboard-v1';

export function useTypingLeaderboard(initialMode: TypingMode = 'time', initialLanguage: TypingLanguage = 'en') {
  const [leaderboard, setLeaderboard] = useState<TypingLeaderboardEntry[]>([]);
  const [mode, setMode] = useState<TypingMode>(initialMode);
  const [language, setLanguage] = useState<TypingLanguage>(initialLanguage);
  const [period, setPeriod] = useState<LeaderboardPeriod>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  // ローカルストレージキー
  const getStorageKey = useCallback(() => {
    return `${LOCAL_STORAGE_KEY}-${mode}-${language}`;
  }, [mode, language]);

  // ローカルストレージからリーダーボード取得
  const getLocalLeaderboard = useCallback((): TypingLeaderboardEntry[] => {
    try {
      const stored = localStorage.getItem(getStorageKey());
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return [];
  }, [getStorageKey]);

  // ローカルストレージにリーダーボード保存
  const saveLocalLeaderboard = useCallback(
    (entries: TypingLeaderboardEntry[]) => {
      try {
        localStorage.setItem(getStorageKey(), JSON.stringify(entries));
      } catch {
        // ignore
      }
    },
    [getStorageKey]
  );

  // 期間フィルタリング
  const filterByPeriod = useCallback(
    (entries: TypingLeaderboardEntry[], filterPeriod: LeaderboardPeriod) => {
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
      const response = await fetch(`${API_BASE}?mode=${mode}&language=${language}&limit=100`);
      if (response.ok) {
        const data = await response.json();
        const entries = data.leaderboard as TypingLeaderboardEntry[];
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
  }, [mode, language, period, filterByPeriod, getLocalLeaderboard, saveLocalLeaderboard]);

  // モード/言語変更時にリロード
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // スコア送信
  const submitScore = useCallback(
    async (entry: Omit<TypingLeaderboardEntry, 'device_id' | 'mode' | 'language'>) => {
      const deviceId = getDeviceId();
      const entryWithDevice: TypingLeaderboardEntry = {
        ...entry,
        mode,
        language,
        device_id: deviceId,
      };

      // ローカルに即座に追加
      const localEntries = getLocalLeaderboard();
      const existingIndex = localEntries.findIndex((e) => e.device_id === deviceId);

      let newLocalEntries: TypingLeaderboardEntry[];
      if (existingIndex >= 0) {
        if (entry.wpm > localEntries[existingIndex].wpm) {
          newLocalEntries = [...localEntries];
          newLocalEntries[existingIndex] = entryWithDevice;
        } else {
          newLocalEntries = localEntries;
        }
      } else {
        newLocalEntries = [...localEntries, entryWithDevice];
      }

      newLocalEntries.sort((a, b) => b.wpm - a.wpm);
      saveLocalLeaderboard(newLocalEntries);
      setLeaderboard(filterByPeriod(newLocalEntries, period));

      // オンラインの場合、サーバーに送信
      if (isOnline) {
        try {
          const response = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
    [mode, language, isOnline, period, filterByPeriod, getDeviceId, getLocalLeaderboard, saveLocalLeaderboard]
  );

  // ランキング入り判定
  const isRankingScore = useCallback(
    (wpm: number): boolean => {
      if (leaderboard.length < 10) return true;
      const minWpm = leaderboard[leaderboard.length - 1]?.wpm || 0;
      return wpm > minWpm;
    },
    [leaderboard]
  );

  return {
    leaderboard: leaderboard.slice(0, 10),
    mode,
    setMode,
    language,
    setLanguage,
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
