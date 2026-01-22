import { Metadata } from 'next';
import { MinesweeperGame } from '@/components/games/MinesweeperGame';
import { GameStructuredData } from '@/components/games/GameStructuredData';
import { SITE_CONFIG } from '@/lib/constants';
import { Gamepad2, ArrowLeft, Swords } from 'lucide-react';
import Link from 'next/link';
import { OnlineIndicator } from '@/components/OnlineIndicator';

export const metadata: Metadata = {
  title: 'マインスイーパー',
  description:
    'クラシックなマインスイーパーゲーム。地雷を避けてすべてのセルを開けよう！初級・中級・上級の3つの難易度でプレイ可能。',
  keywords: ['マインスイーパー', 'Minesweeper', 'ブラウザゲーム', '無料', 'パズル', 'ADA Lab'],
  alternates: {
    canonical: `${SITE_CONFIG.url}/games/minesweeper`,
  },
  openGraph: {
    title: 'マインスイーパー | ADA Lab Games',
    description: 'クラシックなマインスイーパーゲーム。地雷を避けてすべてのセルを開けよう！',
    url: `${SITE_CONFIG.url}/games/minesweeper`,
    images: ['/images/games/minesweeper.png'],
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'マインスイーパー | ADA Lab Games',
    description: 'クラシックなマインスイーパーゲーム',
    images: ['/images/games/minesweeper.png'],
  },
};

export default function MinesweeperPage() {
  return (
    <>
      <GameStructuredData
        name="マインスイーパー"
        description="クラシックなマインスイーパーゲーム。地雷を避けてすべてのセルを開けよう！初級・中級・上級の3つの難易度でプレイ可能。オンライン対戦モードも搭載。"
        url={`${SITE_CONFIG.url}/games/minesweeper`}
        image={`${SITE_CONFIG.url}/images/games/minesweeper.png`}
        genre={['Puzzle']}
        playMode="SinglePlayer"
        applicationCategory="Game"
      />
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-4">
          {/* ナビゲーション */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
            <Link
              href="/games"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={16} />
              ゲーム一覧に戻る
            </Link>
            <OnlineIndicator page="minesweeper" />
          </div>

          {/* ヘッダー */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 text-primary mb-4">
              <Gamepad2 size={24} />
              <span className="text-sm font-medium uppercase tracking-wider">ADA Lab Games</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">マインスイーパー</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              地雷を避けてすべてのセルを開けよう！
            </p>

            {/* 対戦モードへのリンク */}
            <Link
              href="/games/minesweeper/battle"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <Swords className="w-5 h-5" />
              オンライン対戦
            </Link>
          </div>

          {/* ゲーム本体 */}
          <div className="flex justify-center">
            <MinesweeperGame />
          </div>

          {/* ゲーム情報 */}
          <div className="max-w-2xl mx-auto mt-12 grid gap-6 md:grid-cols-2">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-semibold mb-3">遊び方</h2>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• 左クリックでセルを開く</li>
                <li>• 右クリックで旗を立てる（地雷マーク）</li>
                <li>• 数字は周囲の地雷の数を示す</li>
                <li>• すべての安全なセルを開けば勝利</li>
              </ul>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-semibold mb-3">ヒント</h2>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• 最初のクリックは地雷に当たらない</li>
                <li>• 数字と旗を照らし合わせて推理</li>
                <li>• 難易度を上げると地雷が増える</li>
                <li>• 対戦モードで友達と競おう</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
