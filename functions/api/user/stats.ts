interface Env {
  DB: D1Database;
  ALLOWED_ORIGIN?: string;
}

interface SyncStatsRequest {
  gameType: string;
  stats: Record<string, unknown>;
}

// Decode Firebase JWT token (basic validation)
function decodeFirebaseToken(token: string): { uid: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));
    if (!payload.sub || !payload.exp) return null;

    // Check expiration
    if (payload.exp * 1000 < Date.now()) return null;

    return { uid: payload.sub };
  } catch {
    return null;
  }
}

// Get allowed origin for CORS
function getAllowedOrigin(env: Env): string {
  return env.ALLOWED_ORIGIN || 'https://adalabtech.com';
}

// Verify auth and get UID from token
function verifyAuth(request: Request): { uid: string } | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  return decodeFirebaseToken(token);
}

// Valid game types (matches database CHECK constraint)
const VALID_GAME_TYPES = ['tetris', '2048', 'snake', 'typing', 'minesweeper'];

// POST: ゲーム統計を同期
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const allowedOrigin = getAllowedOrigin(env);

  const corsHeaders = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    // Verify authentication
    const auth = verifyAuth(request);
    if (!auth) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: SyncStatsRequest = await request.json();

    // Validate game type
    if (!body.gameType || !VALID_GAME_TYPES.includes(body.gameType)) {
      return new Response(JSON.stringify({ error: 'Invalid game type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate stats
    if (!body.stats || typeof body.stats !== 'object') {
      return new Response(JSON.stringify({ error: 'Invalid stats data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user ID from firebase_uid
    const user = await env.DB.prepare(
      `SELECT id FROM users WHERE firebase_uid = ?`
    )
      .bind(auth.uid)
      .first();

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = user.id as number;
    const statsJson = JSON.stringify(body.stats);

    // UPSERT: insert or update stats
    await env.DB.prepare(
      `INSERT INTO user_game_stats (user_id, game_type, stats_json, updated_at)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(user_id, game_type)
       DO UPDATE SET stats_json = excluded.stats_json, updated_at = CURRENT_TIMESTAMP`
    )
      .bind(userId, body.gameType, statsJson)
      .run();

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Stats sync error:', error);
    return new Response(JSON.stringify({ error: 'Failed to sync stats' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

export const onRequestOptions: PagesFunction<Env> = async (context) => {
  const allowedOrigin = getAllowedOrigin(context.env);
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};
