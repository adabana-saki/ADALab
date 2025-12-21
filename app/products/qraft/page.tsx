'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Zap, Wifi, History, Layers, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const featuresData = {
  ja: [
    {
      icon: Zap,
      title: '高速読み取り',
      description: 'カメラを向けるだけで瞬時に認識。複数のQRコードも連続スキャン可能。',
    },
    {
      icon: Wifi,
      title: 'Wi-Fi QR生成',
      description: 'Wi-Fi接続情報をQRコード化。友人やゲストへの共有が簡単に。',
    },
    {
      icon: History,
      title: '履歴保存',
      description: 'スキャン・生成したQRコードを自動保存。いつでも再利用可能。',
    },
    {
      icon: Layers,
      title: 'バッチ処理',
      description: '複数のQRコードを一括生成。ビジネス利用にも対応。',
    },
  ],
  en: [
    {
      icon: Zap,
      title: 'Fast Scanning',
      description: 'Instant recognition just by pointing the camera. Continuous scanning of multiple QR codes.',
    },
    {
      icon: Wifi,
      title: 'Wi-Fi QR Generation',
      description: 'Convert Wi-Fi connection info to QR code. Easy sharing with friends and guests.',
    },
    {
      icon: History,
      title: 'History Saving',
      description: 'Automatically save scanned and generated QR codes. Reuse anytime.',
    },
    {
      icon: Layers,
      title: 'Batch Processing',
      description: 'Generate multiple QR codes at once. Ready for business use.',
    },
  ],
};

const faqsData = {
  ja: [
    {
      q: '対応デバイスは？',
      a: 'Android 8.0以上、iOS 14以上のデバイスに対応予定です。',
    },
    {
      q: '無料で使えますか？',
      a: 'はい、基本機能はすべて無料でご利用いただけます。',
    },
    {
      q: 'どんな種類のQRコードに対応していますか？',
      a: 'URL、テキスト、Wi-Fi、連絡先、位置情報など、主要なQRコード形式すべてに対応しています。',
    },
  ],
  en: [
    {
      q: 'What devices are supported?',
      a: 'Planned to support Android 8.0+ and iOS 14+ devices.',
    },
    {
      q: 'Is it free to use?',
      a: 'Yes, all basic features are free to use.',
    },
    {
      q: 'What types of QR codes are supported?',
      a: 'All major QR code formats including URL, text, Wi-Fi, contacts, and location.',
    },
  ],
};

export default function QRaftPage() {
  const { language } = useLanguage();
  const features = featuresData[language];
  const faqs = faqsData[language];

  const content = {
    ja: {
      backToProducts: '製品一覧に戻る',
      tagline: 'QRコードをもっと便利に',
      comingSoon: 'Coming Soon',
      featuresTitle: '機能',
      faqTitle: 'よくある質問',
    },
    en: {
      backToProducts: 'Back to Products',
      tagline: 'Make QR codes more convenient',
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
                  src="/images/products/QRaft.png"
                  alt="QRaft"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">QRaft</h1>
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
                    <feature.icon className="w-8 h-8 text-violet-500 mb-4" />
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
