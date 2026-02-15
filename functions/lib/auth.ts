/**
 * 認証ユーティリティ
 * Firebase JWTトークンの検証とユーザー情報取得
 */

export interface Env {
  DB: D1Database;
  ALLOWED_ORIGIN?: string;
}

export interface AuthResult {
  uid: string;
  userId?: number;
}

/**
 * Firebase JWTトークンをデコード（基本検証）
 */
export function decodeFirebaseToken(token: string): { uid: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));
    if (!payload.sub || !payload.exp) return null;

    // 有効期限チェック
    if (payload.exp * 1000 < Date.now()) return null;

    return { uid: payload.sub };
  } catch {
    return null;
  }
}

/**
 * CORS用のAllowed Originを取得
 */
export function getAllowedOrigin(env: Env): string {
  return env.ALLOWED_ORIGIN || 'https://adalabtech.com';
}

/**
 * CORSヘッダーを生成
 */
export function getCorsHeaders(env: Env, methods: string = 'GET, POST, PUT, OPTIONS'): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': getAllowedOrigin(env),
    'Access-Control-Allow-Methods': methods,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

/**
 * リクエストからAuthorizationヘッダーを検証してUIDを取得
 */
export function verifyAuth(request: Request): { uid: string } | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  return decodeFirebaseToken(token);
}

/**
 * UIDからユーザーIDを取得
 */
export async function getUserIdByUid(db: D1Database, uid: string): Promise<number | null> {
  const user = await db.prepare('SELECT id FROM users WHERE firebase_uid = ?').bind(uid).first<{ id: number }>();
  return user?.id || null;
}

/**
 * リクエストから認証情報とユーザーIDを取得（オプショナル）
 * ログインしていなくてもエラーにならない
 */
export async function getOptionalAuth(
  request: Request,
  db: D1Database
): Promise<{ uid: string; userId: number } | null> {
  const auth = verifyAuth(request);
  if (!auth) return null;

  const userId = await getUserIdByUid(db, auth.uid);
  if (!userId) return null;

  return { uid: auth.uid, userId };
}

/**
 * エラーレスポンスを生成
 */
export function errorResponse(
  message: string,
  status: number,
  corsHeaders: Record<string, string>
): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/**
 * 成功レスポンスを生成
 */
export function successResponse(
  data: unknown,
  corsHeaders: Record<string, string>,
  cacheControl?: string
): Response {
  const headers: Record<string, string> = {
    ...corsHeaders,
    'Content-Type': 'application/json',
  };
  if (cacheControl) {
    headers['Cache-Control'] = cacheControl;
  }
  return new Response(JSON.stringify(data), { headers });
}
