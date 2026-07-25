'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { FAQStructuredData } from '@/components/FAQStructuredData';

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQPage() {
  const { language } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const content = {
    ja: {
      title: 'よくある質問',
      subtitle: 'adalab focus をはじめ、プロダクトについてよくいただく質問をまとめました。',
      faqs: [
        {
          question: 'ADA Labはどんなことをしていますか？',
          answer: '個人開発です。自分が困ったものを自分のために作って公開しています。今は集中管理アプリ「adalab focus」がメインで、連携する集中ガード拡張「adalab shield」も公開しています。',
        },
        {
          question: 'adalab focus は無料で使えますか？',
          answer: 'はい、無料で使えます。ブラウザからそのまま使えるアプリ（PWA）で、study.adalabtech.com から始められます。',
        },
        {
          question: 'PC とスマホでデータは同期できますか？',
          answer: 'はい。Google ログインをすると、TODO・ポモドーロ・学習記録などが PC とスマホで自動同期します。データは Cloudflare D1 に保存されます。',
        },
        {
          question: 'オフラインでも使えますか？',
          answer: 'はい。PWA として動作するので、オフラインでも記録でき、オンラインに戻ったタイミングで自動的に同期します。',
        },
        {
          question: 'アカウントやデータを削除したいときは？',
          answer: 'アプリ内の設定から削除できます。うまくいかない場合は info.adalabtech@gmail.com までご連絡いただければ対応します。',
        },
        {
          question: '不具合の報告や機能リクエストはどこに送ればいいですか？',
          answer: 'メール（info.adalabtech@gmail.com）、X（@ADA_Lab_tech）、Discord でお気軽にどうぞ。もらった意見はかなりの割合でそのまま取り込んでいます。',
        },
        {
          question: '開発の依頼はできますか？',
          answer: '個人開発なので基本は自分のプロダクトが中心ですが、余裕があればご相談をお受けする場合があります。詳しくは「作っている人（About）」ページをご覧ください。',
        },
      ] as FAQItem[],
    },
    en: {
      title: 'Frequently Asked Questions',
      subtitle: 'Common questions about adalab focus and my other products.',
      faqs: [
        {
          question: 'What does ADA Lab do?',
          answer: 'It\'s a one-person project. I build the tools I wish existed, for myself first, then ship them. Right now the main one is adalab focus, a study-focus app, along with adalab shield, a companion focus-guard extension.',
        },
        {
          question: 'Is adalab focus free to use?',
          answer: 'Yes, it\'s free. It\'s a web app (PWA) you can use right in your browser — just head to study.adalabtech.com.',
        },
        {
          question: 'Can I sync data between my PC and phone?',
          answer: 'Yes. Sign in with Google and your TODOs, Pomodoro sessions, and study logs sync automatically across PC and phone. Data is stored on Cloudflare D1.',
        },
        {
          question: 'Does it work offline?',
          answer: 'Yes. It runs as a PWA, so you can keep logging offline and it syncs automatically once you\'re back online.',
        },
        {
          question: 'How do I delete my account or data?',
          answer: 'You can delete it from the in-app settings. If you run into trouble, email me at info.adalabtech@gmail.com and I\'ll take care of it.',
        },
        {
          question: 'Where can I send bug reports or feature requests?',
          answer: 'Email (info.adalabtech@gmail.com), X (@ADA_Lab_tech), or Discord — whatever\'s easiest. A good chunk of what people ask for ends up shipped as-is.',
        },
        {
          question: 'Can I commission you for development work?',
          answer: 'As a solo developer I mostly focus on my own products, but I occasionally take requests when I have room. See the About page for details.',
        },
      ] as FAQItem[],
    },
  };

  const t = content[language];

  return (
    <>
      <FAQStructuredData faqs={t.faqs} />
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
        <h1 className="text-4xl md:text-5xl font-bold mb-4 holographic-text">
          {t.title}
        </h1>
        <p className="text-muted-foreground mb-12">{t.subtitle}</p>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {t.faqs.map((faq, index) => (
            <div
              key={index}
              className="glass rounded-xl border border-border overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-6 flex items-center justify-between gap-4 text-left hover:bg-white/5 transition-colors"
              >
                <span className="font-semibold text-lg">{faq.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5 text-neon-cyan flex-shrink-0" />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-0 text-muted-foreground leading-relaxed border-t border-border/50">
                      <div className="pt-4">{faq.answer}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 glass rounded-xl p-8 border border-border text-center">
          <h2 className="text-2xl font-bold mb-4 holographic-text">
            {language === 'ja' ? 'その他のご質問はこちら' : 'Have More Questions?'}
          </h2>
          <p className="text-muted-foreground mb-6">
            {language === 'ja'
              ? 'お気軽にお問い合わせください。個人開発のため、返信までに数日いただくことがあります。'
              : 'Feel free to reach out. As a solo developer, replies may take a few days.'}
          </p>
          <Link
            href="/#contact"
            className="inline-block px-8 py-3 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-lg font-semibold hover:scale-105 transition-transform"
          >
            {language === 'ja' ? 'お問い合わせ' : 'Contact Us'}
          </Link>
        </div>

        </div>
      </div>
      <Footer />
    </>
  );
}
