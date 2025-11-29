'use client';

import { ReactNode, useEffect } from 'react';
import { useEngagement } from '@/hooks/useEngagement';
import { EngagementContext } from '@/components/blog/ArticleEngagement';

interface ArticleWithEngagementProps {
  slug: string;
  position: 'header' | 'footer';
  children: ReactNode;
}

// エンゲージメント状態をコンポーネントで共有するためのラッパー
// position="header" の場合のみビュートラッキングを行う
export function ArticleWithEngagement({ slug, position, children }: ArticleWithEngagementProps) {
  const engagement = useEngagement(slug);

  // ヘッダーでのみビュートラッキング
  useEffect(() => {
    if (position === 'header') {
      engagement.trackView();
    }
  }, [position, engagement.trackView]);

  return (
    <EngagementContext.Provider value={engagement}>
      {children}
    </EngagementContext.Provider>
  );
}
