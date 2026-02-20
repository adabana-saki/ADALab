'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Hand, Zap, Layout, Settings, ArrowLeft, ExternalLink, Smartphone, CreditCard } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const featuresData = {
  ja: [
    {
      icon: Hand,
      title: 'トラックパッド操作',
      description: '画面下部をトラックパッドにして直感的にカーソル操作。片手でも画面全体を操作できます。',
    },
    {
      icon: Zap,
      title: 'タップ＆スクロール',
      description: 'カーソル位置でのタップ、スクロールモードで上下左右に快適スクロール。',
    },
    {
      icon: Layout,
      title: 'アプリプロファイル',
      description: 'アプリごとにカスタム設定を保存し、自動で切り替え。使い方に合わせた最適化を。',
    },
    {
      icon: Settings,
      title: '37種のアクション',
      description: '戻る、ホーム、通知、スクリーンショットなど37種のアクションをジェスチャーで実行。',
    },
  ],
  en: [
    {
      icon: Hand,
      title: 'Trackpad Control',
      description: 'Turn the bottom of your screen into a trackpad for intuitive cursor control. Reach the entire screen with one hand.',
    },
    {
      icon: Zap,
      title: 'Tap & Scroll',
      description: 'Tap at cursor position, scroll mode for smooth directional scrolling.',
    },
    {
      icon: Layout,
      title: 'App Profiles',
      description: 'Save custom settings per app with automatic switching. Optimized for your workflow.',
    },
    {
      icon: Settings,
      title: '37 Actions',
      description: 'Execute 37 actions like Back, Home, Notifications, Screenshot and more via gestures.',
    },
  ],
};

const faqsData = {
  ja: [
    {
      q: '対応デバイスは？',
      a: 'Android 8.0以上のデバイスに対応しています。',
    },
    {
      q: 'アクセシビリティサービスって何？',
      a: 'Naviはアクセシビリティサービスを使って画面上にカーソルを表示し、タップやスクロールを実行します。初回起動時に設定画面から有効にしてください。',
    },
    {
      q: '無料で使えますか？',
      a: '基本機能は無料です。Premium（¥490・買い切り）で広告非表示・全37アクション解放など、すべての機能をご利用いただけます。',
    },
  ],
  en: [
    {
      q: 'What devices are supported?',
      a: 'Supports devices with Android 8.0 or higher.',
    },
    {
      q: 'What is the Accessibility Service?',
      a: 'Navi uses the Accessibility Service to display a cursor on screen and perform taps and scrolls. Enable it in your device settings on first launch.',
    },
    {
      q: 'Is it free to use?',
      a: 'Basic features are free. Premium (¥490, one-time purchase) unlocks ad-free experience, all 37 actions, and full functionality.',
    },
  ],
};

export default function NaviPage() {
  const { language } = useLanguage();
  const features = featuresData[language];
  const faqs = faqsData[language];

  const content = {
    ja: {
      backToProducts: '製品一覧に戻る',
      tagline: '片手操作トラックパッド',
      googlePlay: 'Google Play',
      privacyPolicy: 'プライバシーポリシー',
      featuresTitle: '機能',
      infoTitle: '製品情報',
      faqTitle: 'よくある質問',
      os: '対応OS',
      osValue: 'Android 8.0+',
      price: '価格',
      priceValue: '基本無料 / Premium ¥490（買い切り）',
    },
    en: {
      backToProducts: 'Back to Products',
      tagline: 'One-handed Trackpad',
      googlePlay: 'Google Play',
      privacyPolicy: 'Privacy Policy',
      featuresTitle: 'Features',
      infoTitle: 'Product Info',
      faqTitle: 'FAQ',
      os: 'Supported OS',
      osValue: 'Android 8.0+',
      price: 'Price',
      priceValue: 'Free / Premium ¥490 (one-time)',
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
                  src="/images/products/Navi.png"
                  alt="Navi"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Navi</h1>
              <p className="text-xl text-muted-foreground mb-8">
                {content[language].tagline}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {/* TODO: Play Store公開後にURLを設定 */}
                <a
                  href="#"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {content[language].googlePlay}
                  <ExternalLink className="w-4 h-4" />
                </a>
                <a
                  href="/privacy#navi"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-input rounded-lg hover:bg-accent transition-colors"
                >
                  {content[language].privacyPolicy}
                </a>
              </div>
            </div>

            {/* Features */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold mb-8 text-center">{content[language].featuresTitle}</h2>
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

            {/* Product Info */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold mb-8 text-center">{content[language].infoTitle}</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass p-6 rounded-2xl">
                  <Smartphone className="w-8 h-8 text-accent mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{content[language].os}</h3>
                  <p className="text-muted-foreground">{content[language].osValue}</p>
                </div>
                <div className="glass p-6 rounded-2xl">
                  <CreditCard className="w-8 h-8 text-accent mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{content[language].price}</h3>
                  <p className="text-muted-foreground">{content[language].priceValue}</p>
                </div>
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
