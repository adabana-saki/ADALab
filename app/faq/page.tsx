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
      subtitle: 'お客様からよくいただくご質問とその回答をまとめました。',
      faqs: [
        {
          question: 'ADA Labはどんな活動をしていますか？',
          answer: '個人開発チームとして、自分たちが欲しいと思えるアプリやサービスを開発しています。現在はRem bot（Discord Bot）やNavi（モバイルアプリ）を開発中です。',
        },
        {
          question: '開発の依頼は受け付けていますか？',
          answer: 'はい、納期に余裕がある案件であればお受けする場合があります。ただし、のんびりマイペースで開発するスタイルなので、急ぎの案件には対応できません。',
        },
        {
          question: 'デザインのみ、コーディングのみの依頼は可能ですか？',
          answer: '申し訳ありませんが、デザインのみやコーディングのみといった部分的なご依頼は基本的にお受けしていません。企画からコーディングまで一貫して担当できる案件を優先しています。',
        },
        {
          question: '開発期間はどのくらいかかりますか？',
          answer: 'プロジェクトの規模によりますが、のんびり開発するスタイルなので、一般的な開発会社より時間がかかる場合があります。スケジュールについてはご相談時にお伝えします。',
        },
        {
          question: 'どのような技術を使っていますか？',
          answer: 'React、Next.js、TypeScript、Node.js、Python、PostgreSQL、Firebase、Cloudflareなどを使用しています。プロジェクトに合わせて最適な技術を選択します。',
        },
        {
          question: 'プロダクトのバグ報告や機能リクエストはどこに送ればいいですか？',
          answer: 'お問い合わせフォーム、メール（info.adalabtech@gmail.com）、またはX（@ADA_Lab_tech）のDMでお気軽にご連絡ください。',
        },
        {
          question: '相談は無料ですか？',
          answer: 'はい、ご相談は無料です。お気軽にお問い合わせください。',
        },
      ] as FAQItem[],
    },
    en: {
      title: 'Frequently Asked Questions',
      subtitle: 'Common questions and answers from our clients.',
      faqs: [
        {
          question: 'What does ADA Lab do?',
          answer: 'We\'re an indie development team building apps and services we genuinely want to use. Currently developing Rem bot (Discord Bot) and Navi (mobile app).',
        },
        {
          question: 'Do you accept development requests?',
          answer: 'Yes, we may accept projects with flexible timelines. However, we work at our own relaxed pace, so we can\'t handle urgent projects.',
        },
        {
          question: 'Can I request design-only or coding-only work?',
          answer: 'Sorry, we generally don\'t accept partial work like design-only or coding-only requests. We prefer projects where we handle everything from planning to coding.',
        },
        {
          question: 'How long does development take?',
          answer: 'It depends on project scope, but since we work at a relaxed pace, it may take longer than typical development firms. We\'ll discuss schedules during consultation.',
        },
        {
          question: 'What technologies do you use?',
          answer: 'We use React, Next.js, TypeScript, Node.js, Python, PostgreSQL, Firebase, Cloudflare, and more. We choose the best tech for each project.',
        },
        {
          question: 'Where can I send bug reports or feature requests?',
          answer: 'Feel free to reach out via our contact form, email (info.adalabtech@gmail.com), or X (@ADA_Lab_tech) DM.',
        },
        {
          question: 'Are consultations free?',
          answer: 'Yes, consultations are free. Feel free to contact us.',
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
              ? 'お気軽にお問い合わせください。24時間以内にご返信いたします。'
              : 'Feel free to contact us. We will respond within 24 hours.'}
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
