'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
          question: '開発期間はどのくらいかかりますか？',
          answer: 'プロジェクトの規模や内容によって異なりますが、一般的なWebアプリケーションの場合、1ヶ月〜6ヶ月程度です。詳細なスケジュールについては、お見積もり時にご提示いたします。',
        },
        {
          question: '料金体系について教えてください',
          answer: '料金はプロジェクトの規模、使用する技術、開発期間などによって異なります。まずはお問い合わせフォームよりご相談ください。無料でお見積もりを作成いたします。',
        },
        {
          question: 'どのような技術に対応していますか？',
          answer: 'React、Next.js、TypeScript、Node.js、Python、PostgreSQL、MongoDB、AWS、GCP、Azureなど、最新のモダンな技術スタックに対応しています。また、お客様のご要望に応じて柔軟に対応いたします。',
        },
        {
          question: '保守・運用サポートは提供していますか？',
          answer: 'はい、開発後の保守・運用サポートも提供しております。サーバーの監視、バグ修正、機能追加など、長期的なサポートが可能です。',
        },
        {
          question: 'リモートでの開発は可能ですか？',
          answer: 'はい、全国どこからでもリモートで対応可能です。オンラインミーティングツールを活用し、スムーズなコミュニケーションを心がけています。',
        },
        {
          question: 'デザインのみの依頼は可能ですか？',
          answer: 'はい、UI/UXデザインのみのご依頼も承っております。Figma等のデザインツールを使用し、モダンで使いやすいデザインをご提供いたします。',
        },
        {
          question: '小規模なプロジェクトでも依頼できますか？',
          answer: 'はい、小規模なプロジェクトから大規模なシステム開発まで、幅広く対応しております。まずはお気軽にご相談ください。',
        },
        {
          question: '既存システムの改修・リニューアルは対応していますか？',
          answer: 'はい、既存システムの改修、リニューアル、移行作業なども対応可能です。現在のシステムの状況をお聞かせいただければ、最適な提案をさせていただきます。',
        },
        {
          question: '納品後の追加開発は可能ですか？',
          answer: 'はい、納品後も継続的な機能追加や改善を承っております。お客様のビジネスの成長に合わせて、柔軟に対応いたします。',
        },
        {
          question: '相談・見積もりは無料ですか？',
          answer: 'はい、初回のご相談とお見積もりは無料です。お問い合わせフォームまたはメールにてお気軽にご連絡ください。',
        },
      ] as FAQItem[],
    },
    en: {
      title: 'Frequently Asked Questions',
      subtitle: 'Common questions and answers from our clients.',
      faqs: [
        {
          question: 'How long does development take?',
          answer: 'It varies by project scope and content, but typically 1-6 months for standard web applications. We provide detailed schedules during the estimation phase.',
        },
        {
          question: 'What is your pricing structure?',
          answer: 'Pricing depends on project scale, technologies used, and development timeline. Please contact us through our inquiry form for a free estimate.',
        },
        {
          question: 'What technologies do you support?',
          answer: 'We support modern technology stacks including React, Next.js, TypeScript, Node.js, Python, PostgreSQL, MongoDB, AWS, GCP, and Azure. We also adapt flexibly to client requirements.',
        },
        {
          question: 'Do you provide maintenance and operational support?',
          answer: 'Yes, we offer post-development maintenance and operational support, including server monitoring, bug fixes, and feature additions for long-term support.',
        },
        {
          question: 'Is remote development possible?',
          answer: 'Yes, we can work remotely from anywhere in Japan. We use online meeting tools to ensure smooth communication.',
        },
        {
          question: 'Can I request design-only services?',
          answer: 'Yes, we accept UI/UX design-only requests. We use design tools like Figma to provide modern, user-friendly designs.',
        },
        {
          question: 'Do you accept small projects?',
          answer: 'Yes, we handle projects of all sizes, from small projects to large-scale system development. Please feel free to contact us.',
        },
        {
          question: 'Do you handle existing system modifications and renewals?',
          answer: 'Yes, we can handle existing system modifications, renewals, and migration work. Share your current system situation, and we\'ll provide optimal recommendations.',
        },
        {
          question: 'Is additional development possible after delivery?',
          answer: 'Yes, we accept continuous feature additions and improvements after delivery. We adapt flexibly to your business growth.',
        },
        {
          question: 'Are consultations and estimates free?',
          answer: 'Yes, initial consultations and estimates are free. Please contact us via our inquiry form or email.',
        },
      ] as FAQItem[],
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
