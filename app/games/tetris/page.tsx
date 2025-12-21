import { Metadata } from 'next';
import { TetrisGame } from '@/components/games/TetrisGame';
import { Gamepad2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const baseUrl = 'https://adalabtech.com';

export const metadata: Metadata = {
  title: 'Tetris',
  description:
    'ブラウザで遊べるクラシックテトリス。キーボードまたはタッチ操作で楽しめます。T-Spin、Back-to-Backボーナス、ランキング機能搭載。',
  keywords: ['テトリス', 'Tetris', 'ブラウザゲーム', '無料', 'パズルゲーム', 'ADA Lab'],
  alternates: {
    canonical: `${baseUrl}/games/tetris`,
  },
  openGraph: {
    title: 'Tetris | ADA Lab Games',
    description: 'ブラウザで遊べるクラシックテトリス。T-Spin、Back-to-Backボーナス搭載。',
    url: `${baseUrl}/games/tetris`,
    images: ['/images/games/tetris-thumbnail.png'],
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tetris | ADA Lab Games',
    description: 'ブラウザで遊べるクラシックテトリス',
    images: ['/images/games/tetris-thumbnail.png'],
  },
};

export default function TetrisPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-4">
        {/* ナビゲーション */}
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          ゲーム一覧に戻る
        </Link>

        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-primary mb-4">
            <Gamepad2 size={24} />
            <span className="text-sm font-medium uppercase tracking-wider">ADA Lab Games</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Tetris</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            クラシックなテトリスをブラウザで。ブロックを回転させてラインを消そう！
          </p>
        </div>

        {/* ゲーム本体 */}
        <div className="flex justify-center">
          <TetrisGame />
        </div>

        {/* ゲーム情報 */}
        <div className="max-w-2xl mx-auto mt-12 grid gap-6 md:grid-cols-2">
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-semibold mb-3">遊び方</h2>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• ブロックを左右に動かして配置</li>
              <li>• 横一列を揃えるとラインが消える</li>
              <li>• 一度に多くのラインを消すと高得点</li>
              <li>• ブロックが画面上部に達するとゲームオーバー</li>
            </ul>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-semibold mb-3">スコアリング</h2>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• 1ライン: 100点</li>
              <li>• 2ライン: 300点</li>
              <li>• 3ライン: 500点</li>
              <li>• 4ライン (テトリス): 800点</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
