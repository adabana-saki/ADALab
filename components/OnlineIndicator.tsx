'use client';

import { useOnlinePresence } from '@/hooks/useOnlinePresence';
import { Users, Gamepad2 } from 'lucide-react';

interface OnlineIndicatorProps {
  page: string;
  activity?: 'viewing' | 'playing';
  showDetails?: boolean;
}

export function OnlineIndicator({ page, activity = 'viewing', showDetails = false }: OnlineIndicatorProps) {
  const { stats, isConnected } = useOnlinePresence({ page, activity });

  if (!isConnected || !stats) {
    return null;
  }

  const currentPageCount = stats.byPage[page] || 0;

  return (
    <div className="flex items-center gap-3 text-sm">
      {/* 全体のオンライン人数 */}
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        <Users className="w-4 h-4" />
        <span>{stats.total}人がオンライン</span>
      </div>

      {/* プレイ中の人数 */}
      {stats.byActivity.playing > 0 && (
        <div className="flex items-center gap-1.5 text-primary">
          <Gamepad2 className="w-4 h-4" />
          <span>{stats.byActivity.playing}人がプレイ中</span>
        </div>
      )}

      {/* 詳細表示 */}
      {showDetails && currentPageCount > 0 && (
        <div className="text-muted-foreground">
          このページ: {currentPageCount}人
        </div>
      )}
    </div>
  );
}
