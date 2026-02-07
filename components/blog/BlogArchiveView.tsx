'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BlogMeta } from '@/lib/blog';
import { BlogCard } from './BlogCard';

interface BlogArchiveViewProps {
  postsByMonth: Map<string, BlogMeta[]>;
  engagement: Record<string, { views: number; likes: number }>;
}

export function BlogArchiveView({ postsByMonth, engagement }: BlogArchiveViewProps) {
  const monthKeys = useMemo(() => Array.from(postsByMonth.keys()), [postsByMonth]);

  // 直近3ヶ月はデフォルト展開
  const defaultExpanded = useMemo(() => {
    const set = new Set<string>();
    monthKeys.slice(0, 3).forEach((key) => set.add(key));
    return set;
  }, [monthKeys]);

  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(defaultExpanded);

  const toggleMonth = (key: string) => {
    setExpandedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const formatMonthLabel = (key: string) => {
    const [year, month] = key.split('-');
    return `${year}年${Number.parseInt(month, 10)}月`;
  };

  if (monthKeys.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        アーカイブに表示する記事がありません
      </div>
    );
  }

  return (
    <div className="relative pl-6 md:pl-8">
      {/* タイムラインの縦線 */}
      <div className="absolute left-2 md:left-3 top-0 bottom-0 w-px bg-border" />

      <div className="space-y-6">
        {monthKeys.map((key) => {
          const posts = postsByMonth.get(key) || [];
          const isExpanded = expandedMonths.has(key);

          return (
            <div key={key} className="relative">
              {/* タイムラインドット */}
              <div className="absolute -left-6 md:-left-8 top-3 w-3 h-3 md:w-4 md:h-4 rounded-full bg-primary border-2 border-background shadow-sm shadow-primary/30" />

              {/* 月ヘッダー */}
              <button
                onClick={() => toggleMonth(key)}
                className="flex items-center gap-2 mb-3 group cursor-pointer"
              >
                <span className="text-lg font-bold group-hover:text-primary transition-colors">
                  {formatMonthLabel(key)}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({posts.length}件)
                </span>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </button>

              {/* 記事リスト */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-3 pb-2">
                      {posts.map((post) => (
                        <BlogCard
                          key={post.slug}
                          post={post}
                          engagement={engagement[post.slug]}
                          variant="compact"
                          showThumbnail={true}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
