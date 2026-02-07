'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Share2, Twitter, Link as LinkIcon, Check } from 'lucide-react';
import { useState } from 'react';
import type { Difficulty } from '@/hooks/useMinesweeperGame';

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: '初級',
  intermediate: '中級',
  expert: '上級',
};

interface GameOverOverlayProps {
  gameStatus: 'idle' | 'playing' | 'won' | 'lost';
  difficulty: Difficulty;
  elapsedTime: number;
  onNewGame: () => void;
}

export function GameOverOverlay({
  gameStatus,
  difficulty,
  elapsedTime,
  onNewGame,
}: GameOverOverlayProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareToTwitter = () => {
    const text = `マインスイーパー ${DIFFICULTY_LABELS[difficulty]} を ${elapsedTime}秒 でクリア！\n\n#ADALab #マインスイーパー`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent('https://adalabtech.com/games/minesweeper')}`;
    window.open(url, '_blank');
    setShowShareMenu(false);
  };

  const copyToClipboard = () => {
    const text = `マインスイーパー ${DIFFICULTY_LABELS[difficulty]} を ${elapsedTime}秒 でクリア！\nhttps://adalabtech.com/games/minesweeper`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {(gameStatus === 'won' || gameStatus === 'lost') && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => {}}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full mx-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {gameStatus === 'won' ? (
              <>
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold mb-2">クリア！</h2>
                <p className="text-lg text-muted-foreground mb-4">
                  {DIFFICULTY_LABELS[difficulty]} を {elapsedTime}秒 でクリア
                </p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">💥</div>
                <h2 className="text-2xl font-bold mb-2">ゲームオーバー</h2>
                <p className="text-lg text-muted-foreground mb-4">
                  地雷を踏んでしまいました...
                </p>
              </>
            )}

            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={onNewGame}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <RotateCcw className="w-5 h-5" />
                もう一度
              </button>

              {gameStatus === 'won' && (
                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Share2 className="w-5 h-5" />
                    シェア
                  </button>

                  {showShareMenu && (
                    <div className="absolute top-full mt-2 right-0 bg-white dark:bg-gray-700 rounded-lg shadow-lg p-2 min-w-[150px]">
                      <button
                        onClick={shareToTwitter}
                        className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                      >
                        <Twitter className="w-4 h-4" />
                        Twitter
                      </button>
                      <button
                        onClick={copyToClipboard}
                        className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
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
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
