'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2,
  Twitter,
  Link as LinkIcon,
  Check,
  X,
  MessageCircle,
  Facebook,
} from 'lucide-react';

interface ShareButtonProps {
  score: number;
  lines: number;
  level: number;
  mode: 'marathon' | 'sprint' | 'battle' | 'timeAttack';
  isWin?: boolean;
  className?: string;
}

export function ShareButton({
  score,
  lines,
  level,
  mode,
  isWin,
  className = '',
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://adalabtech.com';
  const gameUrl = `${baseUrl}/games/tetris`;

  // 共有テキスト生成
  const generateShareText = useCallback(() => {
    let text = '';

    if (mode === 'battle') {
      text = isWin
        ? `ADA Lab Tetris オンラインバトルで勝利しました！\n\nスコア: ${score.toLocaleString()}\nライン: ${lines}\n`
        : `ADA Lab Tetris オンラインバトル\n\nスコア: ${score.toLocaleString()}\nライン: ${lines}\n`;
    } else if (mode === 'sprint') {
      text = `ADA Lab Tetris スプリントモード完走！\n\n40ライン消去達成！\nスコア: ${score.toLocaleString()}\n`;
    } else if (mode === 'timeAttack') {
      text = `ADA Lab Tetris タイムアタック (2分) で ${score.toLocaleString()} 点を達成！\n\nライン: ${lines}\nレベル: ${level}\n`;
    } else {
      text = `ADA Lab Tetris で ${score.toLocaleString()} 点を達成！\n\nライン: ${lines}\nレベル: ${level}\n`;
    }

    text += `\n#ADALabGames #Tetris\n${gameUrl}`;
    return text;
  }, [score, lines, level, mode, isWin, gameUrl]);

  // Twitter/Xで共有
  const shareToTwitter = useCallback(() => {
    const text = encodeURIComponent(generateShareText());
    const url = `https://twitter.com/intent/tweet?text=${text}`;
    window.open(url, '_blank', 'width=550,height=420');
    setIsOpen(false);
  }, [generateShareText]);

  // LINEで共有
  const shareToLine = useCallback(() => {
    const text = encodeURIComponent(generateShareText());
    const url = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(gameUrl)}&text=${text}`;
    window.open(url, '_blank', 'width=550,height=420');
    setIsOpen(false);
  }, [generateShareText, gameUrl]);

  // Facebookで共有（quoteパラメータは非推奨のため、URLのみ共有）
  const shareToFacebook = useCallback(() => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(gameUrl)}`;
    window.open(url, '_blank', 'width=550,height=420');
    setIsOpen(false);
  }, [gameUrl]);

  // URLをコピー
  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generateShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [generateShareText]);

  // Web Share API
  const shareNative = useCallback(async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: 'ADA Lab Tetris',
          text: generateShareText(),
          url: gameUrl,
        });
        setIsOpen(false);
      } catch (err) {
        // ユーザーがキャンセルした場合は無視
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    }
  }, [generateShareText, gameUrl]);

  return (
    <div className={`relative ${className}`}>
      {/* メインボタン */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Share2 size={18} />
        <span>結果をシェア</span>
      </motion.button>

      {/* シェアメニュー */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* オーバーレイ */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* メニュー */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute right-0 bottom-full mb-2 w-64 p-3 rounded-xl bg-card border border-border shadow-xl z-50"
            >
              {/* ヘッダー */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
                <span className="text-sm font-medium">シェアする</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded hover:bg-muted transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* シェアオプション */}
              <div className="space-y-2">
                {/* Twitter/X */}
                <button
                  onClick={shareToTwitter}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
                    <Twitter size={16} className="text-white" />
                  </div>
                  <span className="text-sm">X (Twitter) でシェア</span>
                </button>

                {/* LINE */}
                <button
                  onClick={shareToLine}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#06C755] flex items-center justify-center">
                    <MessageCircle size={16} className="text-white" />
                  </div>
                  <span className="text-sm">LINE でシェア</span>
                </button>

                {/* Facebook */}
                <button
                  onClick={shareToFacebook}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#1877F2] flex items-center justify-center">
                    <Facebook size={16} className="text-white" />
                  </div>
                  <span className="text-sm">Facebook でシェア</span>
                </button>

                {/* Web Share API (対応ブラウザのみ) */}
                {typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'share' in navigator && (
                  <button
                    onClick={shareNative}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Share2 size={16} className="text-primary" />
                    </div>
                    <span className="text-sm">その他のアプリでシェア</span>
                  </button>
                )}

                {/* リンクコピー */}
                <button
                  onClick={copyToClipboard}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    {copied ? (
                      <Check size={16} className="text-green-500" />
                    ) : (
                      <LinkIcon size={16} />
                    )}
                  </div>
                  <span className="text-sm">{copied ? 'コピーしました！' : 'テキストをコピー'}</span>
                </button>
              </div>

              {/* プレビュー */}
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">プレビュー:</p>
                <div className="p-2 rounded-lg bg-muted/50 text-xs text-muted-foreground whitespace-pre-line line-clamp-4">
                  {generateShareText()}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ゲーム終了時のシェアカード
interface ShareCardProps {
  score: number;
  lines: number;
  level: number;
  mode: 'marathon' | 'sprint' | 'battle' | 'timeAttack';
  isWin?: boolean;
  highScore?: number;
  isNewHighScore?: boolean;
}

export function ShareCard({
  score,
  lines,
  level,
  mode,
  isWin,
  highScore,
  isNewHighScore,
}: ShareCardProps) {
  return (
    <div className="relative p-6 rounded-2xl bg-gradient-to-br from-card to-muted/50 border border-border overflow-hidden">
      {/* 背景装飾 */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      {/* ハイスコアバッジ */}
      {isNewHighScore && (
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          className="absolute -top-2 -right-2 px-4 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full shadow-lg"
        >
          NEW RECORD!
        </motion.div>
      )}

      {/* モードラベル */}
      <div className="flex items-center gap-2 mb-4">
        <span className="px-3 py-1 text-xs font-bold rounded-full bg-primary/20 text-primary">
          {mode === 'marathon' && 'マラソン'}
          {mode === 'sprint' && 'スプリント'}
          {mode === 'battle' && 'オンラインバトル'}
          {mode === 'timeAttack' && 'タイムアタック'}
        </span>
        {mode === 'battle' && (
          <span
            className={`px-3 py-1 text-xs font-bold rounded-full ${
              isWin ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
            }`}
          >
            {isWin ? 'WIN' : 'LOSE'}
          </span>
        )}
      </div>

      {/* スコア */}
      <div className="text-center mb-6">
        <p className="text-sm text-muted-foreground mb-1">スコア</p>
        <p className="text-4xl font-bold text-primary">{score.toLocaleString()}</p>
        {highScore && !isNewHighScore && (
          <p className="text-xs text-muted-foreground mt-1">
            ハイスコア: {highScore.toLocaleString()}
          </p>
        )}
      </div>

      {/* 統計 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 rounded-lg bg-muted/30">
          <p className="text-2xl font-bold">{lines}</p>
          <p className="text-xs text-muted-foreground">ライン</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-muted/30">
          <p className="text-2xl font-bold">{level}</p>
          <p className="text-xs text-muted-foreground">レベル</p>
        </div>
      </div>

      {/* シェアボタン */}
      <ShareButton score={score} lines={lines} level={level} mode={mode} isWin={isWin} className="w-full justify-center" />
    </div>
  );
}
