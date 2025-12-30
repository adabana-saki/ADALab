'use client';

import { SnakeGame } from '@/components/games/SnakeGame';

export default function SnakePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto py-8">
        <SnakeGame />
      </div>
    </div>
  );
}
