'use client';

import { useState, useEffect } from 'react';
import { useTetrisBattle, OpponentState } from '@/hooks/useTetrisBattle';
import { TetrisBattle } from './TetrisBattle';
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
} from 'lucide-react';
import Link from 'next/link';
import { OnlineIndicator } from '@/components/OnlineIndicator';

type LobbyMode = 'menu' | 'quickmatch' | 'create' | 'join' | 'playing';

export function TetrisBattleLobby() {
  const [lobbyMode, setLobbyMode] = useState<LobbyMode>('menu');
  const [nickname, setNickname] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [gameSeed, setGameSeed] = useState<number>(0);
  const [opponent, setOpponent] = useState<OpponentState | null>(null);
  const [opponentAlive, setOpponentAlive] = useState(true);
  const [pendingGarbage, setPendingGarbage] = useState(0);

  const {
    gameStatus,
    roomId,
    roomCode,
    players,
    countdown,
    winner,
    error,
    createRoom,
    joinRoom,
    quickMatch,
    setReady,
    leave,
    sendFieldUpdate,
    sendAttack,
    consumeGarbage,
    sendGameOver,
  } = useTetrisBattle({
    onGameStart: (seed) => {
      // ゲーム開始時にプレイモードに切り替え
      setGameSeed(seed);
      setOpponentAlive(true);
      setPendingGarbage(0);
      setLobbyMode('playing');
    },
    onReceiveGarbage: (lines) => {
      setPendingGarbage((prev) => prev + lines);
    },
    onOpponentUpdate: (state) => {
      setOpponent(state);
    },
    onOpponentGameOver: () => {
      setOpponentAlive(false);
    },
    onGameEnd: () => {
      // ゲーム終了時はそのまま（TetrisBattle内で処理）
    },
  });

  // Load nickname from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tetris-nickname');
    if (saved) {
      setNickname(saved);
    }
  }, []);

  // Save nickname to localStorage
  const saveNickname = (name: string) => {
    setNickname(name);
    localStorage.setItem('tetris-nickname', name);
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
    // すべての状態をリセット
    setLobbyMode('menu');
    setIsReady(false);
    setOpponent(null);
    setOpponentAlive(true);
    setPendingGarbage(0);
    setGameSeed(0);
  };

  // メインメニュー
  if (lobbyMode === 'menu') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">Tetris Battle</h1>
            <p className="text-muted-foreground">オンライン対戦モード</p>
          </div>

          {/* オンライン人数 */}
          <div className="flex justify-center">
            <OnlineIndicator page="tetris-battle" />
          </div>

          {/* ニックネーム入力 */}
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

          {/* モード選択ボタン */}
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

          {/* ソロモードへのリンク */}
          <div className="pt-4 border-t border-border">
            <Link
              href="/games/tetris"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home className="w-4 h-4" />
              ソロモードに戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 部屋コード入力画面
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

  // 接続中 / マッチング中 / ルーム作成中
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

  // 待機室（ルームコード共有・準備）
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

          {/* プレイヤーリスト */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">プレイヤー ({players.length}/2)</h3>

            <div className="space-y-2">
              {/* 自分 */}
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

              {/* 相手 */}
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

          {/* 準備ボタン */}
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

          {players.length === 2 && !isReady && (
            <p className="text-center text-sm text-muted-foreground">
              両プレイヤーが準備完了するとゲームが始まります
            </p>
          )}

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  // カウントダウン
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

  // ゲーム中 - 対戦画面
  if (gameStatus === 'playing' || lobbyMode === 'playing') {
    return (
      <TetrisBattle
        roomId={roomId || 'unknown'}
        nickname={nickname}
        seed={gameSeed}
        onLeave={handleBack}
        sendFieldUpdate={sendFieldUpdate}
        sendAttack={sendAttack}
        consumeGarbage={consumeGarbage}
        sendGameOver={sendGameOver}
        pendingGarbageFromServer={pendingGarbage}
        opponentFromServer={opponent}
        opponentAliveFromServer={opponentAlive}
        winnerFromServer={winner}
      />
    );
  }

  // ゲーム終了
  if (gameStatus === 'finished' && winner) {
    const isWinner = winner.nickname === nickname;

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
              勝者: {winner.nickname}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                // 状態をリセットして待機室に戻る
                setIsReady(false);
                setReady(false);
                setOpponent(null);
                setOpponentAlive(true);
                setPendingGarbage(0);
                setGameSeed(0);
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

  // デフォルト - エラー表示
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
