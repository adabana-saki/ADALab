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
          content: '• 自社プロダクト開発・運営\n• SaaSプラットフォーム事業\n• AIソリューション開発\n• データ分析プラットフォーム\n• コミュニケーションツール\n• セキュリティソリューション',
        },
        {
          title: '企業理念',
          content: 'テクノロジーで世界を変える。\n\n私たちは、革新的なプロダクトを通じて人々の生活やビジネスをより良くすることを目指しています。ユーザーファーストの姿勢を貫き、常に挑戦し続けることで、社会に真の価値を提供します。',
        },
        {
          title: '私たちの強み',
          content: '• プロダクト開発に特化したチーム\n• 迅速なリリースと改善サイクル\n• データドリブンな意思決定\n• スケーラブルなアーキテクチャ設計\n• ユーザー体験を第一に考えたデザイン',
        },
        {
          title: 'ユーザー',
          content: '私たちのプロダクトは、スタートアップから大企業まで、50,000以上のユーザーにご利用いただいています。グローバルに展開し、日々成長を続けています。',
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
          content: '• Product Development & Operations\n• SaaS Platform Business\n• AI Solutions\n• Data Analytics Platform\n• Communication Tools\n• Security Solutions',
        },
        {
          title: 'Corporate Philosophy',
          content: 'Changing the world with technology.\n\nWe aim to improve people\'s lives and businesses through innovative products. With a user-first approach and continuous innovation, we deliver true value to society.',
        },
        {
          title: 'Our Strengths',
          content: '• Product-focused team\n• Rapid release and improvement cycles\n• Data-driven decision making\n• Scalable architecture design\n• User experience-first design',
        },
        {
          title: 'Users',
          content: 'Our products are used by over 50,000 users, from startups to large enterprises. We are expanding globally and growing every day.',
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
