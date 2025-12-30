interface Env {
  DB: D1Database;
}

interface LeaderboardEntry {
  nickname: string;
  score: number;
  length: number;
  time_survived?: number;
  date: string;
  device_id?: string;
}

// GET: ランキング取得
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 100);

    const result = await env.DB.prepare(
      `SELECT id, nickname, score, length, time_survived, date
       FROM snake_leaderboard
       ORDER BY score DESC
       LIMIT ?`
    )
      .bind(limit)
      .all();

    return new Response(
      JSON.stringify({ leaderboard: result.results }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch leaderboard' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
};

// POST: スコア登録
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const body: LeaderboardEntry = await request.json();

    // バリデーション
    if (!body.nickname || typeof body.nickname !== 'string' || body.nickname.length > 20) {
      return new Response(
        JSON.stringify({ error: 'Invalid nickname' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    if (typeof body.score !== 'number' || body.score < 0 || body.score > 100000) {
      return new Response(
        JSON.stringify({ error: 'Invalid score' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    const deviceId = body.device_id || null;

    // UPSERTロジック
    if (deviceId) {
      const existing = await env.DB.prepare(
        `SELECT id, score FROM snake_leaderboard WHERE device_id = ?`
      )
        .bind(deviceId)
        .first();

      if (existing) {
        // 既存スコアより高い場合のみ更新
        if (body.score > (existing.score as number)) {
          await env.DB.prepare(
            `UPDATE snake_leaderboard
             SET nickname = ?, score = ?, length = ?, time_survived = ?, date = ?
             WHERE id = ?`
          )
            .bind(
              body.nickname,
              body.score,
              body.length,
              body.time_survived || null,
              body.date,
              existing.id
            )
            .run();
        }
      } else {
        // 新規挿入
        await env.DB.prepare(
          `INSERT INTO snake_leaderboard (nickname, score, length, time_survived, date, device_id)
           VALUES (?, ?, ?, ?, ?, ?)`
        )
          .bind(
            body.nickname,
            body.score,
            body.length,
            body.time_survived || null,
            body.date,
            deviceId
          )
          .run();
      }
    } else {
      // device_idなしの場合は常に挿入
      await env.DB.prepare(
        `INSERT INTO snake_leaderboard (nickname, score, length, time_survived, date)
         VALUES (?, ?, ?, ?, ?)`
      )
        .bind(body.nickname, body.score, body.length, body.time_survived || null, body.date)
        .run();
    }

    // 更新後のランキング取得
    const leaderboard = await env.DB.prepare(
      `SELECT id, nickname, score, length, time_survived, date
       FROM snake_leaderboard
       ORDER BY score DESC
       LIMIT 10`
    ).all();

    return new Response(
      JSON.stringify({ success: true, leaderboard: leaderboard.results }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Score submit error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to submit score' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
