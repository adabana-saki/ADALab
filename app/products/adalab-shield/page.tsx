'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Focus, BarChart3, Ban, ArrowLeft, Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const featuresData = {
  ja: [
    {
      icon: Zap,
      title: 'adalab focus 連携',
      description: 'study.adalabtech.com のポモドーロと同期。フォーカス中は誘惑サイトを自動ブロック、休憩中は自動解除。ポップアップからタイマー操作やタスク完了も可能。',
    },
    {
      icon: Ban,
      title: '読み込み前ブロック',
      description: 'ページが表示される前のネットワーク層でブロック。ブロック画面にはフォーカスの残り時間と取組中のタスクが表示されます。',
    },
    {
      icon: Focus,
      title: 'ショート動画・サイトブロック',
      description: 'YouTube Shorts、TikTok、Instagramリールなどをブロック。サイト全体ブロックやカスタムドメインの追加にも対応。',
    },
    {
      icon: BarChart3,
      title: '統計とストリーク',
      description: 'ブロック回数・時間制限・連続達成日数を可視化。ブロック統計は adalab focus の週次レポートにも表示されます。',
    },
  ],
  en: [
    {
      icon: Zap,
      title: 'adalab focus Sync',
      description: 'Syncs with the study.adalabtech.com pomodoro. Sites are auto-blocked during focus and unblocked during breaks. Control the timer and complete tasks from the popup.',
    },
    {
      icon: Ban,
      title: 'Pre-load Blocking',
      description: 'Blocks at the network layer before the page renders. The block screen shows your remaining focus time and current task.',
    },
    {
      icon: Focus,
      title: 'Shorts & Site Blocking',
      description: 'Block YouTube Shorts, TikTok, Instagram Reels and more. Full-site blocking and custom domains supported.',
    },
    {
      icon: BarChart3,
      title: 'Stats & Streaks',
      description: 'Visualize block counts, time limits, and streaks. Block statistics also appear in the adalab focus weekly report.',
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
    {
      q: 'adalab focus がなくても使えますか？',
      a: 'はい、ショート動画ブロックや時間制限などの機能は単体で利用できます。adalab focus と併用すると、ポモドーロ連動の自動ブロックが有効になります。',
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
    {
      q: 'Can I use it without adalab focus?',
      a: 'Yes. Shorts blocking, time limits, and other features work standalone. Pairing with adalab focus enables pomodoro-synced auto blocking.',
    },
  ],
};

export default function AdalabShieldPage() {
  const { language } = useLanguage();
  const features = featuresData[language];
  const faqs = faqsData[language];

  const content = {
    ja: {
      backToProducts: '製品一覧に戻る',
      tagline: 'フォーカス中の誘惑を、仕組みで断つ',
      comingSoon: 'Coming Soon',
      featuresTitle: '機能',
      faqTitle: 'よくある質問',
    },
    en: {
      backToProducts: 'Back to Products',
      tagline: 'Guard your focus, automatically',
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
                  src="/images/products/adalab-shield-v2.png"
                  alt="adalab shield"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">adalab shield</h1>
              <p className="text-xl text-muted-foreground mb-8">
                {content[language].tagline}
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
