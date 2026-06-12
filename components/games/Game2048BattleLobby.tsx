'use client';

import { useState, useEffect } from 'react';
import { use2048Battle, OpponentState, GameSettings, GameResult } from '@/hooks/use2048Battle';
import { Game2048Battle } from './Game2048Battle';
import {
  Users,
  Swords,
  Copy,
  Check,
  ArrowLeft,
  Loader2,
  UserCheck,
  UserX,
  Play,
  Home,
  HelpCircle,
  X,
  Timer,
  Target,
} from 'lucide-react';
import Link from 'next/link';
import { OnlineIndicator } from '@/components/OnlineIndicator';

type LobbyMode = 'menu' | 'quickmatch' | 'create' | 'join' | 'playing';

export function Game2048BattleLobby() {
  const [lobbyMode, setLobbyMode] = useState<LobbyMode>('menu');
  const [nickname, setNickname] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [gameSeed, setGameSeed] = useState<number>(0);
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    timeLimit: 180,
    targetTile: 2048,
  });
  const [opponentState, setOpponentState] = useState<OpponentState | null>(null);
  const [showRules, setShowRules] = useState(false);
  const [finalResults, setFinalResults] = useState<GameResult[]>([]);
  const [endReason, setEndReason] = useState<string>('');

  const {
    gameStatus,
    roomCode,
    players,
    countdown,
    settings,
    timeRemaining,
    winner,
    error,
    myPlayerId,
    opponent,
    createRoom,
    joinRoom,
    quickMatch,
    setReady,
    rematch,
    sendMoveUpdate,
    sendReachedTarget,
    sendGameOver,
    leave,
  } = use2048Battle({
    onGameStart: (seed, settings) => {
      setGameSeed(seed);
      setGameSettings(settings);
      setOpponentState(null);
      setLobbyMode('playing');
    },
    onOpponentUpdate: (state) => {
      setOpponentState(state);
    },
    onOpponentReachedTarget: (id, score) => {
      setOpponentState(prev => prev ? { ...prev, reachedTarget: true, score } : null);
    },
    onOpponentGameOver: (id, score) => {
      setOpponentState(prev => prev ? { ...prev, isFinished: true, score } : null);
    },
    onTimeUpdate: (_remaining) => {
      // Timer update handled in state
    },
    onGameEnd: (winnerId, winnerNickname, reason, results) => {
      setFinalResults(results);
      setEndReason(reason);
    },
    onError: (message) => {
      console.error('Battle error:', message);
    },
  });

  // Load nickname from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('2048-nickname');
    if (saved) {
      setNickname(saved);
    }
  }, []);

  const saveNickname = (name: string) => {
    setNickname(name);
    localStorage.setItem('2048-nickname', name);
  };

  const handleQuickMatch = () => {
    if (!nickname.trim()) return;
    saveNickname(nickname);
    setLobbyMode('quickmatch');
    quickMatch(nickname);
  };

  const handleCreateRoom = () => {
    if (!nickname.trim()) return;
    saveNickname(nickname);
    setLobbyMode('create');
    createRoom(nickname, settings);
  };

  const handleJoinRoom = () => {
    if (!nickname.trim() || !roomCodeInput.trim()) return;
    saveNickname(nickname);
    setLobbyMode('join');
    joinRoom(roomCodeInput.toUpperCase(), nickname);
  };

  const handleCopyCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleReady = () => {
    const newReady = !isReady;
    setIsReady(newReady);
    setReady(newReady);
  };

  const handleBack = () => {
    leave();
    setLobbyMode('menu');
    setIsReady(false);
    setOpponentState(null);
    setGameSeed(0);
    setFinalResults([]);
    setEndReason('');
  };

  const handleRematch = () => {
    // WebSocket接続を維持したまま待機室に戻る
    rematch(); // フック内のgameStatusをwaitingに戻し、unreadyを送信
    setLobbyMode('create');
    setIsReady(false);
    setOpponentState(null);
    setGameSeed(0);
    setFinalResults([]);
    setEndReason('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Main menu
  if (lobbyMode === 'menu') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">2048 Battle</h1>
            <p className="text-muted-foreground">オンライン対戦モード</p>
          </div>

          <div className="flex justify-center">
            <OnlineIndicator page="2048-battle" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">ニックネーム</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value.slice(0, 12))}
              placeholder="名前を入力..."
              className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              maxLength={12}
            />
          </div>

          <div className="space-y-3">
            <button
              onClick={handleQuickMatch}
              disabled={!nickname.trim()}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Swords className="w-5 h-5" />
              クイックマッチ
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleCreateRoom}
                disabled={!nickname.trim()}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-card border border-border rounded-lg font-medium hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Users className="w-4 h-4" />
                部屋を作る
              </button>

              <button
                onClick={() => setLobbyMode('join')}
                disabled={!nickname.trim()}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-card border border-border rounded-lg font-medium hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Users className="w-4 h-4" />
                部屋に参加
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-border space-y-2">
            <button
              onClick={() => setShowRules(true)}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              ルール説明
            </button>
            <Link
              href="/games/2048"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home className="w-4 h-4" />
              ソロモードに戻る
            </Link>
          </div>

          {showRules && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-card border border-border rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h3 className="text-lg font-bold">バトルルール</h3>
                  <button onClick={() => setShowRules(false)} className="p-1 hover:bg-accent rounded">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4 space-y-4 text-sm">
                  <div>
                    <h4 className="font-bold text-foreground mb-2">勝利条件</h4>
                    <ul className="text-muted-foreground space-y-1">
                      <li>・先に2048タイルを作成したプレイヤーの勝利</li>
                      <li>・制限時間終了時: 高スコアのプレイヤーの勝利</li>
                      <li>・相手がゲームオーバーになった場合: あなたの勝利</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-foreground mb-2">ゲーム設定</h4>
                    <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                      <div className="flex justify-between">
                        <span className="flex items-center gap-2"><Timer className="w-4 h-4" /> 制限時間</span>
                        <span className="text-muted-foreground">3分</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="flex items-center gap-2"><Target className="w-4 h-4" /> 目標タイル</span>
                        <span className="text-muted-foreground">2048</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-foreground mb-2">操作方法</h4>
                    <ul className="text-muted-foreground space-y-1">
                      <li>・矢印キー or WASD: タイルを移動</li>
                      <li>・スワイプ: タイルを移動（タッチデバイス）</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Room code input screen
  if (lobbyMode === 'join' && gameStatus === 'disconnected') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md space-y-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            戻る
          </button>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">部屋に参加</h2>
            <p className="text-muted-foreground">ルームコードを入力してください</p>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="XXXXXX"
              className="w-full px-4 py-4 bg-card border border-border rounded-lg text-foreground text-center text-2xl tracking-widest font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              maxLength={6}
            />

            <button
              onClick={handleJoinRoom}
              disabled={roomCodeInput.length !== 6}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              参加する
            </button>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Connecting / Matchmaking
  if (
    gameStatus === 'connecting' ||
    (lobbyMode === 'quickmatch' && gameStatus === 'waiting' && players.length < 2) ||
    (lobbyMode === 'create' && gameStatus === 'disconnected' && !error)
  ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {lobbyMode === 'quickmatch' ? '対戦相手を探しています...' : '接続中...'}
            </h2>
            <p className="text-muted-foreground">しばらくお待ちください</p>
          </div>

          <button
            onClick={handleBack}
            className="px-6 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            キャンセル
          </button>
        </div>
      </div>
    );
  }

  // Waiting room
  if (gameStatus === 'waiting') {
    const otherPlayer = players.find(p => p.nickname !== nickname);

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md space-y-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            退出
          </button>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">対戦部屋</h2>
            {roomCode && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">ルームコードを共有してください</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl font-mono font-bold text-primary tracking-widest">
                    {roomCode}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="p-2 hover:bg-accent rounded-lg transition-colors"
                    title="コピー"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <Copy className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-muted/30 rounded-lg p-3 text-center text-sm flex items-center justify-center gap-4">
            <span className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-muted-foreground" />
              {formatTime(settings.timeLimit)}
            </span>
            <span className="flex items-center gap-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              {settings.targetTile}
            </span>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">プレイヤー ({players.length}/2)</h3>

            <div className="space-y-2">
              <div className={`flex items-center justify-between p-3 rounded-lg border ${isReady ? 'bg-green-500/10 border-green-500/30' : 'bg-card border-border'}`}>
                <div className="flex items-center gap-3">
                  {isReady ? (
                    <UserCheck className="w-5 h-5 text-green-500" />
                  ) : (
                    <UserX className="w-5 h-5 text-muted-foreground" />
                  )}
                  <span className="font-medium">{nickname} (あなた)</span>
                </div>
                <span className={`text-sm ${isReady ? 'text-green-500' : 'text-muted-foreground'}`}>
                  {isReady ? '準備完了' : '待機中'}
                </span>
              </div>

              {otherPlayer ? (
                <div className={`flex items-center justify-between p-3 rounded-lg border ${otherPlayer.isReady ? 'bg-green-500/10 border-green-500/30' : 'bg-card border-border'}`}>
                  <div className="flex items-center gap-3">
                    {otherPlayer.isReady ? (
                      <UserCheck className="w-5 h-5 text-green-500" />
                    ) : (
                      <UserX className="w-5 h-5 text-muted-foreground" />
                    )}
                    <span className="font-medium">{otherPlayer.nickname}</span>
                  </div>
                  <span className={`text-sm ${otherPlayer.isReady ? 'text-green-500' : 'text-muted-foreground'}`}>
                    {otherPlayer.isReady ? '準備完了' : '待機中'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center p-3 rounded-lg border border-dashed border-border bg-card/50">
                  <span className="text-muted-foreground">対戦相手を待っています...</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleToggleReady}
            disabled={players.length < 2}
            className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isReady
                ? 'bg-yellow-500 text-yellow-950 hover:bg-yellow-400'
                : 'bg-green-500 text-white hover:bg-green-400'
            }`}
          >
            <Play className="w-5 h-5" />
            {isReady ? 'キャンセル' : '準備完了'}
          </button>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Countdown
  if (gameStatus === 'countdown' && countdown !== null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <div className="text-9xl font-bold text-primary animate-pulse">
            {countdown > 0 ? countdown : 'GO!'}
          </div>
          <p className="text-muted-foreground mt-4">ゲーム開始まで...</p>
        </div>
      </div>
    );
  }

  // Playing
  if (gameStatus === 'playing' || lobbyMode === 'playing') {
    // フックから来るopponentを優先、なければローカルのopponentState
    const activeOpponentState = opponent || opponentState;

    return (
      <Game2048Battle
        nickname={nickname}
        seed={gameSeed}
        settings={gameSettings}
        opponentState={activeOpponentState}
        timeRemaining={timeRemaining}
        winner={winner}
        myPlayerId={myPlayerId}
        onMoveUpdate={sendMoveUpdate}
        onReachedTarget={sendReachedTarget}
        onGameOver={sendGameOver}
        onLeave={handleBack}
        onRematch={handleRematch}
        results={finalResults}
        endReason={endReason}
      />
    );
  }

  // Game finished
  if (gameStatus === 'finished' && winner) {
    const isWinner = winner.nickname === nickname;
    const myResult = finalResults.find(r => r.nickname === nickname);
    const opponentResult = finalResults.find(r => r.nickname !== nickname);

    const reasonText = {
      'reached_target': '2048達成！',
      'time_up': '時間切れ',
      'opponent_quit': '相手が退出',
      'higher_score': 'スコア勝負',
    }[endReason] || '';

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className={`text-6xl ${isWinner ? 'text-yellow-500' : 'text-muted-foreground'}`}>
            {isWinner ? '🏆' : '😢'}
          </div>
          <div>
            <h2 className={`text-3xl font-bold mb-2 ${isWinner ? 'text-yellow-500' : 'text-foreground'}`}>
              {isWinner ? 'WIN!' : 'LOSE...'}
            </h2>
            <p className="text-muted-foreground">
              {reasonText} - 勝者: {winner.nickname}
            </p>
          </div>

          {myResult && opponentResult && (
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-medium mb-2">結果</h3>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div></div>
                <div className="text-center font-medium">スコア</div>
                <div className="text-center font-medium">最大タイル</div>

                <div className="text-left">{myResult.nickname}</div>
                <div className="text-center text-primary font-bold">{myResult.score}</div>
                <div className="text-center">{myResult.maxTile}</div>

                <div className="text-left text-muted-foreground">{opponentResult.nickname}</div>
                <div className="text-center text-muted-foreground">{opponentResult.score}</div>
                <div className="text-center text-muted-foreground">{opponentResult.maxTile}</div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => {
                setIsReady(false);
                setReady(false);
                setOpponentState(null);
                setGameSeed(0);
                setFinalResults([]);
                setEndReason('');
                setLobbyMode('menu');
              }}
              className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
            >
              もう一度
            </button>
            <button
              onClick={handleBack}
              className="w-full px-6 py-3 bg-card border border-border rounded-lg font-medium hover:bg-accent"
            >
              ロビーに戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center space-y-4">
        <p className="text-destructive">{error || '予期しないエラーが発生しました'}</p>
        <button
          onClick={handleBack}
          className="px-6 py-2 bg-card border border-border rounded-lg hover:bg-accent"
        >
          戻る
        </button>
      </div>
    </div>
  );
}
