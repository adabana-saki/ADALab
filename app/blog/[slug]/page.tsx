import { getPostBySlug, getAllSlugs, getAllPosts, getSeriesForPost } from '@/lib/blog';
import { MDXContent } from '@/components/blog/MDXContent';
import { TableOfContents } from '@/components/blog/TableOfContents';
import { ShareButtons } from '@/components/blog/ShareButtons';
import { RelatedPosts } from '@/components/blog/RelatedPosts';
import { SeriesNavigation } from '@/components/blog/SeriesNavigation';
import { ArticleEngagement, ArticleLikeSection } from '@/components/blog/ArticleEngagement';
import { ArticleWithEngagement } from './ArticleWithEngagement';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Clock, Tag, ArrowLeft, User, BookOpen } from 'lucide-react';
import type { Metadata } from 'next';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: 'Not Found' };

  const ogImageUrl = `https://adalab.pages.dev/og/${slug}/og-image.png`;

  return {
    title: `${post.title} | ADA Lab Blog`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      tags: post.tags,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [ogImageUrl],
    },
  };
}

export function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  const allPosts = getAllPosts();

  if (!post) {
    notFound();
  }

  // シリーズ情報を取得
  const seriesInfo = getSeriesForPost(slug);

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* 3カラムレイアウト */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_minmax(0,720px)_1fr] gap-8 max-w-7xl mx-auto">
            {/* 左サイドバー（著者情報・シェア） */}
            <aside className="hidden xl:block">
              <div className="sticky top-24 space-y-6">
                {/* 著者カード */}
                <div className="bg-card border border-border/50 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src="/images/adabanasaki.png"
                      alt="Adabana Saki"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-sm">{post.author || 'Adabana Saki'}</p>
                      <p className="text-xs text-muted-foreground">Author</p>
                    </div>
                  </div>
                </div>

                {/* シェアボタン */}
                <div className="bg-card border border-border/50 rounded-xl p-5">
                  <p className="text-xs text-muted-foreground mb-3">この記事をシェア</p>
                  <ShareButtons title={post.title} slug={post.slug} variant="vertical" />
                </div>

                {/* 戻るリンク */}
                <Link
                  href="/blog"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft size={16} />
                  記事一覧
                </Link>
              </div>
            </aside>

            {/* メインコンテンツ */}
            <article className="min-w-0">
              {/* モバイル用戻るリンク */}
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 xl:hidden"
              >
                <ArrowLeft size={16} />
                記事一覧に戻る
              </Link>

              {/* 記事ヘッダー */}
              <header className="mb-8">
                {/* カテゴリー・シリーズバッジ */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {post.category && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                      {post.category}
                    </span>
                  )}
                  {seriesInfo && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                      <BookOpen size={12} />
                      {seriesInfo.series.title} ({seriesInfo.currentIndex + 1}/{seriesInfo.series.posts.length})
                    </span>
                  )}
                </div>

                {/* タイトル */}
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                  {post.title}
                </h1>

                {/* 説明文 */}
                <p className="text-muted-foreground text-lg mb-6">
                  {post.description}
                </p>

                {/* メタ情報 */}
                <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground pb-6 border-b border-border/50">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={16} />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={16} />
                      {post.readingTime}
                    </span>
                    {post.author && (
                      <span className="flex items-center gap-1.5">
                        <User size={16} />
                        {post.author}
                      </span>
                    )}
                  </div>
                  {/* エンゲージメント（ビュー数・いいね） */}
                  <ArticleWithEngagement slug={post.slug} position="header">
                    <ArticleEngagement />
                  </ArticleWithEngagement>
                </div>

                {/* タグ */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-muted/50 text-muted-foreground text-xs rounded-lg hover:bg-muted transition-colors"
                      >
                        <Tag size={12} />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </header>

              {/* シリーズナビゲーション */}
              {seriesInfo && (
                <SeriesNavigation
                  series={seriesInfo.series}
                  currentIndex={seriesInfo.currentIndex}
                  prev={seriesInfo.prev}
                  next={seriesInfo.next}
                />
              )}

              {/* モバイル用目次 */}
              <TableOfContents content={post.content} variant="inline" />

              {/* 記事本文 */}
              <div className="blog-content prose prose-invert max-w-none">
                <MDXContent content={post.content} />
              </div>

              {/* 記事フッター */}
              <footer className="mt-12 pt-8 border-t border-border/50">
                {/* いいねセクション */}
                <ArticleWithEngagement slug={post.slug} position="footer">
                  <ArticleLikeSection />
                </ArticleWithEngagement>

                {/* モバイル用シェア */}
                <div className="xl:hidden mb-8">
                  <p className="text-sm text-muted-foreground mb-3">この記事をシェア</p>
                  <ShareButtons title={post.title} slug={post.slug} />
                </div>

                {/* シリーズナビゲーション（記事下部） */}
                {seriesInfo && (
                  <div className="mb-8">
                    <SeriesNavigation
                      series={seriesInfo.series}
                      currentIndex={seriesInfo.currentIndex}
                      prev={seriesInfo.prev}
                      next={seriesInfo.next}
                    />
                  </div>
                )}

                {/* 関連記事 */}
                <RelatedPosts
                  currentSlug={post.slug}
                  currentTags={post.tags}
                  allPosts={allPosts}
                />

                {/* 戻るリンク */}
                <div className="mt-8 text-center">
                  <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-card border border-border/50 rounded-xl text-sm hover:border-primary/50 transition-colors"
                  >
                    <ArrowLeft size={16} />
                    記事一覧に戻る
                  </Link>
                </div>
              </footer>
            </article>

            {/* 右サイドバー（目次） */}
            <aside className="hidden xl:block">
              <TableOfContents content={post.content} variant="sidebar" />
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
