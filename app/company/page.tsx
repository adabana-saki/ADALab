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
      subtitle: '自分が困ったものを、自分のために。',
      info: [
        { icon: Code, label: '運営', value: '個人開発' },
        { icon: Calendar, label: '活動開始', value: '2025年' },
        { icon: Mail, label: 'メール', value: 'info.adalabtech@gmail.com' },
      ],
      sections: [
        {
          title: 'ADA Labとは',
          content: 'ADA Labは、日常の「あったらいいな」を形にする個人開発です。\n\n使いやすさとシンプルさを大切に、自分が本当に欲しいと思えるアプリを作っています。',
        },
        {
          title: '開発スタイル',
          content: 'のんびり、マイペースに開発しています。\n\n急ぎの案件や厳しい納期には対応できませんが、じっくり丁寧に作りたい方には向いているかもしれません。',
        },
        {
          title: '受託開発について',
          content: 'ご依頼をお受けする場合もあります。\n\n• 納期に余裕がある案件\n• 企画からコーディングまで一貫して任せていただける案件\n\nデザインのみ、コーディングのみといった部分的なご依頼は基本的にお受けしていません。',
        },
        {
          title: '現在のプロダクト',
          content: '• adalab focus — 集中管理アプリ / PWA（公開中）\n• adalab shield — 集中ガード拡張機能（GitHubで公開中）\n• Rem bot・Navi・Sumio・QRaft（開発中）\n\n自分が使いたいものを、自分のペースで作っています。',
        },
        {
          title: 'お問い合わせ',
          content: 'プロダクトへのご質問、ご依頼のご相談など、お気軽にどうぞ。\n\nメール: info.adalabtech@gmail.com\nX: @ADA_Lab_tech',
        },
      ],
    },
    en: {
      title: 'About ADA Lab',
      subtitle: 'The things I got stuck on, built for myself.',
      info: [
        { icon: Code, label: 'Operation', value: 'Independent Development' },
        { icon: Calendar, label: 'Started', value: '2025' },
        { icon: Mail, label: 'Email', value: 'info.adalabtech@gmail.com' },
      ],
      sections: [
        {
          title: 'What is ADA Lab',
          content: 'ADA Lab is a one-person project that turns everyday "nice to haves" into real tools.\n\nI focus on usability and simplicity, building the apps I genuinely want to use myself.',
        },
        {
          title: 'Development Style',
          content: 'I work at my own relaxed pace.\n\nI can\'t handle urgent projects or tight deadlines, but it might be a good fit if you prefer careful, thoughtful development.',
        },
        {
          title: 'About Commissions',
          content: 'I occasionally accept project requests.\n\n• Projects with flexible timelines\n• Projects where I handle everything from planning to coding\n\nI generally don\'t accept partial work like design-only or coding-only requests.',
        },
        {
          title: 'Current Products',
          content: '• adalab focus — study-focus app / PWA (Live)\n• adalab shield — focus-guard extension (Open source on GitHub)\n• Rem bot, Navi, Sumio, QRaft (In Development)\n\nI build what I want to use, at my own pace.',
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
