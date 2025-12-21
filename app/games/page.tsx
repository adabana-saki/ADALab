import Link from 'next/link';
import Image from 'next/image';
import { Gamepad2, Play } from 'lucide-react';

const games = [
  {
    id: 'tetris',
    title: 'Tetris',
    description: 'クラシックなテトリス。ブロックを回転させてラインを消そう！',
    thumbnail: '/images/games/tetris-thumbnail.png',
  },
];

export default function GamesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-primary mb-4">
            <Gamepad2 size={24} />
            <span className="text-sm font-medium uppercase tracking-wider">ADA Lab</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Games</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            ブラウザで遊べるミニゲームコレクション。息抜きにどうぞ！
          </p>
        </div>

        {/* ゲーム一覧 */}
        <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <Link
              key={game.id}
              href={`/games/${game.id}`}
              className="group relative bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
            >
              {/* サムネイル */}
              <div className="h-40 relative overflow-hidden">
                <Image
                  src={game.thumbnail}
                  alt={game.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* コンテンツ */}
              <div className="p-5">
                <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {game.title}
                </h2>
                <p className="text-sm text-muted-foreground mb-4">{game.description}</p>
                <div className="flex items-center gap-2 text-primary text-sm font-medium">
                  <Play size={16} />
                  プレイする
                </div>
              </div>
            </Link>
          ))}

          {/* Coming Soon カード */}
          <div className="relative bg-card/50 border border-dashed border-border rounded-xl overflow-hidden opacity-60">
            <div className="h-40 bg-muted/30 flex items-center justify-center">
              <Gamepad2 size={48} className="text-muted-foreground/30" />
            </div>
            <div className="p-5">
              <h2 className="text-xl font-semibold mb-2 text-muted-foreground">Coming Soon</h2>
              <p className="text-sm text-muted-foreground/70">新しいゲームを準備中...</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
