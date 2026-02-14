'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Timer, Skull, Swords, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { BattlePlayerState, GameSettings, GameResult, Position, Direction, PlayerDiedInfo } from '@/hooks/useSnakeBattle';

interface SnakeBattleProps {
  nickname: string;
  settings: GameSettings;
  battlePlayers: BattlePlayerState[];
  food: Position | null;
  timeRemaining: number;
  winner: { id: string; nickname: string } | null;
  myPlayerId: string | null;
  lastDeath: PlayerDiedInfo | null;
  onDirectionChange: (direction: Direction) => void;
  onLeave: () => void;
  onRematch: () => void;
  results: GameResult[];
  endReason: string;
}

// 死因の日本語表示
const getDeathReasonText = (killedBy: string): string => {
  switch (killedBy) {
    case 'wall': return '壁に衝突';
    case 'self': return '自分に衝突';
    case 'opponent': return '相手と正面衝突';
    case 'opponent_body': return '相手の体に衝突';
    default: return 'ゲームオーバー';
  }
};

// hex値から色名へのマッピング
const hexToColorName: Record<string, string> = {
  '#22c55e': 'green',
  '#f97316': 'orange',
  '#3b82f6': 'blue',
  '#a855f7': 'purple',
  '#ec4899': 'pink',
  '#06b6d4': 'cyan',
};

// 色名からCSSクラスへのマッピング
const colorStyles: Record<string, { head: string; body: string; bg: string; border: string; text: string }> = {
  green:  { head: 'bg-green-500',  body: 'bg-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/20',  text: 'text-green-500' },
  orange: { head: 'bg-orange-500', body: 'bg-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-500' },
  blue:   { head: 'bg-blue-500',   body: 'bg-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   text: 'text-blue-500' },
  purple: { head: 'bg-purple-500', body: 'bg-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-500' },
  pink:   { head: 'bg-pink-500',   body: 'bg-pink-400',   bg: 'bg-pink-500/10',   border: 'border-pink-500/20',   text: 'text-pink-500' },
  cyan:   { head: 'bg-cyan-500',   body: 'bg-cyan-400',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/20',   text: 'text-cyan-500' },
};

const resolveColor = (color: string): string => {
  return hexToColorName[color] || color;
};

const getColorClass = (color: string, isHead: boolean): string => {
  const name = resolveColor(color);
  const colorSet = colorStyles[name] || colorStyles.green;
  return isHead ? colorSet.head : colorSet.body;
};

const getColorStyle = (color: string): { bg: string; border: string; text: string } => {
  const name = resolveColor(color);
  return colorStyles[name] || colorStyles.green;
};

export function SnakeBattle({
  nickname,
  settings,
  battlePlayers,
  food,
  timeRemaining,
  winner,
  myPlayerId,
  lastDeath,
  onDirectionChange,
  onLeave,
  onRematch,
  results,
  endReason,
}: SnakeBattleProps) {
  const [currentDirection, setCurrentDirection] = useState<Direction>('right');
  const [deathNotification, setDeathNotification] = useState<PlayerDiedInfo | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // 死亡通知を表示
  useEffect(() => {
    if (lastDeath) {
      setDeathNotification(lastDeath);
      const timer = setTimeout(() => setDeathNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastDeath]);

  // キーボード操作
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const opposites: Record<Direction, Direction> = {
        up: 'down',
        down: 'up',
        left: 'right',
        right: 'left',
      };

      let newDirection: Direction | null = null;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          newDirection = 'up';
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          newDirection = 'down';
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          newDirection = 'left';
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          newDirection = 'right';
          break;
      }

      if (newDirection && opposites[newDirection] !== currentDirection) {
        e.preventDefault();
        setCurrentDirection(newDirection);
        onDirectionChange(newDirection);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentDirection, onDirectionChange]);

  // タッチ操作
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;

    if (Math.abs(dx) < 30 && Math.abs(dy) < 30) {
      touchStartRef.current = null;
      return;
    }

    const opposites: Record<Direction, Direction> = {
      up: 'down',
      down: 'up',
      left: 'right',
      right: 'left',
    };

    let newDirection: Direction;
    if (Math.abs(dx) > Math.abs(dy)) {
      newDirection = dx > 0 ? 'right' : 'left';
    } else {
      newDirection = dy > 0 ? 'down' : 'up';
    }

    if (opposites[newDirection] !== currentDirection) {
      setCurrentDirection(newDirection);
      onDirectionChange(newDirection);
    }

    touchStartRef.current = null;
  }, [currentDirection, onDirectionChange]);

  // モバイル方向ボタン
  const handleDirectionButton = useCallback((direction: Direction) => {
    const opposites: Record<Direction, Direction> = {
      up: 'down', down: 'up', left: 'right', right: 'left',
    };
    if (opposites[direction] !== currentDirection) {
      setCurrentDirection(direction);
      onDirectionChange(direction);
    }
  }, [currentDirection, onDirectionChange]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // グリッドサイズの計算（レスポンシブ）
  const cellSize = Math.min(Math.floor(400 / settings.gridSize), 13);
  const gridPixelSize = cellSize * settings.gridSize;

  // 自分と相手を特定
  const myPlayer = battlePlayers.find(p => p.id === myPlayerId);
  const opponentPlayer = battlePlayers.find(p => p.id !== myPlayerId);

  // 結果表示
  if (winner) {
    const isWinner = winner.id === myPlayerId;
    const myResult = results.find(r => r.id === myPlayerId);
    const opponentResult = results.find(r => r.id !== myPlayerId);

    const reasonText: Record<string, string> = {
      'player_died': '相手がゲームオーバー',
      'opponent_died': '相手がゲームオーバー',
      'time_up': '時間切れ',
      'opponent_quit': '相手が退出',
      'draw': '引き分け',
    };

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-lg space-y-6 text-center">
          <div className={`text-6xl ${isWinner ? 'text-yellow-500' : 'text-muted-foreground'}`}>
            {isWinner ? '🏆' : '😢'}
          </div>
          <div>
            <h2 className={`text-3xl font-bold mb-2 ${isWinner ? 'text-yellow-500' : 'text-foreground'}`}>
              {isWinner ? 'WIN!' : 'LOSE...'}
            </h2>
            <p className="text-muted-foreground">{reasonText[endReason] || endReason} - 勝者: {winner.nickname}</p>
          </div>

          {myResult && opponentResult && (
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-medium mb-3">結果</h3>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div></div>
                <div className="text-center font-medium">スコア</div>
                <div className="text-center font-medium">長さ</div>

                <div className="text-left font-medium">{nickname} (あなた)</div>
                <div className="text-center text-primary font-bold">{myResult.score}</div>
                <div className="text-center">{myResult.length}</div>

                <div className="text-left text-muted-foreground">{opponentResult.nickname}</div>
                <div className="text-center text-muted-foreground">{opponentResult.score}</div>
                <div className="text-center text-muted-foreground">{opponentResult.length}</div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={onRematch}
              className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
            >
              再戦する
            </button>
            <button
              onClick={onLeave}
              className="w-full px-6 py-3 bg-card border border-border rounded-lg font-medium hover:bg-accent"
            >
              ロビーに戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onLeave}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          退出
        </button>
        <div className="flex items-center gap-2">
          <Swords className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">同一フィールドバトル</span>
        </div>
        <div className={`flex items-center gap-2 font-mono font-bold ${timeRemaining <= 30 ? 'text-red-500 animate-pulse' : ''}`}>
          <Timer className="w-4 h-4" />
          {formatTime(timeRemaining)}
        </div>
      </div>

      {/* スコア比較 */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {(() => { const myStyle = getColorStyle(myPlayer?.color || '#22c55e'); return (
        <div className={`border rounded-lg p-3 text-center ${myStyle.bg} ${myStyle.border}`}>
          <p className="text-xs text-muted-foreground mb-1">{nickname} (あなた)</p>
          <p className={`text-2xl font-bold ${myStyle.text}`}>
            {myPlayer?.score ?? 0}
          </p>
          <p className="text-xs text-muted-foreground">
            長さ: {myPlayer?.snake.length ?? 0}
            {myPlayer && !myPlayer.isAlive && <span className="ml-2 text-red-500">(終了)</span>}
          </p>
        </div>
        ); })()}
        {(() => { const opStyle = getColorStyle(opponentPlayer?.color || '#f97316'); return (
        <div className={`border rounded-lg p-3 text-center ${opStyle.bg} ${opStyle.border}`}>
          <p className="text-xs text-muted-foreground mb-1">
            {opponentPlayer?.nickname || '対戦相手'}
          </p>
          <p className={`text-2xl font-bold ${opStyle.text}`}>
            {opponentPlayer?.score ?? '---'}
          </p>
          <p className="text-xs text-muted-foreground">
            長さ: {opponentPlayer?.snake.length ?? '---'}
            {opponentPlayer && !opponentPlayer.isAlive && <span className="ml-2 text-red-500">(終了)</span>}
          </p>
        </div>
        ); })()}
      </div>

      {/* 死亡通知 */}
      <AnimatePresence>
        {deathNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-center"
          >
            <div className="flex items-center justify-center gap-2 text-red-500">
              <Skull className="w-5 h-5" />
              <span className="font-medium">
                {deathNotification.nickname}が{getDeathReasonText(deathNotification.killedBy)}で脱落！
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ゲームフィールド（同一フィールド） */}
      <div className="flex-1 flex items-center justify-center">
        <div
          className="relative select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="relative bg-muted/30 border-2 border-border rounded-lg overflow-hidden"
            style={{ width: gridPixelSize, height: gridPixelSize }}
          >
            {/* グリッド線（薄く表示） */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundSize: `${cellSize}px ${cellSize}px`,
                backgroundImage: 'linear-gradient(to right, rgba(128,128,128,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(128,128,128,0.1) 1px, transparent 1px)',
              }}
            />

            {/* 全プレイヤーのスネーク */}
            {battlePlayers.map(player => (
              player.snake.map((segment, index) => (
                <motion.div
                  key={`${player.id}-${index}`}
                  className={`absolute ${getColorClass(player.color, index === 0)} rounded-sm ${!player.isAlive ? 'opacity-30' : ''}`}
                  style={{
                    width: cellSize - 1,
                    height: cellSize - 1,
                    left: segment.x * cellSize,
                    top: segment.y * cellSize,
                  }}
                  initial={index === 0 ? { scale: 1.2 } : { scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.05 }}
                />
              ))
            ))}

            {/* フード */}
            {food && (
              <motion.div
                className="absolute bg-yellow-500 rounded-full"
                style={{
                  width: cellSize - 1,
                  height: cellSize - 1,
                  left: food.x * cellSize,
                  top: food.y * cellSize,
                }}
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 0.6 }}
              />
            )}

            {/* 自分が死んだ時のオーバーレイ */}
            {myPlayer && !myPlayer.isAlive && (
              <div className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center">
                <div className="text-center text-white">
                  <Skull className="w-16 h-16 mx-auto mb-2" />
                  <p className="font-bold text-xl">ゲームオーバー</p>
                  <p className="text-sm mt-2">結果を待機中...</p>
                </div>
              </div>
            )}
          </div>

          {/* 凡例 */}
          <div className="mt-3 flex justify-center gap-4 text-xs text-muted-foreground">
            {battlePlayers.map(player => (
              <div key={player.id} className="flex items-center gap-1">
                <div className={`w-3 h-3 rounded-sm ${getColorClass(player.color, true)}`} />
                <span>{player.id === myPlayerId ? 'あなた' : player.nickname}</span>
              </div>
            ))}
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span>エサ</span>
            </div>
          </div>
        </div>
      </div>

      {/* 方向ボタン（モバイル用） */}
      <div className="flex flex-col items-center gap-2 sm:hidden mt-4">
        <button
          onTouchStart={(e) => { e.preventDefault(); handleDirectionButton('up'); }}
          className="w-14 h-14 rounded-xl bg-muted/80 border border-border flex items-center justify-center active:bg-primary/20 active:scale-95 transition-all"
        >
          <ChevronUp className="w-7 h-7" />
        </button>
        <div className="flex gap-12">
          <button
            onTouchStart={(e) => { e.preventDefault(); handleDirectionButton('left'); }}
            className="w-14 h-14 rounded-xl bg-muted/80 border border-border flex items-center justify-center active:bg-primary/20 active:scale-95 transition-all"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); handleDirectionButton('right'); }}
            className="w-14 h-14 rounded-xl bg-muted/80 border border-border flex items-center justify-center active:bg-primary/20 active:scale-95 transition-all"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        </div>
        <button
          onTouchStart={(e) => { e.preventDefault(); handleDirectionButton('down'); }}
          className="w-14 h-14 rounded-xl bg-muted/80 border border-border flex items-center justify-center active:bg-primary/20 active:scale-95 transition-all"
        >
          <ChevronDown className="w-7 h-7" />
        </button>
      </div>

      {/* 操作ヒント（PC用） */}
      <div className="text-center text-xs text-muted-foreground mt-4 hidden sm:block">
        矢印キー / WASD で操作
      </div>
    </div>
  );
}
