/**
 * Game Achievements System
 * テトリスゲーム専用の実績/アチーブメントシステム
 */

export type GameAchievementCategory = 'gameplay' | 'score' | 'combo' | 'special' | 'battle' | 'milestone';

export type GameAchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface GameAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: GameAchievementCategory;
  rarity: GameAchievementRarity;
  xp: number;
  // 解除条件のヒント
  hint?: string;
  // 非表示（解除するまで名前も表示しない）
  hidden?: boolean;
}

export interface GameAchievementProgress {
  achievementId: string;
  unlockedAt?: number;
  progress?: number;
  maxProgress?: number;
}

export interface UserGameAchievements {
  unlocked: GameAchievementProgress[];
  totalXp: number;
  lastUpdated: number;
}

// レアリティごとのスタイル
export const GAME_RARITY_STYLES: Record<GameAchievementRarity, { bg: string; border: string; text: string; glow: string }> = {
  common: {
    bg: 'bg-gray-500/20',
    border: 'border-gray-400',
    text: 'text-gray-400',
    glow: 'shadow-gray-400/20',
  },
  uncommon: {
    bg: 'bg-green-500/20',
    border: 'border-green-400',
    text: 'text-green-400',
    glow: 'shadow-green-400/30',
  },
  rare: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-400',
    text: 'text-blue-400',
    glow: 'shadow-blue-400/40',
  },
  epic: {
    bg: 'bg-purple-500/20',
    border: 'border-purple-400',
    text: 'text-purple-400',
    glow: 'shadow-purple-400/50',
  },
  legendary: {
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-400',
    text: 'text-yellow-400',
    glow: 'shadow-yellow-400/60',
  },
};

// カテゴリごとのラベル
export const GAME_CATEGORY_LABELS: Record<GameAchievementCategory, string> = {
  gameplay: 'ゲームプレイ',
  score: 'スコア',
  combo: 'コンボ',
  special: 'スペシャル',
  battle: 'バトル',
  milestone: 'マイルストーン',
};

// 実績定義
export const GAME_ACHIEVEMENTS: GameAchievement[] = [
  // ゲームプレイ系
  {
    id: 'first_game',
    name: '初めての一歩',
    description: '初めてゲームをプレイした',
    icon: '🎮',
    category: 'gameplay',
    rarity: 'common',
    xp: 10,
  },
  {
    id: 'first_line',
    name: 'ライン消去',
    description: '初めてラインを消した',
    icon: '✨',
    category: 'gameplay',
    rarity: 'common',
    xp: 10,
  },
  {
    id: 'games_10',
    name: 'ビギナー',
    description: '10回ゲームをプレイした',
    icon: '🌱',
    category: 'milestone',
    rarity: 'common',
    xp: 25,
  },
  {
    id: 'games_50',
    name: 'レギュラー',
    description: '50回ゲームをプレイした',
    icon: '🌿',
    category: 'milestone',
    rarity: 'uncommon',
    xp: 50,
  },
  {
    id: 'games_100',
    name: 'ベテラン',
    description: '100回ゲームをプレイした',
    icon: '🌳',
    category: 'milestone',
    rarity: 'rare',
    xp: 100,
  },

  // スコア系
  {
    id: 'score_1000',
    name: 'スコアハンター',
    description: '1,000点を達成した',
    icon: '🎯',
    category: 'score',
    rarity: 'common',
    xp: 15,
  },
  {
    id: 'score_5000',
    name: 'スコアマスター',
    description: '5,000点を達成した',
    icon: '🏆',
    category: 'score',
    rarity: 'uncommon',
    xp: 30,
  },
  {
    id: 'score_10000',
    name: 'スコアレジェンド',
    description: '10,000点を達成した',
    icon: '👑',
    category: 'score',
    rarity: 'rare',
    xp: 75,
  },
  {
    id: 'score_50000',
    name: 'スコアゴッド',
    description: '50,000点を達成した',
    icon: '⭐',
    category: 'score',
    rarity: 'epic',
    xp: 150,
  },
  {
    id: 'score_100000',
    name: '伝説のプレイヤー',
    description: '100,000点を達成した',
    icon: '🌟',
    category: 'score',
    rarity: 'legendary',
    xp: 300,
  },

  // コンボ系
  {
    id: 'combo_3',
    name: 'コンボ入門',
    description: '3コンボを達成した',
    icon: '🔥',
    category: 'combo',
    rarity: 'common',
    xp: 15,
  },
  {
    id: 'combo_5',
    name: 'コンボマスター',
    description: '5コンボを達成した',
    icon: '💥',
    category: 'combo',
    rarity: 'uncommon',
    xp: 40,
  },
  {
    id: 'combo_10',
    name: 'コンボキング',
    description: '10コンボを達成した',
    icon: '⚡',
    category: 'combo',
    rarity: 'rare',
    xp: 100,
  },
  {
    id: 'combo_15',
    name: 'コンボレジェンド',
    description: '15コンボを達成した',
    icon: '🌈',
    category: 'combo',
    rarity: 'epic',
    xp: 200,
  },

  // スペシャル系
  {
    id: 'tetris',
    name: 'テトリス！',
    description: '4ライン同時消し（テトリス）を達成した',
    icon: '🎉',
    category: 'special',
    rarity: 'uncommon',
    xp: 50,
  },
  {
    id: 'tetris_10',
    name: 'テトリスマスター',
    description: 'テトリスを10回達成した',
    icon: '🎊',
    category: 'special',
    rarity: 'rare',
    xp: 100,
  },
  {
    id: 't_spin',
    name: 'T-Spinner',
    description: 'T-Spinを達成した',
    icon: '🔄',
    category: 'special',
    rarity: 'rare',
    xp: 75,
  },
  {
    id: 't_spin_10',
    name: 'T-Spinマスター',
    description: 'T-Spinを10回達成した',
    icon: '🌀',
    category: 'special',
    rarity: 'epic',
    xp: 150,
  },
  {
    id: 'perfect_clear',
    name: 'パーフェクトクリア',
    description: 'フィールドを完全に空にした',
    icon: '💎',
    category: 'special',
    rarity: 'epic',
    xp: 200,
  },
  {
    id: 'back_to_back',
    name: 'バックトゥバック',
    description: 'テトリスかT-Spinを連続で達成した',
    icon: '🔗',
    category: 'special',
    rarity: 'rare',
    xp: 75,
  },

  // ライン消去系
  {
    id: 'lines_100',
    name: 'ライン職人',
    description: '累計100ライン消去した',
    icon: '📏',
    category: 'milestone',
    rarity: 'uncommon',
    xp: 50,
  },
  {
    id: 'lines_500',
    name: 'ラインマスター',
    description: '累計500ライン消去した',
    icon: '📐',
    category: 'milestone',
    rarity: 'rare',
    xp: 100,
  },
  {
    id: 'lines_1000',
    name: 'ラインレジェンド',
    description: '累計1,000ライン消去した',
    icon: '🗡️',
    category: 'milestone',
    rarity: 'epic',
    xp: 200,
  },

  // バトル系
  {
    id: 'first_battle',
    name: '初陣',
    description: '初めてオンラインバトルに参加した',
    icon: '⚔️',
    category: 'battle',
    rarity: 'common',
    xp: 20,
  },
  {
    id: 'first_win',
    name: '初勝利',
    description: 'オンラインバトルで初めて勝利した',
    icon: '🏅',
    category: 'battle',
    rarity: 'uncommon',
    xp: 50,
  },
  {
    id: 'wins_10',
    name: 'ウィナー',
    description: 'オンラインバトルで10回勝利した',
    icon: '🥇',
    category: 'battle',
    rarity: 'rare',
    xp: 100,
  },
  {
    id: 'wins_50',
    name: 'チャンピオン',
    description: 'オンラインバトルで50回勝利した',
    icon: '🏆',
    category: 'battle',
    rarity: 'epic',
    xp: 200,
  },
  {
    id: 'win_streak_3',
    name: '連勝街道',
    description: '3連勝を達成した',
    icon: '🔥',
    category: 'battle',
    rarity: 'uncommon',
    xp: 60,
  },
  {
    id: 'win_streak_5',
    name: '無敵艦隊',
    description: '5連勝を達成した',
    icon: '💪',
    category: 'battle',
    rarity: 'rare',
    xp: 120,
  },
  {
    id: 'win_streak_10',
    name: '絶対王者',
    description: '10連勝を達成した',
    icon: '👑',
    category: 'battle',
    rarity: 'legendary',
    xp: 300,
  },
  {
    id: 'garbage_send_100',
    name: 'ガベージシューター',
    description: '累計100ラインのお邪魔ブロックを送った',
    icon: '💣',
    category: 'battle',
    rarity: 'uncommon',
    xp: 50,
  },

  // 隠し実績
  {
    id: 'speed_demon',
    name: 'スピードデーモン',
    description: '40ライン消去を60秒以内に達成した',
    icon: '🏃',
    category: 'special',
    rarity: 'epic',
    xp: 150,
    hidden: true,
    hint: '素早くクリアすると...',
  },
  {
    id: 'survivor',
    name: 'サバイバー',
    description: '10分以上生き残った',
    icon: '🛡️',
    category: 'gameplay',
    rarity: 'rare',
    xp: 100,
    hidden: true,
    hint: '長く生き残ると...',
  },
  {
    id: 'night_owl',
    name: '夜更かしゲーマー',
    description: '深夜2時以降にプレイした',
    icon: '🦉',
    category: 'special',
    rarity: 'uncommon',
    xp: 25,
    hidden: true,
    hint: '深夜にプレイすると...',
  },
];

// 実績取得用ヘルパー
export function getGameAchievementById(id: string): GameAchievement | undefined {
  return GAME_ACHIEVEMENTS.find((a) => a.id === id);
}

export function getGameAchievementsByCategory(category: GameAchievementCategory): GameAchievement[] {
  return GAME_ACHIEVEMENTS.filter((a) => a.category === category);
}

export function getGameAchievementsByRarity(rarity: GameAchievementRarity): GameAchievement[] {
  return GAME_ACHIEVEMENTS.filter((a) => a.rarity === rarity);
}

// LocalStorageキー
export const GAME_ACHIEVEMENTS_STORAGE_KEY = 'adalab-game-achievements';
export const GAME_STATS_STORAGE_KEY = 'adalab-game-stats';

// ゲーム統計インターフェース
export interface GameStats {
  totalGames: number;
  totalLines: number;
  totalScore: number;
  totalTetris: number;
  totalTSpins: number;
  totalCombo: number;
  maxCombo: number;
  highScore: number;
  totalPlayTime: number; // 秒
  battleWins: number;
  battleLosses: number;
  winStreak: number;
  maxWinStreak: number;
  garbageSent: number;
  lastPlayed: number;
}

// デフォルトの統計
export const DEFAULT_GAME_STATS: GameStats = {
  totalGames: 0,
  totalLines: 0,
  totalScore: 0,
  totalTetris: 0,
  totalTSpins: 0,
  totalCombo: 0,
  maxCombo: 0,
  highScore: 0,
  totalPlayTime: 0,
  battleWins: 0,
  battleLosses: 0,
  winStreak: 0,
  maxWinStreak: 0,
  garbageSent: 0,
  lastPlayed: 0,
};

// デフォルトの実績状態
export const DEFAULT_USER_GAME_ACHIEVEMENTS: UserGameAchievements = {
  unlocked: [],
  totalXp: 0,
  lastUpdated: Date.now(),
};
