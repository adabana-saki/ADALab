/**
 * ゲーム設定を管理するフック
 * ログインユーザーはサーバーに保存、未ログインはlocalStorageに保存
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// ゲームタイプの定義
export type GameType = 'global' | 'tetris' | '2048' | 'snake' | 'typing';

// 各ゲームの設定型
export interface GlobalSettings {
  soundEnabled: boolean;
  soundVolume: number;
  theme: 'light' | 'dark' | 'system';
  language: 'ja' | 'en';
  nickname: string;
}

export interface TetrisSettings {
  ghostPiece: boolean;
  holdEnabled: boolean;
  das: number;
  arr: number;
  softDropSpeed: number;
  showNextCount: number;
  defaultMode: 'endless' | 'sprint';
}

export interface Game2048Settings {
  gridSize: number;
  targetTile: number;
  undoEnabled: boolean;
  swipeSensitivity: number;
  animationSpeed: 'slow' | 'normal' | 'fast';
}

export interface SnakeSettings {
  initialSpeed: 'slow' | 'normal' | 'fast';
  gridSize: 'small' | 'medium' | 'large';
  wallMode: 'solid' | 'wrap';
  controlMode: 'arrows' | 'wasd' | 'swipe';
}

export interface TypingSettings {
  defaultMode: 'time' | 'sudden_death' | 'word_count';
  defaultLanguage: 'en' | 'ja' | 'mixed';
  defaultDifficulty: 'easy' | 'normal' | 'hard';
  defaultTimeLimit: number;
  defaultWordCount: number;
  showKeyboard: boolean;
  inputType: 'word' | 'sentence';
  sentenceCategory: string;
}

// 設定タイプマップ
export interface SettingsMap {
  global: GlobalSettings;
  tetris: TetrisSettings;
  '2048': Game2048Settings;
  snake: SnakeSettings;
  typing: TypingSettings;
}

// デフォルト設定
export const DEFAULT_SETTINGS: SettingsMap = {
  global: {
    soundEnabled: true,
    soundVolume: 0.5,
    theme: 'system',
    language: 'ja',
    nickname: '',
  },
  tetris: {
    ghostPiece: true,
    holdEnabled: true,
    das: 170,
    arr: 50,
    softDropSpeed: 50,
    showNextCount: 3,
    defaultMode: 'endless',
  },
  '2048': {
    gridSize: 4,
    targetTile: 2048,
    undoEnabled: true,
    swipeSensitivity: 50,
    animationSpeed: 'normal',
  },
  snake: {
    initialSpeed: 'normal',
    gridSize: 'medium',
    wallMode: 'solid',
    controlMode: 'arrows',
  },
  typing: {
    defaultMode: 'time',
    defaultLanguage: 'ja',
    defaultDifficulty: 'normal',
    defaultTimeLimit: 60,
    defaultWordCount: 25,
    showKeyboard: false,
    inputType: 'word',
    sentenceCategory: 'general',
  },
};

const STORAGE_KEY_PREFIX = 'game-settings-';

/**
 * ゲーム設定フック
 */
export function useGameSettings<T extends GameType>(gameType: T) {
  const { user, getIdToken } = useAuth();
  const [settings, setSettings] = useState<SettingsMap[T]>(DEFAULT_SETTINGS[gameType]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ローカルストレージから読み込み
  const loadFromLocal = useCallback(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${gameType}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_SETTINGS[gameType], ...parsed };
      }
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS[gameType];
  }, [gameType]);

  // ローカルストレージに保存
  const saveToLocal = useCallback(
    (newSettings: Partial<SettingsMap[T]>) => {
      try {
        const current = loadFromLocal();
        const merged = { ...current, ...newSettings };
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${gameType}`, JSON.stringify(merged));
        return merged;
      } catch {
        return loadFromLocal();
      }
    },
    [gameType, loadFromLocal]
  );

  // サーバーから読み込み
  const loadFromServer = useCallback(async () => {
    if (!user) return null;

    try {
      const token = await getIdToken();
      if (!token) return null;

      const response = await fetch(`/api/user/settings?game=${gameType}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.settings as SettingsMap[T];
      }
    } catch {
      // ignore
    }
    return null;
  }, [user, getIdToken, gameType]);

  // サーバーに保存
  const saveToServer = useCallback(
    async (newSettings: Partial<SettingsMap[T]>) => {
      if (!user) return false;

      try {
        const token = await getIdToken();
        if (!token) return false;

        const response = await fetch('/api/user/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            game: gameType,
            settings: newSettings,
          }),
        });

        return response.ok;
      } catch {
        return false;
      }
    },
    [user, getIdToken, gameType]
  );

  // 初期読み込み
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        // まずローカルから読み込み
        let loadedSettings = loadFromLocal();

        // ログインユーザーならサーバーからも読み込み
        if (user) {
          const serverSettings = await loadFromServer();
          if (serverSettings) {
            loadedSettings = serverSettings;
            // ローカルにも同期
            saveToLocal(serverSettings);
          }
        }

        setSettings(loadedSettings);
      } catch (e) {
        setError('設定の読み込みに失敗しました');
        console.error('Settings load error:', e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, loadFromLocal, loadFromServer, saveToLocal]);

  // 設定を更新
  const updateSettings = useCallback(
    async (newSettings: Partial<SettingsMap[T]>) => {
      // 即座にUIを更新
      setSettings((prev) => ({ ...prev, ...newSettings }));

      // ローカルに保存
      saveToLocal(newSettings);

      // ログインユーザーならサーバーにも保存
      if (user) {
        const success = await saveToServer(newSettings);
        if (!success) {
          console.warn('Failed to save settings to server');
        }
      }
    },
    [user, saveToLocal, saveToServer]
  );

  // 設定をリセット
  const resetSettings = useCallback(async () => {
    const defaultSettings = DEFAULT_SETTINGS[gameType];
    setSettings(defaultSettings);

    // ローカルをクリア
    try {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}${gameType}`);
    } catch {
      // ignore
    }

    // サーバーにもデフォルトを保存
    if (user) {
      await saveToServer(defaultSettings);
    }
  }, [gameType, user, saveToServer]);

  return {
    settings,
    loading,
    error,
    updateSettings,
    resetSettings,
  };
}

/**
 * 全ゲーム設定を一括取得
 */
export function useAllGameSettings() {
  const { user, getIdToken } = useAuth();
  const [settings, setSettings] = useState<SettingsMap>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      // ローカルから読み込み
      const localSettings = { ...DEFAULT_SETTINGS };
      for (const game of Object.keys(DEFAULT_SETTINGS) as GameType[]) {
        try {
          const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${game}`);
          if (stored) {
            localSettings[game] = { ...DEFAULT_SETTINGS[game], ...JSON.parse(stored) };
          }
        } catch {
          // ignore
        }
      }

      // ログインユーザーならサーバーから読み込み
      if (user) {
        try {
          const token = await getIdToken();
          if (token) {
            const response = await fetch('/api/user/settings', {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
              const data = await response.json();
              for (const [game, gameSettings] of Object.entries(data.settings)) {
                if (game in localSettings) {
                  (localSettings as Record<string, unknown>)[game] = gameSettings;
                }
              }
            }
          }
        } catch {
          // ignore
        }
      }

      setSettings(localSettings);
      setLoading(false);
    };

    load();
  }, [user, getIdToken]);

  return { settings, loading };
}
