import { Metadata } from 'next';
import { Game2048 } from '@/components/games/Game2048';
import { GameStructuredData } from '@/components/games/GameStructuredData';
import { SITE_CONFIG } from '@/lib/constants';
import { Gamepad2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '2048',
  description:
    'ブラウザで遊べる2048パズルゲーム。数字タイルをスライドして合体させ、2048を目指そう！アンドゥ機能付き。',
  keywords: ['2048', 'パズル', 'ブラウザゲーム', '無料', '数字パズル', 'ADA Lab'],
  alternates: {
    canonical: `${SITE_CONFIG.url}/games/2048`,
  },
  openGraph: {
    title: '2048 | ADA Lab Games',
    description: 'ブラウザで遊べる2048パズルゲーム。タイルを合体させて2048を目指そう！',
    url: `${SITE_CONFIG.url}/games/2048`,
    images: ['/images/games/2048-thumbnail.png'],
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: '2048 | ADA Lab Games',
    description: 'ブラウザで遊べる2048パズルゲーム',
    images: ['/images/games/2048-thumbnail.png'],
  },
};

export default function Game2048Page() {
  return (
    <>
      <GameStructuredData
        name="2048"
        description="ブラウザで遊べる2048パズルゲーム。数字タイルをスライドして合体させ、2048を目指そう！アンドゥ機能付き。"
        url={`${SITE_CONFIG.url}/games/2048`}
        image={`${SITE_CONFIG.url}/images/games/2048-thumbnail.png`}
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
          </div>

          {/* ヘッダー */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 text-primary mb-4">
              <Gamepad2 size={24} />
              <span className="text-sm font-medium uppercase tracking-wider">ADA Lab Games</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">2048</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              数字タイルをスライドして合体させ、2048タイルを作ろう！
            </p>
          </div>

          {/* ゲーム本体 */}
          <div className="flex justify-center">
            <Game2048 />
          </div>

          {/* ゲーム情報 */}
          <div className="max-w-2xl mx-auto mt-12 grid gap-6 md:grid-cols-2">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-semibold mb-3">遊び方</h2>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• 矢印キーまたはスワイプでタイルをスライド</li>
                <li>• 同じ数字のタイルがぶつかると合体</li>
                <li>• 2048タイルを作ると勝利</li>
                <li>• 動かせなくなったらゲームオーバー</li>
              </ul>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-semibold mb-3">ヒント</h2>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• 大きいタイルは隅に集める</li>
                <li>• 一方向に寄せ続けると効率的</li>
                <li>• アンドゥは3回まで使用可能</li>
                <li>• 2048達成後も続けてプレイ可能</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
