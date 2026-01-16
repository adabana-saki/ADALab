'use client';

import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

type GameType = 'tetris' | '2048' | 'snake' | 'typing' | 'minesweeper';

/**
 * 実績をサーバーに同期するためのフック
 * ゲーム終了時に新しく解除された実績をDBに保存
 */
export function useAchievementSync() {
  const { user, getIdToken } = useAuth();

  /**
   * 実績をサーバーに同期
   * @param gameType ゲームタイプ
   * @param achievementIds 同期する実績ID配列
   * @returns 成功した場合はtrue
   */
  const syncAchievements = useCallback(
    async (gameType: GameType, achievementIds: string[]): Promise<boolean> => {
      // ログインしていない場合は何もしない
      if (!user) {
        return false;
      }

      // 同期する実績がない場合は何もしない
      if (achievementIds.length === 0) {
        return true;
      }

      try {
        const token = await getIdToken();
        if (!token) {
          console.warn('Failed to get auth token for achievement sync');
          return false;
        }

        const response = await fetch('/api/user/achievements', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            gameType,
            achievementIds,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Achievement sync failed:', errorData);
          return false;
        }

        const result = await response.json();
        if (result.syncedCount > 0) {
          console.log(`Synced ${result.syncedCount} achievements for ${gameType}`);
        }
        return true;
      } catch (error) {
        console.error('Achievement sync error:', error);
        return false;
      }
    },
    [user, getIdToken]
  );

  /**
   * 全ての実績を一度に同期（初期同期用）
   * @param gameType ゲームタイプ
   * @param allUnlockedIds 全ての解除済み実績ID
   */
  const syncAllAchievements = useCallback(
    async (gameType: GameType, allUnlockedIds: string[]): Promise<boolean> => {
      return syncAchievements(gameType, allUnlockedIds);
    },
    [syncAchievements]
  );

  return {
    syncAchievements,
    syncAllAchievements,
    isLoggedIn: !!user,
  };
}
