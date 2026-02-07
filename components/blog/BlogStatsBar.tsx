'use client';

import { FileText, FolderOpen, Tag, Eye } from 'lucide-react';
import { CounterAnimation } from '@/components/effects/CounterAnimation';

interface BlogStatsBarProps {
  totalPosts: number;
  totalCategories: number;
  totalTags: number;
  totalViews: number;
}

export function BlogStatsBar({ totalPosts, totalCategories, totalTags, totalViews }: BlogStatsBarProps) {
  const stats = [
    { icon: FileText, label: '記事', value: totalPosts },
    { icon: FolderOpen, label: 'カテゴリ', value: totalCategories },
    { icon: Tag, label: 'タグ', value: totalTags },
    { icon: Eye, label: '総閲覧数', value: totalViews },
  ];

  return (
    <div className="glass rounded-2xl border border-border/50 p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex items-center gap-3 px-3 py-2">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-xl font-bold">
                  <CounterAnimation end={stat.value} duration={1.5} />
                </div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
