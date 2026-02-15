'use client';

import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import type { BlogMeta } from '@/lib/blog';

export type SortType = 'date' | 'popular';
export type SortDirection = 'desc' | 'asc';
export type ViewMode = 'grid' | 'list';
export type ViewTab = 'posts' | 'archive' | 'calendar';

interface DateRange {
  year?: number;
  month?: number;
  day?: number;
}

interface UseBlogFiltersOptions {
  posts: BlogMeta[];
  postsPerPage?: number;
  engagement?: Record<string, { views: number; likes: number }>;
}

interface NormalizedPost extends BlogMeta {
  _searchableTitle: string;
  _searchableDesc: string;
  _searchableTags: string[];
  _dateTimestamp: number;
}

export function useBlogFilters({
  posts,
  postsPerPage = 12,
  engagement = {},
}: UseBlogFiltersOptions) {
  const searchParams = useSearchParams();

  // URLパラメータから初期値を取得
  const initialCategory = searchParams.get('category') || null;
  const rawPage = searchParams.get('page');
  const parsedPage = rawPage ? Number.parseInt(rawPage, 10) : 1;
  const initialPage = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
  const initialViewTab = (searchParams.get('view') as ViewTab) || 'posts';

  // 状態管理
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [sortType, setSortType] = useState<SortType>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [tagFilterMode, setTagFilterMode] = useState<'AND' | 'OR'>('OR');
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [viewTab, setViewTab] = useState<ViewTab>(
    ['posts', 'archive', 'calendar'].includes(initialViewTab) ? initialViewTab : 'posts'
  );

  // URLパラメータを更新（Next.jsがpatchしたreplaceStateを回避し、ネイティブAPIを直接使用）
  const updateURL = useCallback((category: string | null, page: number, view?: ViewTab) => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (page > 1) params.set('page', page.toString());
    if (view && view !== 'posts') params.set('view', view);
    const queryString = params.toString();
    const url = `/blog${queryString ? `?${queryString}` : ''}`;
    // Next.js App RouterはHistory.replaceStateをmonkey-patchしてsoft navigationをトリガーする。
    // これによりChunkLoadErrorが発生するため、プロトタイプから直接呼び出す。
    const nativeReplaceState = Object.getPrototypeOf(window.history).replaceState;
    nativeReplaceState.call(window.history, window.history.state, '', url);
  }, []);

  // 検索クエリを正規化
  const normalizedQuery = useMemo(() => searchQuery.toLowerCase().trim(), [searchQuery]);

  // 記事データを事前に正規化
  const normalizedPosts = useMemo<NormalizedPost[]>(() => {
    return posts.map((post) => ({
      ...post,
      _searchableTitle: post.title.toLowerCase(),
      _searchableDesc: post.description.toLowerCase(),
      _searchableTags: post.tags.map((t) => t.toLowerCase()),
      _dateTimestamp: new Date(post.date).getTime(),
    }));
  }, [posts]);

  // フィルタリングとソート
  const filteredPosts = useMemo(() => {
    let result = normalizedPosts;

    // カテゴリーフィルター
    if (selectedCategory) {
      result = result.filter(
        (post) => post.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // タグフィルター（複数選択対応）
    if (selectedTags.length > 0) {
      if (tagFilterMode === 'AND') {
        result = result.filter((post) =>
          selectedTags.every((tag) => post.tags.includes(tag))
        );
      } else {
        result = result.filter((post) =>
          selectedTags.some((tag) => post.tags.includes(tag))
        );
      }
    }

    // 検索フィルター
    if (normalizedQuery) {
      const queryWords = normalizedQuery.split(/\s+/);
      result = result.filter((post) =>
        queryWords.every(
          (word) =>
            post._searchableTitle.includes(word) ||
            post._searchableDesc.includes(word) ||
            post._searchableTags.some((tag) => tag.includes(word))
        )
      );
    }

    // 日付範囲フィルター
    if (dateRange) {
      result = result.filter((post) => {
        const postDate = new Date(post.date);
        if (dateRange.year && postDate.getFullYear() !== dateRange.year) return false;
        if (dateRange.month !== undefined && postDate.getMonth() !== dateRange.month) return false;
        if (dateRange.day !== undefined && postDate.getDate() !== dateRange.day) return false;
        return true;
      });
    }

    // ソート
    if (sortType === 'popular') {
      const scored = result.map((post) => ({
        post,
        score: (engagement[post.slug]?.views || 0) + (engagement[post.slug]?.likes || 0) * 3,
      }));
      scored.sort((a, b) =>
        sortDirection === 'desc' ? b.score - a.score : a.score - b.score
      );
      return scored.map((s) => s.post);
    } else {
      return [...result].sort((a, b) =>
        sortDirection === 'desc'
          ? b._dateTimestamp - a._dateTimestamp
          : a._dateTimestamp - b._dateTimestamp
      );
    }
  }, [normalizedPosts, selectedCategory, selectedTags, tagFilterMode, normalizedQuery, dateRange, sortType, sortDirection, engagement]);

  // ページネーション
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * postsPerPage;
    return filteredPosts.slice(start, start + postsPerPage);
  }, [filteredPosts, currentPage, postsPerPage]);

  // カテゴリー別の記事数
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach((post) => {
      if (post.category) {
        const key = post.category.toLowerCase();
        counts[key] = (counts[key] || 0) + 1;
      }
    });
    return counts;
  }, [posts]);

  // 全タグのリスト（検索フィルター対応）
  const allTags = useMemo(() => {
    const tagCounts: Record<string, number> = {};
    posts.forEach((post) => {
      post.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    return Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [posts]);

  // タグ検索でフィルタリング
  const filteredTags = useMemo(() => {
    if (!tagSearchQuery) return allTags;
    const query = tagSearchQuery.toLowerCase();
    return allTags.filter((tag) => tag.name.toLowerCase().includes(query));
  }, [allTags, tagSearchQuery]);

  // 月別記事グループ（アーカイブ用）
  const postsByMonth = useMemo(() => {
    const map = new Map<string, BlogMeta[]>();
    // 日付降順でソートされた全記事を使用
    const sorted = [...posts].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    sorted.forEach((post) => {
      const d = new Date(post.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(post);
    });
    return map;
  }, [posts]);

  // 日付ごとの記事数（カレンダーのドット表示用）
  const postDates = useMemo(() => {
    const map = new Map<string, number>();
    posts.forEach((post) => {
      const d = new Date(post.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [posts]);

  // トレンド記事（engagementスコア上位5件）
  const trendingPosts = useMemo(() => {
    if (Object.keys(engagement).length === 0) return [];
    return [...posts]
      .map((post) => ({
        post,
        score: (engagement[post.slug]?.views || 0) + (engagement[post.slug]?.likes || 0) * 3,
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((item) => item.post);
  }, [posts, engagement]);

  // アクションハンドラー
  const handleCategoryChange = useCallback((category: string | null) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    updateURL(category, 1, viewTab);
  }, [updateURL, viewTab]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    updateURL(selectedCategory, page, viewTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedCategory, updateURL, viewTab]);

  const handleSortClick = useCallback((type: SortType) => {
    if (sortType === type) {
      setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortType(type);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  }, [sortType]);

  const handleTagToggle = useCallback((tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName]
    );
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handleViewTabChange = useCallback((tab: ViewTab) => {
    setViewTab(tab);
    setCurrentPage(1);
    updateURL(selectedCategory, 1, tab);
  }, [selectedCategory, updateURL]);

  const handleDateRangeChange = useCallback((range: DateRange | null) => {
    setDateRange(range);
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedTags([]);
    setSelectedCategory(null);
    setCurrentPage(1);
    setTagSearchQuery('');
    setDateRange(null);
    updateURL(null, 1, viewTab);
  }, [updateURL, viewTab]);

  const hasActiveFilters = searchQuery || selectedTags.length > 0 || selectedCategory || dateRange;

  // 最新記事の判定
  const showFeatured = !searchQuery && selectedTags.length === 0 && !selectedCategory && !dateRange && sortType === 'date' && sortDirection === 'desc' && currentPage === 1;
  const featuredPost = showFeatured ? paginatedPosts[0] : null;
  const regularPosts = showFeatured ? paginatedPosts.slice(1) : paginatedPosts;

  return {
    // 状態
    searchQuery,
    selectedTags,
    selectedCategory,
    sortType,
    sortDirection,
    currentPage,
    tagSearchQuery,
    tagFilterMode,
    dateRange,
    viewTab,

    // 計算値
    filteredPosts,
    paginatedPosts,
    totalPages,
    categoryCounts,
    allTags,
    filteredTags,
    hasActiveFilters,
    featuredPost,
    regularPosts,
    postsByMonth,
    postDates,
    trendingPosts,

    // アクション
    setSearchQuery: handleSearchChange,
    setSelectedTags,
    setSelectedCategory: handleCategoryChange,
    setTagSearchQuery,
    setTagFilterMode,
    setDateRange: handleDateRangeChange,
    setViewTab: handleViewTabChange,
    handlePageChange,
    handleSortClick,
    handleTagToggle,
    clearFilters,
  };
}
