import { Metadata } from 'next';
import { OthelloGame } from '@/components/games/OthelloGame';
import { GameStructuredData } from '@/components/games/GameStructuredData';
import { SITE_CONFIG } from '@/lib/constants';
import { Gamepad2, ArrowLeft, Swords } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'リバーシ',
  description:
    'AIと対戦できるリバーシ（オセロ）ゲーム。かんたん・ふつう・むずかしいの3つの難易度でプレイ可能。',
  keywords: ['リバーシ', 'オセロ', 'Reversi', 'Othello', 'ブラウザゲーム', '無料', 'AI対戦', 'ADA Lab'],
  alternates: {
    canonical: `${SITE_CONFIG.url}/games/othello`,
  },
  openGraph: {
    title: 'リバーシ | ADA Lab Games',
    description: 'AIと対戦できるリバーシゲーム。3つの難易度で遊べます！',
    url: `${SITE_CONFIG.url}/games/othello`,
    images: ['/images/games/othello-thumbnail.png'],
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'リバーシ | ADA Lab Games',
    description: 'AIと対戦できるリバーシゲーム',
    images: ['/images/games/othello-thumbnail.png'],
  },
};

export default function OthelloPage() {
  return (
    <>
      <GameStructuredData
        name="リバーシ"
        description="AIと対戦できるリバーシ（オセロ）ゲーム。かんたん・ふつう・むずかしいの3つの難易度でプレイ可能。"
        url={`${SITE_CONFIG.url}/games/othello`}
        image={`${SITE_CONFIG.url}/images/games/othello-thumbnail.png`}
        genre={['Board', 'Strategy']}
        playMode="SinglePlayer"
        applicationCategory="Game"
      />
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-3 sm:px-4 py-4">
          {/* ナビゲーション */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
            <Link
              href="/games"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={16} />
              ゲーム一覧に戻る
            </Link>
            <Link
              href="/games/othello/battle"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <Swords size={16} />
              オンライン対戦
            </Link>
          </div>

          {/* ヘッダー */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 text-primary mb-4">
              <Gamepad2 size={24} />
              <span className="text-sm font-medium uppercase tracking-wider">ADA Lab Games</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold mb-4">リバーシ</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              AIと対戦！相手より多くの駒を自分の色にしよう！
            </p>
          </div>

          {/* ゲーム本体 */}
          <div className="flex justify-center">
            <OthelloGame />
          </div>

          {/* ゲーム情報 */}
          <div className="max-w-2xl mx-auto mt-12 grid gap-6 md:grid-cols-2">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-semibold mb-3">遊び方</h2>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• あなたは黒（●）、AIは白（○）です</li>
                <li>• 有効な場所をクリック/タップして駒を置く</li>
                <li>• 相手の駒を挟むと自分の色に裏返せる</li>
                <li>• 最終的に駒が多い方が勝ち</li>
              </ul>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-semibold mb-3">ヒント</h2>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• 角を取ると圧倒的に有利</li>
                <li>• 角の隣は相手に角を与えやすいので注意</li>
                <li>• 序盤は少なく取り、終盤で逆転を狙おう</li>
                <li>• 難易度「むずかしい」はAIが先読みします</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
