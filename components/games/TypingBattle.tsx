'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Trophy, Timer, Keyboard, Flame, Zap } from 'lucide-react';
import { createSeededRandom } from '@/lib/seededRandom';
import { getWords, TypingWord, Language, Difficulty } from '@/lib/typing-words';
import { OpponentProgress, GameSettings, GameResult, StreakAttack, TypingAttackType } from '@/hooks/useTypingBattle';

interface TypingBattleProps {
  nickname: string;
  seed: number;
  settings: GameSettings;
  opponentProgress: OpponentProgress | null;
  winner: { id: string; nickname: string } | null;
  myPlayerId: string | null;
  onWordComplete: (wordIndex: number, correct: boolean, wpm: number, accuracy: number, correctChars: number, totalChars: number) => void;
  onGameFinished: (finalWpm: number, finalAccuracy: number, finishTime: number) => void;
  onLeave: () => void;
  results: GameResult[];
  activeAttacks?: StreakAttack[];
  myStreak?: number;
}

// Attack type display info
const ATTACK_INFO: Record<TypingAttackType, { label: string; color: string; icon: string }> = {
  blurWord: { label: 'ぼかし', color: 'text-blue-500', icon: '👁️' },
  scrambleWord: { label: 'シャッフル', color: 'text-purple-500', icon: '🔀' },
  addExtraWord: { label: '+1単語', color: 'text-red-500', icon: '➕' },
  speedUpTimer: { label: '加速', color: 'text-orange-500', icon: '⚡' },
  hideLetters: { label: '非表示', color: 'text-gray-500', icon: '🙈' },
};

interface GameState {
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
}

export function TypingBattle({
  nickname,
  seed,
  settings,
  opponentProgress,
  winner,
  myPlayerId: _myPlayerId,
  onWordComplete,
  onGameFinished,
  onLeave,
  results,
  activeAttacks = [],
  myStreak = 0,
}: TypingBattleProps) {
  const [gameState, setGameState] = useState<GameState>({
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
  });

  const [elapsedTime, setElapsedTime] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize game with seeded words
  useEffect(() => {
    const rng = createSeededRandom(seed);
    const wordList = getWords(settings.language as Language, settings.difficulty as Difficulty);
    const shuffledWords = rng.shuffle([...wordList]).slice(0, settings.wordCount);

    setGameState({
      words: shuffledWords,
      currentWordIndex: 0,
      currentInput: '',
      isStarted: false,
      isFinished: false,
      startTime: null,
      endTime: null,
      correctChars: 0,
      totalChars: 0,
      correctWords: 0,
    });

    // Focus input
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [seed, settings]);

  // Timer
  useEffect(() => {
    if (gameState.isStarted && !gameState.isFinished) {
      timerRef.current = setInterval(() => {
        if (gameState.startTime) {
          setElapsedTime(Math.floor((Date.now() - gameState.startTime) / 1000));
        }
      }, 100);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState.isStarted, gameState.isFinished, gameState.startTime]);

  // Calculate current stats
  const calculateStats = useCallback(() => {
    const elapsed = gameState.startTime ? (Date.now() - gameState.startTime) / 1000 : 0;
    const minutes = elapsed / 60;
    const wpm = minutes > 0 ? Math.round((gameState.correctChars / 5) / minutes) : 0;
    const accuracy = gameState.totalChars > 0
      ? Math.round((gameState.correctChars / gameState.totalChars) * 100)
      : 100;
    return { wpm, accuracy };
  }, [gameState.correctChars, gameState.totalChars, gameState.startTime]);

  // Handle input
  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    setGameState(prev => {
      if (prev.isFinished) return prev;

      const currentWord = prev.words[prev.currentWordIndex];
      if (!currentWord) return prev;

      const targetText = settings.language === 'ja' && currentWord.reading
        ? currentWord.reading
        : currentWord.text;

      // Start on first input
      const isStarted = prev.isStarted || input.length > 0;
      const startTime = prev.startTime || (isStarted ? Date.now() : null);

      // Check if word is complete
      if (input.endsWith(' ') || input === targetText) {
        const typedWord = input.trim();
        const isCorrect = typedWord === targetText;

        const newCorrectChars = prev.correctChars + (isCorrect ? targetText.length : 0);
        const newTotalChars = prev.totalChars + typedWord.length;
        const newCorrectWords = prev.correctWords + (isCorrect ? 1 : 0);

        const nextIndex = prev.currentWordIndex + 1;
        const elapsed = startTime ? (Date.now() - startTime) / 1000 : 0;
        const minutes = elapsed / 60;
        const currentWpm = minutes > 0 ? Math.round((newCorrectChars / 5) / minutes) : 0;
        const currentAccuracy = newTotalChars > 0
          ? Math.round((newCorrectChars / newTotalChars) * 100)
          : 100;

        // Send progress to server
        onWordComplete(nextIndex, isCorrect, currentWpm, currentAccuracy, newCorrectChars, newTotalChars);

        // Check if finished
        if (nextIndex >= prev.words.length) {
          const endTime = Date.now();
          const finishTime = startTime ? endTime - startTime : 0;

          // Send game finished to server
          setTimeout(() => {
            onGameFinished(currentWpm, currentAccuracy, finishTime);
          }, 0);

          return {
            ...prev,
            currentInput: '',
            currentWordIndex: nextIndex,
            correctChars: newCorrectChars,
            totalChars: newTotalChars,
            correctWords: newCorrectWords,
            isStarted,
            startTime,
            isFinished: true,
            endTime,
          };
        }

        return {
          ...prev,
          currentInput: '',
          currentWordIndex: nextIndex,
          correctChars: newCorrectChars,
          totalChars: newTotalChars,
          correctWords: newCorrectWords,
          isStarted,
          startTime,
        };
      }

      return { ...prev, currentInput: input, isStarted, startTime };
    });
  }, [settings.language, onWordComplete, onGameFinished]);

  // Get character status for display
  const getCharacterStatus = (charIndex: number, targetText: string): 'correct' | 'incorrect' | 'pending' => {
    if (charIndex >= gameState.currentInput.length) return 'pending';
    if (gameState.currentInput[charIndex] === targetText[charIndex]) return 'correct';
    return 'incorrect';
  };

  const { wpm, accuracy } = calculateStats();
  const currentWord = gameState.words[gameState.currentWordIndex];
  const targetText = currentWord
    ? (settings.language === 'ja' && currentWord.reading ? currentWord.reading : currentWord.text)
    : '';

  const myProgress = (gameState.currentWordIndex / gameState.words.length) * 100;
  const opponentProgressPercent = opponentProgress
    ? (opponentProgress.wordIndex / settings.wordCount) * 100
    : 0;

  // Show results if winner is declared
  if (winner) {
    const isWinner = winner.nickname === nickname;
    const myResult = results.find(r => r.nickname === nickname);
    const opponentResult = results.find(r => r.nickname !== nickname);

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
            <p className="text-muted-foreground">勝者: {winner.nickname}</p>
          </div>

          {/* Results comparison */}
          {(myResult || gameState.isFinished) && (
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-medium mb-3">結果</h3>
              <div className="grid grid-cols-5 gap-2 text-sm">
                <div></div>
                <div className="text-center font-medium">WPM</div>
                <div className="text-center font-medium">精度</div>
                <div className="text-center font-medium">最大連続</div>
                <div className="text-center font-medium">攻撃</div>

                <div className="text-left font-medium">{nickname} (あなた)</div>
                <div className="text-center text-primary font-bold">{myResult?.wpm || wpm}</div>
                <div className="text-center">{myResult?.accuracy || accuracy}%</div>
                <div className="text-center">
                  {myResult?.maxStreak ? (
                    <span className="flex items-center justify-center gap-1">
                      <Flame className="w-3 h-3 text-orange-500" />
                      {myResult.maxStreak}
                    </span>
                  ) : '-'}
                </div>
                <div className="text-center">{myResult?.attacksSent || 0}</div>

                {opponentResult && (
                  <>
                    <div className="text-left text-muted-foreground">{opponentResult.nickname}</div>
                    <div className="text-center text-muted-foreground">{opponentResult.wpm}</div>
                    <div className="text-center text-muted-foreground">{opponentResult.accuracy}%</div>
                    <div className="text-center text-muted-foreground">
                      {opponentResult.maxStreak ? (
                        <span className="flex items-center justify-center gap-1">
                          <Flame className="w-3 h-3 text-orange-500" />
                          {opponentResult.maxStreak}
                        </span>
                      ) : '-'}
                    </div>
                    <div className="text-center text-muted-foreground">{opponentResult.attacksSent || 0}</div>
                  </>
                )}
              </div>
            </div>
          )}

          <button
            onClick={onLeave}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
          >
            ロビーに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onLeave}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          退出
        </button>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-muted-foreground" />
            <span className="font-mono">{elapsedTime}s</span>
          </div>
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-muted-foreground" />
            <span className="font-mono">{wpm} WPM</span>
          </div>
        </div>
      </div>

      {/* Progress bars */}
      <div className="space-y-3 mb-8">
        {/* My progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-primary">{nickname} (あなた)</span>
            <span className="text-muted-foreground">{gameState.currentWordIndex}/{gameState.words.length}</span>
          </div>
          <div className="h-4 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${myProgress}%` }}
            />
          </div>
        </div>

        {/* Opponent progress */}
        {opponentProgress && (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-orange-500">{opponentProgress.nickname}</span>
                {opponentProgress.streak && opponentProgress.streak >= 3 && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-500/20 rounded-full text-xs text-orange-500 animate-pulse">
                    <Flame className="w-3 h-3" />
                    {opponentProgress.streak}連続
                  </span>
                )}
              </div>
              <span className="text-muted-foreground">
                {opponentProgress.wordIndex}/{settings.wordCount}
                {opponentProgress.isFinished && ' (完了)'}
              </span>
            </div>
            <div className="h-4 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  opponentProgress.isFinished ? 'bg-green-500' : 'bg-orange-500'
                }`}
                style={{ width: `${opponentProgressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* My streak display */}
        {myStreak >= 3 && (
          <div className="flex items-center justify-center gap-2 py-2">
            <div className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-full animate-streak-pulse">
              <Flame className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-bold text-yellow-500">{myStreak}連続ストリーク!</span>
              {myStreak >= 10 && <Zap className="w-4 h-4 text-yellow-500" />}
            </div>
          </div>
        )}
      </div>

      {/* Active attacks overlay */}
      {activeAttacks.length > 0 && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2">
          {activeAttacks.map((attack, index) => {
            const info = ATTACK_INFO[attack.type];
            return (
              <div
                key={`${attack.receivedAt}-${index}`}
                className={`flex items-center gap-2 px-4 py-2 bg-red-500/90 text-white rounded-lg shadow-lg animate-receive-attack`}
              >
                <span className="text-lg">{info.icon}</span>
                <span className="font-medium">{info.label}攻撃!</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Main typing area */}
      <div className={`flex-1 flex flex-col items-center justify-center ${activeAttacks.some(a => a.type === 'blurWord') ? 'blur-word' : ''}`}>
        {gameState.isFinished ? (
          <div className="text-center space-y-4">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto" />
            <h2 className="text-2xl font-bold">完了!</h2>
            <div className="text-muted-foreground">
              <p>WPM: {wpm}</p>
              <p>精度: {accuracy}%</p>
            </div>
            <p className="text-sm text-muted-foreground">相手の結果を待っています...</p>
          </div>
        ) : (
          <div className="w-full max-w-2xl space-y-8">
            {/* Word display */}
            <div className="text-center space-y-2">
              {settings.language === 'ja' && currentWord && (
                <div className="text-2xl text-muted-foreground">
                  {currentWord.text}
                </div>
              )}
              <div className="text-4xl font-mono tracking-wider">
                {targetText.split('').map((char, i) => {
                  const status = getCharacterStatus(i, targetText);
                  return (
                    <span
                      key={i}
                      className={
                        status === 'correct' ? 'text-green-500' :
                        status === 'incorrect' ? 'text-red-500 bg-red-500/20' :
                        'text-foreground'
                      }
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
              value={gameState.currentInput}
              onChange={handleInput}
              className="w-full px-6 py-4 bg-card border border-border rounded-lg text-center text-2xl font-mono focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={gameState.isStarted ? '' : 'ここに入力...'}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />

            {/* Stats */}
            <div className="flex justify-center gap-8 text-sm text-muted-foreground">
              <div>正解: {gameState.correctWords}/{gameState.currentWordIndex}</div>
              <div>精度: {accuracy}%</div>
            </div>
          </div>
        )}
      </div>

      {/* Opponent status bar (sticky bottom) */}
      {opponentProgress && !gameState.isFinished && (
        <div className="fixed bottom-4 left-4 right-4 bg-card/90 backdrop-blur border border-border rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center relative">
              <span className="text-orange-500 text-sm font-bold">
                {opponentProgress.nickname.charAt(0).toUpperCase()}
              </span>
              {opponentProgress.streak && opponentProgress.streak >= 3 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                  <Flame className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{opponentProgress.nickname}</span>
                {opponentProgress.streak && opponentProgress.streak >= 5 && (
                  <span className="px-1.5 py-0.5 bg-orange-500/20 rounded text-xs text-orange-500 font-bold">
                    🔥{opponentProgress.streak}
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {opponentProgress.wpm} WPM / {opponentProgress.accuracy}%
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono font-bold">
              {opponentProgress.wordIndex}/{settings.wordCount}
            </div>
            {opponentProgress.isFinished && (
              <div className="text-xs text-green-500">完了!</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
