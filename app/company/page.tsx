'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { ArrowLeft, Building, MapPin, Mail, Phone, Calendar } from 'lucide-react';

export default function CompanyInfoPage() {
  const { language } = useLanguage();

  const content = {
    ja: {
      title: '会社概要',
      info: [
        { icon: Building, label: '会社名', value: '株式会社ADA Lab' },
        { icon: Calendar, label: '設立', value: '2020年4月1日' },
        { icon: MapPin, label: '所在地', value: '〒100-0001 東京都千代田区千代田1-1-1' },
        { icon: Phone, label: '電話番号', value: '03-1234-5678' },
        { icon: Mail, label: 'メール', value: 'info@adalab.example.com' },
      ],
      sections: [
        {
          title: '事業内容',
          content: '• Webアプリケーション開発\n• モバイルアプリケーション開発（iOS / Android）\n• UI/UXデザイン\n• システムコンサルティング\n• クラウドインフラ構築・運用\n• AIソリューション開発',
        },
        {
          title: '企業理念',
          content: 'テクノロジーで未来を創造する。\n\n私たちは、最新のテクノロジーと創造的なアイデアを融合し、お客様のビジネスに真の価値を提供します。常に挑戦し続け、革新的なソリューションを通じて社会に貢献することを目指しています。',
        },
        {
          title: '私たちの強み',
          content: '• 最新技術への迅速な対応\n• 経験豊富なエンジニアチーム\n• お客様に寄り添った丁寧なサポート\n• 高品質なコードとデザイン\n• アジャイル開発による柔軟な対応',
        },
        {
          title: '取引先企業',
          content: '大手IT企業、金融機関、製造業、小売業、スタートアップ企業など、幅広い業界のお客様と取引実績がございます。',
        },
      ],
    },
    en: {
      title: 'Company Information',
      info: [
        { icon: Building, label: 'Company Name', value: 'ADA Lab Inc.' },
        { icon: Calendar, label: 'Established', value: 'April 1, 2020' },
        { icon: MapPin, label: 'Address', value: '1-1-1 Chiyoda, Chiyoda-ku, Tokyo 100-0001, Japan' },
        { icon: Phone, label: 'Phone', value: '+81-3-1234-5678' },
        { icon: Mail, label: 'Email', value: 'info@adalab.example.com' },
      ],
      sections: [
        {
          title: 'Business Activities',
          content: '• Web Application Development\n• Mobile Application Development (iOS / Android)\n• UI/UX Design\n• System Consulting\n• Cloud Infrastructure Construction & Operations\n• AI Solution Development',
        },
        {
          title: 'Corporate Philosophy',
          content: 'Creating the future with technology.\n\nWe combine cutting-edge technology with creative ideas to deliver true value to our clients\' businesses. We continuously challenge ourselves and aim to contribute to society through innovative solutions.',
        },
        {
          title: 'Our Strengths',
          content: '• Rapid adoption of latest technologies\n• Experienced engineering team\n• Attentive customer support\n• High-quality code and design\n• Flexible agile development approach',
        },
        {
          title: 'Client Portfolio',
          content: 'We have worked with clients across various industries, including major IT companies, financial institutions, manufacturing, retail, and startups.',
        },
      ],
    },
  };

  const t = content[language];

  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 via-transparent to-neon-purple/5" />
        <div className="scanlines opacity-10" />
      </div>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-8 text-neon-cyan hover:text-neon-purple transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{language === 'ja' ? 'ホームに戻る' : 'Back to Home'}</span>
        </Link>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-12 holographic-text">
          {t.title}
        </h1>

        {/* Company Info Cards */}
        <div className="grid gap-4 mb-12">
          {t.info.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="glass rounded-xl p-6 border border-border flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">{item.label}</p>
                  <p className="text-lg font-semibold">{item.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {t.sections.map((section, index) => (
            <section key={index} className="glass rounded-xl p-6 border border-border">
              <h2 className="text-2xl font-bold mb-4 text-neon-cyan">
                {section.title}
              </h2>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {section.content}
              </p>
            </section>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 ADA Lab. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
