import { getCorsHeaders, getOptionalAuth, errorResponse, successResponse } from '../../../lib/auth';

interface Env {
  DB: D1Database;
  ALLOWED_ORIGIN?: string;
}

interface LeaderboardEntry {
  nickname: string;
  time_seconds: number;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  date: string;
  device_id?: string;
}

const VALID_DIFFICULTIES = ['beginner', 'intermediate', 'expert'];

// GET: ランキング取得
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const corsHeaders = getCorsHeaders(env);

  try {
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 100);
    const difficulty = url.searchParams.get('difficulty') || 'beginner';

    if (!VALID_DIFFICULTIES.includes(difficulty)) {
      return errorResponse('Invalid difficulty', 400, corsHeaders);
    }

    const result = await env.DB.prepare(
      `SELECT id, nickname, time_seconds, difficulty, date, user_id
       FROM minesweeper_leaderboard
       WHERE difficulty = ?
       ORDER BY time_seconds ASC
       LIMIT ?`
    )
      .bind(difficulty, limit)
      .all();

    return successResponse(
      { leaderboard: result.results },
      corsHeaders,
      'public, max-age=60'
    );
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    return errorResponse('Failed to fetch leaderboard', 500, corsHeaders);
  }
};

// POST: スコア登録
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const corsHeaders = getCorsHeaders(env);

  try {
    const body: LeaderboardEntry = await request.json();

    // 認証情報を取得（オプショナル）
    const auth = await getOptionalAuth(request, env.DB);
    const userId = auth?.userId || null;

    // バリデーション
    if (!body.nickname || typeof body.nickname !== 'string' || body.nickname.length > 20) {
      return errorResponse('Invalid nickname', 400, corsHeaders);
    }

    if (typeof body.time_seconds !== 'number' || body.time_seconds < 0 || body.time_seconds > 9999) {
      return errorResponse('Invalid time', 400, corsHeaders);
    }

    if (!VALID_DIFFICULTIES.includes(body.difficulty)) {
      return errorResponse('Invalid difficulty', 400, corsHeaders);
    }

    const deviceId = body.device_id || null;

    // UPSERTロジック: user_id優先、なければdevice_id
    // 難易度ごとに1レコード
    const lookupField = userId ? 'user_id' : 'device_id';
    const lookupValue = userId || deviceId;

    if (lookupValue) {
      const existing = await env.DB.prepare(
        `SELECT id, time_seconds FROM minesweeper_leaderboard WHERE ${lookupField} = ? AND difficulty = ?`
      )
        .bind(lookupValue, body.difficulty)
        .first();

      if (existing) {
        // 既存タイムより短い場合のみ更新（タイムは短い方が良い）
        if (body.time_seconds < (existing.time_seconds as number)) {
          await env.DB.prepare(
            `UPDATE minesweeper_leaderboard
             SET nickname = ?, time_seconds = ?, date = ?, user_id = COALESCE(?, user_id)
             WHERE id = ?`
          )
            .bind(
              body.nickname,
              body.time_seconds,
              body.date,
              userId,
              existing.id
            )
            .run();
        } else if (userId) {
          // タイムは遅いがuser_idを紐付ける
          await env.DB.prepare(
            `UPDATE minesweeper_leaderboard SET user_id = ? WHERE id = ?`
          )
            .bind(userId, existing.id)
            .run();
        }
      } else {
        // 新規挿入
        await env.DB.prepare(
          `INSERT INTO minesweeper_leaderboard (nickname, time_seconds, difficulty, date, device_id, user_id)
           VALUES (?, ?, ?, ?, ?, ?)`
        )
          .bind(
            body.nickname,
            body.time_seconds,
            body.difficulty,
            body.date,
            deviceId,
            userId
          )
          .run();
      }
    } else {
      // 識別子なしの場合は常に挿入
      await env.DB.prepare(
        `INSERT INTO minesweeper_leaderboard (nickname, time_seconds, difficulty, date)
         VALUES (?, ?, ?, ?)`
      )
        .bind(body.nickname, body.time_seconds, body.difficulty, body.date)
        .run();
    }

    // 更新後のランキング取得
    const leaderboard = await env.DB.prepare(
      `SELECT id, nickname, time_seconds, difficulty, date, user_id
       FROM minesweeper_leaderboard
       WHERE difficulty = ?
       ORDER BY time_seconds ASC
       LIMIT 10`
    )
      .bind(body.difficulty)
      .all();

    return successResponse({ success: true, leaderboard: leaderboard.results }, corsHeaders);
  } catch (error) {
    console.error('Score submit error:', error);
    return errorResponse('Failed to submit score', 500, corsHeaders);
  }
};

export const onRequestOptions: PagesFunction<Env> = async (context) => {
  const corsHeaders = getCorsHeaders(context.env);
  return new Response(null, { headers: corsHeaders });
};
