'use client';

import { useEffect, useState } from 'react';

interface TetrisGarbageMeterProps {
  pendingGarbage: number;
  maxDisplay?: number;
  height?: number;
}

export function TetrisGarbageMeter({
  pendingGarbage,
  maxDisplay = 20,
  height = 400,
}: TetrisGarbageMeterProps) {
  const [animatedValue, setAnimatedValue] = useState(pendingGarbage);

  // スムーズなアニメーション
  useEffect(() => {
    const diff = pendingGarbage - animatedValue;
    if (diff === 0) return;

    const step = diff > 0 ? 1 : -1;
    const timeout = setTimeout(() => {
      setAnimatedValue((prev) => prev + step);
    }, 30);

    return () => clearTimeout(timeout);
  }, [pendingGarbage, animatedValue]);

  const displayValue = Math.min(animatedValue, maxDisplay);
  const fillPercent = (displayValue / maxDisplay) * 100;

  // 危険度に応じた色
  const getColor = () => {
    if (displayValue >= 12) return 'bg-red-500';
    if (displayValue >= 8) return 'bg-orange-500';
    if (displayValue >= 4) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  return (
    <div className="flex flex-col items-center gap-1">
      {/* ラベル */}
      <div className="text-xs text-muted-foreground">おじゃま</div>

      {/* メーター本体 */}
      <div
        className="relative w-4 bg-card border border-border rounded overflow-hidden"
        style={{ height }}
      >
        {/* 目盛り */}
        {[...Array(maxDisplay)].map((_, i) => (
          <div
            key={i}
            className="absolute w-full border-t border-border/30"
            style={{ bottom: `${((i + 1) / maxDisplay) * 100}%` }}
          />
        ))}

        {/* ゲージ本体 */}
        <div
          className={`absolute bottom-0 w-full transition-all duration-100 ${getColor()}`}
          style={{ height: `${fillPercent}%` }}
        />

        {/* オーバーフロー表示 */}
        {pendingGarbage > maxDisplay && (
          <div className="absolute top-0 left-0 right-0 bg-red-600 text-white text-[8px] text-center py-0.5 animate-pulse">
            +{pendingGarbage - maxDisplay}
          </div>
        )}
      </div>

      {/* 数値表示 */}
      <div className={`text-sm font-mono font-bold ${pendingGarbage > 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
        {pendingGarbage}
      </div>
    </div>
  );
}
