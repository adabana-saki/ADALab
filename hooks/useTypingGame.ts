'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  TypingWord,
  TypingDifficulty as WordDifficulty,
  getRandomWords,
} from '@/lib/typing-words-extended';
import {
  TypingSentence,
  SentenceCategory,
  SentenceDifficulty,
  getRandomSentences,
} from '@/lib/typing-sentences';
import { getSoundEngine } from '@/lib/sound-engine';
import { matchPartialRomaji, getFirstRomajiPattern } from '@/lib/romaji-converter';

// 新しいゲームモード
export type GameMode = 'time' | 'sudden_death' | 'word_count';

// 入力タイプ（単語 or 文章）
export type InputType = 'word' | 'sentence';

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

// 統一されたアイテム型（単語 or 文章）
export type TypingItem = TypingWord | TypingSentence;

export interface GameState {
  items: TypingItem[];
  currentItemIndex: number;
  currentInput: string;
  isStarted: boolean;
  isFinished: boolean;
  startTime: number | null;
  endTime: number | null;
  correctChars: number;
  totalChars: number;
  correctItems: number;
  mistakes: number;
  gameOverReason?: 'completed' | 'time_up' | 'mistake';
}

interface UseTypingGameOptions {
  language: TypingLanguage;
  difficulty: TypingDifficulty;
  mode: GameMode;
  inputType?: InputType; // 単語 or 文章モード
  itemCount?: number; // アイテム数
  wordCount?: number; // 後方互換性のため残す
  timeLimit?: number; // time モード用（秒）
  sentenceCategory?: SentenceCategory; // 文章モード用カテゴリ
  onWordComplete?: (correct: boolean) => void;
  onItemComplete?: (correct: boolean) => void;
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
    inputType = 'word',
    itemCount,
    wordCount = MODE_DEFAULTS[mode].wordCount,
    timeLimit = MODE_DEFAULTS[mode].timeLimit,
    sentenceCategory,
    onWordComplete,
    onItemComplete,
    onMistake,
    onGameEnd,
  } = options;

  // アイテム数の決定（itemCount > wordCount の優先順）
  const count = itemCount ?? wordCount;

  const [gameState, setGameState] = useState<GameState>(() => ({
    items: [],
    currentItemIndex: 0,
    currentInput: '',
    isStarted: false,
    isFinished: false,
    startTime: null,
    endTime: null,
    correctChars: 0,
    totalChars: 0,
    correctItems: 0,
    mistakes: 0,
  }));

  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [highScores, setHighScores] = useState<Record<string, { wpm: number; accuracy: number }>>({});
  const timerRef = useRef<number | null>(null);
  const soundEngine = useRef(typeof window !== 'undefined' ? getSoundEngine() : null);

  // ハイスコアキー生成
  const getHighScoreKey = useCallback(() => {
    return `${language}-${difficulty}-${mode}-${inputType}`;
  }, [language, difficulty, mode, inputType]);

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
    let itemList: TypingItem[];

    if (inputType === 'sentence') {
      // 文章モード
      itemList = getRandomSentences(language, count, {
        category: sentenceCategory,
        difficulty: difficulty as SentenceDifficulty,
      });
    } else {
      // 単語モード（従来の動作）
      itemList = getRandomWords(language, difficulty, count);
    }

    setGameState({
      items: itemList,
      currentItemIndex: 0,
      currentInput: '',
      isStarted: false,
      isFinished: false,
      startTime: null,
      endTime: null,
      correctChars: 0,
      totalChars: 0,
      correctItems: 0,
      mistakes: 0,
    });
    setTimeRemaining(timeLimit);
  }, [language, difficulty, count, timeLimit, inputType, sentenceCategory]);

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
    const { correctChars, totalChars, correctItems, mistakes, startTime, endTime, items, currentItemIndex } = gameState;
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
      correctWords: correctItems,
      totalWords: mode === 'word_count' ? items.length : currentItemIndex,
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

      const currentItem = prev.items[prev.currentItemIndex];
      if (!currentItem) return prev;

      // 日本語判定（readingまたはhiraganaがあれば日本語）
      const isJapanese = !!currentItem.reading || !!(currentItem as { hiragana?: string }).hiragana;
      // ひらがなテキスト（hiraganaフィールド優先、なければtextを使用）
      const hiraganaText = isJapanese
        ? ((currentItem as { hiragana?: string }).hiragana || currentItem.text)
        : '';
      // 対象テキスト（フォールバック用：日本語はローマ字読み、英語はそのまま）
      const targetText = currentItem.reading || currentItem.text;

      // ゲーム開始
      const isStarted = prev.isStarted || input.length > 0;
      const startTime = prev.startTime || (isStarted ? Date.now() : null);

      // 日本語のローマ字マッチング
      const romajiMatch = isJapanese ? matchPartialRomaji(hiraganaText, input) : null;

      // sudden_death モード：間違えたら即終了
      if (mode === 'sudden_death' && input.length > 0) {
        // 日本語: ローマ字マッチング / 英語: 文字比較
        const isInputValid = isJapanese
          ? (romajiMatch?.isValid ?? false)
          : input[input.length - 1] === targetText[input.length - 1];

        if (!isInputValid) {
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

      // アイテム完了チェック
      const isWordMode = inputType === 'word';
      let shouldComplete = false;
      let isCorrect = false;

      if (isJapanese) {
        // 日本語: ローマ字マッチングで完了判定
        if (romajiMatch?.isComplete) {
          shouldComplete = true;
          isCorrect = true;
        } else if (isWordMode && input.endsWith(' ')) {
          // スペースで強制次へ（間違い扱い）
          shouldComplete = true;
          isCorrect = false;
        }
      } else {
        // 英語: 従来の判定
        shouldComplete = isWordMode
          ? (input.endsWith(' ') || input === targetText)
          : (input === targetText);
        if (shouldComplete) {
          const typedText = input.trim();
          isCorrect = typedText === targetText;
        }
      }

      if (shouldComplete) {
        const typedText = input.trim();
        const newCorrectChars = prev.correctChars + (isCorrect ? targetText.length : 0);
        const newTotalChars = prev.totalChars + typedText.length;
        const newCorrectItems = prev.correctItems + (isCorrect ? 1 : 0);
        const newMistakes = prev.mistakes + (isCorrect ? 0 : 1);

        // 効果音
        if (isCorrect) {
          soundEngine.current?.typingWordComplete();
        } else {
          soundEngine.current?.typingMiss();
        }

        onWordComplete?.(isCorrect);
        onItemComplete?.(isCorrect);

        const nextIndex = prev.currentItemIndex + 1;

        // ゲーム終了チェック
        if (nextIndex >= prev.items.length) {
          return {
            ...prev,
            currentInput: '',
            currentItemIndex: nextIndex,
            correctChars: newCorrectChars,
            totalChars: newTotalChars,
            correctItems: newCorrectItems,
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
          currentItemIndex: nextIndex,
          correctChars: newCorrectChars,
          totalChars: newTotalChars,
          correctItems: newCorrectItems,
          mistakes: newMistakes,
          isStarted,
          startTime,
        };
      }

      // リアルタイム入力チェック（効果音）
      if (input.length > prev.currentInput.length) {
        let isLastCharCorrect = false;

        if (isJapanese) {
          // 日本語: ローマ字マッチングで判定
          isLastCharCorrect = romajiMatch?.isValid ?? false;
        } else {
          // 英語: 従来の文字比較
          const lastIndex = input.length - 1;
          isLastCharCorrect = input[lastIndex] === targetText[lastIndex];
        }

        if (isLastCharCorrect) {
          soundEngine.current?.typingCorrect();
        } else if (mode !== 'sudden_death') {
          soundEngine.current?.typingMiss();
        }
      }

      return { ...prev, currentInput: input, isStarted, startTime };
    });
  }, [mode, inputType, onWordComplete, onItemComplete, onMistake, finishGame]);

  // 現在のアイテム
  const currentItem = gameState.items[gameState.currentItemIndex];
  const isJapanese = currentItem
    ? (!!currentItem.reading || !!(currentItem as { hiragana?: string }).hiragana)
    : false;
  const hiraganaText = isJapanese && currentItem
    ? ((currentItem as { hiragana?: string }).hiragana || currentItem.text)
    : '';

  // ローマ字マッチング結果（日本語の場合）
  const currentRomajiMatch = isJapanese
    ? matchPartialRomaji(hiraganaText, gameState.currentInput)
    : null;

  // ターゲットテキスト（日本語の場合は動的に生成）
  const targetText = (() => {
    if (!currentItem) return '';
    if (!isJapanese) return currentItem.text;
    // 日本語: 現在の入力パターンに基づいて残りのローマ字を生成
    if (currentRomajiMatch) {
      // 確定した入力 + 残りのひらがなの第一ローマ字パターン
      const confirmedInput = currentRomajiMatch.confirmedInput;
      const remainingHiragana = hiraganaText.slice(currentRomajiMatch.matchedHiragana);
      const remainingRomaji = getFirstRomajiPattern(remainingHiragana);
      return confirmedInput + remainingRomaji;
    }
    return currentItem.reading || currentItem.text;
  })();

  // 文字ステータス取得
  const getCharacterStatus = useCallback((charIndex: number): 'correct' | 'incorrect' | 'pending' => {
    if (charIndex >= gameState.currentInput.length) return 'pending';

    if (isJapanese && currentRomajiMatch) {
      // 日本語: ローマ字マッチング結果に基づく
      if (currentRomajiMatch.isValid) {
        // 入力が有効なら、入力済み部分はすべて正解
        return 'correct';
      } else {
        // 無効な場合、最後の文字が間違い
        return charIndex === gameState.currentInput.length - 1 ? 'incorrect' : 'correct';
      }
    }

    // 英語: 従来の文字比較
    if (gameState.currentInput[charIndex] === targetText[charIndex]) return 'correct';
    return 'incorrect';
  }, [gameState.currentInput, targetText, isJapanese, currentRomajiMatch]);

  // 経過時間
  const elapsedTime = gameState.startTime
    ? Math.floor((gameState.endTime || Date.now()) - gameState.startTime) / 1000
    : 0;

  // リアルタイム統計
  const liveStats = (): TypingStats => {
    const elapsed = elapsedTime;
    const minutes = elapsed / 60;
    const { correctChars, totalChars, correctItems, mistakes, items, currentItemIndex } = gameState;

    const wpm = minutes > 0 ? Math.round((correctChars / 5) / minutes) : 0;
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;

    return {
      wpm,
      accuracy,
      correctChars,
      totalChars,
      correctWords: correctItems,
      totalWords: mode === 'word_count' ? items.length : currentItemIndex,
      mistakes,
    };
  };

  return {
    // State
    items: gameState.items,
    words: gameState.items, // 後方互換性
    currentItemIndex: gameState.currentItemIndex,
    currentWordIndex: gameState.currentItemIndex, // 後方互換性
    currentItem,
    currentWord: currentItem, // 後方互換性
    currentInput: gameState.currentInput,
    targetText,
    displayText: currentItem?.text || '', // 表示用テキスト（日本語の場合はかな/漢字）
    isStarted: gameState.isStarted,
    isFinished: gameState.isFinished,
    gameOverReason: gameState.gameOverReason,
    timeRemaining,
    elapsedTime,
    progress: gameState.items.length > 0
      ? Math.round((gameState.currentItemIndex / gameState.items.length) * 100)
      : 0,
    highWpm: currentHighScore.wpm,
    bestAccuracy: currentHighScore.accuracy,
    inputType,

    // Stats
    stats: gameState.isFinished ? calculateStats() : liveStats(),

    // Actions
    handleInput,
    resetGame: initGame,
    getCharacterStatus,
  };
}
