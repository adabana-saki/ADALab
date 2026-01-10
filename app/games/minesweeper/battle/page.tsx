'use client';

import { MinesweeperBattleLobby } from '@/components/games/MinesweeperBattleLobby';

export default function MinesweeperBattlePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <MinesweeperBattleLobby />
    </div>
  );
}
