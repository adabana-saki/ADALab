'use client';

import { Calendar, Clock } from 'lucide-react';
import type { ScheduledPost } from '@/lib/blog';

interface UpcomingPostsProps {
  posts: ScheduledPost[];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const weekday = weekdays[date.getDay()];
  return `${month}/${day}（${weekday}）`;
}

function getDaysUntil(dateString: string): number {
  const publishDate = new Date(dateString);
  publishDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = publishDate.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function UpcomingPosts({ posts }: UpcomingPostsProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-cyan-500/20 bg-gray-900/50 p-6 backdrop-blur-sm">
      <div className="mb-4 flex items-center gap-2">
        <Calendar className="h-5 w-5 text-cyan-400" />
        <h3 className="text-lg font-bold text-white">公開予定</h3>
      </div>

      <div className="space-y-3">
        {posts.map((post) => {
          const daysUntil = getDaysUntil(post.publishDate);

          return (
            <div
              key={post.slug}
              className="group rounded-lg border border-gray-700/50 bg-gray-800/30 p-4 transition-colors hover:border-cyan-500/30 hover:bg-gray-800/50"
            >
              <div className="mb-2 flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-cyan-400" />
                <span className="text-cyan-400">{formatDate(post.publishDate)}</span>
                <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-xs text-cyan-300">
                  {daysUntil === 1 ? '明日' : `${daysUntil}日後`}
                </span>
              </div>
              <h4 className="line-clamp-2 text-sm font-medium text-gray-200 transition-colors group-hover:text-white">
                {post.title}
              </h4>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-center text-xs text-gray-500">
        毎朝 9:00 に自動公開されます
      </p>
    </div>
  );
}
