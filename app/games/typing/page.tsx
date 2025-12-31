'use client';

import { TypingGame } from '@/components/games/TypingGame';
import { Gamepad2, ArrowLeft, Swords } from 'lucide-react';
import Link from 'next/link';
import { OnlineIndicator } from '@/components/OnlineIndicator';

export default function TypingPage() {
  return (
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
          <OnlineIndicator page="typing" />
        </div>

        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-primary mb-4">
            <Gamepad2 size={24} />
            <span className="text-sm font-medium uppercase tracking-wider">ADA Lab Games</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Typing</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            タイピングスキルを磨こう！速さと正確さを競おう。
          </p>

          {/* 対戦モードへのリンク */}
          <Link
            href="/games/typing/battle"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <Swords className="w-5 h-5" />
            オンライン対戦
          </Link>
        </div>

        {/* ゲーム本体 */}
        <div className="flex justify-center">
          <TypingGame />
        </div>

        {/* ゲーム情報 */}
        <div className="max-w-2xl mx-auto mt-12 grid gap-6 md:grid-cols-2">
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-semibold mb-3">遊び方</h2>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• 画面に表示される単語を入力</li>
              <li>• 正確に速く入力するほど高得点</li>
              <li>• WPM（1分あたりの単語数）で計測</li>
              <li>• 日本語・英語モードから選択可能</li>
            </ul>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-semibold mb-3">ヒント</h2>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• ホームポジションを意識する</li>
              <li>• 速さより正確さを優先</li>
              <li>• 毎日練習で上達</li>
              <li>• 対戦モードで友達と競おう</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
