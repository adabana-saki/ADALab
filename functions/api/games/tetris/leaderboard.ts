// Cloudflare Pages Function for Tetris Leaderboard (D1)

interface Env {
  DB: D1Database;
}

interface LeaderboardEntry {
  id?: number;
  nickname: string;
  score: number;
  lines: number;
  level: number;
  date: string;
  mode: 'endless' | 'sprint';
  time?: number;
  created_at?: string;
}

// GET: ランキングを取得
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const url = new URL(request.url);
    const mode = url.searchParams.get('mode') || 'endless';
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 100);

    const result = await env.DB.prepare(
      `SELECT id, nickname, score, lines, level, date, mode, time, created_at
       FROM tetris_leaderboard
       WHERE mode = ?
       ORDER BY score DESC
       LIMIT ?`
    )
      .bind(mode, limit)
      .all();

    return new Response(JSON.stringify({ leaderboard: result.results }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Leaderboard GET error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch leaderboard', leaderboard: [] }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};

// POST: スコアを登録
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const body = await request.json() as LeaderboardEntry;

    // バリデーション
    if (!body.nickname || typeof body.nickname !== 'string' || body.nickname.length > 20) {
      return new Response(JSON.stringify({ error: 'Invalid nickname' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (typeof body.score !== 'number' || body.score < 0 || body.score > 10000000) {
      return new Response(JSON.stringify({ error: 'Invalid score' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (!['endless', 'sprint'].includes(body.mode)) {
      return new Response(JSON.stringify({ error: 'Invalid mode' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // ニックネームをサニタイズ
    const sanitizedNickname = body.nickname.trim().slice(0, 20);

    // スコアを登録
    await env.DB.prepare(
      `INSERT INTO tetris_leaderboard (nickname, score, lines, level, date, mode, time)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        sanitizedNickname,
        body.score,
        body.lines || 0,
        body.level || 1,
        body.date || new Date().toISOString(),
        body.mode,
        body.time || null
      )
      .run();

    // 更新後のランキングを取得
    const result = await env.DB.prepare(
      `SELECT id, nickname, score, lines, level, date, mode, time, created_at
       FROM tetris_leaderboard
       WHERE mode = ?
       ORDER BY score DESC
       LIMIT 10`
    )
      .bind(body.mode)
      .all();

    return new Response(JSON.stringify({ success: true, leaderboard: result.results }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Leaderboard POST error:', error);
    return new Response(JSON.stringify({ error: 'Failed to submit score' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
};

// OPTIONS: CORS preflight
export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
