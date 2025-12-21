'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Zap, Globe, History, Sparkles, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const featuresData = {
  ja: [
    {
      icon: Zap,
      title: 'ワンクリック要約',
      description: 'ボタンひとつでページ全体をAIが要約。複雑な操作は一切不要。',
    },
    {
      icon: Sparkles,
      title: 'AIモデル選択',
      description: 'ChatGPT、Claude、Geminiなど、お好みのAIモデルを選択可能。',
    },
    {
      icon: Globe,
      title: '多言語対応',
      description: '英語のページも日本語で要約。言語の壁を越えて情報収集。',
    },
    {
      icon: History,
      title: '要約履歴',
      description: '過去の要約をいつでも確認。後から見返すのも簡単。',
    },
  ],
  en: [
    {
      icon: Zap,
      title: 'One-click Summary',
      description: 'AI summarizes the entire page with one button. No complex operations needed.',
    },
    {
      icon: Sparkles,
      title: 'AI Model Selection',
      description: 'Choose your preferred AI model: ChatGPT, Claude, Gemini, and more.',
    },
    {
      icon: Globe,
      title: 'Multi-language Support',
      description: 'Summarize English pages in Japanese. Gather information beyond language barriers.',
    },
    {
      icon: History,
      title: 'Summary History',
      description: 'Access past summaries anytime. Easy to review later.',
    },
  ],
};

const faqsData = {
  ja: [
    {
      q: 'APIキーは必要ですか？',
      a: 'はい、お好みのAIサービス（OpenAI、Anthropic等）のAPIキーが必要です。',
    },
    {
      q: '対応ブラウザは？',
      a: 'Chrome、Firefox、Edgeに対応しています。',
    },
    {
      q: 'データはどこに保存されますか？',
      a: '要約データはローカルに保存されます。外部サーバーには送信しません。',
    },
  ],
  en: [
    {
      q: 'Do I need an API key?',
      a: 'Yes, you need an API key from your preferred AI service (OpenAI, Anthropic, etc.).',
    },
    {
      q: 'Which browsers are supported?',
      a: 'Chrome, Firefox, and Edge are supported.',
    },
    {
      q: 'Where is data stored?',
      a: 'Summary data is stored locally. It is not sent to external servers.',
    },
  ],
};

export default function SumioPage() {
  const { language } = useLanguage();
  const features = featuresData[language];
  const faqs = faqsData[language];

  const content = {
    ja: {
      backToProducts: '製品一覧に戻る',
      tagline: '長文記事も3行で把握',
      comingSoon: 'Coming Soon',
      featuresTitle: '機能',
      faqTitle: 'よくある質問',
    },
    en: {
      backToProducts: 'Back to Products',
      tagline: 'Understand long articles in 3 lines',
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
                  src="/images/products/Sumio.png"
                  alt="Sumio"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Sumio</h1>
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
                    <feature.icon className="w-8 h-8 text-emerald-500 mb-4" />
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
