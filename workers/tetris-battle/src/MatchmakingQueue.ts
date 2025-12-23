// マッチメイキングキュー用Durable Object
// Workerのマルチインスタンス間でキューを共有するために必要

interface QueueEntry {
  playerId: string;
  nickname: string;
  timestamp: number;
}

interface MatchResult {
  roomId: string;
  wsUrl: string;
  opponent: string;
  timestamp: number;
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
        const body = await request.json() as { nickname?: string; playerId?: string };
        const nickname = body.nickname?.trim().slice(0, 12) || 'Player';
        const playerId = body.playerId || crypto.randomUUID();
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
        const existingMatch = this.matchedPlayers.get(playerId);
        if (existingMatch) {
          this.matchedPlayers.delete(playerId);
          return new Response(JSON.stringify({
            success: true,
            matched: true,
            roomId: existingMatch.roomId,
            wsUrl: existingMatch.wsUrl,
            opponent: existingMatch.opponent,
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Check if there's someone waiting
        for (const [waitingId, waiting] of this.queue) {
          if (waitingId !== playerId) {
            // Found a match!
            this.queue.delete(waitingId);

            // Create a new room for the match
            const roomId = `match-${crypto.randomUUID()}`;
            const wsUrl = `/ws/room/${roomId}`;

            // Store match result for the waiting player so they can find it on next poll
            this.matchedPlayers.set(waitingId, {
              roomId,
              wsUrl,
              opponent: nickname,
              timestamp: now,
            });

            return new Response(JSON.stringify({
              success: true,
              matched: true,
              roomId,
              wsUrl,
              opponent: waiting.nickname,
              needsInit: true, // Signal that room needs initialization
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }

        // No match found, add to queue
        this.queue.set(playerId, { playerId, nickname, timestamp: now });

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
        const body = await request.json() as { playerId?: string };
        if (body.playerId) {
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
