import type { Project } from '@/types';

export const PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Rem bot',
    description:
      'Discordの多機能管理Bot。リマインド、投票作成、読み上げ、サーバー管理、ゲームなど、これ一つで完結。',
    longDescription:
      'Discordサーバーの運営に必要な機能をオールインワンで提供する多機能Bot。複数のBotを導入する必要がなく、Rem bot一つで様々なニーズに対応できます。シンプルなコマンドで直感的に操作でき、日本語対応で使いやすさを追求しています。',
    category: 'web',
    image: '/images/project-placeholder.jpg',
    images: [
      '/images/rembot-1.jpg',
      '/images/rembot-2.jpg',
      '/images/rembot-3.jpg',
    ],
    technologies: ['Discord.js', 'Node.js', 'TypeScript', 'MongoDB', 'Google Cloud'],
    features: [
      'リマインダー機能',
      '投票作成・集計',
      'テキスト読み上げ',
      'サーバー管理ツール',
      'ミニゲーム',
      '多言語対応',
    ],
    gradient: 'from-indigo-500 to-purple-500',
    duration: '開発中',
    teamSize: '1名',
    role: 'フルスタック開発',
    challenges: [
      '大規模サーバーでのパフォーマンス最適化',
      '多機能でありながらシンプルなUI設計',
      '安定した読み上げ機能の実装',
    ],
    results: [
      'Coming Soon',
    ],
  },
  {
    id: '2',
    title: 'Navi',
    description:
      '片手でスマホを完全操作。カーソル操作で満員電車でも快適に使えるモバイルアプリ。',
    longDescription:
      '満員電車や荷物を持っている時など、両手が使えない状況でもスマートフォンを快適に操作できるアプリ。親指一本でカーソルを動かし、タップ、スワイプ、スクロールなど全ての操作が可能。アクセシビリティの向上にも貢献します。',
    category: 'mobile',
    image: '/images/project-placeholder.jpg',
    technologies: ['React Native', 'TypeScript', 'Expo'],
    features: [
      'カーソルによる精密操作',
      'ワンハンドモード',
      'カスタマイズ可能なジェスチャー',
      '省バッテリー設計',
      'アクセシビリティ対応',
      'ダークモード',
    ],
    gradient: 'from-cyan-500 to-blue-500',
    duration: '開発中',
    teamSize: '1名',
    role: 'モバイル開発',
    challenges: [
      '直感的で使いやすいカーソル操作の実装',
      'バッテリー消費の最適化',
      '様々な画面サイズへの対応',
    ],
    results: [
      'Coming Soon',
    ],
  },
];

export function getProjectById(id: string): Project | undefined {
  return PROJECTS.find((project) => project.id === id);
}

export function getProjectsByCategory(category: Project['category']): Project[] {
  return PROJECTS.filter((project) => project.category === category);
}
