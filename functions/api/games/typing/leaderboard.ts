import { getCorsHeaders, getOptionalAuth, errorResponse, successResponse } from '../../../lib/auth';

interface Env {
  DB: D1Database;
  ALLOWED_ORIGIN?: string;
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
  const corsHeaders = getCorsHeaders(env);

  try {
    const url = new URL(request.url);
    const mode = url.searchParams.get('mode') || 'time';
    const language = url.searchParams.get('language') || 'en';
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 100);

    const result = await env.DB.prepare(
      `SELECT id, nickname, wpm, accuracy, mode, language, words_typed, time_seconds, date, user_id
       FROM typing_leaderboard
       WHERE mode = ? AND language = ?
       ORDER BY wpm DESC
       LIMIT ?`
    )
      .bind(mode, language, limit)
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

    if (typeof body.wpm !== 'number' || body.wpm < 0 || body.wpm > 500) {
      return errorResponse('Invalid wpm', 400, corsHeaders);
    }

    if (!['time', 'sudden_death', 'word_count'].includes(body.mode)) {
      return errorResponse('Invalid mode', 400, corsHeaders);
    }

    if (!['en', 'ja', 'mixed'].includes(body.language)) {
      return errorResponse('Invalid language', 400, corsHeaders);
    }

    if (typeof body.accuracy !== 'number' || body.accuracy < 0 || body.accuracy > 100) {
      return errorResponse('Invalid accuracy (must be 0-100)', 400, corsHeaders);
    }

    if (typeof body.words_typed !== 'number' || body.words_typed < 0 || body.words_typed > 10000) {
      return errorResponse('Invalid words_typed', 400, corsHeaders);
    }

    if (body.time_seconds !== undefined && body.time_seconds !== null) {
      if (typeof body.time_seconds !== 'number' || body.time_seconds < 0 || body.time_seconds > 3600) {
        return errorResponse('Invalid time_seconds', 400, corsHeaders);
      }
    }

    const deviceId = body.device_id || null;

    // UPSERTロジック: user_id優先、なければdevice_id
    const lookupField = userId ? 'user_id' : 'device_id';
    const lookupValue = userId || deviceId;

    if (lookupValue) {
      const existing = await env.DB.prepare(
        `SELECT id, wpm FROM typing_leaderboard WHERE ${lookupField} = ? AND mode = ? AND language = ?`
      )
        .bind(lookupValue, body.mode, body.language)
        .first();

      if (existing) {
        // 既存WPMより高い場合のみ更新
        if (body.wpm > (existing.wpm as number)) {
          await env.DB.prepare(
            `UPDATE typing_leaderboard
             SET nickname = ?, wpm = ?, accuracy = ?, words_typed = ?, time_seconds = ?, date = ?, user_id = COALESCE(?, user_id)
             WHERE id = ?`
          )
            .bind(
              body.nickname,
              body.wpm,
              body.accuracy,
              body.words_typed,
              body.time_seconds || null,
              body.date,
              userId,
              existing.id
            )
            .run();
        } else if (userId) {
          // スコアは低いがuser_idを紐付ける
          await env.DB.prepare(
            `UPDATE typing_leaderboard SET user_id = ? WHERE id = ?`
          )
            .bind(userId, existing.id)
            .run();
        }
      } else {
        // 新規挿入
        await env.DB.prepare(
          `INSERT INTO typing_leaderboard (nickname, wpm, accuracy, mode, language, words_typed, time_seconds, date, device_id, user_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
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
            deviceId,
            userId
          )
          .run();
      }
    } else {
      // 識別子なしの場合は常に挿入
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
      `SELECT id, nickname, wpm, accuracy, mode, language, words_typed, time_seconds, date, user_id
       FROM typing_leaderboard
       WHERE mode = ? AND language = ?
       ORDER BY wpm DESC
       LIMIT 10`
    )
      .bind(body.mode, body.language)
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
