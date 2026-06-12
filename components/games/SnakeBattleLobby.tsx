'use client';

import { useState, useEffect } from 'react';
import { useSnakeBattle, GameSettings, GameResult, BattlePlayerState, PlayerDiedInfo, Position } from '@/hooks/useSnakeBattle';
import { SnakeBattle } from './SnakeBattle';
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
  Grid3X3,
} from 'lucide-react';
import Link from 'next/link';
import { OnlineIndicator } from '@/components/OnlineIndicator';

type LobbyMode = 'menu' | 'quickmatch' | 'create' | 'join' | 'playing';

export function SnakeBattleLobby() {
  const [lobbyMode, setLobbyMode] = useState<LobbyMode>('menu');
  const [nickname, setNickname] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    gridSize: 30, // 30x30に拡大
    timeLimit: 180,
  });
  const [showRules, setShowRules] = useState(false);
  const [finalResults, setFinalResults] = useState<GameResult[]>([]);
  const [endReason, setEndReason] = useState<string>('');

  // 同一フィールドバトル用の状態
  const [localBattlePlayers, setLocalBattlePlayers] = useState<BattlePlayerState[]>([]);
  const [localFood, setLocalFood] = useState<Position | null>(null);
  const [localLastDeath, setLocalLastDeath] = useState<PlayerDiedInfo | null>(null);

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
    battlePlayers,
    food,
    lastDeath,
    availableColors,
    createRoom,
    joinRoom,
    quickMatch,
    setReady,
    rematch,
    selectColor,
    sendDirectionChange,
    leave,
  } = useSnakeBattle({
    onGameStart: (_seed, settings) => {
      setGameSettings(settings);
      setLocalBattlePlayers([]);
      setLocalFood(null);
      setLocalLastDeath(null);
      setLobbyMode('playing');
    },
    onGameStateUpdate: (players, food) => {
      setLocalBattlePlayers(players);
      setLocalFood(food);
    },
    onPlayerDied: (info) => {
      setLocalLastDeath(info);
    },
    onGameEnd: (_winnerId, _winnerNickname, reason, results) => {
      setFinalResults(results);
      setEndReason(reason);
    },
    onError: (message) => {
      console.error('Battle error:', message);
    },
  });

  // Load nickname from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('snake-nickname');
    if (saved) {
      setNickname(saved);
    }
  }, []);

  const saveNickname = (name: string) => {
    setNickname(name);
    localStorage.setItem('snake-nickname', name);
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
    setLocalBattlePlayers([]);
    setLocalFood(null);
    setLocalLastDeath(null);
    setFinalResults([]);
    setEndReason('');
  };

  const handleRematch = () => {
    // WebSocket接続を維持したまま待機室に戻る
    rematch(); // フック内のgameStatusをwaitingに戻し、unreadyを送信
    setLobbyMode('create');
    setIsReady(false);
    setLocalBattlePlayers([]);
    setLocalFood(null);
    setLocalLastDeath(null);
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Snake Battle</h1>
            <p className="text-muted-foreground">オンライン対戦モード</p>
          </div>

          <div className="flex justify-center">
            <OnlineIndicator page="snake-battle" />
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
              href="/games/snake"
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
                    <h4 className="font-bold text-foreground mb-2">🎮 同一フィールドバトル</h4>
                    <ul className="text-muted-foreground space-y-1">
                      <li>・2人のプレイヤーが<span className="text-primary font-medium">同じフィールド</span>で対戦</li>
                      <li>・エサを食べるとスネークが成長</li>
                      <li>・エサは2人で取り合い！</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-foreground mb-2">💀 ゲームオーバー条件</h4>
                    <ul className="text-muted-foreground space-y-1">
                      <li>・壁に衝突</li>
                      <li>・自分の体に衝突</li>
                      <li>・<span className="text-red-500 font-medium">相手の体に衝突</span></li>
                      <li>・相手と正面衝突（両者ゲームオーバー）</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-foreground mb-2">🏆 勝利条件</h4>
                    <ul className="text-muted-foreground space-y-1">
                      <li>・相手がゲームオーバーになる</li>
                      <li>・制限時間終了時: 高スコアのプレイヤーが勝利</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-foreground mb-2">⚙️ ゲーム設定</h4>
                    <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                      <div className="flex justify-between">
                        <span className="flex items-center gap-2"><Grid3X3 className="w-4 h-4" /> グリッドサイズ</span>
                        <span className="text-muted-foreground">30x30（広めのフィールド）</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="flex items-center gap-2"><Timer className="w-4 h-4" /> 制限時間</span>
                        <span className="text-muted-foreground">3分</span>
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
              <Grid3X3 className="w-4 h-4 text-muted-foreground" />
              {settings.gridSize}x{settings.gridSize}
            </span>
            <span className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-muted-foreground" />
              {formatTime(settings.timeLimit)}
            </span>
          </div>

          {/* 色選択 */}
          {availableColors.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">スネークの色を選択</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {availableColors.map((color) => {
                  const myPlayer = players.find(p => p.nickname === nickname);
                  const isMyColor = myPlayer?.color === color.hex;
                  const isOtherPlayerColor = players.some(p => p.nickname !== nickname && p.color === color.hex);

                  return (
                    <button
                      key={color.id}
                      onClick={() => selectColor(color.id)}
                      disabled={isMyColor}
                      className={`relative w-10 h-10 rounded-lg transition-all ${
                        isMyColor
                          ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110'
                          : 'hover:scale-105'
                      } ${isOtherPlayerColor ? 'opacity-50' : ''}`}
                      style={{ backgroundColor: color.hex }}
                      title={`${color.name}${isOtherPlayerColor ? ' (相手が使用中)' : ''}`}
                    >
                      {isMyColor && (
                        <Check className="absolute inset-0 m-auto w-5 h-5 text-white drop-shadow-md" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">プレイヤー ({players.length}/2)</h3>

            <div className="space-y-2">
              {(() => {
                const myPlayer = players.find(p => p.nickname === nickname);
                return (
                  <div className={`flex items-center justify-between p-3 rounded-lg border ${isReady ? 'bg-green-500/10 border-green-500/30' : 'bg-card border-border'}`}>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: myPlayer?.color || '#22c55e' }}
                      />
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
                );
              })()}

              {otherPlayer ? (
                <div className={`flex items-center justify-between p-3 rounded-lg border ${otherPlayer.isReady ? 'bg-green-500/10 border-green-500/30' : 'bg-card border-border'}`}>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: otherPlayer.color || '#f97316' }}
                    />
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
    // 優先: hookから来るbattlePlayers、なければローカル状態
    const activeBattlePlayers = battlePlayers.length > 0 ? battlePlayers : localBattlePlayers;
    const activeFood = food || localFood;
    const activeLastDeath = lastDeath || localLastDeath;

    return (
      <SnakeBattle
        nickname={nickname}
        settings={gameSettings}
        battlePlayers={activeBattlePlayers}
        food={activeFood}
        timeRemaining={timeRemaining}
        winner={winner}
        myPlayerId={myPlayerId}
        lastDeath={activeLastDeath}
        onDirectionChange={sendDirectionChange}
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
      'opponent_died': '相手がゲームオーバー',
      'time_up': '時間切れ',
      'opponent_quit': '相手が退出',
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
                <div className="text-center font-medium">長さ</div>

                <div className="text-left">{myResult.nickname}</div>
                <div className="text-center text-primary font-bold">{myResult.score}</div>
                <div className="text-center">{myResult.length}</div>

                <div className="text-left text-muted-foreground">{opponentResult.nickname}</div>
                <div className="text-center text-muted-foreground">{opponentResult.score}</div>
                <div className="text-center text-muted-foreground">{opponentResult.length}</div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => {
                setIsReady(false);
                setReady(false);
                setLocalBattlePlayers([]);
                setLocalFood(null);
                setLocalLastDeath(null);
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
