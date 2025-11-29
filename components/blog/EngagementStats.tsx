'use client';

import { Eye, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EngagementStatsProps {
  views: number;
  likes: number;
  className?: string;
  size?: 'sm' | 'md';
}

export function EngagementStats({
  views,
  likes,
  className,
  size = 'sm',
}: EngagementStatsProps) {
  const iconSize = size === 'sm' ? 12 : 14;
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <div className={cn('flex items-center gap-3', textSize, className)}>
      <span className="flex items-center gap-1 text-muted-foreground">
        <Eye size={iconSize} />
        {views.toLocaleString()}
      </span>
      <span className="flex items-center gap-1 text-muted-foreground">
        <Heart size={iconSize} />
        {likes.toLocaleString()}
      </span>
    </div>
  );
}
