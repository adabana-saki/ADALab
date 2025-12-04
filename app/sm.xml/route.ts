import { NextResponse } from 'next/server';
import { getAllPosts } from '@/lib/blog';

export const dynamic = 'force-static';

const BASE_URL = 'https://adalab.pages.dev';

const STATIC_PAGES = [
  { path: '', changeFrequency: 'weekly', priority: 1.0 },
  { path: '/blog', changeFrequency: 'daily', priority: 0.9 },
  { path: '/products', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/products/rem', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/products/navi', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/company', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/tech-stack', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/roadmap', changeFrequency: 'weekly', priority: 0.6 },
  { path: '/changelog', changeFrequency: 'weekly', priority: 0.6 },
  { path: '/news', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/faq', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/security', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.4 },
];

export async function GET() {
  const currentDate = new Date().toISOString();

  let urls = STATIC_PAGES.map((page) => `
  <url>
    <loc>${BASE_URL}${page.path}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('');

  try {
    const posts = getAllPosts();
    urls += posts.map((post) => `
  <url>
    <loc>${BASE_URL}/blog/${post.slug}</loc>
    <lastmod>${new Date(post.date).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('');
  } catch (error) {
    console.error('Sitemap: Failed to fetch blog posts', error);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
