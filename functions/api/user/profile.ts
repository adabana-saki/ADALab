interface Env {
  DB: D1Database;
  ALLOWED_ORIGIN?: string;
}

interface UpdateProfileRequest {
  uid: string;
  nickname?: string;
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

// GET: プロフィール取得
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const allowedOrigin = getAllowedOrigin(env);

  const corsHeaders = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
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

    // Use authenticated UID instead of query parameter
    const uid = auth.uid;

    const user = await env.DB.prepare(
      `SELECT u.id, u.nickname, u.avatar_url, u.created_at,
              (SELECT COUNT(*) FROM user_achievements WHERE user_id = u.id) as total_achievements
       FROM users u
       WHERE u.firebase_uid = ?`
    )
      .bind(uid)
      .first();

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get game stats
    const gameStats = await env.DB.prepare(
      `SELECT game_type, stats_json FROM user_game_stats WHERE user_id = ?`
    )
      .bind(user.id)
      .all();

    // Get achievements count per game
    const achievementCounts = await env.DB.prepare(
      `SELECT game_type, COUNT(*) as count
       FROM user_achievements
       WHERE user_id = ?
       GROUP BY game_type`
    )
      .bind(user.id)
      .all();

    // Get unlocked achievement IDs per game
    const unlockedAchievements = await env.DB.prepare(
      `SELECT game_type, achievement_id, unlocked_at
       FROM user_achievements
       WHERE user_id = ?
       ORDER BY unlocked_at DESC`
    )
      .bind(user.id)
      .all();

    // Get best rankings
    const rankings: Record<string, number | null> = {};

    // Tetris ranking
    const tetrisRank = await env.DB.prepare(
      `SELECT COUNT(*) + 1 as rank
       FROM tetris_leaderboard t1
       WHERE t1.score > (
         SELECT COALESCE(MAX(score), 0) FROM tetris_leaderboard WHERE user_id = ?
       )`
    )
      .bind(user.id)
      .first();
    rankings.tetris = tetrisRank?.rank as number | null;

    // 2048 ranking
    const game2048Rank = await env.DB.prepare(
      `SELECT COUNT(*) + 1 as rank
       FROM game_2048_leaderboard t1
       WHERE t1.score > (
         SELECT COALESCE(MAX(score), 0) FROM game_2048_leaderboard WHERE user_id = ?
       )`
    )
      .bind(user.id)
      .first();
    rankings['2048'] = game2048Rank?.rank as number | null;

    return new Response(
      JSON.stringify({
        user: {
          id: user.id,
          nickname: user.nickname,
          avatar_url: user.avatar_url,
          created_at: user.created_at,
          total_achievements: user.total_achievements,
        },
        gameStats: gameStats.results.reduce((acc, stat) => {
          acc[stat.game_type as string] = JSON.parse(stat.stats_json as string);
          return acc;
        }, {} as Record<string, unknown>),
        achievementCounts: achievementCounts.results.reduce((acc, item) => {
          acc[item.game_type as string] = item.count as number;
          return acc;
        }, {} as Record<string, number>),
        unlockedAchievements: unlockedAchievements.results.reduce((acc, item) => {
          const gameType = item.game_type as string;
          if (!acc[gameType]) acc[gameType] = [];
          acc[gameType].push({
            id: item.achievement_id as string,
            unlockedAt: item.unlocked_at as string,
          });
          return acc;
        }, {} as Record<string, Array<{ id: string; unlockedAt: string }>>),
        rankings,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Profile fetch error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch profile' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

// PUT: プロフィール更新
export const onRequestPut: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const allowedOrigin = getAllowedOrigin(env);

  const corsHeaders = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
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

    const body: UpdateProfileRequest = await request.json();

    // Verify token UID matches request UID
    if (body.uid && body.uid !== auth.uid) {
      return new Response(JSON.stringify({ error: 'UID mismatch' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use authenticated UID
    const uid = auth.uid;

    // Validate nickname
    if (body.nickname) {
      if (body.nickname.length < 1 || body.nickname.length > 20) {
        return new Response(
          JSON.stringify({ error: 'Nickname must be 1-20 characters' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    await env.DB.prepare(
      `UPDATE users
       SET nickname = COALESCE(?, nickname), updated_at = CURRENT_TIMESTAMP
       WHERE firebase_uid = ?`
    )
      .bind(body.nickname, uid)
      .run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update profile' }), {
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
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};
