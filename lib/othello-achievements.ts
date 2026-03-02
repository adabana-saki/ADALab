import type { GameAchievement, GameAchievementCategory, GameAchievementRarity } from './game-achievements';

export const OTHELLO_ACHIEVEMENTS: GameAchievement[] = [
  // ゲームプレイ
  {
    id: 'othello_first_game',
    name: 'はじめの一手',
    description: '最初のオセロをプレイ',
    icon: '⚫',
    category: 'gameplay' as GameAchievementCategory,
    rarity: 'common' as GameAchievementRarity,
    xp: 10,
  },
  {
    id: 'othello_first_win',
    name: '初勝利',
    description: '初めてAIに勝利',
    icon: '🎉',
    category: 'gameplay' as GameAchievementCategory,
    rarity: 'common' as GameAchievementRarity,
    xp: 20,
  },

  // マイルストーン
  {
    id: 'othello_10_games',
    name: 'オセロ練習生',
    description: '10回プレイする',
    icon: '📊',
    category: 'milestone' as GameAchievementCategory,
    rarity: 'common' as GameAchievementRarity,
    xp: 25,
  },
  {
    id: 'othello_50_games',
    name: 'オセロマスター',
    description: '50回プレイする',
    icon: '🎯',
    category: 'milestone' as GameAchievementCategory,
    rarity: 'uncommon' as GameAchievementRarity,
    xp: 50,
  },
  {
    id: 'othello_100_games',
    name: 'オセロレジェンド',
    description: '100回プレイする',
    icon: '🏆',
    category: 'milestone' as GameAchievementCategory,
    rarity: 'rare' as GameAchievementRarity,
    xp: 100,
  },

  // 難易度別勝利
  {
    id: 'othello_easy_win',
    name: 'かんたんクリア',
    description: 'かんたんモードで勝利',
    icon: '🌱',
    category: 'gameplay' as GameAchievementCategory,
    rarity: 'common' as GameAchievementRarity,
    xp: 15,
  },
  {
    id: 'othello_normal_win',
    name: 'ふつうクリア',
    description: 'ふつうモードで勝利',
    icon: '🌿',
    category: 'gameplay' as GameAchievementCategory,
    rarity: 'uncommon' as GameAchievementRarity,
    xp: 40,
  },
  {
    id: 'othello_hard_win',
    name: 'むずかしいクリア',
    description: 'むずかしいモードで勝利',
    icon: '🌳',
    category: 'gameplay' as GameAchievementCategory,
    rarity: 'rare' as GameAchievementRarity,
    xp: 100,
  },

  // スコア系
  {
    id: 'othello_domination_40',
    name: '圧勝',
    description: '40枚以上の駒で勝利',
    icon: '💪',
    category: 'score' as GameAchievementCategory,
    rarity: 'uncommon' as GameAchievementRarity,
    xp: 30,
  },
  {
    id: 'othello_domination_50',
    name: '完全制覇',
    description: '50枚以上の駒で勝利',
    icon: '👑',
    category: 'score' as GameAchievementCategory,
    rarity: 'rare' as GameAchievementRarity,
    xp: 75,
  },
  {
    id: 'othello_perfect_64',
    name: 'パーフェクトゲーム',
    description: '全64マスを自分の色にして勝利',
    icon: '💎',
    category: 'score' as GameAchievementCategory,
    rarity: 'legendary' as GameAchievementRarity,
    xp: 500,
  },

  // 連勝系
  {
    id: 'othello_streak_3',
    name: '3連勝',
    description: '3回連続で勝利',
    icon: '🔥',
    category: 'milestone' as GameAchievementCategory,
    rarity: 'uncommon' as GameAchievementRarity,
    xp: 40,
  },
  {
    id: 'othello_streak_5',
    name: '5連勝',
    description: '5回連続で勝利',
    icon: '🌟',
    category: 'milestone' as GameAchievementCategory,
    rarity: 'rare' as GameAchievementRarity,
    xp: 100,
  },
  {
    id: 'othello_streak_10',
    name: '10連勝',
    description: '10回連続で勝利',
    icon: '✨',
    category: 'milestone' as GameAchievementCategory,
    rarity: 'epic' as GameAchievementRarity,
    xp: 200,
  },

  // 特殊実績
  {
    id: 'othello_corner_master',
    name: '角取り名人',
    description: '1ゲームで4つの角すべてを獲得',
    icon: '📐',
    category: 'special' as GameAchievementCategory,
    rarity: 'rare' as GameAchievementRarity,
    xp: 75,
  },
  {
    id: 'othello_comeback',
    name: '大逆転',
    description: '終盤で10枚以上差をつけられた状態から逆転勝利',
    icon: '🔄',
    category: 'special' as GameAchievementCategory,
    rarity: 'epic' as GameAchievementRarity,
    xp: 150,
  },
  {
    id: 'othello_close_game',
    name: '接戦',
    description: '2枚差以内で勝利',
    icon: '⚖️',
    category: 'special' as GameAchievementCategory,
    rarity: 'uncommon' as GameAchievementRarity,
    xp: 40,
  },

  // 隠し実績
  {
    id: 'othello_night_owl',
    name: '夜更かしオセロ',
    description: '深夜2時〜5時にプレイ',
    icon: '🦉',
    category: 'special' as GameAchievementCategory,
    rarity: 'rare' as GameAchievementRarity,
    xp: 75,
    hidden: true,
    hint: '夜更かしするオセロプレイヤー...',
  },
  {
    id: 'othello_all_difficulties',
    name: 'マスターオブリバーシ',
    description: '全難易度で勝利',
    icon: '🎓',
    category: 'milestone' as GameAchievementCategory,
    rarity: 'rare' as GameAchievementRarity,
    xp: 100,
    hidden: true,
    hint: '全ての難易度を制覇せよ...',
  },
];

export const OTHELLO_ACHIEVEMENT_TOTAL = OTHELLO_ACHIEVEMENTS.length;
