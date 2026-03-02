'use client';

import { useState, useEffect, useCallback } from 'react';
import { useOthelloBattle, GameResult } from '@/hooks/useOthelloBattle';
import { OthelloBattle } from './OthelloBattle';
import type { CellState } from '@/lib/othello-ai';
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
} from 'lucide-react';
import Link from 'next/link';
import { OnlineIndicator } from '@/components/OnlineIndicator';

type LobbyMode = 'menu' | 'quickmatch' | 'create' | 'join' | 'playing';

export function OthelloBattleLobby() {
  const [lobbyMode, setLobbyMode] = useState<LobbyMode>('menu');
  const [nickname, setNickname] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [finalResults, setFinalResults] = useState<GameResult[]>([]);
  const [passMessage, setPassMessage] = useState<string | null>(null);

  const {
    gameStatus,
    roomCode,
    players,
    countdown,
    myColor,
    board,
    currentPlayer,
    blackCount,
    whiteCount,
    validMoves,
    timeRemaining,
    winner,
    error,
    myPlayerId,
    lastMove,
    results,
    createRoom,
    joinRoom,
    quickMatch,
    setReady,
    sendMove,
    rematch,
    leave,
    cancelMatchmaking,
  } = useOthelloBattle({
    onGameStart: () => {
      setLobbyMode('playing');
      setPassMessage(null);
    },
    onPlayerPassed: (passedPlayer: CellState) => {
      const colorName = passedPlayer === 1 ? '黒' : '白';
      setPassMessage(`${colorName}はパスしました`);
      setTimeout(() => setPassMessage(null), 2000);
    },
    onGameEnd: (_winnerId, _winnerNickname, gameResults) => {
      setFinalResults(gameResults);
    },
    onError: (message) => {
      console.error('Battle error:', message);
    },
  });

  // Load nickname from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('othello-nickname');
    if (saved) {
      setNickname(saved);
    }
  }, []);

  const saveNickname = (name: string) => {
    setNickname(name);
    localStorage.setItem('othello-nickname', name);
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
    createRoom(nickname);
  };

  const handleJoinRoom = () => {
    if (!nickname.trim() || !roomCodeInput.trim()) return;
    saveNickname(nickname);
    setLobbyMode('join');
    joinRoom(roomCodeInput.toUpperCase(), nickname);
  };

  const handleCopyCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode).catch(() => {});
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
    setFinalResults([]);
    setPassMessage(null);
  };

  const handleRematch = () => {
    rematch();
    setLobbyMode('create');
    setIsReady(false);
    setFinalResults([]);
    setPassMessage(null);
  };

  const handleMove = useCallback(
    (row: number, col: number) => {
      sendMove(row, col);
    },
    [sendMove]
  );

  const colorLabel = (color: CellState) => (color === 1 ? '黒 ●' : '白 ○');

  // Main menu
  if (lobbyMode === 'menu') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">Othello Battle</h1>
            <p className="text-muted-foreground">オンライン対戦モード</p>
          </div>

          <div className="flex justify-center">
            <OnlineIndicator page="othello-battle" />
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
              href="/games/othello"
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
                    <h4 className="font-bold text-foreground mb-2">🎮 ターン制対戦</h4>
                    <ul className="text-muted-foreground space-y-1">
                      <li>・2人が<span className="text-primary font-medium">同じ盤面</span>で交互に打つ</li>
                      <li>・先に入室した人が黒（先手）</li>
                      <li>・有効な手がない場合は自動パス</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-foreground mb-2">🏆 勝利条件</h4>
                    <ul className="text-muted-foreground space-y-1">
                      <li>・ゲーム終了時に<span className="text-primary font-medium">駒が多い方</span>が勝ち</li>
                      <li>・両者とも打てなくなったらゲーム終了</li>
                      <li>・相手が退出しても勝利</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-foreground mb-2">⚙️ 設定</h4>
                    <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                      <div className="flex justify-between">
                        <span className="flex items-center gap-2"><Timer className="w-4 h-4" /> 制限時間</span>
                        <span className="text-muted-foreground">10分</span>
                      </div>
                    </div>
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
            onClick={() => {
              cancelMatchmaking();
              handleBack();
            }}
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
    const otherPlayer = players.find((p) => p.nickname !== nickname);

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
                  <span className="text-3xl font-mono font-bold text-primary tracking-widest">{roomCode}</span>
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
              制限時間: 10分
            </span>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">プレイヤー ({players.length}/2)</h3>

            <div className="space-y-2">
              {/* 自分 */}
              <div
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  isReady ? 'bg-green-500/10 border-green-500/30' : 'bg-card border-border'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isReady ? (
                    <UserCheck className="w-5 h-5 text-green-500" />
                  ) : (
                    <UserX className="w-5 h-5 text-muted-foreground" />
                  )}
                  <span className="font-medium">{nickname} (あなた)</span>
                  {myColor > 0 && (
                    <span className="text-xs text-muted-foreground">{colorLabel(myColor)}</span>
                  )}
                </div>
                <span className={`text-sm ${isReady ? 'text-green-500' : 'text-muted-foreground'}`}>
                  {isReady ? '準備完了' : '待機中'}
                </span>
              </div>

              {/* 相手 */}
              {otherPlayer ? (
                <div
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    otherPlayer.isReady ? 'bg-green-500/10 border-green-500/30' : 'bg-card border-border'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {otherPlayer.isReady ? (
                      <UserCheck className="w-5 h-5 text-green-500" />
                    ) : (
                      <UserX className="w-5 h-5 text-muted-foreground" />
                    )}
                    <span className="font-medium">{otherPlayer.nickname}</span>
                    {otherPlayer.color > 0 && (
                      <span className="text-xs text-muted-foreground">{colorLabel(otherPlayer.color)}</span>
                    )}
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
          <div className="text-9xl font-bold text-primary animate-pulse">{countdown > 0 ? countdown : 'GO!'}</div>
          <p className="text-muted-foreground mt-4">ゲーム開始まで...</p>
        </div>
      </div>
    );
  }

  // Playing
  if ((gameStatus === 'playing' || lobbyMode === 'playing') && board) {
    const opponent = players.find(p => p.id !== myPlayerId);
    const opponentNickname = opponent?.nickname || '対戦相手';

    return (
      <OthelloBattle
        nickname={nickname}
        opponentNickname={opponentNickname}
        board={board}
        myColor={myColor}
        currentPlayer={currentPlayer}
        blackCount={blackCount}
        whiteCount={whiteCount}
        validMoves={validMoves}
        timeRemaining={timeRemaining}
        lastMove={lastMove}
        winner={winner}
        myPlayerId={myPlayerId}
        results={finalResults.length > 0 ? finalResults : results}
        passMessage={passMessage}
        onMove={handleMove}
        onLeave={handleBack}
        onRematch={handleRematch}
      />
    );
  }

  // Game finished fallback
  if (gameStatus === 'finished' && winner) {
    const isWinner = winner.id === myPlayerId;

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className={`text-6xl ${isWinner ? 'text-yellow-500' : 'text-muted-foreground'}`}>
            {winner.id === null ? '🤝' : isWinner ? '🏆' : '😢'}
          </div>
          <div>
            <h2 className={`text-3xl font-bold mb-2 ${isWinner ? 'text-yellow-500' : 'text-foreground'}`}>
              {winner.id === null ? 'DRAW' : isWinner ? 'WIN!' : 'LOSE...'}
            </h2>
            <p className="text-muted-foreground">
              {winner.id === null ? '引き分け' : `勝者: ${winner.nickname}`}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleRematch}
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
        <button onClick={handleBack} className="px-6 py-2 bg-card border border-border rounded-lg hover:bg-accent">
          戻る
        </button>
      </div>
    </div>
  );
}
