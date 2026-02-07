'use client';

import { useState, useEffect, useMemo } from 'react';
import { BookOpen } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import type { BlogMeta, ScheduledPost, Category } from '@/lib/blog';
import { UpcomingPosts } from '@/components/blog/UpcomingPosts';
import { BlogCard } from '@/components/blog/BlogCard';
import { BlogFilterBar } from '@/components/blog/BlogFilterBar';
import { BlogPagination } from '@/components/blog/BlogPagination';
import { BlogViewTabs } from '@/components/blog/BlogViewTabs';
import { BlogStatsBar } from '@/components/blog/BlogStatsBar';
import { BlogTrendingStrip } from '@/components/blog/BlogTrendingStrip';
import { BlogArchiveView } from '@/components/blog/BlogArchiveView';
import { BlogCalendarView } from '@/components/blog/BlogCalendarView';
import { useBlogFilters, type ViewMode } from '@/components/blog/hooks/useBlogFilters';

interface BlogListClientProps {
  posts: BlogMeta[];
  tags: { name: string; count: number }[];
  categories?: Category[];
  scheduledPosts?: ScheduledPost[];
}

export function BlogListClient({
  posts,
  tags,
  categories = [],
  scheduledPosts = [],
}: BlogListClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [engagement, setEngagement] = useState<Record<string, { views: number; likes: number }>>({});
  const [_isLoadingEngagement, setIsLoadingEngagement] = useState(true);

  // フィルターフックを使用
  const {
    searchQuery,
    selectedTags,
    selectedCategory,
    sortType,
    sortDirection,
    currentPage,
    tagSearchQuery,
    tagFilterMode,
    filteredPosts,
    totalPages,
    categoryCounts,
    allTags,
    filteredTags,
    hasActiveFilters,
    featuredPost,
    regularPosts,
    viewTab,
    postsByMonth,
    postDates,
    trendingPosts,
    setSearchQuery,
    setSelectedCategory,
    setTagSearchQuery,
    setTagFilterMode,
    setViewTab,
    setDateRange,
    handlePageChange,
    handleSortClick,
    handleTagToggle,
    clearFilters,
  } = useBlogFilters({
    posts,
    postsPerPage: 12,
    engagement,
  });

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

  // カテゴリー一覧をフィルターバー用に整形
  const categoryOptions = useMemo(() => {
    return categories.map((cat) => ({
      name: cat.name,
      count: categoryCounts[cat.slug.toLowerCase()] || 0,
    }));
  }, [categories, categoryCounts]);

  // 統計用の総閲覧数
  const totalViews = useMemo(() => {
    return Object.values(engagement).reduce((sum, e) => sum + (e.views || 0), 0);
  }, [engagement]);

  // ユニークカテゴリー数
  const uniqueCategories = useMemo(() => {
    return new Set(posts.map((p) => p.category).filter(Boolean)).size;
  }, [posts]);

  return (
    <div className="max-w-7xl mx-auto">
      {/* ヘッダー */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">ブログ</h1>
        <p className="text-muted-foreground">
          開発ツール、Linux環境、Web技術についての記事を発信しています。
        </p>
      </div>

      {/* 公開予定 */}
      {scheduledPosts.length > 0 && (
        <div className="mb-6">
          <UpcomingPosts posts={scheduledPosts} />
        </div>
      )}

      {/* 統計バー */}
      <div className="mb-6">
        <BlogStatsBar
          totalPosts={posts.length}
          totalCategories={uniqueCategories}
          totalTags={tags.length}
          totalViews={totalViews}
        />
      </div>

      {/* フィルターバー */}
      <BlogFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categories={categoryOptions}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        allTags={allTags}
        filteredTags={filteredTags}
        selectedTags={selectedTags}
        tagSearchQuery={tagSearchQuery}
        tagFilterMode={tagFilterMode}
        onTagToggle={handleTagToggle}
        onTagSearchChange={setTagSearchQuery}
        onTagFilterModeChange={setTagFilterMode}
        sortType={sortType}
        sortDirection={sortDirection}
        onSortClick={handleSortClick}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        hasActiveFilters={!!hasActiveFilters}
        onClearFilters={clearFilters}
        totalResults={filteredPosts.length}
      />

      {/* ビュータブ */}
      <div className="mb-6">
        <BlogViewTabs activeTab={viewTab} onTabChange={setViewTab} />
      </div>

      {/* タブコンテンツ */}
      <AnimatePresence mode="wait">
        {viewTab === 'posts' && (
          <motion.div
            key="posts"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {filteredPosts.length === 0 ? (
              <div className="text-center py-20 bg-card border border-border rounded-xl">
                <BookOpen size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">
                  {hasActiveFilters
                    ? '条件に一致する記事が見つかりませんでした'
                    : 'まだ記事がありません'}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-primary hover:underline text-sm cursor-pointer"
                  >
                    フィルターをクリアして全記事を表示
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* トレンド記事ストリップ */}
                {trendingPosts.length > 0 && !hasActiveFilters && currentPage === 1 && (
                  <BlogTrendingStrip posts={trendingPosts} engagement={engagement} />
                )}

                {/* フィーチャー記事（最新） */}
                {featuredPost && (
                  <BlogCard
                    post={featuredPost}
                    engagement={engagement[featuredPost.slug]}
                    variant="featured"
                  />
                )}

                {/* 記事リスト */}
                {viewMode === 'grid' ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {regularPosts.map((post) => (
                      <BlogCard
                        key={post.slug}
                        post={post}
                        engagement={engagement[post.slug]}
                        variant="default"
                          />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {regularPosts.map((post) => (
                      <BlogCard
                        key={post.slug}
                        post={post}
                        engagement={engagement[post.slug]}
                        variant="compact"
                          />
                    ))}
                  </div>
                )}

                {/* ページネーション */}
                <BlogPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  showPageJump={true}
                />
              </div>
            )}
          </motion.div>
        )}

        {viewTab === 'archive' && (
          <motion.div
            key="archive"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <BlogArchiveView postsByMonth={postsByMonth} engagement={engagement} />
          </motion.div>
        )}

        {viewTab === 'calendar' && (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <BlogCalendarView
              posts={posts}
              postDates={postDates}
              engagement={engagement}
              onDateSelect={(range) => {
                if (range) {
                  setDateRange({ year: range.year, month: range.month, day: range.day });
                } else {
                  setDateRange(null);
                }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
