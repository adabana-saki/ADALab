interface Env {
  DB: D1Database;
}

interface LeaderboardEntry {
  nickname: string;
  wpm: number;
  accuracy: number;
  mode: 'time' | 'sudden_death' | 'word_count';
  language: 'en' | 'ja' | 'mixed';
  words_typed: number;
  time_seconds?: number;
  date: string;
  device_id?: string;
}

// GET: ランキング取得
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const url = new URL(request.url);
    const mode = url.searchParams.get('mode') || 'time';
    const language = url.searchParams.get('language') || 'en';
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 100);

    const result = await env.DB.prepare(
      `SELECT id, nickname, wpm, accuracy, mode, language, words_typed, time_seconds, date
       FROM typing_leaderboard
       WHERE mode = ? AND language = ?
       ORDER BY wpm DESC
       LIMIT ?`
    )
      .bind(mode, language, limit)
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

    if (typeof body.wpm !== 'number' || body.wpm < 0 || body.wpm > 500) {
      return new Response(
        JSON.stringify({ error: 'Invalid wpm' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    if (!['time', 'sudden_death', 'word_count'].includes(body.mode)) {
      return new Response(
        JSON.stringify({ error: 'Invalid mode' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    if (!['en', 'ja', 'mixed'].includes(body.language)) {
      return new Response(
        JSON.stringify({ error: 'Invalid language' }),
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
        `SELECT id, wpm FROM typing_leaderboard WHERE device_id = ? AND mode = ? AND language = ?`
      )
        .bind(deviceId, body.mode, body.language)
        .first();

      if (existing) {
        // 既存WPMより高い場合のみ更新
        if (body.wpm > (existing.wpm as number)) {
          await env.DB.prepare(
            `UPDATE typing_leaderboard
             SET nickname = ?, wpm = ?, accuracy = ?, words_typed = ?, time_seconds = ?, date = ?
             WHERE id = ?`
          )
            .bind(
              body.nickname,
              body.wpm,
              body.accuracy,
              body.words_typed,
              body.time_seconds || null,
              body.date,
              existing.id
            )
            .run();
        }
      } else {
        // 新規挿入
        await env.DB.prepare(
          `INSERT INTO typing_leaderboard (nickname, wpm, accuracy, mode, language, words_typed, time_seconds, date, device_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
          .bind(
            body.nickname,
            body.wpm,
            body.accuracy,
            body.mode,
            body.language,
            body.words_typed,
            body.time_seconds || null,
            body.date,
            deviceId
          )
          .run();
      }
    } else {
      // device_idなしの場合は常に挿入
      await env.DB.prepare(
        `INSERT INTO typing_leaderboard (nickname, wpm, accuracy, mode, language, words_typed, time_seconds, date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          body.nickname,
          body.wpm,
          body.accuracy,
          body.mode,
          body.language,
          body.words_typed,
          body.time_seconds || null,
          body.date
        )
        .run();
    }

    // 更新後のランキング取得
    const leaderboard = await env.DB.prepare(
      `SELECT id, nickname, wpm, accuracy, mode, language, words_typed, time_seconds, date
       FROM typing_leaderboard
       WHERE mode = ? AND language = ?
       ORDER BY wpm DESC
       LIMIT 10`
    )
      .bind(body.mode, body.language)
      .all();

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
