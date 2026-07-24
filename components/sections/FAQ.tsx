'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown, HelpCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';

// シンプルなマークダウンをHTMLに変換（静的コンテンツ専用）
function parseMarkdown(text: string): string {
  // HTMLエンティティをエスケープ
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return escaped
    // 太字 **text**
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // リスト項目 - text
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // 番号リスト 1. text
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
}

const faqsData = {
  ja: [
    {
      id: '1',
      question: 'ADA Lab とは？',
      answer:
        'ADA Lab は、私が自分の困りごとを解決するために作ったアプリを公開している場所です。会社ではなく、一人でやっています。今のメインは集中管理アプリ「adalab focus」です。',
    },
    {
      id: '2',
      question: 'どのプロダクトが今すぐ使えますか？',
      answer:
        '今すぐ使えるのは2つです。\n\n- **adalab focus**: ポモドーロ・学習記録・試験カウントダウンをまとめた集中管理アプリ（Web / PWA、無料で公開中）\n- **adalab shield**: フォーカス中に誘惑サイトを自動ブロックするブラウザ拡張（v0.2、GitHub で公開中）\n\nこのほか Rem bot・Navi などを開発中です。動くようになったものから順番に公開します。',
    },
    {
      id: '3',
      question: '無料で使えますか？',
      answer:
        '公開しているものはすべて無料で使えます。\n\n将来もし有料プランを作ることがあっても、今ある機能を後から有料に閉じ込めることはしません。',
    },
    {
      id: '4',
      question: 'バグ報告・要望・サポートはどこに送ればいい？',
      answer:
        '個人開発なので、私一人で対応しています。\n\n- **Discord / X (@ADA_Lab_tech)**: 一番早いです。だいたい2〜3日以内に返します\n- **メール**: info.adalabtech@gmail.com\n\n即レスや24時間対応はできませんが、もらった要望はかなりの割合でそのまま取り込んでいます。',
    },
  ],
  en: [
    {
      id: '1',
      question: 'What is ADA Lab?',
      answer:
        'ADA Lab is where I publish the apps I build to solve my own problems. It\'s not a company — it\'s just me. Right now the main one is adalab focus, a study-focus app.',
    },
    {
      id: '2',
      question: 'Which products can I use right now?',
      answer:
        'Two of them are live today:\n\n- **adalab focus**: a focus app that combines Pomodoro, a study log, and an exam countdown (Web / PWA, free)\n- **adalab shield**: a browser extension that blocks distracting sites while you\'re in a focus session (v0.2, on GitHub)\n\nRem bot, Navi and a few others are still in development. I ship them one by one as they actually start working.',
    },
    {
      id: '3',
      question: 'Are they free?',
      answer:
        'Everything I\'ve published is free to use.\n\nIf I ever add a paid plan, I won\'t take today\'s features and lock them behind it later.',
    },
    {
      id: '4',
      question: 'Where do I report a bug or request a feature?',
      answer:
        'It\'s a one-person project, so I handle everything myself.\n\n- **Discord / X (@ADA_Lab_tech)**: fastest — I usually reply within 2–3 days\n- **Email**: info.adalabtech@gmail.com\n\nI can\'t do instant or 24/7 support, but a good chunk of the requests I get end up shipped as-is.',
    },
  ],
};

const uiContent = {
  ja: {
    subtitle: 'よくあるご質問にお答えします',
    moreQuestions: 'その他のご質問がございましたら、お気軽にお問い合わせください',
    contactUs: 'お問い合わせ →',
    viewAll: 'すべてのFAQを見る',
  },
  en: {
    subtitle: 'Answers to commonly asked questions',
    moreQuestions: 'If you have any other questions, please feel free to contact us',
    contactUs: 'Contact Us →',
    viewAll: 'View All FAQs',
  },
};

interface FAQItemProps {
  faq: typeof faqsData.ja[0];
  index: number;
}

function FAQItem({ faq, index }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.05 * index }}
      className="glass rounded-lg overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="font-semibold pr-4">{faq.question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="text-primary flex-shrink-0" size={20} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5">
              <div
                className="text-muted-foreground leading-relaxed whitespace-pre-line [&_strong]:text-foreground [&_strong]:font-semibold [&_li]:ml-4 [&_li]:list-disc"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(faq.answer) }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQ() {
  const { language } = useLanguage();
  const faqs = faqsData[language];
  const content = uiContent[language];

  return (
    <section id="faq" className="py-20 md:py-32 bg-muted/20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="hidden md:block absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <HelpCircle className="text-primary" size={40} />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {content.subtitle}
          </p>
        </motion.div>

        {/* FAQ List */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem key={faq.id} faq={faq} index={index} />
          ))}
        </div>

        {/* View All FAQs Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 hover:bg-primary/20 text-primary font-semibold rounded-lg transition-colors"
          >
            {content.viewAll}
            <ArrowRight size={18} />
          </Link>
        </motion.div>

        {/* Additional Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-8"
        >
          <p className="text-lg text-muted-foreground mb-4">
            {content.moreQuestions}
          </p>
          <a
            href="#contact"
            className="text-primary hover:text-primary/80 font-semibold text-lg underline underline-offset-4"
          >
            {content.contactUs}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
