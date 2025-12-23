// オンラインプレゼンス追跡用Durable Object

interface UserPresence {
  id: string;
  page: string; // 'home', 'tetris', 'tetris-battle', etc.
  activity: 'viewing' | 'playing';
  lastSeen: number;
}

export class OnlinePresence {
  private state: DurableObjectState;
  private users: Map<string, UserPresence> = new Map();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor(state: DurableObjectState) {
    this.state = state;
    // Clean up stale users every 15 seconds
    this.cleanupInterval = setInterval(() => this.cleanupStaleUsers(), 15000);
  }

  private cleanupStaleUsers() {
    const now = Date.now();
    const timeout = 30000; // 30 seconds timeout

    for (const [id, user] of this.users) {
      if (now - user.lastSeen > timeout) {
        this.users.delete(id);
      }
    }
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Heartbeat - update presence
    if (path === '/heartbeat' && request.method === 'POST') {
      try {
        const body = await request.json() as { userId: string; page: string; activity: 'viewing' | 'playing' };
        const { userId, page, activity } = body;

        if (!userId) {
          return new Response(JSON.stringify({ error: 'userId required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        this.users.set(userId, {
          id: userId,
          page: page || 'home',
          activity: activity || 'viewing',
          lastSeen: Date.now(),
        });

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (e) {
        console.error('Heartbeat error:', e);
        return new Response(JSON.stringify({ error: 'Invalid request' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Leave - remove presence
    if (path === '/leave' && request.method === 'POST') {
      try {
        const body = await request.json() as { userId: string };
        const { userId } = body;

        if (userId) {
          this.users.delete(userId);
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: 'Invalid request' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Get stats
    if (path === '/stats') {
      // Clean up before returning stats
      this.cleanupStaleUsers();

      const stats = {
        total: this.users.size,
        byPage: {} as Record<string, number>,
        byActivity: {
          viewing: 0,
          playing: 0,
        },
      };

      for (const user of this.users.values()) {
        stats.byPage[user.page] = (stats.byPage[user.page] || 0) + 1;
        stats.byActivity[user.activity]++;
      }

      return new Response(JSON.stringify(stats), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  }
}
