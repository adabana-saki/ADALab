'use client';

import { useRef, useEffect } from 'react';

interface TetrisOpponentFieldProps {
  field: number[][];
  nickname: string;
  score: number;
  lines: number;
  level: number;
  isAlive?: boolean;
  scale?: number;
}

// ミニフィールド用の設定
const FIELD_COL = 10;
const FIELD_ROW = 20;

// カラーテーマ（クラシック）
const COLORS = [
  '#1a1a2e', // 空
  '#06b6d4', // I - シアン
  '#f97316', // L - オレンジ
  '#3b82f6', // J - 青
  '#a855f7', // T - 紫
  '#eab308', // O - 黄
  '#ef4444', // Z - 赤
  '#22c55e', // S - 緑
  '#6b7280', // おじゃまブロック - グレー
];

export function TetrisOpponentField({
  field,
  nickname,
  score,
  lines,
  level,
  isAlive = true,
  scale = 0.5,
}: TetrisOpponentFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const BLOCK_SIZE = Math.floor(28 * scale);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // キャンバスサイズ設定
    canvas.width = FIELD_COL * BLOCK_SIZE;
    canvas.height = FIELD_ROW * BLOCK_SIZE;

    // 背景
    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // グリッド
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 1;
    for (let y = 0; y <= FIELD_ROW; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * BLOCK_SIZE);
      ctx.lineTo(FIELD_COL * BLOCK_SIZE, y * BLOCK_SIZE);
      ctx.stroke();
    }
    for (let x = 0; x <= FIELD_COL; x++) {
      ctx.beginPath();
      ctx.moveTo(x * BLOCK_SIZE, 0);
      ctx.lineTo(x * BLOCK_SIZE, FIELD_ROW * BLOCK_SIZE);
      ctx.stroke();
    }

    // フィールド描画
    for (let y = 0; y < FIELD_ROW; y++) {
      for (let x = 0; x < FIELD_COL; x++) {
        const cell = field[y]?.[x];
        if (cell) {
          const color = COLORS[cell] || COLORS[8];
          ctx.fillStyle = color;
          ctx.fillRect(
            x * BLOCK_SIZE + 1,
            y * BLOCK_SIZE + 1,
            BLOCK_SIZE - 2,
            BLOCK_SIZE - 2
          );

          // 3D効果
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.fillRect(x * BLOCK_SIZE + 1, y * BLOCK_SIZE + 1, BLOCK_SIZE - 2, 2);
          ctx.fillRect(x * BLOCK_SIZE + 1, y * BLOCK_SIZE + 1, 2, BLOCK_SIZE - 2);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.fillRect(x * BLOCK_SIZE + 1, y * BLOCK_SIZE + BLOCK_SIZE - 3, BLOCK_SIZE - 2, 2);
          ctx.fillRect(x * BLOCK_SIZE + BLOCK_SIZE - 3, y * BLOCK_SIZE + 1, 2, BLOCK_SIZE - 2);
        }
      }
    }

    // ゲームオーバー時のオーバーレイ
    if (!isAlive) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ef4444';
      ctx.font = `bold ${Math.floor(14 * scale)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('K.O.', canvas.width / 2, canvas.height / 2);
    }
  }, [field, isAlive, BLOCK_SIZE, scale]);

  return (
    <div className="flex flex-col items-center gap-2">
      {/* プレイヤー名 */}
      <div className={`text-sm font-medium ${isAlive ? 'text-foreground' : 'text-muted-foreground line-through'}`}>
        {nickname}
      </div>

      {/* フィールド */}
      <canvas
        ref={canvasRef}
        className="border-2 border-border rounded"
        style={{ imageRendering: 'pixelated' }}
      />

      {/* スコア情報 */}
      <div className="grid grid-cols-3 gap-2 text-xs text-center w-full">
        <div>
          <div className="text-muted-foreground">SCORE</div>
          <div className="font-mono font-bold">{score.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-muted-foreground">LINES</div>
          <div className="font-mono font-bold">{lines}</div>
        </div>
        <div>
          <div className="text-muted-foreground">LV</div>
          <div className="font-mono font-bold">{level}</div>
        </div>
      </div>
    </div>
  );
}
