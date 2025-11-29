'use client';

import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LikeButtonProps {
  likes: number;
  hasLiked: boolean;
  onToggle: () => void;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function LikeButton({
  likes,
  hasLiked,
  onToggle,
  isLoading = false,
  size = 'md',
}: LikeButtonProps) {
  const sizeClasses = {
    sm: 'p-2 text-xs gap-1',
    md: 'p-2.5 text-sm gap-1.5',
    lg: 'p-3 text-base gap-2',
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
  };

  return (
    <button
      onClick={onToggle}
      disabled={isLoading}
      className={cn(
        'flex items-center rounded-full border transition-all duration-300',
        sizeClasses[size],
        hasLiked
          ? 'bg-pink-500/10 border-pink-500/50 text-pink-500 hover:bg-pink-500/20'
          : 'bg-muted/50 border-border/50 text-muted-foreground hover:text-pink-500 hover:border-pink-500/50 hover:bg-pink-500/10',
        isLoading && 'opacity-50 cursor-not-allowed'
      )}
      aria-label={hasLiked ? 'いいねを取り消す' : 'いいね'}
    >
      <Heart
        size={iconSizes[size]}
        className={cn(
          'transition-all duration-300',
          hasLiked && 'fill-current scale-110'
        )}
      />
      <span className="font-medium min-w-[1.5em] text-center">{likes}</span>
    </button>
  );
}
