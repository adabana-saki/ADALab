/**
 * 2048 Game Achievements System
 */

import type { GameAchievement, GameAchievementCategory, GameAchievementRarity } from './game-achievements';

// 2048専用の実績定義
export const GAME_2048_ACHIEVEMENTS: GameAchievement[] = [
  // ゲームプレイ系
  {
    id: '2048_first_game',
    name: 'はじめの一歩',
    description: '2048を初めてプレイした',
    icon: '🎮',
    category: 'gameplay',
    rarity: 'common',
    xp: 10,
  },
  {
    id: '2048_first_merge',
    name: '初マージ',
    description: '初めてタイルを合体させた',
    icon: '✨',
    category: 'gameplay',
    rarity: 'common',
    xp: 10,
  },
  {
    id: '2048_games_10',
    name: 'パズルビギナー',
    description: '2048を10回プレイした',
    icon: '🌱',
    category: 'milestone',
    rarity: 'common',
    xp: 25,
  },
  {
    id: '2048_games_50',
    name: 'パズルマニア',
    description: '2048を50回プレイした',
    icon: '🌿',
    category: 'milestone',
    rarity: 'uncommon',
    xp: 50,
  },
  {
    id: '2048_games_100',
    name: 'パズルマスター',
    description: '2048を100回プレイした',
    icon: '🌳',
    category: 'milestone',
    rarity: 'rare',
    xp: 100,
  },

  // タイル達成系
  {
    id: '2048_tile_128',
    name: '128達成',
    description: '128タイルを作成した',
    icon: '🔢',
    category: 'gameplay',
    rarity: 'common',
    xp: 15,
  },
  {
    id: '2048_tile_256',
    name: '256達成',
    description: '256タイルを作成した',
    icon: '📊',
    category: 'gameplay',
    rarity: 'common',
    xp: 20,
  },
  {
    id: '2048_tile_512',
    name: '512達成',
    description: '512タイルを作成した',
    icon: '📈',
    category: 'gameplay',
    rarity: 'uncommon',
    xp: 30,
  },
  {
    id: '2048_tile_1024',
    name: '1024達成',
    description: '1024タイルを作成した',
    icon: '🔥',
    category: 'gameplay',
    rarity: 'uncommon',
    xp: 50,
  },
  {
    id: '2048_tile_2048',
    name: '2048達成！',
    description: '2048タイルを作成した',
    icon: '🏆',
    category: 'special',
    rarity: 'rare',
    xp: 100,
  },
  {
    id: '2048_tile_4096',
    name: '4096マスター',
    description: '4096タイルを作成した',
    icon: '👑',
    category: 'special',
    rarity: 'epic',
    xp: 200,
  },
  {
    id: '2048_tile_8192',
    name: '8192レジェンド',
    description: '8192タイルを作成した',
    icon: '🌟',
    category: 'special',
    rarity: 'legendary',
    xp: 500,
  },

  // スコア系
  {
    id: '2048_score_1000',
    name: 'スコア1,000',
    description: '1,000点を達成した',
    icon: '🎯',
    category: 'score',
    rarity: 'common',
    xp: 15,
  },
  {
    id: '2048_score_5000',
    name: 'スコア5,000',
    description: '5,000点を達成した',
    icon: '🏅',
    category: 'score',
    rarity: 'uncommon',
    xp: 30,
  },
  {
    id: '2048_score_10000',
    name: 'スコア10,000',
    description: '10,000点を達成した',
    icon: '🥇',
    category: 'score',
    rarity: 'uncommon',
    xp: 50,
  },
  {
    id: '2048_score_20000',
    name: 'スコア20,000',
    description: '20,000点を達成した',
    icon: '💎',
    category: 'score',
    rarity: 'rare',
    xp: 100,
  },
  {
    id: '2048_score_50000',
    name: 'スコア50,000',
    description: '50,000点を達成した',
    icon: '⭐',
    category: 'score',
    rarity: 'epic',
    xp: 200,
  },
  {
    id: '2048_score_100000',
    name: 'スコア100,000',
    description: '100,000点を達成した',
    icon: '🌟',
    category: 'score',
    rarity: 'legendary',
    xp: 500,
  },

  // スペシャル系
  {
    id: '2048_no_undo',
    name: 'ノーアンドゥクリア',
    description: 'アンドゥを使わずに2048達成',
    icon: '🎖️',
    category: 'special',
    rarity: 'epic',
    xp: 200,
    hidden: true,
    hint: 'アンドゥなしで2048を達成すると...',
  },
  {
    id: '2048_speedrun_5min',
    name: 'スピードクリア',
    description: '5分以内に2048達成',
    icon: '⚡',
    category: 'special',
    rarity: 'epic',
    xp: 200,
    hidden: true,
    hint: '素早くクリアすると...',
  },
  {
    id: '2048_low_moves',
    name: '効率クリア',
    description: '500手以内で2048達成',
    icon: '🧠',
    category: 'special',
    rarity: 'rare',
    xp: 150,
    hidden: true,
    hint: '少ない手数でクリアすると...',
  },
  {
    id: '2048_keep_playing',
    name: '探求者',
    description: '2048達成後も続けてプレイした',
    icon: '🚀',
    category: 'gameplay',
    rarity: 'uncommon',
    xp: 30,
  },
  {
    id: '2048_comeback',
    name: '逆転勝利',
    description: '残り1マスから2048達成',
    icon: '💪',
    category: 'special',
    rarity: 'legendary',
    xp: 300,
    hidden: true,
    hint: 'ギリギリの状況からクリアすると...',
  },
];

// 2048統計インターフェース
export interface Game2048Stats {
  totalGames: number;
  totalMerges: number;
  totalScore: number;
  highScore: number;
  maxTile: number;
  totalMoves: number;
  wins: number;
  winsWithoutUndo: number;
  fastestWin: number | null; // 秒
  lowestMoveWin: number | null; // 手数
  totalPlayTime: number; // 秒
  lastPlayed: number;
}

export const DEFAULT_GAME_2048_STATS: Game2048Stats = {
  totalGames: 0,
  totalMerges: 0,
  totalScore: 0,
  highScore: 0,
  maxTile: 0,
  totalMoves: 0,
  wins: 0,
  winsWithoutUndo: 0,
  fastestWin: null,
  lowestMoveWin: null,
  totalPlayTime: 0,
  lastPlayed: 0,
};

export const GAME_2048_STATS_STORAGE_KEY = 'adalab-2048-stats';
export const GAME_2048_ACHIEVEMENTS_STORAGE_KEY = 'adalab-2048-achievements';

// 実績取得用ヘルパー
export function get2048AchievementById(id: string): GameAchievement | undefined {
  return GAME_2048_ACHIEVEMENTS.find((a) => a.id === id);
}

export function get2048AchievementsByCategory(category: GameAchievementCategory): GameAchievement[] {
  return GAME_2048_ACHIEVEMENTS.filter((a) => a.category === category);
}

export function get2048AchievementsByRarity(rarity: GameAchievementRarity): GameAchievement[] {
  return GAME_2048_ACHIEVEMENTS.filter((a) => a.rarity === rarity);
}
