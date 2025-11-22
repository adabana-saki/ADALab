import { Metadata } from 'next';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Smartphone, Hand, Zap, Layout, Settings, ArrowLeft, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Navi',
  description: '片手操作特化アプリ。スマートフォンを片手で快適に操作するためのユーティリティ。',
};

const features = [
  {
    icon: Hand,
    title: '片手操作最適化',
    description: '画面の端に手が届かない問題を解決。どんな画面サイズでも快適に。',
  },
  {
    icon: Zap,
    title: 'クイックアクション',
    description: 'よく使う機能をワンタップで実行。カスタマイズ自由自在。',
  },
  {
    icon: Layout,
    title: 'ウィジェット',
    description: 'ホーム画面からすぐにアクセス。必要な情報をすぐに確認。',
  },
  {
    icon: Settings,
    title: 'カスタムジェスチャー',
    description: 'スワイプやタップで好きなアクションを設定。あなただけの操作体系を。',
  },
];

const faqs = [
  {
    q: '対応デバイスは？',
    a: 'Android 8.0以上のデバイスに対応しています。',
  },
  {
    q: 'バッテリー消費は？',
    a: 'バックグラウンド動作を最適化しており、バッテリー消費は最小限です。',
  },
  {
    q: '無料で使えますか？',
    a: '基本機能は無料です。Pro版でより高度なカスタマイズが可能になります。',
  },
];

export default function NaviPage() {
  return (
    <>
      <Navigation />
      <main id="main-content" className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              製品一覧に戻る
            </Link>

            {/* Hero */}
            <div className="text-center mb-16">
              <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-6">
                <Smartphone className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Navi</h1>
              <p className="text-xl text-muted-foreground mb-8">
                片手操作特化アプリ
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="#"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Google Play
                  <ExternalLink className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-input rounded-lg hover:bg-accent transition-colors"
                >
                  使い方ガイド
                </a>
              </div>
            </div>

            {/* Features */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold mb-8 text-center">機能</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {features.map((feature) => (
                  <div key={feature.title} className="glass p-6 rounded-2xl">
                    <feature.icon className="w-8 h-8 text-accent mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section>
              <h2 className="text-2xl font-bold mb-8 text-center">よくある質問</h2>
              <div className="space-y-4">
                {faqs.map((faq) => (
                  <div key={faq.q} className="glass p-6 rounded-2xl">
                    <h3 className="font-semibold mb-2">{faq.q}</h3>
                    <p className="text-muted-foreground">{faq.a}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
