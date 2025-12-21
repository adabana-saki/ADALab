'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { ArrowLeft, Code, Mail, Calendar } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

export default function CompanyInfoPage() {
  const { language } = useLanguage();

  const content = {
    ja: {
      title: 'About ADA Lab',
      subtitle: 'あなたの"ほしい"を、カタチに。',
      info: [
        { icon: Code, label: '運営', value: 'Adabana Saki' },
        { icon: Calendar, label: '活動開始', value: '2025年' },
        { icon: Mail, label: 'メール', value: 'info.adalabtech@gmail.com' },
      ],
      sections: [
        {
          title: 'ADA Labとは',
          content: 'ADA Labは、日常の「あったらいいな」を形にする個人開発チームです。\n\n使いやすさとシンプルさを大切に、自分たちが本当に欲しいと思えるアプリケーションを開発しています。',
        },
        {
          title: '開発スタイル',
          content: 'のんびり、マイペースに開発しています。\n\n急ぎの案件や厳しい納期には対応できませんが、じっくり丁寧に作りたい方には向いているかもしれません。',
        },
        {
          title: '受託開発について',
          content: 'ご依頼をお受けする場合もあります。\n\n• 納期に余裕がある案件\n• 企画からコーディングまで一貫して任せていただける案件\n• コーディングのみのご依頼\n\nデザインのみのご依頼は基本的にお受けしていません。',
        },
        {
          title: '現在のプロダクト',
          content: '• Rem bot - Discord多機能管理Bot（2025年1月末リリース予定）\n• ShortShield - ショート動画ブロック拡張機能（開発中）\n• Sumio - AI要約ブラウザ拡張機能（開発中）\n• Navi - 片手操作モバイルアプリ（開発中）\n• QRaft - QRコードユーティリティ（開発中）\n\n自分たちが使いたいものを、自分たちのペースで作っています。',
        },
        {
          title: 'お問い合わせ',
          content: 'プロダクトへのご質問、ご依頼のご相談など、お気軽にどうぞ。\n\nメール: info.adalabtech@gmail.com\nX: @ADA_Lab_tech',
        },
      ],
    },
    en: {
      title: 'About ADA Lab',
      subtitle: 'Simple tools for everyday needs.',
      info: [
        { icon: Code, label: 'Operated by', value: 'Adabana Saki' },
        { icon: Calendar, label: 'Started', value: '2025' },
        { icon: Mail, label: 'Email', value: 'info.adalabtech@gmail.com' },
      ],
      sections: [
        {
          title: 'What is ADA Lab',
          content: 'ADA Lab is an indie development team that turns everyday "nice to haves" into reality.\n\nWe focus on usability and simplicity, building applications that we genuinely want to use ourselves.',
        },
        {
          title: 'Development Style',
          content: 'We work at our own relaxed pace.\n\nWe can\'t handle urgent projects or tight deadlines, but we might be a good fit if you prefer careful, thoughtful development.',
        },
        {
          title: 'About Commissions',
          content: 'We occasionally accept project requests.\n\n• Projects with flexible timelines\n• Projects where we handle everything from planning to coding\n• Coding-only requests\n\nWe generally don\'t accept design-only requests.',
        },
        {
          title: 'Current Products',
          content: '• Rem bot - Discord multi-function Bot (Launching end of Jan 2025)\n• ShortShield - Short video blocker extension (In Development)\n• Sumio - AI summary browser extension (In Development)\n• Navi - One-hand operation mobile app (In Development)\n• QRaft - QR code utility app (In Development)\n\nWe build what we want to use, at our own pace.',
        },
        {
          title: 'Contact',
          content: 'Feel free to reach out for product questions or project inquiries.\n\nEmail: info.adalabtech@gmail.com\nX: @ADA_Lab_tech',
        },
      ],
    },
  };

  const t = content[language];

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background pt-16">
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
        <h1 className="text-4xl md:text-5xl font-bold mb-2 holographic-text">
          {t.title}
        </h1>
        <p className="text-lg text-muted-foreground mb-12">{t.subtitle}</p>

        {/* Info Cards */}
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

      </div>
      </div>
      <Footer />
    </>
  );
}
