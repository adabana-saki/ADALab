'use client';

import { useState, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { BlogMeta } from '@/lib/blog';

export type SortType = 'date' | 'popular';
export type SortDirection = 'desc' | 'asc';
export type ViewMode = 'grid' | 'list';

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
  const router = useRouter();
  const searchParams = useSearchParams();

  // URLパラメータから初期値を取得
  const initialCategory = searchParams.get('category') || null;
  const rawPage = searchParams.get('page');
  const parsedPage = rawPage ? Number.parseInt(rawPage, 10) : 1;
  const initialPage = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

  // 状態管理
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [sortType, setSortType] = useState<SortType>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [tagFilterMode, setTagFilterMode] = useState<'AND' | 'OR'>('OR');

  // URLパラメータを更新
  const updateURL = useCallback((category: string | null, page: number) => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (page > 1) params.set('page', page.toString());
    const queryString = params.toString();
    router.push(`/blog${queryString ? `?${queryString}` : ''}`, { scroll: false });
  }, [router]);

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
  }, [normalizedPosts, selectedCategory, selectedTags, tagFilterMode, normalizedQuery, sortType, sortDirection, engagement]);

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

  // アクションハンドラー
  const handleCategoryChange = useCallback((category: string | null) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    updateURL(category, 1);
  }, [updateURL]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    updateURL(selectedCategory, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedCategory, updateURL]);

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

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedTags([]);
    setSelectedCategory(null);
    setCurrentPage(1);
    setTagSearchQuery('');
    updateURL(null, 1);
  }, [updateURL]);

  const hasActiveFilters = searchQuery || selectedTags.length > 0 || selectedCategory;

  // 最新記事の判定
  const showFeatured = !searchQuery && selectedTags.length === 0 && !selectedCategory && sortType === 'date' && sortDirection === 'desc' && currentPage === 1;
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

    // アクション
    setSearchQuery: handleSearchChange,
    setSelectedTags,
    setSelectedCategory: handleCategoryChange,
    setTagSearchQuery,
    setTagFilterMode,
    handlePageChange,
    handleSortClick,
    handleTagToggle,
    clearFilters,
  };
}
