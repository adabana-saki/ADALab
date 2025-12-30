'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Award, Play, ArrowRight } from 'lucide-react';

interface GameStatsCardProps {
  game: string;
  title: string;
  icon: ReactNode;
  stats?: unknown;
  achievementCount: number;
}

export function GameStatsCard({
  game,
  title,
  icon,
  stats,
  achievementCount,
}: GameStatsCardProps) {
  const gameStats = stats as Record<string, unknown> | undefined;

  // ゲーム別の統計表示
  const renderStats = () => {
    if (!gameStats) {
      return (
        <p className="text-sm text-muted-foreground">まだプレイしていません</p>
      );
    }

    switch (game) {
      case 'tetris':
        return (
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ハイスコア</span>
              <span className="font-medium">
                {(Number(gameStats.highScore) || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">総ライン数</span>
              <span className="font-medium">
                {(Number(gameStats.totalLines) || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">プレイ回数</span>
              <span className="font-medium">{Number(gameStats.totalGames) || 0}</span>
            </div>
          </div>
        );
      case '2048':
        return (
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ベストスコア</span>
              <span className="font-medium">
                {(Number(gameStats.highScore) || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">最大タイル</span>
              <span className="font-medium">{Number(gameStats.maxTile) || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">プレイ回数</span>
              <span className="font-medium">{Number(gameStats.totalGames) || 0}</span>
            </div>
          </div>
        );
      case 'snake':
        return (
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ハイスコア</span>
              <span className="font-medium">
                {(Number(gameStats.highScore) || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">最長スネーク</span>
              <span className="font-medium">{Number(gameStats.maxLength) || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">プレイ回数</span>
              <span className="font-medium">{Number(gameStats.totalGames) || 0}</span>
            </div>
          </div>
        );
      case 'typing':
        return (
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">最高WPM</span>
              <span className="font-medium">{Number(gameStats.highWpm) || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">最高正確率</span>
              <span className="font-medium">
                {Number(gameStats.highAccuracy) || 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">プレイ回数</span>
              <span className="font-medium">{Number(gameStats.totalGames) || 0}</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors"
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">{icon}</div>
          <h3 className="font-bold">{title}</h3>
        </div>
        <div className="flex items-center gap-1 text-yellow-500">
          <Award size={16} />
          <span className="text-sm font-medium">{achievementCount}</span>
        </div>
      </div>

      {/* 統計 */}
      <div className="mb-4">{renderStats()}</div>

      {/* プレイボタン */}
      <Link
        href={`/games/${game}`}
        className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-medium"
      >
        <Play size={14} />
        プレイする
        <ArrowRight size={14} />
      </Link>
    </motion.div>
  );
}
