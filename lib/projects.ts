import type { Project } from '@/types';

export const PROJECTS: Project[] = [
  {
    id: '0',
    title: 'adalab focus',
    description:
      '集中力を可視化する PWA。TODO・ポモドーロ・学習記録・統計・カウントダウンを 1 つのダークなネオン画面に。',
    longDescription:
      'TickTick / Todoist 系のタスク管理に、ポモドーロタイマー・学習記録・統計・試験カウントダウンを統合した個人向け集中管理 PWA。Cyberpunk Neon デザインで、PC とスマホで自動同期、完全オフライン対応。Cloudflare D1 + Google OAuth で稼働。',
    category: 'web',
    image: '/images/products/Adalabstudy.png',
    technologies: ['React 19', 'TypeScript', 'Vite', 'Tailwind v4', 'Cloudflare Pages', 'D1', 'PWA'],
    features: [
      'TODO 管理',
      'ポモドーロ',
      '学習統計',
      '試験カウントダウン',
      'オフライン PWA',
      'Google ログイン',
    ],
    gradient: 'from-cyan-500 to-purple-500',
    duration: '公開中',
    teamSize: '1名',
    role: 'フルスタック開発',
    challenges: [
      'PWA オフライン同期 (Dexie + Outbox + Background Sync)',
      'Cloudflare D1 + Google OAuth (PKCE) のサーバーレス認証',
      'Cyberpunk Neon デザインシステム構築',
    ],
    results: [
      'study.adalabtech.com で稼働中',
    ],
    link: 'https://study.adalabtech.com',
  },
  {
    id: '1',
    title: 'adalab shield',
    description:
      'フォーカス中の誘惑サイトを自動ブロックする、adalab focus 連携の集中ガード拡張機能。',
    longDescription:
      'adalab focus (study.adalabtech.com) のポモドーロと連携し、フォーカス中は YouTube・TikTok などの誘惑サイトを自動ブロック、休憩中は自動解除。ブロックはページ読み込み前のネットワーク層で行われ、ブロック画面にはフォーカスの残り時間と取組中のタスクが表示されます。拡張のポップアップからタイマーの開始/停止やタスク完了も操作可能。ショート動画ブロック・時間制限・ストリークなど単体でも使える集中機能を搭載し、9 言語に対応しています。',
    category: 'web',
    image: '/images/products/adalab-shield.png',
    technologies: ['TypeScript', 'React', 'Chrome Extension API (MV3)', 'Firefox WebExtensions', 'declarativeNetRequest'],
    features: [
      'adalab focus 連携 (フォーカス中の自動ブロック・休憩で解除)',
      '読み込み前のネットワーク層ブロック',
      'ブロック画面にフォーカス残り時間・タスク名を表示',
      'ポップアップからタイマー操作・タスク完了',
      'ショート動画ブロック / サイト全体ブロック / カスタムドメイン',
      '時間制限・ストリーク・ブロック統計',
      '9 言語対応',
    ],
    gradient: 'from-orange-500 to-red-500',
    duration: '開発中',
    teamSize: '1名',
    role: 'フルスタック開発',
    challenges: [
      'ポモドーロ状態の Web アプリ ↔ 拡張間リアルタイム同期',
      'declarativeNetRequest による読み込み前ブロックと休憩時の自動解除',
      '拡張を実機読み込みする Playwright E2E テストの構築',
    ],
    results: [
      'v0.2.0 (GitHub で公開中・ストア申請準備中)',
    ],
    detailPath: '/products/adalab-shield',
  },
  {
    id: '2',
    title: 'Sumio',
    description:
      '閲覧中のWebページをAIが瞬時に要約。情報収集を効率化するブラウザ拡張機能。',
    longDescription:
      'ワンクリックでページ全体をAIが要約。ChatGPT、Claude、Geminiなど複数のAIモデルに対応し、長文記事も3行で把握できます。多言語対応で、英語のページも日本語で要約可能。',
    category: 'web',
    image: '/images/products/Sumio.png',
    technologies: ['TypeScript', 'Chrome Extension API', 'OpenAI API', 'Anthropic API'],
    features: [
      'ワンクリック要約',
      'AIモデル選択',
      '多言語対応',
      '要約履歴',
      'カスタムプロンプト',
      'オフライン履歴',
    ],
    gradient: 'from-emerald-500 to-teal-500',
    duration: '開発中',
    teamSize: '1名',
    role: 'フルスタック開発',
    challenges: [
      '様々なWebサイトからのコンテンツ抽出',
      'APIコスト最適化',
      'プライバシー保護',
    ],
    results: [
      'Coming Soon',
    ],
    detailPath: '/products/sumio',
  },
  {
    id: '3',
    title: 'Rem bot',
    description:
      'Discordの多機能管理Bot。リマインド、投票作成、読み上げ、サーバー管理、ゲームなど、これ一つで完結。',
    longDescription:
      'Discordサーバーの運営に必要な機能をオールインワンで提供する多機能Bot。複数のBotを導入する必要がなく、Rem bot一つで様々なニーズに対応できます。シンプルなコマンドで直感的に操作でき、日本語対応で使いやすさを追求しています。',
    category: 'web',
    image: '/images/products/Rembot.png',
    technologies: ['Discord.js', 'Node.js', 'TypeScript', 'MongoDB', 'Google Cloud'],
    features: [
      'リマインダー機能',
      '投票作成・集計',
      'テキスト読み上げ',
      'サーバー管理ツール',
      'ミニゲーム',
      '多言語対応',
    ],
    gradient: 'from-cyan-500 to-blue-500',
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
    detailPath: '/products/rem',
  },
  {
    id: '4',
    title: 'Navi',
    description:
      '片手でスマホを完全操作。カーソル操作で満員電車でも快適に使えるモバイルアプリ。',
    longDescription:
      'Android専用アプリ。満員電車や荷物を持っている時など、両手が使えない状況でもスマートフォンを快適に操作できます。親指一本でカーソルを動かし、タップ、スワイプ、スクロールなど全ての操作が可能。アクセシビリティの向上にも貢献します。',
    category: 'mobile',
    image: '/images/products/Navi.png',
    technologies: ['Kotlin', 'Android', 'Jetpack Compose'],
    features: [
      'カーソルによる精密操作',
      'ワンハンドモード',
      'カスタマイズ可能なジェスチャー',
      '省バッテリー設計',
      'アクセシビリティ対応',
      'ダークモード',
    ],
    gradient: 'from-purple-500 to-pink-500',
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
    detailPath: '/products/navi',
  },
  {
    id: '5',
    title: 'QRaft',
    description:
      'QRコードの読み取り・生成・保存を素早く行えるオールインワンアプリ。',
    longDescription:
      'カメラを向けるだけで瞬時にQRコードを認識。Wi-Fi接続情報のQRコード化、スキャン履歴の自動保存、複数QRコードの一括生成など、QRコードに関するあらゆるニーズに対応するユーティリティアプリです。',
    category: 'mobile',
    image: '/images/products/QRaft.png',
    technologies: ['Kotlin', 'Android', 'CameraX', 'ML Kit'],
    features: [
      '高速読み取り',
      'Wi-Fi QR生成',
      '履歴保存',
      'バッチ処理',
      'カスタムデザイン',
      'クリップボード連携',
    ],
    gradient: 'from-violet-500 to-purple-500',
    duration: '開発中',
    teamSize: '1名',
    role: 'モバイル開発',
    challenges: [
      '高速かつ正確なQRコード認識',
      '様々なQRコード形式への対応',
      '直感的なUI設計',
    ],
    results: [
      'Coming Soon',
    ],
    detailPath: '/products/qraft',
  },
];

export function getProjectById(id: string): Project | undefined {
  return PROJECTS.find((project) => project.id === id);
}

export function getProjectsByCategory(category: Project['category']): Project[] {
  return PROJECTS.filter((project) => project.category === category);
}
