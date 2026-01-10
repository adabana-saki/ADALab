'use client';

import { MinesweeperGame } from '@/components/games/MinesweeperGame';
import { GameStructuredData } from '@/components/games/GameStructuredData';

export default function MinesweeperPage() {
  return (
    <>
      <GameStructuredData
        name="マインスイーパー"
        description="クラシックなマインスイーパーゲーム。地雷を避けてすべてのセルを開けよう！初級・中級・上級の3つの難易度でプレイ可能。オンライン対戦モードも搭載。"
        url="https://adalabtech.com/games/minesweeper"
        image="https://adalabtech.com/images/games/minesweeper.png"
      />
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">💣 マインスイーパー</h1>
            <p className="text-muted-foreground">
              地雷を避けてすべてのセルを開けよう！
            </p>
          </div>
          <MinesweeperGame />
        </div>
      </main>
    </>
  );
}
