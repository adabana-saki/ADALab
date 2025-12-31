/**
 * ユーザーゲーム設定 API
 * GET: 設定取得
 * PUT: 設定更新
 */
import {
  getCorsHeaders,
  verifyAuth,
  getUserIdByUid,
  errorResponse,
  successResponse,
} from '../../lib/auth';

interface Env {
  DB: D1Database;
  ALLOWED_ORIGIN?: string;
}

// ゲームタイプの定義
type GameType = 'tetris' | '2048' | 'snake' | 'typing' | 'global';

// 各ゲームの設定スキーマ
interface GlobalSettings {
  soundEnabled: boolean;
  soundVolume: number;
  theme: 'light' | 'dark' | 'system';
  language: 'ja' | 'en';
  nickname: string;
}

interface TetrisSettings {
  ghostPiece: boolean;
  holdEnabled: boolean;
  das: number; // Delayed Auto Shift (ms)
  arr: number; // Auto Repeat Rate (ms)
  softDropSpeed: number;
  showNextCount: number; // 1-6
  defaultMode: 'endless' | 'sprint';
}

interface Game2048Settings {
  gridSize: number; // 4, 5, 6
  targetTile: number; // 2048, 4096, etc.
  undoEnabled: boolean;
  swipeSensitivity: number;
  animationSpeed: 'slow' | 'normal' | 'fast';
}

interface SnakeSettings {
  initialSpeed: 'slow' | 'normal' | 'fast';
  gridSize: 'small' | 'medium' | 'large';
  wallMode: 'solid' | 'wrap';
  controlMode: 'arrows' | 'wasd' | 'swipe';
}

interface TypingSettings {
  defaultMode: 'time' | 'sudden_death' | 'word_count';
  defaultLanguage: 'en' | 'ja' | 'mixed';
  defaultDifficulty: 'easy' | 'normal' | 'hard';
  defaultTimeLimit: number; // seconds
  defaultWordCount: number;
  showKeyboard: boolean;
  inputType: 'word' | 'sentence';
  sentenceCategory: string;
}

// デフォルト設定
const DEFAULT_SETTINGS: Record<GameType, unknown> = {
  global: {
    soundEnabled: true,
    soundVolume: 0.5,
    theme: 'system',
    language: 'ja',
    nickname: '',
  } as GlobalSettings,
  tetris: {
    ghostPiece: true,
    holdEnabled: true,
    das: 170,
    arr: 50,
    softDropSpeed: 50,
    showNextCount: 3,
    defaultMode: 'endless',
  } as TetrisSettings,
  '2048': {
    gridSize: 4,
    targetTile: 2048,
    undoEnabled: true,
    swipeSensitivity: 50,
    animationSpeed: 'normal',
  } as Game2048Settings,
  snake: {
    initialSpeed: 'normal',
    gridSize: 'medium',
    wallMode: 'solid',
    controlMode: 'arrows',
  } as SnakeSettings,
  typing: {
    defaultMode: 'time',
    defaultLanguage: 'ja',
    defaultDifficulty: 'normal',
    defaultTimeLimit: 60,
    defaultWordCount: 25,
    showKeyboard: false,
    inputType: 'word',
    sentenceCategory: 'general',
  } as TypingSettings,
};

// GET: ユーザー設定取得
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const corsHeaders = getCorsHeaders(env);

  try {
    // 認証確認
    const auth = verifyAuth(request);
    if (!auth) {
      return errorResponse('Unauthorized', 401, corsHeaders);
    }

    const userId = await getUserIdByUid(env.DB, auth.uid);
    if (!userId) {
      return errorResponse('User not found', 404, corsHeaders);
    }

    const url = new URL(request.url);
    const gameType = url.searchParams.get('game') as GameType | null;

    // 特定ゲームの設定を取得
    if (gameType && gameType in DEFAULT_SETTINGS) {
      const result = await env.DB.prepare(
        `SELECT settings_json FROM user_game_settings WHERE user_id = ? AND game_type = ?`
      )
        .bind(userId, gameType)
        .first<{ settings_json: string }>();

      const settings = result
        ? { ...DEFAULT_SETTINGS[gameType], ...JSON.parse(result.settings_json) }
        : DEFAULT_SETTINGS[gameType];

      return successResponse({ game: gameType, settings }, corsHeaders);
    }

    // 全ゲームの設定を取得
    const results = await env.DB.prepare(
      `SELECT game_type, settings_json FROM user_game_settings WHERE user_id = ?`
    )
      .bind(userId)
      .all<{ game_type: string; settings_json: string }>();

    const settings: Record<string, unknown> = {};

    // デフォルト設定をベースに
    for (const [game, defaultSetting] of Object.entries(DEFAULT_SETTINGS)) {
      settings[game] = { ...defaultSetting };
    }

    // ユーザー設定で上書き
    for (const row of results.results) {
      if (row.game_type in settings) {
        settings[row.game_type] = {
          ...settings[row.game_type],
          ...JSON.parse(row.settings_json),
        };
      }
    }

    return successResponse({ settings }, corsHeaders);
  } catch (error) {
    console.error('Settings GET error:', error);
    return errorResponse('Failed to fetch settings', 500, corsHeaders);
  }
};

// PUT: ユーザー設定更新
export const onRequestPut: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const corsHeaders = getCorsHeaders(env);

  try {
    // 認証確認
    const auth = verifyAuth(request);
    if (!auth) {
      return errorResponse('Unauthorized', 401, corsHeaders);
    }

    const userId = await getUserIdByUid(env.DB, auth.uid);
    if (!userId) {
      return errorResponse('User not found', 404, corsHeaders);
    }

    const body = await request.json() as { game: GameType; settings: Record<string, unknown> };

    // バリデーション
    if (!body.game || !(body.game in DEFAULT_SETTINGS)) {
      return errorResponse('Invalid game type', 400, corsHeaders);
    }

    if (!body.settings || typeof body.settings !== 'object') {
      return errorResponse('Invalid settings', 400, corsHeaders);
    }

    // 設定をマージ（既存設定 + 新設定）
    const existingResult = await env.DB.prepare(
      `SELECT settings_json FROM user_game_settings WHERE user_id = ? AND game_type = ?`
    )
      .bind(userId, body.game)
      .first<{ settings_json: string }>();

    const existingSettings = existingResult ? JSON.parse(existingResult.settings_json) : {};
    const mergedSettings = { ...existingSettings, ...body.settings };
    const settingsJson = JSON.stringify(mergedSettings);

    // UPSERT
    await env.DB.prepare(
      `INSERT INTO user_game_settings (user_id, game_type, settings_json, updated_at)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(user_id, game_type) DO UPDATE SET
         settings_json = excluded.settings_json,
         updated_at = CURRENT_TIMESTAMP`
    )
      .bind(userId, body.game, settingsJson)
      .run();

    // 最終設定を返す
    const finalSettings = { ...DEFAULT_SETTINGS[body.game], ...mergedSettings };

    return successResponse({ success: true, game: body.game, settings: finalSettings }, corsHeaders);
  } catch (error) {
    console.error('Settings PUT error:', error);
    return errorResponse('Failed to update settings', 500, corsHeaders);
  }
};

// OPTIONS: CORS preflight
export const onRequestOptions: PagesFunction<Env> = async (context) => {
  const corsHeaders = getCorsHeaders(context.env);
  return new Response(null, { headers: corsHeaders });
};
