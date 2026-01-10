'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User,
  Gamepad2,
  TrendingUp,
  Medal,
  Target,
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

export default function DashboardPage() {
  const { user, profile, getIdToken, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
