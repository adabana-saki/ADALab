'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight, BookOpen, CheckCircle2 } from 'lucide-react';
import type { Series, BlogMeta } from '@/lib/blog';

interface SeriesNavigationProps {
  series: Series;
  currentIndex: number;
  prev?: BlogMeta;
  next?: BlogMeta;
}

export function SeriesNavigation({ series, currentIndex, prev, next }: SeriesNavigationProps) {
  const totalPosts = series.posts.length;
  const progress = ((currentIndex + 1) / totalPosts) * 100;

  return (
    <div className="bg-gradient-to-br from-primary/5 via-card to-card border border-primary/20 rounded-xl overflow-hidden mb-8">
      {/* シリーズヘッダー */}
      <div className="p-5 border-b border-border/50">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BookOpen size={20} className="text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-primary font-medium">シリーズ</span>
              {series.level && (
                <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted/50 rounded">
                  {series.level}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-sm">{series.title}</h3>
            {series.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {series.description}
              </p>
            )}
          </div>
        </div>

        {/* 進捗バー */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>進捗</span>
            <span>{currentIndex + 1} / {totalPosts}</span>
          </div>
          <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* 前後のナビゲーション */}
      <div className="grid grid-cols-2 divide-x divide-border/50">
        {prev ? (
          <Link
            href={`/blog/${prev.slug}`}
            className="group p-4 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <ChevronLeft size={14} />
              前の記事
            </div>
            <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
              {prev.title}
            </p>
          </Link>
        ) : (
          <div className="p-4 opacity-50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <CheckCircle2 size={14} />
              シリーズ開始
            </div>
            <p className="text-sm text-muted-foreground">最初の記事です</p>
          </div>
        )}

        {next ? (
          <Link
            href={`/blog/${next.slug}`}
            className="group p-4 hover:bg-muted/30 transition-colors text-right"
          >
            <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground mb-1">
              次の記事
              <ChevronRight size={14} />
            </div>
            <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
              {next.title}
            </p>
          </Link>
        ) : (
          <div className="p-4 opacity-50 text-right">
            <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground mb-1">
              シリーズ完了
              <CheckCircle2 size={14} />
            </div>
            <p className="text-sm text-muted-foreground">最後の記事です</p>
          </div>
        )}
      </div>
    </div>
  );
}
