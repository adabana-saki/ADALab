import type { GameAchievement, GameAchievementCategory, GameAchievementRarity } from './game-achievements';

export const SNAKE_ACHIEVEMENTS: GameAchievement[] = [
  // ゲームプレイ
  {
    id: 'snake_first_game',
    name: 'はじめの一歩',
    description: '最初のゲームをプレイ',
    icon: '🐍',
    category: 'gameplay' as GameAchievementCategory,
    rarity: 'common' as GameAchievementRarity,
    xp: 10,
  },
  {
    id: 'snake_first_food',
    name: '最初の獲物',
    description: '最初のエサを食べる',
    icon: '🍎',
    category: 'gameplay' as GameAchievementCategory,
    rarity: 'common' as GameAchievementRarity,
    xp: 10,
  },
  {
    id: 'snake_10_games',
    name: 'スネーク練習生',
    description: '10回プレイする',
    icon: '📊',
    category: 'milestone' as GameAchievementCategory,
    rarity: 'common' as GameAchievementRarity,
    xp: 25,
  },
  {
    id: 'snake_50_games',
    name: 'スネークマスター',
    description: '50回プレイする',
    icon: '🎯',
    category: 'milestone' as GameAchievementCategory,
    rarity: 'uncommon' as GameAchievementRarity,
    xp: 50,
  },

  // スコア系
  {
    id: 'snake_score_100',
    name: 'スコアハンター',
    description: '100点を達成',
    icon: '💯',
    category: 'score' as GameAchievementCategory,
    rarity: 'common' as GameAchievementRarity,
    xp: 15,
  },
  {
    id: 'snake_score_500',
    name: 'スコアマスター',
    description: '500点を達成',
    icon: '🏆',
    category: 'score' as GameAchievementCategory,
    rarity: 'uncommon' as GameAchievementRarity,
    xp: 40,
  },
  {
    id: 'snake_score_1000',
    name: 'スコアレジェンド',
    description: '1000点を達成',
    icon: '👑',
    category: 'score' as GameAchievementCategory,
    rarity: 'rare' as GameAchievementRarity,
    xp: 100,
  },

  // 長さ系
  {
    id: 'snake_length_10',
    name: 'ちょっと長くなった',
    description: '長さ10を達成',
    icon: '📏',
    category: 'special' as GameAchievementCategory,
    rarity: 'common' as GameAchievementRarity,
    xp: 15,
  },
  {
    id: 'snake_length_25',
    name: 'かなり長い',
    description: '長さ25を達成',
    icon: '🐉',
    category: 'special' as GameAchievementCategory,
    rarity: 'uncommon' as GameAchievementRarity,
    xp: 40,
  },
  {
    id: 'snake_length_50',
    name: '巨大スネーク',
    description: '長さ50を達成',
    icon: '🌟',
    category: 'special' as GameAchievementCategory,
    rarity: 'rare' as GameAchievementRarity,
    xp: 100,
  },

  // 生存時間系
  {
    id: 'snake_survive_60',
    name: '1分サバイバー',
    description: '1分間生き残る',
    icon: '⏱️',
    category: 'special' as GameAchievementCategory,
    rarity: 'common' as GameAchievementRarity,
    xp: 20,
  },
  {
    id: 'snake_survive_180',
    name: '3分サバイバー',
    description: '3分間生き残る',
    icon: '🕐',
    category: 'special' as GameAchievementCategory,
    rarity: 'uncommon' as GameAchievementRarity,
    xp: 50,
  },
  {
    id: 'snake_survive_300',
    name: 'サバイバルマスター',
    description: '5分間生き残る',
    icon: '🏅',
    category: 'special' as GameAchievementCategory,
    rarity: 'rare' as GameAchievementRarity,
    xp: 100,
  },

  // 隠し実績
  {
    id: 'snake_perfect_run',
    name: 'パーフェクトラン',
    description: '壁に一度も接触せずに30点達成',
    icon: '✨',
    category: 'special' as GameAchievementCategory,
    rarity: 'epic' as GameAchievementRarity,
    xp: 150,
    hidden: true,
    hint: '壁に触れないように...',
  },
  {
    id: 'snake_night_owl',
    name: '夜更かしスネーク',
    description: '深夜2時〜5時にプレイ',
    icon: '🦉',
    category: 'special' as GameAchievementCategory,
    rarity: 'rare' as GameAchievementRarity,
    xp: 75,
    hidden: true,
    hint: '夜更かしするスネーク...',
  },
];

export const SNAKE_ACHIEVEMENT_TOTAL = SNAKE_ACHIEVEMENTS.length;
