'use client';

import { SnakeBattleLobby } from '@/components/games/SnakeBattleLobby';

export default function SnakeBattlePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <SnakeBattleLobby />
    </div>
  );
}
