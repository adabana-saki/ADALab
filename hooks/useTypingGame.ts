'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  TypingWord,
  Language,
  Difficulty,
  getWords,
  getProgrammingWords,
  shuffleArray,
} from '@/lib/typing-words';

export type GameMode = 'standard' | 'programming';

export interface TypingStats {
  wpm: number;
  accuracy: number;
  correctChars: number;
  totalChars: number;
  correctWords: number;
  totalWords: number;
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
}

interface UseTypingGameOptions {
  language: Language;
  difficulty: Difficulty;
  mode: GameMode;
  wordCount?: number;
  timeLimit?: number; // seconds, 0 = no limit
  onWordComplete?: (correct: boolean) => void;
  onGameEnd?: (stats: TypingStats) => void;
}

const HIGH_SCORE_KEY = 'adalab-typing-high-wpm';
const BEST_ACCURACY_KEY = 'adalab-typing-best-accuracy';

export function useTypingGame(options: UseTypingGameOptions) {
  const {
    language,
    difficulty,
    mode,
    wordCount = 20,
    timeLimit = 0,
    onWordComplete,
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
  const [highWpm, setHighWpm] = useState(0);
  const [bestAccuracy, setBestAccuracy] = useState(0);
  const timerRef = useRef<number | null>(null);

  // Load high scores
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedWpm = localStorage.getItem(HIGH_SCORE_KEY);
      const storedAccuracy = localStorage.getItem(BEST_ACCURACY_KEY);
      if (storedWpm) setHighWpm(parseInt(storedWpm, 10) || 0);
      if (storedAccuracy) setBestAccuracy(parseFloat(storedAccuracy) || 0);
    }
  }, []);

  // Initialize game
  const initGame = useCallback(() => {
    let wordList: TypingWord[];
    if (mode === 'programming') {
      wordList = shuffleArray(getProgrammingWords()).slice(0, wordCount);
    } else {
      wordList = shuffleArray(getWords(language, difficulty)).slice(0, wordCount);
    }

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
  }, [language, difficulty, mode, wordCount, timeLimit]);

  // Initialize on mount and when options change
  useEffect(() => {
    initGame();
  }, [initGame]);

  // Timer for time-limited games
  useEffect(() => {
    if (gameState.isStarted && !gameState.isFinished && timeLimit > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            finishGame();
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
  }, [gameState.isStarted, gameState.isFinished, timeLimit]);

  // Calculate stats
  const calculateStats = useCallback((): TypingStats => {
    const { correctChars, totalChars, correctWords, startTime, endTime } = gameState;
    const elapsed = startTime && endTime ? (endTime - startTime) / 1000 : 0;
    const minutes = elapsed / 60;

    // WPM = (characters / 5) / minutes
    const wpm = minutes > 0 ? Math.round((correctChars / 5) / minutes) : 0;
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0;

    return {
      wpm,
      accuracy,
      correctChars,
      totalChars,
      correctWords,
      totalWords: gameState.words.length,
    };
  }, [gameState]);

  // Finish game
  const finishGame = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setGameState((prev) => {
      if (prev.isFinished) return prev;

      const endTime = Date.now();
      const newState = { ...prev, isFinished: true, endTime };

      return newState;
    });
  }, []);

  // Handle game end effects
  useEffect(() => {
    if (gameState.isFinished && gameState.endTime) {
      const stats = calculateStats();

      // Save high scores
      if (typeof window !== 'undefined') {
        if (stats.wpm > highWpm) {
          setHighWpm(stats.wpm);
          localStorage.setItem(HIGH_SCORE_KEY, stats.wpm.toString());
        }
        if (stats.accuracy > bestAccuracy) {
          setBestAccuracy(stats.accuracy);
          localStorage.setItem(BEST_ACCURACY_KEY, stats.accuracy.toString());
        }
      }

      onGameEnd?.(stats);
    }
  }, [gameState.isFinished, gameState.endTime, calculateStats, highWpm, bestAccuracy, onGameEnd]);

  // Handle input change
  const handleInput = useCallback((input: string) => {
    setGameState((prev) => {
      if (prev.isFinished) return prev;

      const currentWord = prev.words[prev.currentWordIndex];
      if (!currentWord) return prev;

      // Get the target text (reading for Japanese, text for English)
      const targetText = language === 'ja' && currentWord.reading
        ? currentWord.reading
        : currentWord.text;

      // Start game on first input
      const isStarted = prev.isStarted || input.length > 0;
      const startTime = prev.startTime || (isStarted ? Date.now() : null);

      // Check if word is complete
      if (input.endsWith(' ') || input === targetText) {
        const typedWord = input.trim();
        const isCorrect = typedWord === targetText;

        const newCorrectChars = prev.correctChars + (isCorrect ? targetText.length : 0);
        const newTotalChars = prev.totalChars + typedWord.length;
        const newCorrectWords = prev.correctWords + (isCorrect ? 1 : 0);
        const newMistakes = prev.mistakes + (isCorrect ? 0 : 1);

        onWordComplete?.(isCorrect);

        const nextIndex = prev.currentWordIndex + 1;

        // Check if game is finished
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

      return { ...prev, currentInput: input, isStarted, startTime };
    });
  }, [language, onWordComplete]);

  // Get current word
  const currentWord = gameState.words[gameState.currentWordIndex];
  const targetText = currentWord
    ? (language === 'ja' && currentWord.reading ? currentWord.reading : currentWord.text)
    : '';

  // Check character correctness
  const getCharacterStatus = useCallback((charIndex: number): 'correct' | 'incorrect' | 'pending' => {
    if (charIndex >= gameState.currentInput.length) return 'pending';
    if (gameState.currentInput[charIndex] === targetText[charIndex]) return 'correct';
    return 'incorrect';
  }, [gameState.currentInput, targetText]);

  // Calculate elapsed time
  const elapsedTime = gameState.startTime
    ? Math.floor((gameState.endTime || Date.now()) - gameState.startTime) / 1000
    : 0;

  // Live WPM calculation
  const liveStats = (): TypingStats => {
    const elapsed = elapsedTime;
    const minutes = elapsed / 60;
    const { correctChars, totalChars, correctWords } = gameState;

    const wpm = minutes > 0 ? Math.round((correctChars / 5) / minutes) : 0;
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;

    return {
      wpm,
      accuracy,
      correctChars,
      totalChars,
      correctWords,
      totalWords: gameState.words.length,
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
    timeRemaining,
    elapsedTime,
    progress: gameState.words.length > 0
      ? Math.round((gameState.currentWordIndex / gameState.words.length) * 100)
      : 0,
    highWpm,
    bestAccuracy,

    // Stats
    stats: gameState.isFinished ? calculateStats() : liveStats(),

    // Actions
    handleInput,
    resetGame: initGame,
    getCharacterStatus,
  };
}
