'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface Engagement {
  views: number;
  likes: number;
  hasLiked: boolean;
}

interface EngagementState extends Engagement {
  isLoading: boolean;
  error: string | null;
  isLiking: boolean;
}

/**
 * ユニークな訪問者IDを生成・取得
 * プライバシー考慮: ランダムIDのみ使用、個人を特定する情報は含めない
 */
function getVisitorId(): string {
  if (typeof window === 'undefined') return '';

  try {
    let visitorId = localStorage.getItem('visitor_id');
    if (!visitorId) {
      // crypto.randomUUID()を優先使用（より安全なランダム生成）
      visitorId = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem('visitor_id', visitorId);
    }
    return visitorId;
  } catch {
    // localStorageがブロックされている場合（プライベートモード等）
    // セッション限定の一時IDを返す
    return `temp-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}

export function useEngagement(slug: string) {
  const [state, setState] = useState<EngagementState>({
    views: 0,
    likes: 0,
    hasLiked: false,
    isLoading: true,
    error: null,
    isLiking: false,
  });

  // 並行リクエスト防止用のref
  const isLikingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // エンゲージメントを取得
  useEffect(() => {
    // 前回のリクエストをキャンセル
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const fetchEngagement = async () => {
      try {
        const visitorId = getVisitorId();
        const params = visitorId ? `?visitorId=${encodeURIComponent(visitorId)}` : '';
        const res = await fetch(`/api/blog/${slug}/engagement${params}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        setState((prev) => ({
          ...prev,
          views: data.views ?? 0,
          likes: data.likes ?? 0,
          hasLiked: data.hasLiked ?? false,
          isLoading: false,
          error: null,
        }));
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return; // キャンセルされた場合は何もしない
        }
        console.error('Failed to fetch engagement:', error);
        // APIエラー時もUIは動作継続（graceful degradation）
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: 'エンゲージメントの取得に失敗しました',
        }));
      }
    };

    fetchEngagement();

    return () => {
      controller.abort();
    };
  }, [slug]);

  // ビュー数をインクリメント（ページロード時に1回だけ）
  const trackView = useCallback(async () => {
    try {
      const sessionKey = `viewed_${slug}`;
      // sessionStorageへのアクセスも保護
      try {
        if (sessionStorage.getItem(sessionKey)) return;
      } catch {
        // sessionStorageがブロックされている場合はスキップ
        return;
      }

      const res = await fetch(`/api/blog/${slug}/engagement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'view' }),
      });

      if (res.ok) {
        const data = await res.json();
        setState((prev) => ({ ...prev, views: data.views ?? prev.views }));
        try {
          sessionStorage.setItem(sessionKey, '1');
        } catch {
          // sessionStorageへの書き込み失敗は無視
        }
      }
    } catch (error) {
      console.error('Failed to track view:', error);
      // ビュートラッキングの失敗はユーザー体験に影響しないので無視
    }
  }, [slug]);

  // いいねをトグル（楽観的更新 + エラー時ロールバック）
  const toggleLike = useCallback(async () => {
    // 並行リクエスト防止
    if (isLikingRef.current) return;
    isLikingRef.current = true;

    const previousState = { ...state };

    try {
      // 楽観的更新
      setState((prev) => ({
        ...prev,
        isLiking: true,
        hasLiked: !prev.hasLiked,
        likes: prev.hasLiked ? Math.max(0, prev.likes - 1) : prev.likes + 1,
      }));

      const visitorId = getVisitorId();
      const res = await fetch(`/api/blog/${slug}/engagement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'like', visitorId }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      setState((prev) => ({
        ...prev,
        likes: data.likes ?? prev.likes,
        hasLiked: data.hasLiked ?? prev.hasLiked,
        isLiking: false,
      }));
    } catch (error) {
      console.error('Failed to toggle like:', error);
      // エラー時は元の状態にロールバック
      setState({
        ...previousState,
        isLiking: false,
        error: 'いいねの更新に失敗しました',
      });
    } finally {
      isLikingRef.current = false;
    }
  }, [slug, state]);

  return {
    views: state.views,
    likes: state.likes,
    hasLiked: state.hasLiked,
    isLoading: state.isLoading,
    isLiking: state.isLiking,
    error: state.error,
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
