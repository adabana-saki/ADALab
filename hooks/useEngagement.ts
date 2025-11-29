'use client';

import { useState, useEffect, useCallback } from 'react';

interface Engagement {
  views: number;
  likes: number;
  hasLiked: boolean;
}

// ユニークな訪問者IDを生成・取得
function getVisitorId(): string {
  if (typeof window === 'undefined') return '';

  let visitorId = localStorage.getItem('visitor_id');
  if (!visitorId) {
    visitorId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('visitor_id', visitorId);
  }
  return visitorId;
}

export function useEngagement(slug: string) {
  const [engagement, setEngagement] = useState<Engagement>({
    views: 0,
    likes: 0,
    hasLiked: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  // エンゲージメントを取得
  useEffect(() => {
    const fetchEngagement = async () => {
      try {
        const visitorId = getVisitorId();
        const res = await fetch(`/api/blog/${slug}/engagement`, {
          headers: { 'x-visitor-id': visitorId },
        });
        if (res.ok) {
          const data = await res.json();
          setEngagement(data);
        }
      } catch (error) {
        console.error('Failed to fetch engagement:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEngagement();
  }, [slug]);

  // ビュー数をインクリメント（ページロード時に1回だけ）
  const trackView = useCallback(async () => {
    try {
      const sessionKey = `viewed_${slug}`;
      if (sessionStorage.getItem(sessionKey)) return; // 同セッションで既にカウント済み

      const res = await fetch(`/api/blog/${slug}/engagement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'view' }),
      });

      if (res.ok) {
        const { views } = await res.json();
        setEngagement((prev) => ({ ...prev, views }));
        sessionStorage.setItem(sessionKey, '1');
      }
    } catch (error) {
      console.error('Failed to track view:', error);
    }
  }, [slug]);

  // いいねをトグル
  const toggleLike = useCallback(async () => {
    try {
      const visitorId = getVisitorId();
      const res = await fetch(`/api/blog/${slug}/engagement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'like', visitorId }),
      });

      if (res.ok) {
        const { likes, hasLiked } = await res.json();
        setEngagement((prev) => ({ ...prev, likes, hasLiked }));
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  }, [slug]);

  return {
    ...engagement,
    isLoading,
    trackView,
    toggleLike,
  };
}

// 複数記事のエンゲージメントを取得
export function useBulkEngagement(slugs: string[]) {
  const [engagement, setEngagement] = useState<Record<string, { views: number; likes: number }>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEngagement = async () => {
      if (slugs.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/blog/engagement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slugs }),
        });

        if (res.ok) {
          const data = await res.json();
          setEngagement(data);
        }
      } catch (error) {
        console.error('Failed to fetch bulk engagement:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEngagement();
  }, [slugs.join(',')]);

  return { engagement, isLoading };
}
