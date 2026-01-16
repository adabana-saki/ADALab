interface Env {
  DB: D1Database;
  ALLOWED_ORIGIN?: string;
}

interface SyncAchievementsRequest {
  gameType: string;
  achievementIds: string[];
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

// POST: 実績を同期
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

    const body: SyncAchievementsRequest = await request.json();

    // Validate game type
    if (!body.gameType || !VALID_GAME_TYPES.includes(body.gameType)) {
      return new Response(JSON.stringify({ error: 'Invalid game type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate achievement IDs
    if (!Array.isArray(body.achievementIds) || body.achievementIds.length === 0) {
      return new Response(JSON.stringify({ error: 'No achievements to sync' }), {
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

    // Insert achievements (ignore duplicates using INSERT OR IGNORE)
    let syncedCount = 0;
    for (const achievementId of body.achievementIds) {
      if (typeof achievementId !== 'string' || !achievementId.trim()) continue;

      try {
        const result = await env.DB.prepare(
          `INSERT OR IGNORE INTO user_achievements (user_id, game_type, achievement_id)
           VALUES (?, ?, ?)`
        )
          .bind(userId, body.gameType, achievementId.trim())
          .run();

        if (result.meta.changes > 0) {
          syncedCount++;
        }
      } catch (e) {
        // Log but continue with other achievements
        console.error(`Failed to sync achievement ${achievementId}:`, e);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        syncedCount,
        totalRequested: body.achievementIds.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Achievement sync error:', error);
    return new Response(JSON.stringify({ error: 'Failed to sync achievements' }), {
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
