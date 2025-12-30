export type NewsType = 'announcement' | 'maintenance' | 'important' | 'info';

export interface NewsItem {
  date: string;
  type: NewsType;
  title: string;
  content: string;
}

/**
 * ニュースデータ（一元管理）
 * 新しいニュースは配列の先頭に追加してください
 */
export const newsData: Record<'ja' | 'en', NewsItem[]> = {
  ja: [
    {
      date: '2025-12-30',
      type: 'announcement',
      title: '全ゲームにオンライン対戦機能を追加しました',
      content: 'Tetris、2048、Snake、Typingの全ゲームでリアルタイムオンライン対戦が可能になりました。クイックマッチで即座にマッチング、またはルームコードで友達と対戦できます。',
    },
    {
      date: '2025-12-30',
      type: 'announcement',
      title: 'ミニゲーム「Snake」「Typing」を公開しました',
      content: 'クラシックなスネークゲームとタイピング速度測定ゲームを公開しました。タイピングは日本語・英語・プログラミング用語モードを搭載しています。',
    },
    {
      date: '2025-12-30',
      type: 'announcement',
      title: 'ミニゲーム「2048」を公開しました',
      content: 'ブラウザで遊べる2048パズルゲームを公開しました。スワイプ操作対応、アンドゥ機能（3回まで）、ベストスコア記録機能を搭載しています。',
    },
    {
      date: '2025-12-30',
      type: 'announcement',
      title: 'テトリスに新機能を多数追加しました',
      content: 'タイムアタックモード（2分間スコアアタック）、キーバインドカスタマイズ、期間別ランキング（今日/今週/今月/全期間）、実績システム、SNS共有機能、プレイ統計ダッシュボードを追加しました。',
    },
    {
      date: '2025-12-21',
      type: 'announcement',
      title: 'カスタムドメイン adalabtech.com に移行しました',
      content: 'SEO対策強化のため、adalabtech.com への移行が完了しました。旧URL（adalab.pages.dev）からは自動的にリダイレクトされます。',
    },
    {
      date: '2025-12-20',
      type: 'announcement',
      title: 'ミニゲーム「テトリス」を公開しました',
      content: 'ブラウザで遊べるクラシックテトリスを公開しました。時間経過による加速、T-Spin、Back-to-Backボーナス、ニックネーム付きランキング機能など、本格的な機能を搭載しています。',
    },
    {
      date: '2025-12-01',
      type: 'announcement',
      title: 'ブログ機能をリリースしました',
      content: '技術ブログ機能を公開しました。Omarchy、Linux、Web開発などの技術情報を発信していきます。',
    },
    {
      date: '2025-11-26',
      type: 'announcement',
      title: 'ADA Lab 公式サイトを公開しました',
      content: 'ADA Labの公式サイトを公開しました。プロダクト情報や技術ブログを発信していきます。',
    },
  ],
  en: [
    {
      date: '2025-12-30',
      type: 'announcement',
      title: 'Online Battle Mode Added to All Games',
      content: 'Real-time online battles are now available for all games: Tetris, 2048, Snake, and Typing. Use Quick Match for instant matchmaking, or create a room code to play with friends.',
    },
    {
      date: '2025-12-30',
      type: 'announcement',
      title: 'Mini Games "Snake" and "Typing" Released',
      content: 'We have released a classic Snake game and a typing speed test game. Typing features Japanese, English, and programming terminology modes.',
    },
    {
      date: '2025-12-30',
      type: 'announcement',
      title: 'Mini Game "2048" Released',
      content: 'We have released a 2048 puzzle game playable in browser. Features include swipe controls, undo function (up to 3 times), and best score tracking.',
    },
    {
      date: '2025-12-30',
      type: 'announcement',
      title: 'Added Multiple New Features to Tetris',
      content: 'We have added Time Attack mode (2-min score attack), key binding customization, period-based leaderboard (daily/weekly/monthly/all-time), achievement system, SNS sharing, and play statistics dashboard.',
    },
    {
      date: '2025-12-21',
      type: 'announcement',
      title: 'Migrated to Custom Domain adalabtech.com',
      content: 'We have completed the migration to adalabtech.com for better SEO. The old URL (adalab.pages.dev) will automatically redirect.',
    },
    {
      date: '2025-12-20',
      type: 'announcement',
      title: 'Mini Game "Tetris" Released',
      content: 'We have released a classic Tetris game playable in browser. Features include time-based acceleration, T-Spin, Back-to-Back bonuses, and a nickname-based leaderboard.',
    },
    {
      date: '2025-12-01',
      type: 'announcement',
      title: 'Blog Feature Released',
      content: 'We have launched our technical blog. We will share information about Omarchy, Linux, Web development and more.',
    },
    {
      date: '2025-11-26',
      type: 'announcement',
      title: 'ADA Lab Official Site Launched',
      content: 'We have launched the official ADA Lab website. We will share product information and technical blog posts.',
    },
  ],
};

/**
 * 最新のニュースを取得
 */
export function getLatestNews(language: 'ja' | 'en', count: number = 3): NewsItem[] {
  return newsData[language].slice(0, count);
}

/**
 * すべてのニュースを取得
 */
export function getAllNews(language: 'ja' | 'en'): NewsItem[] {
  return newsData[language];
}
