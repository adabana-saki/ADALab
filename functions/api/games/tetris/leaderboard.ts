// Cloudflare Pages Function for Tetris Leaderboard (D1)
import { getCorsHeaders, getOptionalAuth, errorResponse, successResponse } from '../../../lib/auth';

interface Env {
  DB: D1Database;
  ALLOWED_ORIGIN?: string;
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
  device_id?: string;
  created_at?: string;
}

// GET: ランキングを取得
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const corsHeaders = getCorsHeaders(env);

  try {
    const url = new URL(request.url);
    const mode = url.searchParams.get('mode') || 'endless';
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 100);

    const result = await env.DB.prepare(
      `SELECT id, nickname, score, lines, level, date, mode, time, created_at, user_id
       FROM tetris_leaderboard
       WHERE mode = ?
       ORDER BY score DESC
       LIMIT ?`
    )
      .bind(mode, limit)
      .all();

    return successResponse(
      { leaderboard: result.results },
      corsHeaders,
      'public, max-age=60'
    );
  } catch (error) {
    console.error('Leaderboard GET error:', error);
    return errorResponse('Failed to fetch leaderboard', 500, corsHeaders);
  }
};

// POST: スコアを登録（user_id/デバイスIDがある場合は1ユーザー1記録）
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const corsHeaders = getCorsHeaders(env);

  try {
    const body = await request.json() as LeaderboardEntry;

    // 認証情報を取得（オプショナル）
    const auth = await getOptionalAuth(request, env.DB);
    const userId = auth?.userId || null;

    // バリデーション
    if (!body.nickname || typeof body.nickname !== 'string' || body.nickname.length > 20) {
      return errorResponse('Invalid nickname', 400, corsHeaders);
    }

    if (typeof body.score !== 'number' || !isFinite(body.score) || body.score < 0 || body.score > 10000000) {
      return errorResponse('Invalid score', 400, corsHeaders);
    }

    if (!['endless', 'sprint'].includes(body.mode)) {
      return errorResponse('Invalid mode', 400, corsHeaders);
    }

    // ニックネームをサニタイズ
    const sanitizedNickname = body.nickname.trim().slice(0, 20);
    const deviceId = body.device_id?.trim() || null;

    // UPSERTロジック: user_id優先、なければdevice_id
    const lookupField = userId ? 'user_id' : 'device_id';
    const lookupValue = userId || deviceId;

    if (lookupValue) {
      // 既存のレコードを確認
      const existing = await env.DB.prepare(
        `SELECT id, score FROM tetris_leaderboard WHERE ${lookupField} = ? AND mode = ?`
      )
        .bind(lookupValue, body.mode)
        .first<{ id: number; score: number }>();

      if (existing) {
        // 既存レコードがある場合
        if (body.score > existing.score) {
          // 新しいスコアが高い場合のみ更新
          await env.DB.prepare(
            `UPDATE tetris_leaderboard
             SET nickname = ?, score = ?, lines = ?, level = ?, date = ?, time = ?, user_id = COALESCE(?, user_id)
             WHERE id = ?`
          )
            .bind(
              sanitizedNickname,
              body.score,
              body.lines || 0,
              body.level || 1,
              body.date || new Date().toISOString(),
              body.time || null,
              userId,
              existing.id
            )
            .run();
        } else if (userId) {
          // スコアは低いがuser_idを紐付ける
          await env.DB.prepare(
            `UPDATE tetris_leaderboard SET user_id = ? WHERE id = ?`
          )
            .bind(userId, existing.id)
            .run();
        }
      } else {
        // 新規レコード
        await env.DB.prepare(
          `INSERT INTO tetris_leaderboard (nickname, score, lines, level, date, mode, time, device_id, user_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
          .bind(
            sanitizedNickname,
            body.score,
            body.lines || 0,
            body.level || 1,
            body.date || new Date().toISOString(),
            body.mode,
            body.time || null,
            deviceId,
            userId
          )
          .run();
      }
    } else {
      // 識別子がない場合は従来通り（レガシー互換）
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
    }

    // 更新後のランキングを取得
    const result = await env.DB.prepare(
      `SELECT id, nickname, score, lines, level, date, mode, time, created_at, user_id
       FROM tetris_leaderboard
       WHERE mode = ?
       ORDER BY score DESC
       LIMIT 10`
    )
      .bind(body.mode)
      .all();

    return successResponse({ success: true, leaderboard: result.results }, corsHeaders);
  } catch (error) {
    console.error('Leaderboard POST error:', error);
    return errorResponse('Failed to submit score', 500, corsHeaders);
  }
};

// OPTIONS: CORS preflight
export const onRequestOptions: PagesFunction<Env> = async (context) => {
  const corsHeaders = getCorsHeaders(context.env);
  return new Response(null, { headers: corsHeaders });
};
