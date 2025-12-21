'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Clock, Focus, BarChart3, Ban, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const featuresData = {
  ja: [
    {
      icon: Ban,
      title: 'ショート動画ブロック',
      description: 'YouTube Shorts、TikTok、Instagramリールなど、主要なショート動画プラットフォームをブロック。',
    },
    {
      icon: Clock,
      title: '時間制限設定',
      description: '1日の視聴時間を設定可能。制限時間に達すると自動でブロック。',
    },
    {
      icon: Focus,
      title: '集中モード',
      description: '作業時間中は完全ブロック。ポモドーロテクニックにも対応。',
    },
    {
      icon: BarChart3,
      title: '統計表示',
      description: 'ブロック回数や節約時間を可視化。自己管理をサポート。',
    },
  ],
  en: [
    {
      icon: Ban,
      title: 'Block Short Videos',
      description: 'Block major short video platforms including YouTube Shorts, TikTok, and Instagram Reels.',
    },
    {
      icon: Clock,
      title: 'Time Limits',
      description: 'Set daily viewing time limits. Automatically blocks when limit is reached.',
    },
    {
      icon: Focus,
      title: 'Focus Mode',
      description: 'Complete blocking during work hours. Compatible with Pomodoro Technique.',
    },
    {
      icon: BarChart3,
      title: 'Statistics',
      description: 'Visualize block counts and time saved. Support your self-management.',
    },
  ],
};

const faqsData = {
  ja: [
    {
      q: '対応ブラウザは？',
      a: 'Chrome、Firefox、Edgeに対応しています。',
    },
    {
      q: '無料で使えますか？',
      a: 'はい、基本機能はすべて無料でご利用いただけます。',
    },
    {
      q: 'ブロックを一時的に解除できますか？',
      a: 'はい、設定から一時解除が可能です。ただし、解除回数も記録されます。',
    },
  ],
  en: [
    {
      q: 'Which browsers are supported?',
      a: 'Chrome, Firefox, and Edge are supported.',
    },
    {
      q: 'Is it free to use?',
      a: 'Yes, all basic features are free to use.',
    },
    {
      q: 'Can I temporarily disable blocking?',
      a: 'Yes, you can temporarily disable from settings. However, disable counts are also recorded.',
    },
  ],
};

export default function ShortShieldPage() {
  const { language } = useLanguage();
  const features = featuresData[language];
  const faqs = faqsData[language];

  const content = {
    ja: {
      backToProducts: '製品一覧に戻る',
      tagline: 'ショート動画の誘惑から解放される',
      releaseDate: 'D-U-N-S番号取得後リリース予定',
      comingSoon: 'Coming Soon',
      featuresTitle: '機能',
      faqTitle: 'よくある質問',
    },
    en: {
      backToProducts: 'Back to Products',
      tagline: 'Break free from short video addiction',
      releaseDate: 'Launching after D-U-N-S acquisition',
      comingSoon: 'Coming Soon',
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
              <div className="relative w-48 h-48 md:w-64 md:h-64 mx-auto mb-6 rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/products/ShortShield.png"
                  alt="ShortShield"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">ShortShield</h1>
              <p className="text-xl text-muted-foreground mb-2">
                {content[language].tagline}
              </p>
              <p className="text-sm text-primary font-medium mb-8">
                {content[language].releaseDate}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <span className="inline-flex items-center gap-2 px-6 py-3 bg-muted text-muted-foreground rounded-lg">
                  {content[language].comingSoon}
                </span>
              </div>
            </div>

            {/* Features */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold mb-8 text-center">{content[language].featuresTitle}</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {features.map((feature) => (
                  <div key={feature.title} className="glass p-6 rounded-2xl">
                    <feature.icon className="w-8 h-8 text-orange-500 mb-4" />
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
