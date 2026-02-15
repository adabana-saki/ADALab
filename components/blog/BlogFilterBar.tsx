'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, Filter, ChevronDown, ChevronUp, Tag, Calendar, TrendingUp, Rss, Grid3X3, List } from 'lucide-react';
import type { SortType, SortDirection, ViewMode } from './hooks/useBlogFilters';

interface BlogFilterBarProps {
  // 検索
  searchQuery: string;
  onSearchChange: (query: string) => void;

  // カテゴリー
  categories: { name: string; count: number }[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;

  // タグ
  allTags: { name: string; count: number }[];
  filteredTags: { name: string; count: number }[];
  selectedTags: string[];
  tagSearchQuery: string;
  tagFilterMode: 'AND' | 'OR';
  onTagToggle: (tag: string) => void;
  onTagSearchChange: (query: string) => void;
  onTagFilterModeChange: (mode: 'AND' | 'OR') => void;

  // ソート
  sortType: SortType;
  sortDirection: SortDirection;
  onSortClick: (type: SortType) => void;

  // 表示モード
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;

  // フィルターリセット
  hasActiveFilters: boolean;
  onClearFilters: () => void;

  // 結果数
  totalResults: number;
}

export function BlogFilterBar({
  searchQuery,
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange,
  allTags,
  filteredTags,
  selectedTags,
  tagSearchQuery,
  tagFilterMode,
  onTagToggle,
  onTagSearchChange,
  onTagFilterModeChange,
  sortType,
  sortDirection,
  onSortClick,
  viewMode,
  onViewModeChange,
  hasActiveFilters,
  onClearFilters,
  totalResults,
}: BlogFilterBarProps) {
  const [isTagPanelOpen, setIsTagPanelOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [showTagCloud, setShowTagCloud] = useState(false);
  const tagPanelRef = useRef<HTMLDivElement>(null);

  // タグクラウド用：上位20タグ
  const tagCloudTags = useMemo(() => allTags.slice(0, 20), [allTags]);
  const maxTagCount = useMemo(() => Math.max(...tagCloudTags.map((t) => t.count), 1), [tagCloudTags]);

  const getTagCloudSize = (count: number) => {
    const ratio = count / maxTagCount;
    if (ratio > 0.75) return 'text-base font-semibold';
    if (ratio > 0.5) return 'text-sm font-medium';
    if (ratio > 0.25) return 'text-xs font-medium';
    return 'text-xs';
  };

  // タグパネル外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagPanelRef.current && !tagPanelRef.current.contains(event.target as Node)) {
        setIsTagPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="mb-6 space-y-4">
      {/* メイン検索バー */}
      <div className="flex flex-col lg:flex-row gap-3">
        {/* 検索入力 */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="記事を検索..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-10 py-3 rounded-xl border border-border bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label="検索をクリア"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* ソートボタン + 表示モード + RSS */}
        <div className="flex gap-2">
          <button
            onClick={() => onSortClick('date')}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all duration-200 cursor-pointer ${
              sortType === 'date'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-background/50 hover:border-primary/50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">日付</span>
            {sortType === 'date' && (
              sortDirection === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => onSortClick('popular')}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all duration-200 cursor-pointer ${
              sortType === 'popular'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-background/50 hover:border-primary/50'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">人気</span>
            {sortType === 'popular' && (
              sortDirection === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />
            )}
          </button>

          {/* 表示モード切替 */}
          <div className="hidden md:flex border border-border rounded-xl overflow-hidden">
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-3 transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background/50 text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              aria-label="リスト表示"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-3 transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background/50 text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              aria-label="グリッド表示"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
          </div>

          {/* RSS/Atom リンク */}
          <div className="hidden sm:flex gap-1">
            <a
              href="/feed.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl border border-border bg-background/50 hover:border-orange-500/50 hover:text-orange-500 transition-all text-muted-foreground"
              aria-label="RSS Feed"
            >
              <Rss className="w-4 h-4" />
            </a>
          </div>

          {/* モバイルフィルターボタン */}
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="lg:hidden flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border bg-background/50 hover:border-primary/50 transition-all duration-200 cursor-pointer"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden xs:inline">フィルター</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-primary" />
            )}
          </button>
        </div>
      </div>

      {/* カテゴリーとタグフィルター */}
      <div className={`lg:flex gap-4 items-start ${isMobileFilterOpen ? 'block' : 'hidden lg:flex'}`}>
        {/* カテゴリー選択 */}
        <div className="flex flex-wrap gap-2 mb-4 lg:mb-0">
          <button
            onClick={() => onCategoryChange(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
              !selectedCategory
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
            }`}
          >
            すべて
          </button>
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => onCategoryChange(cat.name === selectedCategory ? null : cat.name)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                selectedCategory === cat.name
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat.name}
              <span className="ml-1.5 text-xs opacity-70">({cat.count})</span>
            </button>
          ))}
        </div>

        {/* タグ選択パネル */}
        <div className="relative flex-shrink-0" ref={tagPanelRef}>
          <div className="flex gap-2">
            <button
              onClick={() => setIsTagPanelOpen(!isTagPanelOpen)}
              className={`flex items-center justify-between gap-2 px-4 py-2 rounded-xl border transition-all duration-200 cursor-pointer ${
                selectedTags.length > 0
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-background/50 hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <span>
                  {selectedTags.length > 0
                    ? `${selectedTags.length}個のタグを選択中`
                    : 'タグで絞り込み'}
                </span>
              </div>
              {isTagPanelOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {/* タグクラウド表示切替 */}
            {tagCloudTags.length > 0 && (
              <button
                onClick={() => setShowTagCloud(!showTagCloud)}
                className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all duration-200 cursor-pointer ${
                  showTagCloud
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background/50 hover:border-primary/50 text-muted-foreground'
                }`}
              >
                タグクラウド
              </button>
            )}
          </div>

          {/* タグ選択ドロップダウン */}
          {isTagPanelOpen && (
            <div className="absolute z-50 top-full left-0 right-0 lg:right-auto lg:min-w-[400px] mt-2 p-4 rounded-xl border border-border bg-background shadow-xl">
              {/* タグ検索 */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="タグを検索..."
                  value={tagSearchQuery}
                  onChange={(e) => onTagSearchChange(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* AND/ORモード切り替え */}
              <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-muted/50">
                <span className="text-xs text-muted-foreground">フィルターモード:</span>
                <button
                  onClick={() => onTagFilterModeChange('OR')}
                  className={`px-3 py-1 text-xs rounded-md transition-all cursor-pointer ${
                    tagFilterMode === 'OR'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  OR (いずれか)
                </button>
                <button
                  onClick={() => onTagFilterModeChange('AND')}
                  className={`px-3 py-1 text-xs rounded-md transition-all cursor-pointer ${
                    tagFilterMode === 'AND'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  AND (すべて)
                </button>
              </div>

              {/* タグリスト */}
              <div className="max-h-[300px] overflow-y-auto space-y-1">
                {filteredTags.length > 0 ? (
                  filteredTags.map((tag) => (
                    <button
                      key={tag.name}
                      onClick={() => onTagToggle(tag.name)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                        selectedTags.includes(tag.name)
                          ? 'bg-primary/20 text-primary'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                          selectedTags.includes(tag.name)
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'border-border'
                        }`}>
                          {selectedTags.includes(tag.name) && (
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                        {tag.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {tag.count}件
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    タグが見つかりません
                  </p>
                )}
              </div>

              {/* 選択中タグのクリア */}
              {selectedTags.length > 0 && (
                <button
                  onClick={() => selectedTags.forEach(tag => onTagToggle(tag))}
                  className="w-full mt-3 py-2 text-sm text-center text-muted-foreground hover:text-foreground border-t border-border cursor-pointer"
                >
                  選択をクリア
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* タグクラウド */}
      {showTagCloud && tagCloudTags.length > 0 && (
        <div className="flex flex-wrap gap-2 p-4 rounded-xl border border-border bg-card/50">
          {tagCloudTags.map((tag) => (
            <button
              key={tag.name}
              onClick={() => onTagToggle(tag.name)}
              className={`px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${getTagCloudSize(tag.count)} ${
                selectedTags.includes(tag.name)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              #{tag.name}
              <span className="ml-1 opacity-60 text-xs">{tag.count}</span>
            </button>
          ))}
        </div>
      )}

      {/* アクティブフィルター表示 */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-sm text-muted-foreground">絞り込み中:</span>

          {selectedCategory && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-primary/20 text-primary">
              {selectedCategory}
              <button
                onClick={() => onCategoryChange(null)}
                className="hover:text-primary/70 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-secondary/50 text-secondary-foreground"
            >
              #{tag}
              <button
                onClick={() => onTagToggle(tag)}
                className="hover:text-secondary-foreground/70 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-muted text-muted-foreground">
              &ldquo;{searchQuery}&rdquo;
              <button
                onClick={() => onSearchChange('')}
                className="hover:text-foreground cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={onClearFilters}
            className="text-sm text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
          >
            すべてクリア
          </button>
        </div>
      )}

      {/* 結果数 */}
      <div className="text-sm text-muted-foreground">
        {totalResults}件の記事
      </div>
    </div>
  );
}
