'use client';

import { createContext, useContext } from 'react';
import { Eye } from 'lucide-react';
import { LikeButton } from './LikeButton';

// エンゲージメント状態を共有するContext
interface EngagementContextValue {
  views: number;
  likes: number;
  hasLiked: boolean;
  isLoading: boolean;
  toggleLike: () => void;
}

export const EngagementContext = createContext<EngagementContextValue | null>(null);

function useEngagementContext() {
  const context = useContext(EngagementContext);
  if (!context) {
    throw new Error('useEngagementContext must be used within ArticleWithEngagement');
  }
  return context;
}

// ヘッダー用コンパクトなエンゲージメント表示
export function ArticleEngagement() {
  const { views, likes, hasLiked, isLoading, toggleLike } = useEngagementContext();

  return (
    <div className="flex items-center gap-4">
      {/* ビュー数 */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Eye size={16} />
        <span>{isLoading ? '-' : views.toLocaleString()}</span>
        <span className="hidden sm:inline">views</span>
      </div>

      {/* いいねボタン */}
      <LikeButton
        likes={likes}
        hasLiked={hasLiked}
        onToggle={toggleLike}
        isLoading={isLoading}
        size="md"
      />
    </div>
  );
}

// 記事下部用の大きいいいねボタン
export function ArticleLikeSection() {
  const { views, likes, hasLiked, isLoading, toggleLike } = useEngagementContext();

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <p className="text-muted-foreground text-sm">この記事が役に立ったら</p>
      <LikeButton
        likes={likes}
        hasLiked={hasLiked}
        onToggle={toggleLike}
        isLoading={isLoading}
        size="lg"
      />
      <p className="text-xs text-muted-foreground">
        {views.toLocaleString()} views
      </p>
    </div>
  );
}
