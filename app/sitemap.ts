import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog';

export const dynamic = 'force-static';

// 静的ページの定義（ビルド時に一度だけ評価）
const BASE_URL = 'https://adalabtech.com';

const STATIC_PAGES = [
  { path: '', changeFrequency: 'weekly' as const, priority: 1.0 },
  { path: '/blog', changeFrequency: 'daily' as const, priority: 0.9 },
  { path: '/products', changeFrequency: 'weekly' as const, priority: 0.8 },
  { path: '/products/rem', changeFrequency: 'weekly' as const, priority: 0.8 },
  { path: '/products/navi', changeFrequency: 'weekly' as const, priority: 0.8 },
  { path: '/games', changeFrequency: 'weekly' as const, priority: 0.8 },
  { path: '/games/tetris', changeFrequency: 'monthly' as const, priority: 0.7 },
  { path: '/games/tetris/battle', changeFrequency: 'monthly' as const, priority: 0.7 },
  { path: '/games/2048', changeFrequency: 'monthly' as const, priority: 0.7 },
  { path: '/games/2048/battle', changeFrequency: 'monthly' as const, priority: 0.7 },
  { path: '/games/snake', changeFrequency: 'monthly' as const, priority: 0.7 },
  { path: '/games/snake/battle', changeFrequency: 'monthly' as const, priority: 0.7 },
  { path: '/games/typing', changeFrequency: 'monthly' as const, priority: 0.7 },
  { path: '/games/typing/battle', changeFrequency: 'monthly' as const, priority: 0.7 },
  { path: '/company', changeFrequency: 'monthly' as const, priority: 0.7 },
  { path: '/tech-stack', changeFrequency: 'monthly' as const, priority: 0.6 },
  { path: '/roadmap', changeFrequency: 'weekly' as const, priority: 0.6 },
  { path: '/changelog', changeFrequency: 'weekly' as const, priority: 0.6 },
  { path: '/news', changeFrequency: 'weekly' as const, priority: 0.7 },
  { path: '/faq', changeFrequency: 'monthly' as const, priority: 0.6 },
  { path: '/security', changeFrequency: 'monthly' as const, priority: 0.5 },
  { path: '/privacy', changeFrequency: 'yearly' as const, priority: 0.4 },
  { path: '/terms', changeFrequency: 'yearly' as const, priority: 0.4 },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();

  // 静的ページを生成
  const staticPages: MetadataRoute.Sitemap = STATIC_PAGES.map((page) => ({
    url: `${BASE_URL}${page.path}`,
    lastModified: currentDate,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  // ブログ記事を取得（getAllPostsは既にメモリ効率的な実装）
  // 大量記事対策: 必要最小限のフィールドのみ使用
  let blogPages: MetadataRoute.Sitemap = [];

  try {
    const posts = getAllPosts();

    // 記事数が多い場合のパフォーマンス警告
    if (posts.length > 1000) {
      console.warn(`Sitemap: Large number of posts (${posts.length}), consider pagination`);
    }

    blogPages = posts.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    // ブログ記事の取得に失敗しても静的ページは返す
    console.error('Sitemap: Failed to fetch blog posts', error);
  }

  return [...staticPages, ...blogPages];
}
