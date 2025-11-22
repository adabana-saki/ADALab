import { Metadata } from 'next';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Calendar, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'ブログ',
  description: 'ADA Labの最新情報、技術記事、プロダクトアップデートをお届けします。',
};

const posts = [
  {
    slug: 'rem-bot-v2-release',
    title: 'Rem bot v2.0 リリース',
    description: '新機能の紹介と改善点について',
    date: '2024-01-15',
    category: 'リリース',
  },
  {
    slug: 'nextjs-performance-tips',
    title: 'Next.js パフォーマンス最適化のコツ',
    description: 'Webサイトを高速化するためのテクニック',
    date: '2024-01-10',
    category: '技術',
  },
  {
    slug: 'adalab-launch',
    title: 'ADA Lab 公式サイト公開',
    description: '新しいウェブサイトとプロダクトラインナップ',
    date: '2024-01-01',
    category: 'お知らせ',
  },
];

export default function BlogPage() {
  return (
    <>
      <Navigation />
      <main id="main-content" className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">Blog</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-12">
              最新情報、技術記事、プロダクトアップデート
            </p>

            <div className="space-y-6">
              {posts.map((post) => (
                <article
                  key={post.slug}
                  className="glass p-6 rounded-2xl hover:bg-muted/30 transition-colors group"
                >
                  <Link href={`/blog/${post.slug}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                          {post.category}
                        </span>
                        <h2 className="text-xl font-bold mt-3 mb-2 group-hover:text-primary transition-colors">
                          {post.title}
                        </h2>
                        <p className="text-muted-foreground mb-3">
                          {post.description}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {post.date}
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
