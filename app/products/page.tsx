import { Metadata } from 'next';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Bot, Smartphone, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: '製品一覧',
  description: 'ADA Labが開発するプロダクト一覧。Rem bot、Naviなど、シンプルで使いやすいアプリを提供します。',
};

const products = [
  {
    slug: 'rem',
    name: 'Rem bot',
    tagline: 'Discord多機能Bot',
    description: 'リマインダー、タスク管理、サーバー管理など、Discordライフを便利にする多機能Bot',
    icon: Bot,
    color: 'from-cyan-500 to-blue-500',
    features: ['リマインダー', 'タスク管理', 'ロール管理', '自動応答'],
  },
  {
    slug: 'navi',
    name: 'Navi',
    tagline: '片手操作アプリ',
    description: 'スマートフォンを片手で快適に操作するためのユーティリティアプリ',
    icon: Smartphone,
    color: 'from-purple-500 to-pink-500',
    features: ['片手操作最適化', 'カスタムジェスチャー', 'クイックアクション', 'ウィジェット'],
  },
];

export default function ProductsPage() {
  return (
    <>
      <Navigation />
      <main id="main-content" className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">Products</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-12">
              シンプルで使いやすいプロダクト
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {products.map((product) => (
                <Link
                  key={product.slug}
                  href={`/products/${product.slug}`}
                  className="glass p-6 rounded-2xl hover:bg-muted/30 transition-all group"
                >
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${product.color} mb-4`}>
                    <product.icon className="w-6 h-6 text-white" />
                  </div>

                  <h2 className="text-2xl font-bold mb-1 group-hover:text-primary transition-colors">
                    {product.name}
                  </h2>
                  <p className="text-sm text-primary mb-3">{product.tagline}</p>
                  <p className="text-muted-foreground mb-4">{product.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.features.map((feature) => (
                      <span
                        key={feature}
                        className="text-xs bg-muted px-2 py-1 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-primary group-hover:translate-x-1 transition-transform">
                    詳細を見る
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
