'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, Eye, Heart, ArrowRight, BookOpen, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import type { BlogMeta } from '@/lib/blog';
import { SpotlightCard } from '@/components/effects/SpotlightCard';

interface BlogCardProps {
  post: BlogMeta;
  engagement?: { views: number; likes: number };
  variant?: 'default' | 'featured' | 'compact';
  showThumbnail?: boolean;
}

// カテゴリーごとの色定義
const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  tech: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' },
  development: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20' },
  design: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20' },
  business: { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/20' },
  ai: { bg: 'bg-pink-500/10', text: 'text-pink-500', border: 'border-pink-500/20' },
  tutorial: { bg: 'bg-cyan-500/10', text: 'text-cyan-500', border: 'border-cyan-500/20' },
  news: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' },
  default: { bg: 'bg-gray-500/10', text: 'text-gray-500', border: 'border-gray-500/20' },
};

// 日付フォーマット
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// 相対日付
function getRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '今日';
  if (diffDays === 1) return '昨日';
  if (diffDays < 7) return `${diffDays}日前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}ヶ月前`;
  return `${Math.floor(diffDays / 365)}年前`;
}

// 新着バッジ判定（7日以内）
function isNew(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 7;
}

// リーディングタイムから分数を抽出
function parseReadingMinutes(readingTime?: string): number {
  if (!readingTime) return 0;
  const match = readingTime.match(/(\d+)/);
  return match ? Number.parseInt(match[1], 10) : 0;
}

// リーディングタイムに応じたバーの色
function getReadingTimeBarColor(minutes: number): string {
  if (minutes <= 5) return 'bg-green-500';
  if (minutes <= 10) return 'bg-yellow-500';
  return 'bg-purple-500';
}

export function BlogCard({
  post,
  engagement,
  variant = 'default',
  showThumbnail = true,
}: BlogCardProps) {
  const categoryColor = categoryColors[post.category?.toLowerCase() || 'default'] || categoryColors.default;
  const isNewPost = isNew(post.date);

  // フィーチャード（横長）バリアント
  if (variant === 'featured') {
    return (
      <SpotlightCard className="rounded-2xl" spotlightColor="rgba(0, 245, 255, 0.15)">
        <Link href={`/blog/${post.slug}`} className="group block">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-lg transition-all duration-300 hover:shadow-xl hover:border-primary/30 dark:hover:shadow-primary/5"
          >
            <div className="flex flex-col lg:flex-row">
              {/* サムネイル */}
              {showThumbnail && (
                <div className="relative lg:w-2/5 aspect-video lg:aspect-auto overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
                  {post.image ? (
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-muted-foreground/30" />
                    </div>
                  )}
                  {/* オーバーレイ */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:bg-gradient-to-r" />
                </div>
              )}

              {/* コンテンツ */}
              <div className="flex-1 p-6 lg:p-8 flex flex-col">
                {/* バッジ */}
                <div className="flex items-center gap-2 mb-3">
                  {isNewPost && (
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-primary text-primary-foreground animate-pulse">
                      NEW
                    </span>
                  )}
                  {post.category && (
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${categoryColor.bg} ${categoryColor.text} border ${categoryColor.border}`}>
                      {post.category}
                    </span>
                  )}
                  {post.series && (
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-secondary/50 text-secondary-foreground">
                      📚 {post.series}
                    </span>
                  )}
                </div>

                {/* タイトル */}
                <h2 className="text-2xl lg:text-3xl font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h2>

                {/* 説明 */}
                <p className="text-muted-foreground mb-4 line-clamp-3 flex-grow">
                  {post.description}
                </p>

                {/* タグ */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-muted text-muted-foreground"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                    {post.tags.length > 4 && (
                      <span className="text-xs text-muted-foreground">
                        +{post.tags.length - 4}
                      </span>
                    )}
                  </div>
                )}

                {/* フッター */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(post.date)}
                    </span>
                    {post.readingTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {post.readingTime}
                      </span>
                    )}
                    {engagement && (
                      <>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {engagement.views.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {engagement.likes.toLocaleString()}
                        </span>
                      </>
                    )}
                  </div>
                  <span className="flex items-center gap-1 text-primary font-medium group-hover:gap-2 transition-all">
                    続きを読む
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          </motion.article>
        </Link>
      </SpotlightCard>
    );
  }

  // コンパクトバリアント（リスト表示用）
  if (variant === 'compact') {
    return (
      <Link href={`/blog/${post.slug}`} className="group block">
        <article className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card transition-all duration-200 hover:border-primary/30 hover:shadow-md">
          {/* サムネイル */}
          {showThumbnail && (
            <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
              {post.image ? (
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-muted-foreground/30" />
                </div>
              )}
            </div>
          )}

          {/* コンテンツ */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {post.category && (
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${categoryColor.bg} ${categoryColor.text}`}>
                  {post.category}
                </span>
              )}
              {isNewPost && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-primary text-primary-foreground">
                  NEW
                </span>
              )}
            </div>
            <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
              {post.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {post.description}
            </p>
          </div>

          {/* メタ情報 */}
          <div className="hidden sm:flex flex-col items-end gap-1 text-sm text-muted-foreground">
            <span>{getRelativeDate(post.date)}</span>
            {engagement && (
              <span className="flex items-center gap-2">
                <Eye className="w-3 h-3" />
                {engagement.views.toLocaleString()}
              </span>
            )}
          </div>

          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </article>
      </Link>
    );
  }

  // デフォルト（カード）バリアント
  const readingMinutes = parseReadingMinutes(post.readingTime);
  const barColor = getReadingTimeBarColor(readingMinutes);
  const barWidth = readingMinutes > 0 ? Math.min((readingMinutes / 15) * 100, 100) : 0;

  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.4 }}
        className="relative h-full overflow-hidden rounded-2xl border border-border bg-card shadow-md transition-all duration-300 hover:shadow-xl hover:border-primary/30 dark:hover:shadow-primary/5 flex flex-col"
      >
        {/* サムネイル */}
        {showThumbnail && (
          <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
            {post.image ? (
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-muted-foreground/30" />
              </div>
            )}
            {/* オーバーレイ */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* バッジ（サムネイル上） */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              {isNewPost && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-primary text-primary-foreground shadow-md animate-pulse">
                  NEW
                </span>
              )}
              {post.category && (
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${categoryColor.bg} ${categoryColor.text} border ${categoryColor.border} backdrop-blur-sm`}>
                  {post.category}
                </span>
              )}
            </div>
          </div>
        )}

        {/* コンテンツ */}
        <div className="flex-1 p-5 flex flex-col">
          {/* シリーズ */}
          {post.series && (
            <div className="mb-2">
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-secondary/50 text-secondary-foreground">
                📚 {post.series}
              </span>
            </div>
          )}

          {/* タイトル */}
          <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>

          {/* 説明 */}
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow">
            {post.description}
          </p>

          {/* タグ */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs rounded-md bg-muted text-muted-foreground"
                >
                  #{tag}
                </span>
              ))}
              {post.tags.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{post.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* フッター */}
          <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {getRelativeDate(post.date)}
              </span>
              {post.readingTime && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {post.readingTime}
                </span>
              )}
            </div>
            {engagement && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {engagement.views.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5" />
                  {engagement.likes}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* リーディングタイム視覚バー */}
        {barWidth > 0 && (
          <div className="h-1 w-full bg-muted/30">
            <div
              className={`h-full ${barColor} opacity-60`}
              style={{ width: `${barWidth}%` }}
            />
          </div>
        )}
      </motion.article>
    </Link>
  );
}
