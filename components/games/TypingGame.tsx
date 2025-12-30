'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  RotateCcw,
  Trophy,
  Timer,
  Target,
  Zap,
  Share2,
  Twitter,
  Link as LinkIcon,
  Check,
  X,
  Keyboard,
  Globe,
  Code,
} from 'lucide-react';
import { useTypingGame, GameMode } from '@/hooks/useTypingGame';
import { Language, Difficulty } from '@/lib/typing-words';

export function TypingGame() {
  const [language, setLanguage] = useState<Language>('en');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [mode, setMode] = useState<GameMode>('standard');
  const [wordCount, setWordCount] = useState(20);
  const [showSettings, setShowSettings] = useState(true);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const {
    currentWord,
    currentInput,
    targetText,
    isStarted,
    isFinished,
    elapsedTime,
    progress,
    highWpm,
    bestAccuracy,
    stats,
    handleInput,
    resetGame,
    getCharacterStatus,
  } = useTypingGame({
    language,
    difficulty,
    mode,
    wordCount,
  });

  // Focus input on start
  useEffect(() => {
    if (!showSettings && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showSettings, isFinished]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Share text
  const generateShareText = useCallback(() => {
    return `ADA Lab Typing で ${stats.wpm} WPM (正確率 ${stats.accuracy}%) を達成！\n\n#ADALabGames #Typing\nhttps://adalabtech.com/games/typing`;
  }, [stats]);

  const shareToTwitter = useCallback(() => {
    const text = encodeURIComponent(generateShareText());
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
    setShowShare(false);
  }, [generateShareText]);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generateShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }, [generateShareText]);

  // Start game
  const startGame = () => {
    setShowSettings(false);
    resetGame();
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Reset to settings
  const backToSettings = () => {
    setShowSettings(true);
    resetGame();
  };

  // Settings screen
  if (showSettings) {
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">Typing</h1>
          <p className="text-muted-foreground">タイピング速度を測定しよう</p>
        </div>

        {/* High scores */}
        <div className="w-full flex gap-4 justify-center">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted">
            <Zap size={18} className="text-yellow-500" />
            <span className="text-sm">ベスト WPM:</span>
            <span className="font-bold">{highWpm}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted">
            <Target size={18} className="text-green-500" />
            <span className="text-sm">最高正確率:</span>
            <span className="font-bold">{bestAccuracy}%</span>
          </div>
        </div>

        {/* Settings */}
        <div className="w-full space-y-4 p-6 rounded-xl bg-card border border-border">
          {/* Mode */}
          <div>
            <label className="block text-sm font-medium mb-2">モード</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMode('standard')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
                  mode === 'standard'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Globe size={18} />
                スタンダード
              </button>
              <button
                onClick={() => setMode('programming')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
                  mode === 'programming'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Code size={18} />
                プログラミング
              </button>
            </div>
          </div>

          {/* Language (only for standard mode) */}
          {mode === 'standard' && (
            <div>
              <label className="block text-sm font-medium mb-2">言語</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    language === 'en'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage('ja')}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    language === 'ja'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  日本語
                </button>
              </div>
            </div>
          )}

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium mb-2">難易度</label>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    difficulty === d
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {d === 'easy' ? '易しい' : d === 'medium' ? '普通' : '難しい'}
                </button>
              ))}
            </div>
          </div>

          {/* Word count */}
          <div>
            <label className="block text-sm font-medium mb-2">単語数: {wordCount}</label>
            <input
              type="range"
              min="10"
              max="50"
              step="5"
              value={wordCount}
              onChange={(e) => setWordCount(parseInt(e.target.value, 10))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>10</span>
              <span>50</span>
            </div>
          </div>
        </div>

        {/* Start button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startGame}
          className="flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg"
        >
          <Play size={24} />
          スタート
        </motion.button>

        {/* Instructions */}
        <div className="w-full p-4 rounded-lg bg-muted/50 text-sm">
          <h3 className="font-bold mb-2">遊び方</h3>
          <ul className="space-y-1 text-muted-foreground">
            <li><strong>操作:</strong> 表示された単語をタイプしてスペースで次へ</li>
            <li><strong>日本語モード:</strong> ローマ字で入力</li>
            <li><strong>WPM:</strong> Words Per Minute（1分あたりの単語数）</li>
            <li><strong>目標:</strong> 速く正確にタイプしよう！</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-2xl mx-auto p-4">
      {/* Header */}
      <div className="w-full flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Typing</h1>
          <p className="text-sm text-muted-foreground">
            {mode === 'programming'
              ? 'プログラミング用語'
              : language === 'ja'
              ? '日本語（ローマ字入力）'
              : 'English'}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex flex-col items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground">
            <span className="text-xs uppercase opacity-80">WPM</span>
            <span className="text-2xl font-bold">{stats.wpm}</span>
          </div>
          <div className="flex flex-col items-center px-4 py-2 rounded-lg bg-muted">
            <span className="text-xs uppercase opacity-80">正確率</span>
            <span className="text-2xl font-bold">{stats.accuracy}%</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.2 }}
        />
      </div>

      {/* Stats row */}
      <div className="w-full flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Timer size={16} />
            {formatTime(elapsedTime)}
          </span>
          <span className="flex items-center gap-1">
            <Keyboard size={16} />
            {stats.correctWords}/{stats.totalWords} 単語
          </span>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={backToSettings}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-muted hover:bg-muted/80"
          >
            <RotateCcw size={16} />
            設定
          </motion.button>
        </div>
      </div>

      {/* Main typing area */}
      <div className="w-full p-8 rounded-xl bg-card border border-border">
        {!isFinished ? (
          <>
            {/* Current word display */}
            <div className="text-center mb-6">
              {language === 'ja' && currentWord?.text && (
                <p className="text-3xl font-bold mb-2">{currentWord.text}</p>
              )}
              <div className="flex justify-center gap-0.5 text-4xl font-mono">
                {targetText.split('').map((char, index) => {
                  const status = getCharacterStatus(index);
                  return (
                    <span
                      key={index}
                      className={`${
                        status === 'correct'
                          ? 'text-green-500'
                          : status === 'incorrect'
                          ? 'text-red-500 bg-red-500/20'
                          : 'text-muted-foreground'
                      } ${index === currentInput.length ? 'border-l-2 border-primary animate-pulse' : ''}`}
                    >
                      {char}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Input */}
            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={(e) => handleInput(e.target.value)}
              className="w-full text-center text-2xl font-mono p-4 rounded-lg bg-muted border border-border focus:border-primary focus:outline-none"
              placeholder={isStarted ? '' : 'タイプを開始...'}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />
          </>
        ) : (
          /* Results */
          <div className="text-center">
            <Trophy size={64} className="mx-auto mb-4 text-yellow-500" />
            <h2 className="text-3xl font-bold mb-2">完了！</h2>

            <div className="grid grid-cols-2 gap-4 my-6">
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground mb-1">WPM</p>
                <p className="text-4xl font-bold text-primary">{stats.wpm}</p>
                {stats.wpm > highWpm && stats.wpm > 0 && (
                  <p className="text-xs text-yellow-500 flex items-center justify-center gap-1 mt-1">
                    <Trophy size={12} />
                    新記録！
                  </p>
                )}
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground mb-1">正確率</p>
                <p className="text-4xl font-bold">{stats.accuracy}%</p>
                {stats.accuracy > bestAccuracy && stats.accuracy > 0 && (
                  <p className="text-xs text-yellow-500 flex items-center justify-center gap-1 mt-1">
                    <Trophy size={12} />
                    新記録！
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-center gap-4 text-sm text-muted-foreground mb-6">
              <span>時間: {formatTime(elapsedTime)}</span>
              <span>単語: {stats.correctWords}/{stats.totalWords}</span>
              <span>文字: {stats.correctChars}</span>
            </div>

            <div className="flex justify-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  resetGame();
                  setTimeout(() => inputRef.current?.focus(), 100);
                }}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium"
              >
                <RotateCcw size={18} />
                もう一度
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowShare(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-muted font-medium"
              >
                <Share2 size={18} />
                シェア
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={backToSettings}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-muted font-medium"
              >
                設定
              </motion.button>
            </div>
          </div>
        )}
      </div>

      {/* Share modal */}
      <AnimatePresence>
        {showShare && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowShare(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">シェアする</h3>
                <button
                  onClick={() => setShowShare(false)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3">
                <button
                  onClick={shareToTwitter}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center">
                    <Twitter size={20} className="text-white" />
                  </div>
                  <span className="font-medium">X (Twitter) でシェア</span>
                </button>

                <button
                  onClick={copyToClipboard}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    {copied ? (
                      <Check size={20} className="text-green-500" />
                    ) : (
                      <LinkIcon size={20} />
                    )}
                  </div>
                  <span className="font-medium">
                    {copied ? 'コピーしました!' : 'テキストをコピー'}
                  </span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
