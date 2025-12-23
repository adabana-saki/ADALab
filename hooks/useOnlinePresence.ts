'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface PresenceStats {
  total: number;
  byPage: Record<string, number>;
  byActivity: {
    viewing: number;
    playing: number;
  };
}

interface UseOnlinePresenceOptions {
  page: string;
  activity?: 'viewing' | 'playing';
  enabled?: boolean;
}

const WORKER_URL = process.env.NEXT_PUBLIC_TETRIS_BATTLE_WORKER_URL || 'https://tetris-battle.adalab.workers.dev';
const HEARTBEAT_INTERVAL = 10000; // 10 seconds
const STATS_FETCH_INTERVAL = 15000; // 15 seconds

export function useOnlinePresence({ page, activity = 'viewing', enabled = true }: UseOnlinePresenceOptions) {
  const [stats, setStats] = useState<PresenceStats | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const userIdRef = useRef<string | null>(null);
  const activityRef = useRef(activity);

  // Update activity ref when it changes
  useEffect(() => {
    activityRef.current = activity;
  }, [activity]);

  // Get or create user ID
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let userId = localStorage.getItem('presence-user-id');
    if (!userId) {
      userId = crypto.randomUUID();
      localStorage.setItem('presence-user-id', userId);
    }
    userIdRef.current = userId;
  }, []);

  // Send heartbeat
  const sendHeartbeat = useCallback(async () => {
    if (!userIdRef.current || !enabled) return;

    try {
      const response = await fetch(`${WORKER_URL}/api/presence/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userIdRef.current,
          page,
          activity: activityRef.current,
        }),
      });

      if (response.ok) {
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Heartbeat failed:', error);
      setIsConnected(false);
    }
  }, [page, enabled]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    if (!enabled) return;

    try {
      const response = await fetch(`${WORKER_URL}/api/presence/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch presence stats:', error);
    }
  }, [enabled]);

  // Leave on unmount
  const leave = useCallback(async () => {
    if (!userIdRef.current) return;

    try {
      await fetch(`${WORKER_URL}/api/presence/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userIdRef.current }),
      });
    } catch (error) {
      // Ignore errors on leave
    }
  }, []);

  // Setup heartbeat and stats fetching
  useEffect(() => {
    if (!enabled) return;

    // Initial heartbeat and stats fetch
    sendHeartbeat();
    fetchStats();

    // Set up intervals
    const heartbeatInterval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
    const statsInterval = setInterval(fetchStats, STATS_FETCH_INTERVAL);

    // Cleanup on unmount
    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(statsInterval);
      leave();
    };
  }, [enabled, sendHeartbeat, fetchStats, leave]);

  // Handle page visibility change
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        sendHeartbeat();
        fetchStats();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enabled, sendHeartbeat, fetchStats]);

  // Update activity
  const setActivity = useCallback((newActivity: 'viewing' | 'playing') => {
    activityRef.current = newActivity;
    sendHeartbeat();
  }, [sendHeartbeat]);

  return {
    stats,
    isConnected,
    setActivity,
    refresh: fetchStats,
  };
}
