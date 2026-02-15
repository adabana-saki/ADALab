'use client';

import Link from 'next/link';
import { TrendingUp, Eye } from 'lucide-react';
import type { BlogMeta } from '@/lib/blog';

// カテゴリーごとの色定義
const categoryColors: Record<string, string> = {
  tech: 'bg-blue-500/10 text-blue-500',
  development: 'bg-green-500/10 text-green-500',
  design: 'bg-purple-500/10 text-purple-500',
  business: 'bg-orange-500/10 text-orange-500',
  ai: 'bg-pink-500/10 text-pink-500',
  tutorial: 'bg-cyan-500/10 text-cyan-500',
  news: 'bg-red-500/10 text-red-500',
  default: 'bg-gray-500/10 text-gray-500',
};

interface BlogTrendingStripProps {
  posts: BlogMeta[];
  engagement: Record<string, { views: number; likes: number }>;
}

export function BlogTrendingStrip({ posts, engagement }: BlogTrendingStripProps) {
  if (posts.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          トレンド
        </h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {posts.map((post, index) => {
          const catColor = categoryColors[post.category?.toLowerCase() || 'default'] || categoryColors.default;
          const views = engagement[post.slug]?.views || 0;
          return (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="flex-shrink-0 snap-start group flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all duration-200 min-w-[280px] max-w-[340px]"
            >
              <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  {post.category && (
                    <span className={`px-2 py-0.5 text-xs rounded-full ${catColor}`}>
                      {post.category}
                    </span>
                  )}
                  {views > 0 && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Eye className="w-3 h-3" />
                      {views.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
