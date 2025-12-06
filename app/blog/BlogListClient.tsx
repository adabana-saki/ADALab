'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  Tag,
  User,
  TrendingUp,
  Sparkles,
  BookOpen,
  Rss,
  Search,
  X,
  Eye,
  Heart,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
  Folder,
} from 'lucide-react';
import type { BlogMeta, ScheduledPost, Category } from '@/lib/blog';
import { UpcomingPosts } from '@/components/blog/UpcomingPosts';

interface BlogListClientProps {
  posts: BlogMeta[];
  tags: { name: string; count: number }[];
  categories?: Category[];
  scheduledPosts?: ScheduledPost[];
}

type SortType = 'date' | 'popular';
type SortDirection = 'desc' | 'asc';
type ViewMode = 'grid' | 'list';

const POSTS_PER_PAGE = 12;

// エンゲージメント表示コンポーネント（コンポーネント外に定義してメモ化を有効に）
interface EngagementBadgeProps {
  data?: { views: number; likes: number };
  isLoading: boolean;
}

function EngagementBadge({ data, isLoading }: EngagementBadgeProps) {
  if (isLoading || !data) return null;
  if (data.views === 0 && data.likes === 0) return null;

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      {data.views > 0 && (
        <span className="flex items-center gap-1">
          <Eye size={12} />
          {data.views}
        </span>
      )}
      {data.likes > 0 && (
        <span className="flex items-center gap-1 text-pink-500">
          <Heart size={12} className="fill-current" />
          {data.likes}
        </span>
      )}
    </div>
  );
}

// ページネーションコンポーネント
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];
  const showPages = 5;

  if (totalPages <= showPages) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg bg-muted/50 hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="前のページ"
      >
        <ChevronLeft size={18} />
      </button>

      <div className="flex items-center gap-1">
        {pages.map((page, i) => (
          <button
            key={i}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            className={`min-w-[40px] h-10 rounded-lg text-sm font-medium transition-colors ${
              page === currentPage
                ? 'bg-primary text-primary-foreground'
                : page === '...'
                ? 'cursor-default text-muted-foreground'
                : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg bg-muted/50 hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="次のページ"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

export function BlogListClient({
  posts,
  tags,
  categories = [],
  scheduledPosts = [],
}: BlogListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URLパラメータから初期値を取得
  const initialCategory = searchParams.get('category') || null;
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [sortType, setSortType] = useState<SortType>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [engagement, setEngagement] = useState<Record<string, { views: number; likes: number }>>({});
  const [isLoadingEngagement, setIsLoadingEngagement] = useState(true);

  // LocalStorageから表示モードを復元
  useEffect(() => {
    const savedViewMode = localStorage.getItem('blog-view-mode') as ViewMode;
    if (savedViewMode) setViewMode(savedViewMode);
  }, []);

  // 表示モード変更時にLocalStorageに保存
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('blog-view-mode', mode);
  };

  // URLパラメータを更新
  const updateURL = (category: string | null, page: number) => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (page > 1) params.set('page', page.toString());
    const queryString = params.toString();
    router.push(`/blog${queryString ? `?${queryString}` : ''}`, { scroll: false });
  };

  // カテゴリー変更
  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    updateURL(category, 1);
  };

  // ページ変更
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateURL(selectedCategory, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ソートボタンのクリックハンドラー
  const handleSortClick = (type: SortType) => {
    if (sortType === type) {
      setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortType(type);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  // エンゲージメントデータを取得
  useEffect(() => {
    const fetchEngagement = async () => {
      if (posts.length === 0) {
        setIsLoadingEngagement(false);
        return;
      }

      try {
        const slugs = posts.map((p) => p.slug);
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
        console.error('Failed to fetch engagement:', error);
      } finally {
        setIsLoadingEngagement(false);
      }
    };

    fetchEngagement();
  }, [posts]);

  // 検索クエリを正規化（メモ化して再計算を防止）
  const normalizedQuery = useMemo(() => searchQuery.toLowerCase().trim(), [searchQuery]);

  // 記事データを事前に正規化（大量記事での検索効率を改善）
  const normalizedPosts = useMemo(() => {
    return posts.map((post) => ({
      ...post,
      _searchableTitle: post.title.toLowerCase(),
      _searchableDesc: post.description.toLowerCase(),
      _searchableTags: post.tags.map((t) => t.toLowerCase()),
      _dateTimestamp: new Date(post.date).getTime(),
    }));
  }, [posts]);

  // フィルタリングとソート（効率化版）
  const filteredPosts = useMemo(() => {
    let result = normalizedPosts;

    // カテゴリーフィルター
    if (selectedCategory) {
      result = result.filter((post) => post.category?.toLowerCase() === selectedCategory.toLowerCase());
    }

    // タグフィルター（早期フィルタリングで検索対象を削減）
    if (selectedTag) {
      result = result.filter((post) => post.tags.includes(selectedTag));
    }

    // 検索フィルター（事前正規化済みデータを使用）
    if (normalizedQuery) {
      result = result.filter(
        (post) =>
          post._searchableTitle.includes(normalizedQuery) ||
          post._searchableDesc.includes(normalizedQuery) ||
          post._searchableTags.some((tag) => tag.includes(normalizedQuery))
      );
    }

    // ソート（スコアを事前計算してソート効率を改善）
    if (sortType === 'popular') {
      // スコアを一度だけ計算
      const scored = result.map((post) => ({
        post,
        score: (engagement[post.slug]?.views || 0) + (engagement[post.slug]?.likes || 0) * 3,
      }));
      scored.sort((a, b) =>
        sortDirection === 'desc' ? b.score - a.score : a.score - b.score
      );
      return scored.map((s) => s.post);
    } else {
      // 事前計算済みのタイムスタンプを使用
      return [...result].sort((a, b) =>
        sortDirection === 'desc'
          ? b._dateTimestamp - a._dateTimestamp
          : a._dateTimestamp - b._dateTimestamp
      );
    }
  }, [normalizedPosts, selectedCategory, selectedTag, normalizedQuery, sortType, sortDirection, engagement]);

  // ページネーション計算
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * POSTS_PER_PAGE;
    return filteredPosts.slice(start, start + POSTS_PER_PAGE);
  }, [filteredPosts, currentPage]);

  // 最新記事（トップに表示）
  const showFeatured = !searchQuery && !selectedTag && !selectedCategory && sortType === 'date' && sortDirection === 'desc' && currentPage === 1;
  const featuredPost = showFeatured ? paginatedPosts[0] : null;
  const regularPosts = showFeatured ? paginatedPosts.slice(1) : paginatedPosts;

  // カテゴリー別の記事数を計算
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

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTag(null);
    setSelectedCategory(null);
    setCurrentPage(1);
    updateURL(null, 1);
  };

  const hasActiveFilters = searchQuery || selectedTag || selectedCategory;

  return (
    <div className="max-w-6xl mx-auto">
      {/* カテゴリータブ */}
      <div className="mb-6 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-2 min-w-max pb-2">
          <button
            onClick={() => handleCategoryChange(null)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              !selectedCategory
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Folder size={16} />
            すべて
            <span className="text-xs opacity-70">({posts.length})</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => handleCategoryChange(cat.slug)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                selectedCategory === cat.slug
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <span>{cat.name}</span>
              <span className="text-xs opacity-70">
                ({categoryCounts[cat.slug.toLowerCase()] || 0})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 検索・フィルターバー */}
      <div className="bg-card border border-border/50 rounded-xl p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* 検索 */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="記事を検索..."
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* ソートオプション */}
          <div className="flex gap-2">
            <button
              onClick={() => handleSortClick('date')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                sortType === 'date'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Sparkles size={16} />
              {sortType === 'date' && sortDirection === 'desc' ? '新着' : '古い順'}
              {sortType === 'date' && (
                sortDirection === 'desc' ? <ArrowDown size={14} /> : <ArrowUp size={14} />
              )}
            </button>
            <button
              onClick={() => handleSortClick('popular')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                sortType === 'popular'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <TrendingUp size={16} />
              {sortType === 'popular' && sortDirection === 'asc' ? '不人気' : '人気'}
              {sortType === 'popular' && (
                sortDirection === 'desc' ? <ArrowDown size={14} /> : <ArrowUp size={14} />
              )}
            </button>

            {/* 表示モード切替 */}
            <div className="hidden md:flex border border-border/50 rounded-lg overflow-hidden">
              <button
                onClick={() => handleViewModeChange('list')}
                className={`p-2.5 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                aria-label="リスト表示"
              >
                <List size={16} />
              </button>
              <button
                onClick={() => handleViewModeChange('grid')}
                className={`p-2.5 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                aria-label="グリッド表示"
              >
                <Grid3X3 size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* タグフィルター */}
        {tags.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 10).map((tag) => (
                <button
                  key={tag.name}
                  onClick={() => {
                    setSelectedTag(selectedTag === tag.name ? null : tag.name);
                    setCurrentPage(1);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                    selectedTag === tag.name
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Tag size={12} />
                  {tag.name}
                  <span className="opacity-60">({tag.count})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* アクティブフィルター表示 */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {filteredPosts.length}件の記事が見つかりました
            </span>
            <button
              onClick={clearFilters}
              className="text-sm text-primary hover:underline"
            >
              フィルターをクリア
            </button>
          </div>
        )}
      </div>

      {filteredPosts.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border/50 rounded-xl">
          <BookOpen size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">
            {hasActiveFilters
              ? '条件に一致する記事が見つかりませんでした'
              : 'まだ記事がありません'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-primary hover:underline text-sm"
            >
              フィルターをクリアして全記事を表示
            </button>
          )}
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* メインコンテンツ */}
          <div className="lg:col-span-2 space-y-6">
            {/* フィーチャー記事（最新） */}
            {featuredPost && (
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="group block bg-gradient-to-br from-primary/5 via-card to-card border border-primary/20 rounded-xl p-6 hover:border-primary/40 transition-all duration-300"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                      <Sparkles size={12} />
                      最新記事
                    </span>
                    {featuredPost.category && (
                      <span className="text-xs text-muted-foreground">
                        {featuredPost.category}
                      </span>
                    )}
                  </div>
                  <EngagementBadge data={engagement[featuredPost.slug]} isLoading={isLoadingEngagement} />
                </div>
                <h2 className="text-xl md:text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {featuredPost.title}
                </h2>
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {featuredPost.description}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    {featuredPost.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} />
                    {featuredPost.readingTime}
                  </span>
                  {featuredPost.author && (
                    <span className="flex items-center gap-1.5">
                      <User size={14} />
                      {featuredPost.author}
                    </span>
                  )}
                </div>
                {featuredPost.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {featuredPost.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-muted/50 text-muted-foreground text-xs rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            )}

            {/* 記事リスト */}
            <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 gap-4' : 'space-y-4'}>
              {regularPosts.map((post) => (
                <article
                  key={post.slug}
                  className={`group bg-card border border-border/50 rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300 ${
                    viewMode === 'grid' ? 'flex flex-col' : ''
                  }`}
                >
                  <Link href={`/blog/${post.slug}`} className={viewMode === 'grid' ? 'flex flex-col h-full' : 'flex'}>
                    {/* サムネイル（将来用） */}
                    {post.image && (
                      <div
                        className={
                          viewMode === 'grid'
                            ? 'h-40 bg-muted'
                            : 'hidden sm:block w-40 h-32 flex-shrink-0 bg-muted'
                        }
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className={`flex-1 p-5 ${viewMode === 'grid' ? 'flex flex-col' : ''}`}>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          {post.category && (
                            <span className="text-xs text-primary font-medium">
                              {post.category}
                            </span>
                          )}
                          {post.series && (
                            <span className="text-xs text-muted-foreground">
                              シリーズ
                            </span>
                          )}
                        </div>
                        <EngagementBadge data={engagement[post.slug]} isLoading={isLoadingEngagement} />
                      </div>

                      <h3
                        className={`font-semibold mb-2 group-hover:text-primary transition-colors ${
                          viewMode === 'grid' ? 'text-base line-clamp-2' : 'text-lg line-clamp-2'
                        }`}
                      >
                        {post.title}
                      </h3>

                      <p
                        className={`text-sm text-muted-foreground mb-3 ${
                          viewMode === 'grid' ? 'line-clamp-2 flex-1' : 'line-clamp-2'
                        }`}
                      >
                        {post.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-auto">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {post.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {post.readingTime}
                        </span>
                        {post.tags.length > 0 && viewMode !== 'grid' && (
                          <div className="flex gap-1">
                            {post.tags.slice(0, 2).map((tag) => (
                              <span key={tag} className="text-primary/80">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>

            {/* ページネーション */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>

          {/* サイドバー */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* 公開予定 */}
              {scheduledPosts.length > 0 && (
                <UpcomingPosts posts={scheduledPosts} />
              )}

              {/* 著者情報 */}
              <div className="bg-card border border-border/50 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src="/images/adabanasaki.png"
                    alt="Adabana Saki"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold">Adabana Saki</h3>
                    <p className="text-sm text-muted-foreground">@ADA Lab</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  開発ツール、Linux環境、Web技術についての記事を発信しています。
                </p>
                <div className="flex gap-2">
                  <a
                    href="/feed.xml"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-500/10 text-orange-500 text-sm rounded-lg hover:bg-orange-500/20 transition-colors"
                  >
                    <Rss size={14} />
                    RSS
                  </a>
                  <a
                    href="/atom.xml"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary/10 text-primary text-sm rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    <Rss size={14} />
                    Atom
                  </a>
                </div>
              </div>

              {/* 人気のタグ */}
              {tags.length > 0 && (
                <div className="bg-card border border-border/50 rounded-xl p-5">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Tag size={16} />
                    人気のタグ
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.slice(0, 15).map((tag) => (
                      <button
                        key={tag.name}
                        onClick={() => {
                          setSelectedTag(selectedTag === tag.name ? null : tag.name);
                          setCurrentPage(1);
                        }}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                          selectedTag === tag.name
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        {tag.name}
                        <span className="ml-1 opacity-60">{tag.count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 統計 */}
              <div className="bg-card border border-border/50 rounded-xl p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp size={16} />
                  統計
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{posts.length}</div>
                    <div className="text-xs text-muted-foreground">記事</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{tags.length}</div>
                    <div className="text-xs text-muted-foreground">タグ</div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
