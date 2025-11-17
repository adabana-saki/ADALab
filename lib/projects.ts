import type { Project } from '@/types';

export const PROJECTS: Project[] = [
  {
    id: '1',
    title: 'E-Commerce Platform',
    description:
      '最新のNext.js 14とStripeを使用した、モダンなECプラットフォーム。管理画面、在庫管理、決済機能を実装。',
    longDescription:
      'フルスタックのECプラットフォームを構築。ユーザー認証、商品管理、カート機能、決済処理、注文管理、管理者ダッシュボードなど、ECサイトに必要な全ての機能を実装しました。Stripe APIとの統合により、安全な決済フローを実現。',
    category: 'web',
    image: '/images/project-placeholder.jpg',
    images: [
      '/images/ecommerce-1.jpg',
      '/images/ecommerce-2.jpg',
      '/images/ecommerce-3.jpg',
    ],
    technologies: ['Next.js', 'TypeScript', 'Stripe', 'PostgreSQL', 'Prisma', 'Tailwind CSS'],
    features: [
      'ユーザー認証・アカウント管理',
      'リアルタイム在庫管理',
      'Stripe決済統合',
      'レスポンシブデザイン',
      '管理者ダッシュボード',
      '注文履歴・追跡機能',
    ],
    gradient: 'from-blue-500 to-cyan-500',
    duration: '3ヶ月',
    teamSize: '2名',
    role: 'フルスタック開発',
    challenges: [
      '大量のトランザクション処理の最適化',
      '在庫の同期管理',
      'Stripe Webhookの実装',
    ],
    results: [
      'ページロード時間 2秒以内',
      '月間10,000件以上の注文処理',
      'モバイル転換率 25%向上',
    ],
    demoUrl: 'https://demo.example.com',
    github: 'https://github.com',
  },
  {
    id: '2',
    title: 'Task Management App',
    description:
      'リアルタイム同期機能を持つタスク管理アプリ。Drag & Drop、通知機能、チーム協業機能を搭載。',
    longDescription:
      'チームでのプロジェクト管理を効率化するタスク管理アプリケーション。リアルタイムでの同期、直感的なDrag & Dropインターフェース、プッシュ通知、ファイル添付など、チーム協業に必要な機能を網羅。',
    category: 'web',
    image: '/images/project-placeholder.jpg',
    technologies: ['React', 'Firebase', 'Tailwind CSS', 'Framer Motion', 'React DnD'],
    features: [
      'リアルタイム同期',
      'Drag & Dropによるタスク移動',
      'プッシュ通知',
      'チームメンバー管理',
      'ファイル添付機能',
      'カンバンボード',
    ],
    gradient: 'from-purple-500 to-pink-500',
    duration: '2ヶ月',
    teamSize: '1名',
    role: 'フロントエンド開発',
    challenges: [
      'リアルタイム同期のパフォーマンス最適化',
      'オフライン対応',
      '複雑な権限管理',
    ],
    results: [
      '500+のアクティブユーザー',
      '平均タスク完了率 30%向上',
      'ユーザー満足度 4.8/5',
    ],
    demoUrl: 'https://demo.example.com',
  },
  {
    id: '3',
    title: 'Healthcare Dashboard',
    description:
      '医療機関向けダッシュボード。患者データの可視化、予約管理、レポート生成機能を提供。',
    longDescription:
      '医療機関のデジタル化を支援するダッシュボード。患者データの一元管理、予約スケジュール、診療記録、統計レポートなど、医療現場の業務効率化を実現。HIPAA準拠のセキュリティ対策を実施。',
    category: 'web',
    image: '/images/project-placeholder.jpg',
    technologies: ['Vue.js', 'Node.js', 'MongoDB', 'Chart.js', 'Express'],
    features: [
      '患者データ管理',
      '予約システム',
      '診療記録管理',
      'データ可視化',
      'レポート自動生成',
      'セキュアな認証',
    ],
    gradient: 'from-green-500 to-teal-500',
    duration: '4ヶ月',
    teamSize: '3名',
    role: 'バックエンド開発',
    challenges: [
      'HIPAA準拠のセキュリティ実装',
      '大量データの高速検索',
      '複雑なアクセス権限管理',
    ],
    results: [
      '予約管理時間 50%削減',
      'データアクセス速度 3倍向上',
      '5つの医療機関で導入',
    ],
  },
  {
    id: '4',
    title: 'AI Chat Application',
    description:
      'OpenAI APIを活用したAIチャットアプリケーション。マルチモーダル対応、会話履歴管理機能付き。',
    longDescription:
      'OpenAI GPT-4を活用した高度なチャットアプリケーション。テキストだけでなく、画像解析や音声入力にも対応。会話履歴の保存、カスタムプロンプト、ストリーミングレスポンスなど、先進的な機能を実装。',
    category: 'ai',
    image: '/images/project-placeholder.jpg',
    technologies: ['Next.js', 'OpenAI API', 'Vercel AI SDK', 'Prisma', 'PostgreSQL'],
    features: [
      'GPT-4統合',
      'ストリーミングレスポンス',
      '画像解析機能',
      '会話履歴管理',
      'カスタムプロンプト',
      'レスポンス共有機能',
    ],
    gradient: 'from-orange-500 to-red-500',
    duration: '2ヶ月',
    teamSize: '1名',
    role: 'フルスタック開発',
    challenges: [
      'APIコストの最適化',
      'ストリーミングレスポンスの実装',
      'レート制限対策',
    ],
    results: [
      '月間50,000リクエスト処理',
      '平均レスポンス時間 1.5秒',
      'APIコスト 40%削減',
    ],
    demoUrl: 'https://demo.example.com',
  },
  {
    id: '5',
    title: 'Portfolio Website',
    description:
      '3Dエフェクトとアニメーションを活用したポートフォリオサイト。CMSと連携し、コンテンツ管理が容易。',
    longDescription:
      'クリエイターのためのポートフォリオサイト。Three.jsによる3Dエフェクト、GSAPによるスムーズなアニメーション、Sanity CMSとの連携により、技術とデザインの両面で優れた体験を提供。',
    category: 'design',
    image: '/images/project-placeholder.jpg',
    technologies: ['Next.js', 'Three.js', 'Sanity CMS', 'GSAP', 'Tailwind CSS'],
    features: [
      '3D背景エフェクト',
      'スムーズなページ遷移',
      'CMS連携',
      'プロジェクトギャラリー',
      'お問い合わせフォーム',
      'ダークモード',
    ],
    gradient: 'from-violet-500 to-purple-500',
    duration: '1.5ヶ月',
    teamSize: '2名',
    role: 'フロントエンド開発',
    challenges: [
      '3Dパフォーマンスの最適化',
      'モバイルでの3D表示',
      '複雑なアニメーション同期',
    ],
    results: [
      'Lighthouse スコア 95+',
      '直帰率 20%改善',
      'ユニークビジター 月間5,000+',
    ],
    demoUrl: 'https://demo.example.com',
  },
  {
    id: '6',
    title: 'Fitness Tracking App',
    description:
      'モバイルファーストのフィットネストラッキングアプリ。運動記録、栄養管理、進捗可視化機能。',
    longDescription:
      'ヘルス&フィットネス向けモバイルアプリケーション。運動記録、栄養管理、体重トラッキング、目標設定など、健康管理に必要な機能を一つのアプリに統合。ネイティブアプリ並みのパフォーマンスを実現。',
    category: 'mobile',
    image: '/images/project-placeholder.jpg',
    technologies: ['React Native', 'Expo', 'Supabase', 'TypeScript', 'React Navigation'],
    features: [
      '運動記録・トラッキング',
      '栄養管理・カロリー計算',
      '体重・体組成記録',
      '目標設定・進捗管理',
      'グラフ・統計表示',
      'リマインダー通知',
    ],
    gradient: 'from-yellow-500 to-orange-500',
    duration: '3ヶ月',
    teamSize: '2名',
    role: 'モバイル開発',
    challenges: [
      'バッテリー消費の最適化',
      'オフライン機能の実装',
      'デバイス間データ同期',
    ],
    results: [
      'App Store 評価 4.7/5',
      '10,000+ダウンロード',
      '継続利用率 60%',
    ],
  },
];

export function getProjectById(id: string): Project | undefined {
  return PROJECTS.find((project) => project.id === id);
}

export function getProjectsByCategory(category: Project['category']): Project[] {
  return PROJECTS.filter((project) => project.category === category);
}
