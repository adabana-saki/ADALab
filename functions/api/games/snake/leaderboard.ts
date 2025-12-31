import { getCorsHeaders, getOptionalAuth, errorResponse, successResponse } from '../../../lib/auth';

interface Env {
  DB: D1Database;
  ALLOWED_ORIGIN?: string;
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
  const corsHeaders = getCorsHeaders(env);

  try {
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 100);

    const result = await env.DB.prepare(
      `SELECT id, nickname, score, length, time_survived, date, user_id
       FROM snake_leaderboard
       ORDER BY score DESC
       LIMIT ?`
    )
      .bind(limit)
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

    if (typeof body.score !== 'number' || body.score < 0 || body.score > 100000) {
      return errorResponse('Invalid score', 400, corsHeaders);
    }

    const deviceId = body.device_id || null;

    // UPSERTロジック: user_id優先、なければdevice_id
    const lookupField = userId ? 'user_id' : 'device_id';
    const lookupValue = userId || deviceId;

    if (lookupValue) {
      const existing = await env.DB.prepare(
        `SELECT id, score FROM snake_leaderboard WHERE ${lookupField} = ?`
      )
        .bind(lookupValue)
        .first();

      if (existing) {
        // 既存スコアより高い場合のみ更新
        if (body.score > (existing.score as number)) {
          await env.DB.prepare(
            `UPDATE snake_leaderboard
             SET nickname = ?, score = ?, length = ?, time_survived = ?, date = ?, user_id = COALESCE(?, user_id)
             WHERE id = ?`
          )
            .bind(
              body.nickname,
              body.score,
              body.length,
              body.time_survived || null,
              body.date,
              userId,
              existing.id
            )
            .run();
        } else if (userId) {
          // スコアは低いがuser_idを紐付ける
          await env.DB.prepare(
            `UPDATE snake_leaderboard SET user_id = ? WHERE id = ?`
          )
            .bind(userId, existing.id)
            .run();
        }
      } else {
        // 新規挿入
        await env.DB.prepare(
          `INSERT INTO snake_leaderboard (nickname, score, length, time_survived, date, device_id, user_id)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
          .bind(
            body.nickname,
            body.score,
            body.length,
            body.time_survived || null,
            body.date,
            deviceId,
            userId
          )
          .run();
      }
    } else {
      // 識別子なしの場合は常に挿入
      await env.DB.prepare(
        `INSERT INTO snake_leaderboard (nickname, score, length, time_survived, date)
         VALUES (?, ?, ?, ?, ?)`
      )
        .bind(body.nickname, body.score, body.length, body.time_survived || null, body.date)
        .run();
    }

    // 更新後のランキング取得
    const leaderboard = await env.DB.prepare(
      `SELECT id, nickname, score, length, time_survived, date, user_id
       FROM snake_leaderboard
       ORDER BY score DESC
       LIMIT 10`
    ).all();

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
