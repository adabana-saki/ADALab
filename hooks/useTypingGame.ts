'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  TypingWord,
  TypingDifficulty as WordDifficulty,
  getRandomWords,
} from '@/lib/typing-words-extended';
import { getSoundEngine } from '@/lib/sound-engine';

// 新しいゲームモード
export type GameMode = 'time' | 'sudden_death' | 'word_count';

// 言語モード（mixedを含む）
export type TypingLanguage = 'en' | 'ja' | 'mixed';

// 難易度
export type TypingDifficulty = WordDifficulty;

export interface TypingStats {
  wpm: number;
  accuracy: number;
  correctChars: number;
  totalChars: number;
  correctWords: number;
  totalWords: number;
  mistakes: number;
}

export interface GameState {
  words: TypingWord[];
  currentWordIndex: number;
  currentInput: string;
  isStarted: boolean;
  isFinished: boolean;
  startTime: number | null;
  endTime: number | null;
  correctChars: number;
  totalChars: number;
  correctWords: number;
  mistakes: number;
  gameOverReason?: 'completed' | 'time_up' | 'mistake';
}

interface UseTypingGameOptions {
  language: TypingLanguage;
  difficulty: TypingDifficulty;
  mode: GameMode;
  wordCount?: number; // word_count モード用
  timeLimit?: number; // time モード用（秒）
  onWordComplete?: (correct: boolean) => void;
  onMistake?: () => void;
  onGameEnd?: (stats: TypingStats) => void;
}

const HIGH_SCORE_KEY = 'adalab-typing-v2';

// モード別デフォルト値
const MODE_DEFAULTS = {
  time: { timeLimit: 60, wordCount: 100 },
  sudden_death: { timeLimit: 0, wordCount: 50 },
  word_count: { timeLimit: 0, wordCount: 30 },
};

export function useTypingGame(options: UseTypingGameOptions) {
  const {
    language,
    difficulty,
    mode,
    wordCount = MODE_DEFAULTS[mode].wordCount,
    timeLimit = MODE_DEFAULTS[mode].timeLimit,
    onWordComplete,
    onMistake,
    onGameEnd,
  } = options;

  const [gameState, setGameState] = useState<GameState>(() => ({
    words: [],
    currentWordIndex: 0,
    currentInput: '',
    isStarted: false,
    isFinished: false,
    startTime: null,
    endTime: null,
    correctChars: 0,
    totalChars: 0,
    correctWords: 0,
    mistakes: 0,
  }));

  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [highScores, setHighScores] = useState<Record<string, { wpm: number; accuracy: number }>>({});
  const timerRef = useRef<number | null>(null);
  const soundEngine = useRef(typeof window !== 'undefined' ? getSoundEngine() : null);

  // ハイスコアキー生成
  const getHighScoreKey = useCallback(() => {
    return `${language}-${difficulty}-${mode}`;
  }, [language, difficulty, mode]);

  // ハイスコア読み込み
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(HIGH_SCORE_KEY);
        if (stored) {
          setHighScores(JSON.parse(stored));
        }
      } catch {
        // ignore
      }
    }
  }, []);

  // 現在のハイスコア取得
  const currentHighScore = highScores[getHighScoreKey()] || { wpm: 0, accuracy: 0 };

  // ゲーム初期化
  const initGame = useCallback(() => {
    // getRandomWords accepts 'en' | 'ja' | 'mixed' for language
    const wordList = getRandomWords(language, difficulty, wordCount);

    setGameState({
      words: wordList,
      currentWordIndex: 0,
      currentInput: '',
      isStarted: false,
      isFinished: false,
      startTime: null,
      endTime: null,
      correctChars: 0,
      totalChars: 0,
      correctWords: 0,
      mistakes: 0,
    });
    setTimeRemaining(timeLimit);
  }, [language, difficulty, wordCount, timeLimit]);

  // 初期化
  useEffect(() => {
    initGame();
  }, [initGame]);

  // タイマー（time モード）
  useEffect(() => {
    if (gameState.isStarted && !gameState.isFinished && mode === 'time' && timeLimit > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            finishGame('time_up');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.isStarted, gameState.isFinished, mode, timeLimit]);

  // 統計計算
  const calculateStats = useCallback((): TypingStats => {
    const { correctChars, totalChars, correctWords, mistakes, startTime, endTime, words, currentWordIndex } = gameState;
    const elapsed = startTime && endTime ? (endTime - startTime) / 1000 : 0;
    const minutes = elapsed / 60;

    // WPM = (characters / 5) / minutes
    const wpm = minutes > 0 ? Math.round((correctChars / 5) / minutes) : 0;
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;

    return {
      wpm,
      accuracy,
      correctChars,
      totalChars,
      correctWords,
      totalWords: mode === 'word_count' ? words.length : currentWordIndex,
      mistakes,
    };
  }, [gameState, mode]);

  // ゲーム終了
  const finishGame = useCallback((reason: 'completed' | 'time_up' | 'mistake' = 'completed') => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setGameState((prev) => {
      if (prev.isFinished) return prev;

      const endTime = Date.now();
      return { ...prev, isFinished: true, endTime, gameOverReason: reason };
    });

    // 効果音
    if (reason === 'completed') {
      soundEngine.current?.success();
    } else if (reason === 'mistake') {
      soundEngine.current?.gameOver();
    } else {
      soundEngine.current?.typingTimeUp();
    }
  }, []);

  // ゲーム終了時の処理
  useEffect(() => {
    if (gameState.isFinished && gameState.endTime) {
      const stats = calculateStats();

      // ハイスコア保存
      if (typeof window !== 'undefined') {
        const key = getHighScoreKey();
        const currentBest = highScores[key] || { wpm: 0, accuracy: 0 };

        if (stats.wpm > currentBest.wpm || stats.accuracy > currentBest.accuracy) {
          const newHighScores = {
            ...highScores,
            [key]: {
              wpm: Math.max(stats.wpm, currentBest.wpm),
              accuracy: Math.max(stats.accuracy, currentBest.accuracy),
            },
          };
          setHighScores(newHighScores);
          localStorage.setItem(HIGH_SCORE_KEY, JSON.stringify(newHighScores));
        }
      }

      onGameEnd?.(stats);
    }
  }, [gameState.isFinished, gameState.endTime, calculateStats, getHighScoreKey, highScores, onGameEnd]);

  // 入力処理
  const handleInput = useCallback((input: string) => {
    setGameState((prev) => {
      if (prev.isFinished) return prev;

      const currentWord = prev.words[prev.currentWordIndex];
      if (!currentWord) return prev;

      // 対象テキスト（日本語はローマ字読み）
      const targetText = currentWord.reading || currentWord.text;

      // ゲーム開始
      const isStarted = prev.isStarted || input.length > 0;
      const startTime = prev.startTime || (isStarted ? Date.now() : null);

      // sudden_death モード：間違えたら即終了
      if (mode === 'sudden_death' && input.length > 0) {
        const lastCharIndex = input.length - 1;
        if (input[lastCharIndex] !== targetText[lastCharIndex]) {
          soundEngine.current?.typingMiss();
          onMistake?.();

          // 次のtickで終了
          setTimeout(() => finishGame('mistake'), 10);

          return {
            ...prev,
            currentInput: input,
            isStarted,
            startTime,
            mistakes: prev.mistakes + 1,
            totalChars: prev.totalChars + 1,
          };
        }
      }

      // 単語完了チェック
      if (input.endsWith(' ') || input === targetText) {
        const typedWord = input.trim();
        const isCorrect = typedWord === targetText;

        const newCorrectChars = prev.correctChars + (isCorrect ? targetText.length : 0);
        const newTotalChars = prev.totalChars + typedWord.length;
        const newCorrectWords = prev.correctWords + (isCorrect ? 1 : 0);
        const newMistakes = prev.mistakes + (isCorrect ? 0 : 1);

        // 効果音
        if (isCorrect) {
          soundEngine.current?.typingWordComplete();
        } else {
          soundEngine.current?.typingMiss();
        }

        onWordComplete?.(isCorrect);

        const nextIndex = prev.currentWordIndex + 1;

        // ゲーム終了チェック
        if (nextIndex >= prev.words.length) {
          return {
            ...prev,
            currentInput: '',
            currentWordIndex: nextIndex,
            correctChars: newCorrectChars,
            totalChars: newTotalChars,
            correctWords: newCorrectWords,
            mistakes: newMistakes,
            isStarted,
            startTime,
            isFinished: true,
            endTime: Date.now(),
            gameOverReason: 'completed',
          };
        }

        return {
          ...prev,
          currentInput: '',
          currentWordIndex: nextIndex,
          correctChars: newCorrectChars,
          totalChars: newTotalChars,
          correctWords: newCorrectWords,
          mistakes: newMistakes,
          isStarted,
          startTime,
        };
      }

      // リアルタイム入力チェック（効果音）
      if (input.length > prev.currentInput.length) {
        const lastIndex = input.length - 1;
        if (input[lastIndex] === targetText[lastIndex]) {
          soundEngine.current?.typingCorrect();
        } else if (mode !== 'sudden_death') {
          soundEngine.current?.typingMiss();
        }
      }

      return { ...prev, currentInput: input, isStarted, startTime };
    });
  }, [mode, onWordComplete, onMistake, finishGame]);

  // 現在の単語
  const currentWord = gameState.words[gameState.currentWordIndex];
  const targetText = currentWord
    ? (currentWord.reading || currentWord.text)
    : '';

  // 文字ステータス取得
  const getCharacterStatus = useCallback((charIndex: number): 'correct' | 'incorrect' | 'pending' => {
    if (charIndex >= gameState.currentInput.length) return 'pending';
    if (gameState.currentInput[charIndex] === targetText[charIndex]) return 'correct';
    return 'incorrect';
  }, [gameState.currentInput, targetText]);

  // 経過時間
  const elapsedTime = gameState.startTime
    ? Math.floor((gameState.endTime || Date.now()) - gameState.startTime) / 1000
    : 0;

  // リアルタイム統計
  const liveStats = (): TypingStats => {
    const elapsed = elapsedTime;
    const minutes = elapsed / 60;
    const { correctChars, totalChars, correctWords, mistakes, words, currentWordIndex } = gameState;

    const wpm = minutes > 0 ? Math.round((correctChars / 5) / minutes) : 0;
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;

    return {
      wpm,
      accuracy,
      correctChars,
      totalChars,
      correctWords,
      totalWords: mode === 'word_count' ? words.length : currentWordIndex,
      mistakes,
    };
  };

  return {
    // State
    words: gameState.words,
    currentWordIndex: gameState.currentWordIndex,
    currentWord,
    currentInput: gameState.currentInput,
    targetText,
    isStarted: gameState.isStarted,
    isFinished: gameState.isFinished,
    gameOverReason: gameState.gameOverReason,
    timeRemaining,
    elapsedTime,
    progress: gameState.words.length > 0
      ? Math.round((gameState.currentWordIndex / gameState.words.length) * 100)
      : 0,
    highWpm: currentHighScore.wpm,
    bestAccuracy: currentHighScore.accuracy,

    // Stats
    stats: gameState.isFinished ? calculateStats() : liveStats(),

    // Actions
    handleInput,
    resetGame: initGame,
    getCharacterStatus,
  };
}
