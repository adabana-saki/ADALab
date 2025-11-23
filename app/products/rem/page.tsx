import { Metadata } from 'next';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Bot, Clock, CheckSquare, Users, MessageSquare, ArrowLeft, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Rem bot',
  description: 'Discord多機能Bot。リマインダー、タスク管理、サーバー管理など、Discordライフを便利にする機能を提供。',
};

const features = [
  {
    icon: Clock,
    title: 'リマインダー',
    description: '自然言語で設定できるリマインダー機能。繰り返し設定も可能。',
  },
  {
    icon: CheckSquare,
    title: 'タスク管理',
    description: 'チームでのタスク管理をサポート。進捗状況を一目で確認。',
  },
  {
    icon: Users,
    title: 'ロール管理',
    description: 'リアクションロールや自動ロール付与など、メンバー管理を簡単に。',
  },
  {
    icon: MessageSquare,
    title: '自動応答',
    description: 'カスタムコマンドや自動返信でサーバーを活性化。',
  },
];

const faqs = [
  {
    q: '無料で使えますか？',
    a: 'はい、基本機能はすべて無料でご利用いただけます。',
  },
  {
    q: 'どうやって導入しますか？',
    a: '「Botを招待」ボタンからDiscordサーバーに追加できます。',
  },
  {
    q: 'サポートはありますか？',
    a: 'Discord サポートサーバーで質問や要望を受け付けています。',
  },
];

export default function RemPage() {
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
              <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 mb-6">
                <Bot className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Rem bot</h1>
              <p className="text-xl text-muted-foreground mb-8">
                Discord多機能Bot
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="https://discord.gg/qvEHyPJyEN"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Botを招待
                  <ExternalLink className="w-4 h-4" />
                </a>
                <a
                  href="https://discord.gg/7Egm8uJPDs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-input rounded-lg hover:bg-accent transition-colors"
                >
                  サポートサーバー
                </a>
              </div>
            </div>

            {/* Features */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold mb-8 text-center">機能</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {features.map((feature) => (
                  <div key={feature.title} className="glass p-6 rounded-2xl">
                    <feature.icon className="w-8 h-8 text-primary mb-4" />
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
