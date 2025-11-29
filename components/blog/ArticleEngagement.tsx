'use client';

import { useEffect } from 'react';
import { Eye } from 'lucide-react';
import { useEngagement } from '@/hooks/useEngagement';
import { LikeButton } from './LikeButton';

interface ArticleEngagementProps {
  slug: string;
}

export function ArticleEngagement({ slug }: ArticleEngagementProps) {
  const { views, likes, hasLiked, isLoading, trackView, toggleLike } = useEngagement(slug);

  // ページロード時にビューをカウント
  useEffect(() => {
    trackView();
  }, [trackView]);

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
export function ArticleLikeSection({ slug }: ArticleEngagementProps) {
  const { views, likes, hasLiked, isLoading, toggleLike } = useEngagement(slug);

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
