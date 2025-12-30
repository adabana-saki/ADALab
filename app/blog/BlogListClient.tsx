'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  Tag,
  TrendingUp,
  Rss,
  Grid3X3,
  List,
  BookOpen,
} from 'lucide-react';
import type { BlogMeta, ScheduledPost, Category } from '@/lib/blog';
import { UpcomingPosts } from '@/components/blog/UpcomingPosts';
import { BlogCard } from '@/components/blog/BlogCard';
import { BlogFilterBar } from '@/components/blog/BlogFilterBar';
import { BlogPagination } from '@/components/blog/BlogPagination';
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
    setSearchQuery,
    setSelectedCategory,
    setTagSearchQuery,
    setTagFilterMode,
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

  return (
    <div className="max-w-7xl mx-auto">
      {/* ヘッダーセクション */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">ブログ</h1>
            <p className="text-muted-foreground">
              開発ツール、Linux環境、Web技術についての記事を発信しています。
            </p>
          </div>

          {/* 表示モード切替 */}
          <div className="hidden md:flex border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => handleViewModeChange('list')}
              className={`p-2.5 transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              aria-label="リスト表示"
            >
              <List size={18} />
            </button>
            <button
              onClick={() => handleViewModeChange('grid')}
              className={`p-2.5 transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              aria-label="グリッド表示"
            >
              <Grid3X3 size={18} />
            </button>
          </div>
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
          hasActiveFilters={!!hasActiveFilters}
          onClearFilters={clearFilters}
          totalResults={filteredPosts.length}
        />
      </div>

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
        <div className="grid lg:grid-cols-3 gap-8">
          {/* メインコンテンツ */}
          <div className="lg:col-span-2 space-y-6">
            {/* フィーチャー記事（最新） */}
            {featuredPost && (
              <BlogCard
                post={featuredPost}
                engagement={engagement[featuredPost.slug]}
                variant="featured"
                showThumbnail={true}
              />
            )}

            {/* 記事リスト */}
            {viewMode === 'grid' ? (
              <div className="grid md:grid-cols-2 gap-6">
                {regularPosts.map((post) => (
                  <BlogCard
                    key={post.slug}
                    post={post}
                    engagement={engagement[post.slug]}
                    variant="default"
                    showThumbnail={true}
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
                    showThumbnail={true}
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

          {/* サイドバー */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* 公開予定 */}
              {scheduledPosts.length > 0 && (
                <UpcomingPosts posts={scheduledPosts} />
              )}

              {/* 著者情報 */}
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <Image
                    src="/images/adabanasaki.png"
                    alt="Adabana Saki"
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
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

              {/* 人気のタグ（サイドバー用） */}
              {tags.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-5">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Tag size={16} />
                    人気のタグ
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.slice(0, 15).map((tag) => (
                      <button
                        key={tag.name}
                        onClick={() => handleTagToggle(tag.name)}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                          selectedTags.includes(tag.name)
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
              <div className="bg-card border border-border rounded-xl p-5">
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
