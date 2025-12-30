interface Env {
  DB: D1Database;
  ALLOWED_ORIGIN?: string;
}

interface SyncRequest {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
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

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const allowedOrigin = getAllowedOrigin(env);

  const corsHeaders = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    // Verify Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing or invalid Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.slice(7);
    const decoded = decodeFirebaseToken(token);
    if (!decoded) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: SyncRequest = await request.json();

    // Validate required fields
    if (!body.uid) {
      return new Response(JSON.stringify({ error: 'uid is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify token UID matches request UID
    if (decoded.uid !== body.uid) {
      return new Response(JSON.stringify({ error: 'UID mismatch' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const nickname = body.displayName || body.email?.split('@')[0] || 'User';

    // Check if user exists
    const existingUser = await env.DB.prepare(
      'SELECT id, nickname, avatar_url FROM users WHERE firebase_uid = ?'
    )
      .bind(body.uid)
      .first();

    if (existingUser) {
      // Update existing user (only update if changed)
      await env.DB.prepare(
        `UPDATE users
         SET email = ?, avatar_url = COALESCE(?, avatar_url), updated_at = CURRENT_TIMESTAMP
         WHERE firebase_uid = ?`
      )
        .bind(body.email, body.photoURL, body.uid)
        .run();

      return new Response(
        JSON.stringify({
          success: true,
          user: {
            id: existingUser.id,
            nickname: existingUser.nickname,
            avatar_url: existingUser.avatar_url || body.photoURL,
          },
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else {
      // Create new user
      const result = await env.DB.prepare(
        `INSERT INTO users (firebase_uid, email, nickname, avatar_url)
         VALUES (?, ?, ?, ?)`
      )
        .bind(body.uid, body.email, nickname, body.photoURL)
        .run();

      return new Response(
        JSON.stringify({
          success: true,
          user: {
            id: result.meta.last_row_id,
            nickname: nickname,
            avatar_url: body.photoURL,
          },
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('User sync error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to sync user' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
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
