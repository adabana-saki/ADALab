'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Share2, Twitter, Link as LinkIcon, Check } from 'lucide-react';
import { useState } from 'react';
import type { GameStatus, Difficulty } from '@/hooks/useOthelloGame';

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'かんたん',
  normal: 'ふつう',
  hard: 'むずかしい',
};

interface GameOverOverlayProps {
  gameStatus: GameStatus;
  difficulty: Difficulty;
  blackCount: number;
  whiteCount: number;
  onNewGame: () => void;
}

export function GameOverOverlay({
  gameStatus,
  difficulty,
  blackCount,
  whiteCount,
  onNewGame,
}: GameOverOverlayProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const isFinished = gameStatus === 'won' || gameStatus === 'lost' || gameStatus === 'draw';

  const shareToTwitter = () => {
    const resultText =
      gameStatus === 'won' ? '勝利' : gameStatus === 'lost' ? '敗北' : '引き分け';
    const text = `オセロ（${DIFFICULTY_LABELS[difficulty]}）で${resultText}！ 黒${blackCount} - 白${whiteCount}\n\n#ADALab #オセロ`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent('https://adalabtech.com/games/othello')}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setShowShareMenu(false);
  };

  const copyToClipboard = async () => {
    const resultText =
      gameStatus === 'won' ? '勝利' : gameStatus === 'lost' ? '敗北' : '引き分け';
    const text = `オセロ（${DIFFICULTY_LABELS[difficulty]}）で${resultText}！ 黒${blackCount} - 白${whiteCount}\nhttps://adalabtech.com/games/othello`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API not available
    }
  };

  return (
    <AnimatePresence>
      {isFinished && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {}}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {gameStatus === 'won' ? (
              <>
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold mb-2">勝利！</h2>
                <p className="text-lg text-muted-foreground mb-4">
                  {DIFFICULTY_LABELS[difficulty]}モードで勝ちました
                </p>
              </>
            ) : gameStatus === 'lost' ? (
              <>
                <div className="text-6xl mb-4">😵</div>
                <h2 className="text-2xl font-bold mb-2">敗北...</h2>
                <p className="text-lg text-muted-foreground mb-4">
                  AIに負けてしまいました
                </p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">🤝</div>
                <h2 className="text-2xl font-bold mb-2">引き分け</h2>
                <p className="text-lg text-muted-foreground mb-4">
                  互角の戦いでした
                </p>
              </>
            )}

            <div className="flex items-center justify-center gap-3 text-2xl font-bold mb-6">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full" style={{ background: 'radial-gradient(circle at 35% 35%, #555, #111)' }} />
                <span>{blackCount}</span>
              </div>
              <span className="text-muted-foreground">-</span>
              <div className="flex items-center gap-1.5">
                <span>{whiteCount}</span>
                <div className="w-5 h-5 rounded-full border border-gray-300" style={{ background: 'radial-gradient(circle at 35% 35%, #fff, #ccc)' }} />
              </div>
            </div>

            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={onNewGame}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium"
              >
                <RotateCcw className="w-5 h-5" />
                もう一度
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg font-medium"
                >
                  <Share2 className="w-5 h-5" />
                  シェア
                </button>

                {showShareMenu && (
                  <div className="absolute top-full mt-2 right-0 bg-card border border-border rounded-lg shadow-lg p-2 min-w-[150px]">
                    <button
                      onClick={shareToTwitter}
                      className="flex items-center gap-2 w-full px-3 py-2 hover:bg-muted rounded"
                    >
                      <Twitter className="w-4 h-4" />
                      Twitter
                    </button>
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 w-full px-3 py-2 hover:bg-muted rounded"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <LinkIcon className="w-4 h-4" />
                      )}
                      {copied ? 'コピー完了' : 'リンクをコピー'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
