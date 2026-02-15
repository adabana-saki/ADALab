'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User,
  Gamepad2,
  TrendingUp,
  Medal,
  Target,
  Bomb,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileCard } from '@/components/dashboard/ProfileCard';
import { GameStatsCard } from '@/components/dashboard/GameStatsCard';
import { RankingsCard } from '@/components/dashboard/RankingsCard';
import { AchievementsOverview } from '@/components/dashboard/AchievementsOverview';

interface UserProfile {
  id: number;
  nickname: string;
  avatar_url: string | null;
  created_at: string;
  total_achievements: number;
}

interface UnlockedAchievement {
  id: string;
  unlockedAt: string;
}

interface DashboardData {
  user: UserProfile;
  gameStats: Record<string, unknown>;
  achievementCounts: Record<string, number>;
  unlockedAchievements: Record<string, UnlockedAchievement[]>;
  rankings: Record<string, number | null>;
}

// ゲームごとのlocalStorageキーマッピング
const GAME_LOCAL_STORAGE_MAP = [
  {
    gameType: 'tetris' as const,
    achievementsKey: 'adalab-game-achievements',
    statsKey: 'adalab-game-stats',
    achievementFormat: 'object' as const, // { unlocked: [{ achievementId }] }
  },
  {
    gameType: '2048' as const,
    achievementsKey: 'adalab-2048-achievements',
    statsKey: 'adalab-2048-stats',
    achievementFormat: 'object' as const, // { unlocked: [{ achievementId }] }
  },
  {
    gameType: 'snake' as const,
    achievementsKey: 'snake-achievements-v1',
    statsKey: 'snake-stats-v1',
    achievementFormat: 'array' as const, // string[]
  },
  {
    gameType: 'typing' as const,
    achievementsKey: 'typing-achievements-v1',
    statsKey: 'typing-stats-v1',
    achievementFormat: 'array' as const, // string[]
  },
  {
    gameType: 'minesweeper' as const,
    achievementsKey: 'minesweeper-achievements-v1',
    statsKey: 'minesweeper-stats-v1',
    achievementFormat: 'array' as const, // string[]
  },
];

/**
 * localStorageから全ゲームの実績・統計を読み取りサーバーに同期
 */
async function syncLocalDataToServer(token: string): Promise<void> {
  const promises: Promise<void>[] = [];

  for (const game of GAME_LOCAL_STORAGE_MAP) {
    // 実績の同期
    try {
      const rawAchievements = localStorage.getItem(game.achievementsKey);
      if (rawAchievements) {
        const parsed = JSON.parse(rawAchievements);
        let achievementIds: string[] = [];

        if (game.achievementFormat === 'object') {
          // Tetris/2048: { unlocked: [{ achievementId, ... }] }
          if (parsed.unlocked && Array.isArray(parsed.unlocked)) {
            achievementIds = parsed.unlocked
              .map((u: { achievementId?: string }) => u.achievementId)
              .filter((id: unknown): id is string => typeof id === 'string' && id.length > 0);
          }
        } else {
          // Snake/Typing/Minesweeper: string[]
          if (Array.isArray(parsed)) {
            achievementIds = parsed.filter((id: unknown): id is string => typeof id === 'string' && id.length > 0);
          }
        }

        if (achievementIds.length > 0) {
          promises.push(
            fetch('/api/user/achievements', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                gameType: game.gameType,
                achievementIds,
              }),
            }).then((res) => {
              if (!res.ok) throw new Error(`HTTP ${res.status}`);
            }).catch((e) => {
              console.error(`Failed to sync ${game.gameType} achievements:`, e);
            })
          );
        }
      }
    } catch (e) {
      console.error(`Failed to read ${game.gameType} achievements from localStorage:`, e);
    }

    // 統計の同期
    try {
      const rawStats = localStorage.getItem(game.statsKey);
      if (rawStats) {
        const stats = JSON.parse(rawStats);
        if (stats && typeof stats === 'object' && stats.totalGames > 0) {
          promises.push(
            fetch('/api/user/stats', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                gameType: game.gameType,
                stats,
              }),
            }).then((res) => {
              if (!res.ok) throw new Error(`HTTP ${res.status}`);
            }).catch((e) => {
              console.error(`Failed to sync ${game.gameType} stats:`, e);
            })
          );
        }
      }
    } catch (e) {
      console.error(`Failed to read ${game.gameType} stats from localStorage:`, e);
    }
  }

  await Promise.allSettled(promises);
}

export default function DashboardPage() {
  const { user, profile, getIdToken, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const syncedRef = useRef(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    const abortController = new AbortController();

    async function fetchDashboardData(retryCount = 0) {
      if (!user) return;

      try {
        const token = await getIdToken();
        if (!token) {
          setError('認証トークンの取得に失敗しました');
          setLoading(false);
          return;
        }

        // 初回のみローカルデータをサーバーに同期
        if (!syncedRef.current) {
          syncedRef.current = true;
          await syncLocalDataToServer(token);
        }

        const response = await fetch('/api/user/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: abortController.signal,
        });
        if (response.ok) {
          const result = await response.json();
          setData(result);
          setError(null);
        } else if (response.status === 401) {
          setError('セッションが期限切れです。再ログインしてください。');
        } else if (response.status === 404 && retryCount < 3) {
          // ユーザーデータがまだ同期されていない場合、少し待ってリトライ
          await new Promise((resolve) => setTimeout(resolve, 1000));
          if (abortController.signal.aborted) return;
          await fetchDashboardData(retryCount + 1);
          return; // リトライ中はここでloadingをfalseにしない
        } else {
          setError('データの取得に失敗しました');
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError('データの取得に失敗しました');
      }
      setLoading(false);
    }

    if (user) {
      fetchDashboardData();
    }

    return () => abortController.abort();
  }, [user, getIdToken]);

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <User className="text-primary" size={28} />
            <h1 className="text-3xl font-bold">ダッシュボード</h1>
          </div>
          <p className="text-muted-foreground">
            ゲームの統計、実績、ランキングを確認できます
          </p>
        </motion.div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* 左カラム - プロフィール */}
          <div className="lg:col-span-1 space-y-6">
            <ProfileCard
              profile={profile}
              userProfile={data?.user}
              totalAchievements={data?.user?.total_achievements || 0}
            />

            <RankingsCard rankings={data?.rankings || {}} />
          </div>

          {/* 右カラム - ゲーム統計 */}
          <div className="lg:col-span-2 space-y-6">
            {/* ゲーム統計グリッド */}
            <div className="grid gap-4 sm:grid-cols-2">
              <GameStatsCard
                game="tetris"
                title="Tetris"
                icon={<Gamepad2 size={20} />}
                stats={data?.gameStats?.tetris}
                achievementCount={data?.achievementCounts?.tetris || 0}
              />
              <GameStatsCard
                game="2048"
                title="2048"
                icon={<Target size={20} />}
                stats={data?.gameStats?.['2048']}
                achievementCount={data?.achievementCounts?.['2048'] || 0}
              />
              <GameStatsCard
                game="snake"
                title="Snake"
                icon={<TrendingUp size={20} />}
                stats={data?.gameStats?.snake}
                achievementCount={data?.achievementCounts?.snake || 0}
              />
              <GameStatsCard
                game="typing"
                title="Typing"
                icon={<Medal size={20} />}
                stats={data?.gameStats?.typing}
                achievementCount={data?.achievementCounts?.typing || 0}
              />
              <GameStatsCard
                game="minesweeper"
                title="Minesweeper"
                icon={<Bomb size={20} />}
                stats={data?.gameStats?.minesweeper}
                achievementCount={data?.achievementCounts?.minesweeper || 0}
              />
            </div>

            {/* 実績概要 */}
            <AchievementsOverview
              achievementCounts={data?.achievementCounts || {}}
              totalAchievements={data?.user?.total_achievements || 0}
              unlockedAchievements={data?.unlockedAchievements || {}}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
