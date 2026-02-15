// Cloudflare Pages Function for 2048 Leaderboard (D1)
import { getCorsHeaders, getOptionalAuth, errorResponse, successResponse } from '../../../lib/auth';

interface Env {
  DB: D1Database;
  ALLOWED_ORIGIN?: string;
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
  const corsHeaders = getCorsHeaders(env);

  try {
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 100);

    const result = await env.DB.prepare(
      `SELECT id, nickname, score, max_tile, moves, date, created_at, user_id
       FROM game_2048_leaderboard
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
    console.error('2048 Leaderboard GET error:', error);
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

    // ニックネームをサニタイズ
    const sanitizedNickname = body.nickname.trim().slice(0, 20);
    const deviceId = body.device_id?.trim() || null;

    // UPSERTロジック: user_id優先、なければdevice_id
    const lookupField = userId ? 'user_id' : 'device_id';
    const lookupValue = userId || deviceId;

    if (lookupValue) {
      // 既存のレコードを確認
      const existing = await env.DB.prepare(
        `SELECT id, score FROM game_2048_leaderboard WHERE ${lookupField} = ?`
      )
        .bind(lookupValue)
        .first<{ id: number; score: number }>();

      if (existing) {
        // 既存レコードがある場合
        if (body.score > existing.score) {
          // 新しいスコアが高い場合のみ更新
          await env.DB.prepare(
            `UPDATE game_2048_leaderboard
             SET nickname = ?, score = ?, max_tile = ?, moves = ?, date = ?, user_id = COALESCE(?, user_id)
             WHERE id = ?`
          )
            .bind(
              sanitizedNickname,
              body.score,
              body.max_tile || 0,
              body.moves || 0,
              body.date || new Date().toISOString(),
              userId,
              existing.id
            )
            .run();
        } else if (userId) {
          // スコアは低いがuser_idを紐付ける
          await env.DB.prepare(
            `UPDATE game_2048_leaderboard SET user_id = ? WHERE id = ?`
          )
            .bind(userId, existing.id)
            .run();
        }
      } else {
        // 新規レコード
        await env.DB.prepare(
          `INSERT INTO game_2048_leaderboard (nickname, score, max_tile, moves, date, device_id, user_id)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
          .bind(
            sanitizedNickname,
            body.score,
            body.max_tile || 0,
            body.moves || 0,
            body.date || new Date().toISOString(),
            deviceId,
            userId
          )
          .run();
      }
    } else {
      // 識別子がない場合は従来通り（レガシー互換）
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
      `SELECT id, nickname, score, max_tile, moves, date, created_at, user_id
       FROM game_2048_leaderboard
       ORDER BY score DESC
       LIMIT 10`
    )
      .all();

    return successResponse({ success: true, leaderboard: result.results }, corsHeaders);
  } catch (error) {
    console.error('2048 Leaderboard POST error:', error);
    return errorResponse('Failed to submit score', 500, corsHeaders);
  }
};

// OPTIONS: CORS preflight
export const onRequestOptions: PagesFunction<Env> = async (context) => {
  const corsHeaders = getCorsHeaders(context.env);
  return new Response(null, { headers: corsHeaders });
};
