import type { Metadata } from 'next';
import { TetrisBattleLobby } from '@/components/games/TetrisBattleLobby';

export const metadata: Metadata = {
  title: 'Tetris Battle - ADA Lab',
  description: 'Tetrisオンライン対戦モード。友達と対戦しよう！',
  openGraph: {
    title: 'Tetris Battle - ADA Lab',
    description: 'Tetrisオンライン対戦モード。友達と対戦しよう！',
    type: 'website',
  },
};

export default function TetrisBattlePage() {
  return (
    <main className="min-h-screen bg-background">
      <TetrisBattleLobby />
    </main>
  );
}
