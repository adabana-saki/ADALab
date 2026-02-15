'use client';

import { Game2048BattleLobby } from '@/components/games/Game2048BattleLobby';

export default function Game2048BattlePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Game2048BattleLobby />
    </div>
  );
}
