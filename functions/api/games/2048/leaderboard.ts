// Cloudflare Pages Function for 2048 Leaderboard (D1)

interface Env {
  DB: D1Database;
}

interface LeaderboardEntry {
  id?: number;
  nickname: string;
  score: number;
  max_tile: number;
  moves: number;
  date: string;
  device_id?: string;
  created_at?: string;
}

// GET: ランキングを取得
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 100);

    const result = await env.DB.prepare(
      `SELECT id, nickname, score, max_tile, moves, date, created_at
       FROM game_2048_leaderboard
       ORDER BY score DESC
       LIMIT ?`
    )
      .bind(limit)
      .all();

    return new Response(JSON.stringify({ leaderboard: result.results }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('2048 Leaderboard GET error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch leaderboard', leaderboard: [] }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};

// POST: スコアを登録（デバイスIDがある場合は1ユーザー1記録）
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

    // ニックネームをサニタイズ
    const sanitizedNickname = body.nickname.trim().slice(0, 20);
    const deviceId = body.device_id?.trim() || null;

    // デバイスIDがある場合は1ユーザー1記録（UPSERTロジック）
    if (deviceId) {
      // 既存のレコードを確認
      const existing = await env.DB.prepare(
        `SELECT id, score FROM game_2048_leaderboard
         WHERE device_id = ?`
      )
        .bind(deviceId)
        .first<{ id: number; score: number }>();

      if (existing) {
        // 既存レコードがある場合
        if (body.score > existing.score) {
          // 新しいスコアが高い場合のみ更新
          await env.DB.prepare(
            `UPDATE game_2048_leaderboard
             SET nickname = ?, score = ?, max_tile = ?, moves = ?, date = ?
             WHERE id = ?`
          )
            .bind(
              sanitizedNickname,
              body.score,
              body.max_tile || 0,
              body.moves || 0,
              body.date || new Date().toISOString(),
              existing.id
            )
            .run();
        }
        // スコアが低い場合は何もしない（成功として返す）
      } else {
        // 新規レコード
        await env.DB.prepare(
          `INSERT INTO game_2048_leaderboard (nickname, score, max_tile, moves, date, device_id)
           VALUES (?, ?, ?, ?, ?, ?)`
        )
          .bind(
            sanitizedNickname,
            body.score,
            body.max_tile || 0,
            body.moves || 0,
            body.date || new Date().toISOString(),
            deviceId
          )
          .run();
      }
    } else {
      // デバイスIDがない場合は従来通り（レガシー互換）
      await env.DB.prepare(
        `INSERT INTO game_2048_leaderboard (nickname, score, max_tile, moves, date)
         VALUES (?, ?, ?, ?, ?)`
      )
        .bind(
          sanitizedNickname,
          body.score,
          body.max_tile || 0,
          body.moves || 0,
          body.date || new Date().toISOString()
        )
        .run();
    }

    // 更新後のランキングを取得
    const result = await env.DB.prepare(
      `SELECT id, nickname, score, max_tile, moves, date, created_at
       FROM game_2048_leaderboard
       ORDER BY score DESC
       LIMIT 10`
    )
      .all();

    return new Response(JSON.stringify({ success: true, leaderboard: result.results }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('2048 Leaderboard POST error:', error);
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
