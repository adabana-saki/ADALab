// マッチメイキングキュー用Durable Object
// Workerのマルチインスタンス間でキューを共有するために必要

type GameType = 'tetris' | 'typing' | '2048' | 'snake' | 'minesweeper';

// ゲーム設定（Typing用）
interface GameSettings {
  wordCount?: number;
  language?: 'en' | 'ja';
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface QueueEntry {
  playerId: string;
  nickname: string;
  timestamp: number;
  gameType: GameType;
  settings?: GameSettings; // ゲーム設定を追加
}

interface MatchResult {
  roomId: string;
  wsUrl: string;
  opponent: string;
  timestamp: number;
  gameType: GameType;
  settings?: GameSettings; // マッチ結果にも設定を追加
}

// ゲームタイプに応じたWebSocketパスを生成
function getWsPath(gameType: GameType): string {
  switch (gameType) {
    case 'typing': return '/ws/typing/';
    case '2048': return '/ws/2048/';
    case 'snake': return '/ws/snake/';
    case 'minesweeper': return '/ws/minesweeper/';
    default: return '/ws/room/';
  }
}

export class MatchmakingQueue {
  private state: DurableObjectState;
  private queue: Map<string, QueueEntry> = new Map();
  private matchedPlayers: Map<string, MatchResult> = new Map();

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (path === '/queue' && request.method === 'POST') {
      try {
        const body = await request.json() as {
          nickname?: string;
          playerId?: string;
          gameType?: string;
          settings?: GameSettings;
        };
        const nickname = body.nickname?.trim().slice(0, 12) || 'Player';
        const playerId = body.playerId || crypto.randomUUID();
        const gameType = (body.gameType as GameType) || 'tetris';
        const settings = body.settings;
        const now = Date.now();

        // Clean up old entries (older than 30 seconds)
        for (const [id, entry] of this.queue) {
          if (now - entry.timestamp > 30000) {
            this.queue.delete(id);
          }
        }
        for (const [id, entry] of this.matchedPlayers) {
          if (now - entry.timestamp > 30000) {
            this.matchedPlayers.delete(id);
          }
        }

        // Check if this player was already matched (waiting player case)
        // gameType別のキーでマッチ結果を管理
        const matchKey = `${playerId}-${gameType}`;
        const existingMatch = this.matchedPlayers.get(matchKey);
        if (existingMatch && existingMatch.gameType === gameType) {
          this.matchedPlayers.delete(matchKey);
          return new Response(JSON.stringify({
            success: true,
            matched: true,
            roomId: existingMatch.roomId,
            wsUrl: existingMatch.wsUrl,
            opponent: existingMatch.opponent,
            settings: existingMatch.settings, // マッチした設定を返す
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Check if there's someone waiting (同じgameTypeかつ同じ設定のプレイヤーのみマッチング)
        const currentQueueKey = `${playerId}-${gameType}`;

        // 設定比較関数（Typing・Minesweeper用）
        const settingsMatch = (s1?: GameSettings, s2?: GameSettings): boolean => {
          if (gameType === 'minesweeper') {
            // minesweeper: 同じdifficultyのプレイヤーのみマッチング
            const d1 = s1?.difficulty || 'beginner';
            const d2 = s2?.difficulty || 'beginner';
            return d1 === d2;
          }
          // gameTypeがtyping以外の場合は設定を比較しない
          if (gameType !== 'typing') return true;
          // 両方undefined/nullの場合はマッチ
          if (!s1 && !s2) return true;
          // 片方だけの場合はデフォルト設定とみなす
          const defaultSettings: GameSettings = { wordCount: 20, language: 'en', difficulty: 'medium' };
          const settings1 = { ...defaultSettings, ...s1 };
          const settings2 = { ...defaultSettings, ...s2 };
          return settings1.wordCount === settings2.wordCount &&
                 settings1.language === settings2.language &&
                 settings1.difficulty === settings2.difficulty;
        };

        for (const [waitingKey, waiting] of this.queue) {
          if (waitingKey !== currentQueueKey &&
              waiting.playerId !== playerId &&
              waiting.gameType === gameType &&
              settingsMatch(waiting.settings, settings)) {
            // Found a match! (同じゲームタイプかつ同じ設定の別プレイヤー)
            this.queue.delete(waitingKey);

            // 使用する設定（待機中プレイヤーの設定を優先）
            const matchedSettings = waiting.settings || settings;

            // Create a new room for the match
            const roomId = `match-${crypto.randomUUID()}`;
            const wsUrl = `${getWsPath(gameType)}${roomId}`;

            // Store match result for the waiting player so they can find it on next poll
            const waitingMatchKey = `${waiting.playerId}-${gameType}`;
            this.matchedPlayers.set(waitingMatchKey, {
              roomId,
              wsUrl,
              opponent: nickname,
              timestamp: now,
              gameType,
              settings: matchedSettings,
            });

            return new Response(JSON.stringify({
              success: true,
              matched: true,
              roomId,
              wsUrl,
              opponent: waiting.nickname,
              needsInit: true, // Signal that room needs initialization
              settings: matchedSettings, // マッチした設定を返す
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }

        // No match found, add to queue (gameType別のキーで管理)
        const queueKey = `${playerId}-${gameType}`;
        this.queue.set(queueKey, { playerId, nickname, timestamp: now, gameType, settings });

        return new Response(JSON.stringify({
          success: true,
          matched: false,
          position: this.queue.size,
          message: 'Waiting for opponent...',
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (e) {
        console.error('Matchmaking error:', e);
        return new Response(JSON.stringify({ error: 'Matchmaking failed' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Cancel matchmaking
    if (path === '/cancel' && request.method === 'POST') {
      try {
        const body = await request.json() as { playerId?: string; gameType?: string };
        if (body.playerId) {
          const gameType = (body.gameType as GameType) || 'tetris';
          const key = `${body.playerId}-${gameType}`;
          this.queue.delete(key);
          this.matchedPlayers.delete(key);
          // 後方互換性のため、古いキー形式も削除
          this.queue.delete(body.playerId);
          this.matchedPlayers.delete(body.playerId);
        }
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: 'Cancel failed' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Get queue stats
    if (path === '/stats') {
      return new Response(JSON.stringify({
        queueSize: this.queue.size,
        matchedSize: this.matchedPlayers.size,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  }
}
