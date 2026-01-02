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
  Skull,
  Clock,
  Hash,
  Medal,
  Award,
  AlertTriangle,
} from 'lucide-react';
import { useTypingGame, GameMode, TypingLanguage, TypingDifficulty, InputType } from '@/hooks/useTypingGame';
import { SentenceCategory, CATEGORY_LABELS } from '@/lib/typing-sentences';
import { useTypingLeaderboard, MODE_LABELS, LANGUAGE_LABELS } from '@/hooks/useTypingLeaderboard';
import { useTypingAchievements } from '@/hooks/useTypingAchievements';
import { AchievementToast } from '@/components/games/AchievementToast';
import { BgmControl } from '@/components/games/BgmControl';
import { TypingLeaderboardModal } from '@/components/games/TypingLeaderboardModal';
import type { GameAchievement } from '@/lib/game-achievements';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';

const MODE_INFO: Record<GameMode, { icon: React.ReactNode; name: string; description: string }> = {
  time: {
    icon: <Clock size={20} />,
    name: 'タイムモード',
    description: '制限時間内にできるだけ多くタイプ',
  },
  sudden_death: {
    icon: <Skull size={20} />,
    name: '即終了モード',
    description: '1文字でも間違えたら即ゲームオーバー',
  },
  word_count: {
    icon: <Hash size={20} />,
    name: '文字数モード',
    description: '指定数の単語を最速でタイプ',
  },
};

const LANGUAGE_INFO: Record<TypingLanguage, { icon: string; name: string }> = {
  en: { icon: '🇺🇸', name: 'English' },
  ja: { icon: '🇯🇵', name: '日本語' },
  mixed: { icon: '🌍', name: '両方' },
};

const DIFFICULTY_INFO: Record<TypingDifficulty, { name: string; color: string }> = {
  easy: { name: '易しい', color: 'text-green-500' },
  normal: { name: '普通', color: 'text-yellow-500' },
  hard: { name: '難しい', color: 'text-red-500' },
};

const INPUT_TYPE_INFO: Record<InputType, { icon: string; name: string; description: string }> = {
  word: { icon: 'Aa', name: '単語', description: '単語を1つずつタイプ' },
  sentence: { icon: '""', name: '文章', description: '名言・ことわざをタイプ' },
};

export function TypingGame() {
  const [language, setLanguage] = useState<TypingLanguage>('en');
  const [difficulty, setDifficulty] = useState<TypingDifficulty>('normal');
  const [mode, setMode] = useState<GameMode>('time');
  const [inputType, setInputType] = useState<InputType>('word');
  const [sentenceCategory, setSentenceCategory] = useState<SentenceCategory | undefined>(undefined);
  const [wordCount, setWordCount] = useState(30);
  const [itemCount, setItemCount] = useState(10); // 文章モード用
  const [timeLimit, setTimeLimit] = useState(60);
  const [showSettings, setShowSettings] = useState(true);
  const [showShare, setShowShare] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showNicknameInput, setShowNicknameInput] = useState(false);
  const [copied, setCopied] = useState(false);
  const [unlockedAchievement, setUnlockedAchievement] = useState<GameAchievement | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // 認証状態
  const { user, profile } = useAuth();
  const userNickname = profile?.displayName || profile?.email?.split('@')[0] || 'ゲスト';

  // Hooks
  const {
    leaderboard,
    mode: leaderboardMode,
    setMode: setLeaderboardMode,
    language: leaderboardLanguage,
    setLanguage: setLeaderboardLanguage,
    period,
    setPeriod,
    isLoading: leaderboardLoading,
    isOnline,
    submitScore,
    isRankingScore,
  } = useTypingLeaderboard(mode, language);

  const {
    stats: _typingStats,
    recordGameStart,
    recordGameOver,
    getAllAchievements: _getAllAchievements,
    progress: achievementProgress,
  } = useTypingAchievements({
    onAchievementUnlock: (achievement) => {
      setUnlockedAchievement(achievement);
    },
  });

  const {
    currentWord,
    currentInput,
    targetText,
    displayText,
    isStarted,
    isFinished,
    gameOverReason,
    elapsedTime,
    timeRemaining,
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
    inputType,
    itemCount: inputType === 'sentence' ? itemCount : undefined,
    wordCount: mode === 'word_count' ? wordCount : 100,
    timeLimit: mode === 'time' ? timeLimit : 0,
    sentenceCategory,
    onGameEnd: (finalStats) => {
      recordGameOver(
        finalStats.wpm,
        finalStats.accuracy,
        finalStats.correctWords,
        elapsedTime,
        language,
        mode
      );

      // ランキング入りチェック
      if (isRankingScore(finalStats.wpm) && finalStats.wpm > 0) {
        setShowNicknameInput(true);
      }
    },
  });

  // Focus input on start
  useEffect(() => {
    if (!showSettings && inputRef.current && !isFinished) {
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
    const modeText = MODE_LABELS[mode];
    const langText = LANGUAGE_LABELS[language];
    return `ADA Lab Typing [${modeText}/${langText}] で ${stats.wpm} WPM (正確率 ${stats.accuracy}%) を達成！\n\n#ADALabGames #Typing\nhttps://adalabtech.com/games/typing`;
  }, [stats, mode, language]);

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
    recordGameStart();
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Reset to settings
  const backToSettings = () => {
    setShowSettings(true);
    setShowNicknameInput(false);
    resetGame();
  };

  // Submit score
  const handleSubmitScore = async () => {
    if (!user) return;

    await submitScore({
      nickname: userNickname.slice(0, 20),
      wpm: stats.wpm,
      accuracy: stats.accuracy,
      words_typed: stats.correctWords,
      time_seconds: Math.floor(elapsedTime),
      date: new Date().toISOString(),
    });

    setShowNicknameInput(false);
    setShowLeaderboard(true);
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

        {/* Achievements & Leaderboard buttons */}
        <div className="w-full flex gap-2">
          <button
            onClick={() => setShowLeaderboard(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
          >
            <Trophy size={18} className="text-yellow-500" />
            ランキング
          </button>
          <div className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-muted">
            <Award size={18} className="text-purple-500" />
            <span className="text-sm">実績: {achievementProgress.unlocked}/{achievementProgress.total}</span>
          </div>
        </div>

        {/* Settings */}
        <div className="w-full space-y-4 p-6 rounded-xl bg-card border border-border">
          {/* Game Mode */}
          <div>
            <label className="block text-sm font-medium mb-2">ゲームモード</label>
            <div className="grid grid-cols-1 gap-2">
              {(Object.keys(MODE_INFO) as GameMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors text-left ${
                    mode === m
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className={mode === m ? 'text-primary' : 'text-muted-foreground'}>
                    {MODE_INFO[m].icon}
                  </div>
                  <div>
                    <div className="font-medium">{MODE_INFO[m].name}</div>
                    <div className="text-xs text-muted-foreground">{MODE_INFO[m].description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium mb-2">言語</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(LANGUAGE_INFO) as TypingLanguage[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    language === lang
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span>{LANGUAGE_INFO[lang].icon}</span>
                  <span>{LANGUAGE_INFO[lang].name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium mb-2">難易度</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(DIFFICULTY_INFO) as TypingDifficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    difficulty === d
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span className={DIFFICULTY_INFO[d].color}>{DIFFICULTY_INFO[d].name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input Type */}
          <div>
            <label className="block text-sm font-medium mb-2">入力タイプ</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(INPUT_TYPE_INFO) as InputType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setInputType(type)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors text-left ${
                    inputType === type
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span className="text-xl font-bold">{INPUT_TYPE_INFO[type].icon}</span>
                  <div>
                    <div className="font-medium">{INPUT_TYPE_INFO[type].name}</div>
                    <div className="text-xs text-muted-foreground">{INPUT_TYPE_INFO[type].description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sentence Category (文章モード時のみ) */}
          {inputType === 'sentence' && (
            <div>
              <label className="block text-sm font-medium mb-2">カテゴリ</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSentenceCategory(undefined)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    sentenceCategory === undefined
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  すべて
                </button>
                {(['quotes', 'proverb', 'daily', 'programming'] as SentenceCategory[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSentenceCategory(cat)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      sentenceCategory === cat
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 文章数設定 (文章モード時のみ) */}
          {inputType === 'sentence' && (
            <div>
              <label className="block text-sm font-medium mb-2">文章数: {itemCount}</label>
              <input
                type="range"
                min="5"
                max="20"
                step="5"
                value={itemCount}
                onChange={(e) => setItemCount(parseInt(e.target.value, 10))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5</span>
                <span>20</span>
              </div>
            </div>
          )}

          {/* Mode-specific settings */}
          {mode === 'time' && (
            <div>
              <label className="block text-sm font-medium mb-2">制限時間: {timeLimit}秒</label>
              <input
                type="range"
                min="30"
                max="120"
                step="15"
                value={timeLimit}
                onChange={(e) => setTimeLimit(parseInt(e.target.value, 10))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>30秒</span>
                <span>120秒</span>
              </div>
            </div>
          )}

          {mode === 'word_count' && (
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
          )}
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

        {/* Leaderboard Modal */}
        <AnimatePresence>
          <TypingLeaderboardModal
            isOpen={showLeaderboard}
            onClose={() => setShowLeaderboard(false)}
            leaderboard={leaderboard}
            leaderboardMode={leaderboardMode}
            setLeaderboardMode={setLeaderboardMode}
            leaderboardLanguage={leaderboardLanguage}
            setLeaderboardLanguage={setLeaderboardLanguage}
            period={period}
            setPeriod={setPeriod}
            isLoading={leaderboardLoading}
            isOnline={isOnline}
          />
        </AnimatePresence>
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
            {MODE_INFO[mode].name} / {LANGUAGE_INFO[language].name}
          </p>
        </div>
        <div className="flex gap-2">
          {/* BGMコントロール */}
          <BgmControl game="typing" isPlaying={isStarted && !isFinished} />
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

      {/* Progress bar / Timer */}
      <div className="w-full">
        {mode === 'time' ? (
          <div className="flex items-center gap-2">
            <Timer size={16} className={timeRemaining <= 10 ? 'text-red-500 animate-pulse' : ''} />
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${timeRemaining <= 10 ? 'bg-red-500' : 'bg-primary'}`}
                initial={{ width: '100%' }}
                animate={{ width: `${(timeRemaining / timeLimit) * 100}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
            <span className={`text-sm font-mono ${timeRemaining <= 10 ? 'text-red-500' : ''}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        ) : (
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="w-full flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          {mode !== 'time' && (
            <span className="flex items-center gap-1">
              <Timer size={16} />
              {formatTime(elapsedTime)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Keyboard size={16} />
            {stats.correctWords}/{stats.totalWords} 単語
          </span>
          {mode === 'sudden_death' && (
            <span className="flex items-center gap-1 text-red-500">
              <Skull size={16} />
              ミス厳禁
            </span>
          )}
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
              {/* 文章モード or 日本語モードの場合、表示テキストを上に表示 */}
              {(inputType === 'sentence' || language === 'ja' || language === 'mixed') && displayText !== targetText && (
                <p className={`font-bold mb-3 ${inputType === 'sentence' ? 'text-2xl md:text-3xl leading-relaxed' : 'text-3xl'}`}>
                  {displayText}
                </p>
              )}
              {/* 入力対象テキスト（ローマ字） */}
              <div className={`flex justify-center gap-0.5 font-mono flex-wrap ${inputType === 'sentence' ? 'text-2xl md:text-3xl' : 'text-4xl'}`}>
                {targetText.split('').map((char: string, index: number) => {
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
            {gameOverReason === 'mistake' ? (
              <>
                <Skull size={64} className="mx-auto mb-4 text-red-500" />
                <h2 className="text-3xl font-bold mb-2 text-red-500">ゲームオーバー</h2>
                <p className="text-muted-foreground mb-4">ミスタイプで終了...</p>
              </>
            ) : gameOverReason === 'time_up' ? (
              <>
                <Timer size={64} className="mx-auto mb-4 text-yellow-500" />
                <h2 className="text-3xl font-bold mb-2">タイムアップ！</h2>
              </>
            ) : (
              <>
                <Trophy size={64} className="mx-auto mb-4 text-yellow-500" />
                <h2 className="text-3xl font-bold mb-2">完了！</h2>
              </>
            )}

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

            <div className="flex justify-center gap-3 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  resetGame();
                  setShowNicknameInput(false);
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
                onClick={() => setShowLeaderboard(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-muted font-medium"
              >
                <Trophy size={18} />
                ランキング
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

      {/* Nickname input modal */}
      <AnimatePresence>
        {showNicknameInput && isFinished && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm"
            >
              <div className="text-center mb-4">
                <Medal className="mx-auto mb-2 text-yellow-500" size={40} />
                <h3 className="text-lg font-bold">ランキング入り！</h3>
                <p className="text-sm text-muted-foreground">
                  WPM: {stats.wpm} / 正確率: {stats.accuracy}%
                </p>
              </div>

              {user ? (
                <>
                  <div className="mb-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">登録名</p>
                    <p className="font-medium text-lg">{userNickname}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowNicknameInput(false)}
                      className="flex-1 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                    >
                      スキップ
                    </button>
                    <button
                      onClick={handleSubmitScore}
                      className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium"
                    >
                      登録
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4 p-4 bg-muted/50 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground">
                      ランキングに登録するにはログインが必要です
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowNicknameInput(false)}
                      className="flex-1 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                    >
                      閉じる
                    </button>
                    <button
                      onClick={() => { setShowNicknameInput(false); setShowAuthModal(true); }}
                      className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium"
                    >
                      ログイン
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Leaderboard Modal */}
      <AnimatePresence>
        <TypingLeaderboardModal
          isOpen={showLeaderboard}
          onClose={() => setShowLeaderboard(false)}
          leaderboard={leaderboard}
          leaderboardMode={leaderboardMode}
          setLeaderboardMode={setLeaderboardMode}
          leaderboardLanguage={leaderboardLanguage}
          setLeaderboardLanguage={setLeaderboardLanguage}
          period={period}
          setPeriod={setPeriod}
          isLoading={leaderboardLoading}
          isOnline={isOnline}
        />
      </AnimatePresence>

      {/* Achievement Toast */}
      {unlockedAchievement && (
        <AchievementToast
          achievement={unlockedAchievement}
          onClose={() => setUnlockedAchievement(null)}
        />
      )}

      {/* 認証モーダル */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
