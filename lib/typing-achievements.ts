import type { GameAchievement, GameAchievementCategory, GameAchievementRarity } from './game-achievements';

export const TYPING_ACHIEVEMENTS: GameAchievement[] = [
  // ゲームプレイ
  {
    id: 'typing_first_game',
    name: 'はじめの一打',
    description: '最初のゲームをプレイ',
    icon: '⌨️',
    category: 'gameplay' as GameAchievementCategory,
    rarity: 'common' as GameAchievementRarity,
    xp: 10,
  },
  {
    id: 'typing_10_games',
    name: 'タイピング練習生',
    description: '10回プレイする',
    icon: '📊',
    category: 'milestone' as GameAchievementCategory,
    rarity: 'common' as GameAchievementRarity,
    xp: 25,
  },
  {
    id: 'typing_50_games',
    name: 'タイピスト',
    description: '50回プレイする',
    icon: '🎯',
    category: 'milestone' as GameAchievementCategory,
    rarity: 'uncommon' as GameAchievementRarity,
    xp: 50,
  },

  // WPM系
  {
    id: 'typing_wpm_30',
    name: 'タイピング入門',
    description: '30 WPMを達成',
    icon: '🐢',
    category: 'score' as GameAchievementCategory,
    rarity: 'common' as GameAchievementRarity,
    xp: 15,
  },
  {
    id: 'typing_wpm_50',
    name: 'タイピング中級',
    description: '50 WPMを達成',
    icon: '🐇',
    category: 'score' as GameAchievementCategory,
    rarity: 'uncommon' as GameAchievementRarity,
    xp: 30,
  },
  {
    id: 'typing_wpm_80',
    name: 'タイピング上級',
    description: '80 WPMを達成',
    icon: '🦅',
    category: 'score' as GameAchievementCategory,
    rarity: 'rare' as GameAchievementRarity,
    xp: 75,
  },
  {
    id: 'typing_wpm_100',
    name: 'タイピングマスター',
    description: '100 WPMを達成',
    icon: '🚀',
    category: 'score' as GameAchievementCategory,
    rarity: 'epic' as GameAchievementRarity,
    xp: 150,
  },
  {
    id: 'typing_wpm_120',
    name: 'タイピングレジェンド',
    description: '120 WPMを達成',
    icon: '⚡',
    category: 'score' as GameAchievementCategory,
    rarity: 'legendary' as GameAchievementRarity,
    xp: 300,
  },

  // 正確率系
  {
    id: 'typing_accuracy_90',
    name: '正確なタイピスト',
    description: '正確率90%以上を達成',
    icon: '🎯',
    category: 'special' as GameAchievementCategory,
    rarity: 'common' as GameAchievementRarity,
    xp: 20,
  },
  {
    id: 'typing_accuracy_95',
    name: '精密タイピスト',
    description: '正確率95%以上を達成',
    icon: '💎',
    category: 'special' as GameAchievementCategory,
    rarity: 'uncommon' as GameAchievementRarity,
    xp: 40,
  },
  {
    id: 'typing_accuracy_100',
    name: 'パーフェクト',
    description: '正確率100%を達成',
    icon: '✨',
    category: 'special' as GameAchievementCategory,
    rarity: 'rare' as GameAchievementRarity,
    xp: 100,
  },

  // 言語モード系
  {
    id: 'typing_english_master',
    name: '英語マスター',
    description: '英語モードで50 WPM以上を達成',
    icon: '🇺🇸',
    category: 'special' as GameAchievementCategory,
    rarity: 'uncommon' as GameAchievementRarity,
    xp: 40,
  },
  {
    id: 'typing_japanese_master',
    name: '日本語マスター',
    description: '日本語モードで40 WPM以上を達成',
    icon: '🇯🇵',
    category: 'special' as GameAchievementCategory,
    rarity: 'uncommon' as GameAchievementRarity,
    xp: 40,
  },
  {
    id: 'typing_bilingual',
    name: 'バイリンガル',
    description: '両方モードで50 WPM以上を達成',
    icon: '🌍',
    category: 'special' as GameAchievementCategory,
    rarity: 'rare' as GameAchievementRarity,
    xp: 75,
  },

  // 隠し実績
  {
    id: 'typing_night_owl',
    name: '夜更かしタイピスト',
    description: '深夜2時〜5時にプレイ',
    icon: '🦉',
    category: 'special' as GameAchievementCategory,
    rarity: 'rare' as GameAchievementRarity,
    xp: 75,
    hidden: true,
    hint: '夜更かしするタイピスト...',
  },
];

export const TYPING_ACHIEVEMENT_TOTAL = TYPING_ACHIEVEMENTS.length;
