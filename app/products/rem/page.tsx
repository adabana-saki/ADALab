'use client';

import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Bot, Clock, CheckSquare, Users, MessageSquare, ArrowLeft, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const featuresData = {
  ja: [
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
  ],
  en: [
    {
      icon: Clock,
      title: 'Reminders',
      description: 'Set reminders with natural language input. Supports recurring reminders.',
    },
    {
      icon: CheckSquare,
      title: 'Task Management',
      description: 'Support team task management. Check progress at a glance.',
    },
    {
      icon: Users,
      title: 'Role Management',
      description: 'Easily manage members with reaction roles and auto role assignment.',
    },
    {
      icon: MessageSquare,
      title: 'Auto Response',
      description: 'Activate your server with custom commands and auto replies.',
    },
  ],
};

const faqsData = {
  ja: [
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
  ],
  en: [
    {
      q: 'Is it free to use?',
      a: 'Yes, all basic features are free to use.',
    },
    {
      q: 'How do I add it?',
      a: 'Click the "Invite Bot" button to add it to your Discord server.',
    },
    {
      q: 'Is there support?',
      a: 'We accept questions and requests on our Discord support server.',
    },
  ],
};

export default function RemPage() {
  const { language } = useLanguage();
  const features = featuresData[language];
  const faqs = faqsData[language];

  const content = {
    ja: {
      backToProducts: '製品一覧に戻る',
      tagline: 'Discord多機能Bot',
      inviteBot: 'Botを招待',
      supportServer: 'サポートサーバー',
      featuresTitle: '機能',
      faqTitle: 'よくある質問',
    },
    en: {
      backToProducts: 'Back to Products',
      tagline: 'Multi-functional Discord Bot',
      inviteBot: 'Invite Bot',
      supportServer: 'Support Server',
      featuresTitle: 'Features',
      faqTitle: 'FAQ',
    },
  };

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
              {content[language].backToProducts}
            </Link>

            {/* Hero */}
            <div className="text-center mb-16">
              <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 mb-6">
                <Bot className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Rem bot</h1>
              <p className="text-xl text-muted-foreground mb-8">
                {content[language].tagline}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="https://discord.com/oauth2/authorize?client_id=1288117077237248072"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {content[language].inviteBot}
                  <ExternalLink className="w-4 h-4" />
                </a>
                <a
                  href="https://discord.gg/qvEHyPJyEN"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-input rounded-lg hover:bg-accent transition-colors"
                >
                  {content[language].supportServer}
                </a>
              </div>
            </div>

            {/* Features */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold mb-8 text-center">{content[language].featuresTitle}</h2>
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
              <h2 className="text-2xl font-bold mb-8 text-center">{content[language].faqTitle}</h2>
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
