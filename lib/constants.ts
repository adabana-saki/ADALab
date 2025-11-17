export const SITE_CONFIG = {
  name: 'ADA Lab',
  description:
    'ADA Labは、最先端の技術で革新的なソフトウェアとアプリを開発する個人事業です。',
  url: 'https://ada-lab.com',
  email: 'contact@ada-lab.com',
} as const;

export const SERVICES = [
  {
    title: 'Webアプリケーション開発',
    description:
      'モダンなフロントエンド技術と、スケーラブルなバックエンドで高品質なWebアプリケーションを開発します。',
    icon: 'Globe',
  },
  {
    title: 'モバイルアプリ開発',
    description:
      'iOS/Android対応のネイティブ・クロスプラットフォームアプリを開発します。',
    icon: 'Smartphone',
  },
  {
    title: 'UI/UXデザイン',
    description:
      'ユーザー中心設計に基づいた、美しく使いやすいインターフェースを提供します。',
    icon: 'Palette',
  },
  {
    title: '技術コンサルティング',
    description:
      'アーキテクチャ設計、パフォーマンス最適化など、技術的な課題を解決します。',
    icon: 'Lightbulb',
  },
] as const;

export const TECHNOLOGIES = {
  frontend: [
    { name: 'React', level: 95 },
    { name: 'Next.js', level: 95 },
    { name: 'TypeScript', level: 90 },
    { name: 'Vue.js', level: 85 },
    { name: 'Tailwind CSS', level: 90 },
  ],
  backend: [
    { name: 'Node.js', level: 90 },
    { name: 'Python', level: 85 },
    { name: 'Go', level: 80 },
    { name: 'PostgreSQL', level: 85 },
    { name: 'MongoDB', level: 80 },
  ],
  mobile: [
    { name: 'React Native', level: 85 },
    { name: 'Flutter', level: 80 },
  ],
  cloud: [
    { name: 'AWS', level: 85 },
    { name: 'Vercel', level: 95 },
    { name: 'Docker', level: 85 },
  ],
} as const;

export const PROCESS_STEPS = [
  {
    number: 1,
    title: 'ヒアリング',
    description: '要件定義、目標設定、プロジェクトスコープの明確化',
  },
  {
    number: 2,
    title: '設計',
    description: 'アーキテクチャ設計、UI/UX設計、技術選定',
  },
  {
    number: 3,
    title: '開発',
    description: 'アジャイル開発、定期的なフィードバック、継続的インテグレーション',
  },
  {
    number: 4,
    title: 'テスト',
    description: '品質保証、パフォーマンステスト、セキュリティ監査',
  },
  {
    number: 5,
    title: 'デプロイ',
    description: '本番環境リリース、モニタリング設定、ドキュメント作成',
  },
  {
    number: 6,
    title: '保守',
    description: '継続的なサポート、バグ修正、機能追加・改善',
  },
] as const;
