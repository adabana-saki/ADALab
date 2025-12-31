'use client';

import { SnakeGame } from '@/components/games/SnakeGame';
import { Gamepad2, ArrowLeft, Swords } from 'lucide-react';
import Link from 'next/link';
import { OnlineIndicator } from '@/components/OnlineIndicator';

export default function SnakePage() {
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
          <OnlineIndicator page="snake" />
        </div>

        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-primary mb-4">
            <Gamepad2 size={24} />
            <span className="text-sm font-medium uppercase tracking-wider">ADA Lab Games</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Snake</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            クラシックなスネークゲーム。エサを食べて長くなろう！
          </p>

          {/* 対戦モードへのリンク */}
          <Link
            href="/games/snake/battle"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <Swords className="w-5 h-5" />
            オンライン対戦
          </Link>
        </div>

        {/* ゲーム本体 */}
        <div className="flex justify-center">
          <SnakeGame />
        </div>

        {/* ゲーム情報 */}
        <div className="max-w-2xl mx-auto mt-12 grid gap-6 md:grid-cols-2">
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-semibold mb-3">遊び方</h2>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• 矢印キーまたはスワイプでスネークを操作</li>
              <li>• 食べ物を食べるとスネークが長くなる</li>
              <li>• 壁や自分の体にぶつかるとゲームオーバー</li>
              <li>• できるだけ長く生き残ろう</li>
            </ul>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-semibold mb-3">ヒント</h2>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• 画面の端に追い詰められないように注意</li>
              <li>• 長くなるとスピードが上がる</li>
              <li>• 効率的な動きでハイスコアを目指そう</li>
              <li>• 対戦モードで友達と競おう</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
