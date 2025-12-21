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
