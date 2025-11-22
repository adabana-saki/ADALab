import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Calendar, ArrowLeft, Tag } from 'lucide-react';

const posts: Record<string, {
  title: string;
  description: string;
  date: string;
  category: string;
  content: string;
}> = {
  'rem-bot-v2-release': {
    title: 'Rem bot v2.0 リリース',
    description: '新機能の紹介と改善点について',
    date: '2024-01-15',
    category: 'リリース',
    content: `
## 新機能

Rem bot v2.0では、多くの新機能と改善を行いました。

### 主な変更点

- **スラッシュコマンド対応**: すべてのコマンドがスラッシュコマンドに対応しました
- **リマインダー機能強化**: 繰り返しリマインダー、自然言語入力に対応
- **ダッシュボード**: Webからの設定変更が可能に
- **パフォーマンス改善**: レスポンス速度が50%向上

### アップデート方法

既存のユーザーは自動的にv2.0に移行されます。新規導入は[こちら](/products/rem)から。
    `,
  },
  'nextjs-performance-tips': {
    title: 'Next.js パフォーマンス最適化のコツ',
    description: 'Webサイトを高速化するためのテクニック',
    date: '2024-01-10',
    category: '技術',
    content: `
## はじめに

Next.jsアプリケーションのパフォーマンスを最適化するためのテクニックを紹介します。

### 1. 画像最適化

next/imageコンポーネントを使用して、自動的に画像を最適化しましょう。

### 2. コード分割

dynamic importを使用して、必要なコンポーネントのみを読み込みます。

### 3. キャッシュ戦略

適切なCache-Controlヘッダーを設定して、静的アセットをキャッシュします。

### まとめ

これらのテクニックを組み合わせることで、大幅なパフォーマンス改善が期待できます。
    `,
  },
  'adalab-launch': {
    title: 'ADA Lab 公式サイト公開',
    description: '新しいウェブサイトとプロダクトラインナップ',
    date: '2024-01-01',
    category: 'お知らせ',
    content: `
## ADA Lab 始動

ADA Labの公式サイトを公開しました。

### ミッション

「あなたの"ほしい"を、カタチに」をモットーに、シンプルで使いやすいプロダクトを開発していきます。

### プロダクトラインナップ

- **Rem bot**: Discord多機能Bot
- **Navi**: 片手操作特化アプリ

### 今後の展開

今後もユーザーの声を聞きながら、新しいプロダクトや機能を開発していきます。
    `,
  },
};

export async function generateStaticParams() {
  return Object.keys(posts).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = posts[params.slug];
  if (!post) return { title: '記事が見つかりません' };

  return {
    title: post.title,
    description: post.description,
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = posts[params.slug];

  if (!post) {
    notFound();
  }

  return (
    <>
      <Navigation />
      <main id="main-content" className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <article className="max-w-3xl mx-auto">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              ブログ一覧に戻る
            </Link>

            <header className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {post.category}
                </span>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {post.date}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
              <p className="text-lg text-muted-foreground">{post.description}</p>
            </header>

            <div className="prose prose-invert prose-cyan max-w-none">
              {post.content.split('\n').map((line, i) => {
                if (line.startsWith('## ')) {
                  return <h2 key={i} className="text-2xl font-bold mt-8 mb-4">{line.replace('## ', '')}</h2>;
                }
                if (line.startsWith('### ')) {
                  return <h3 key={i} className="text-xl font-semibold mt-6 mb-3">{line.replace('### ', '')}</h3>;
                }
                if (line.startsWith('- ')) {
                  return <li key={i} className="ml-4 text-muted-foreground">{line.replace('- ', '')}</li>;
                }
                if (line.trim()) {
                  return <p key={i} className="text-muted-foreground mb-4">{line}</p>;
                }
                return null;
              })}
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
