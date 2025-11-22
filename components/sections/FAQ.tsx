'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

// シンプルなマークダウンをHTMLに変換
function parseMarkdown(text: string): string {
  return text
    // 太字 **text**
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // リスト項目 - text
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // 番号リスト 1. text
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
}

const faqs = [
  {
    id: '1',
    question: 'ADA Labとは何ですか？',
    answer:
      'ADA Labは、日常の「あったらいいな」を形にするプロダクトカンパニーです。シンプルで使いやすいアプリケーションを個人開発で提供しています。「あなたの"ほしい"を、カタチに。」をモットーに活動しています。',
  },
  {
    id: '2',
    question: 'どのようなプロダクトを開発していますか？',
    answer:
      '現在、以下のプロダクトを開発中です：\n\n- **Rem bot**: Discordの多機能管理Bot。リマインド、投票作成、読み上げ、サーバー管理、ゲームなど\n- **Navi**: 片手でスマホを完全操作できるモバイルアプリ。満員電車でも快適に使えます\n\n今後もユーザーの声を聞きながら、新しいプロダクトを開発していきます。',
  },
  {
    id: '3',
    question: 'プロダクトは無料で使えますか？',
    answer:
      '基本的な機能は無料でお使いいただけます。\n\n一部の高度な機能やプレミアム機能については、将来的に有料プランを設ける可能性がありますが、コア機能は常に無料で提供する予定です。詳細は各プロダクトのページでご確認ください。',
  },
  {
    id: '4',
    question: 'Rem botをDiscordサーバーに導入するにはどうすればいいですか？',
    answer:
      'Rem botの導入は簡単です：\n\n1. プロダクトページの「Discordに追加」ボタンをクリック\n2. DiscordのOAuth認証画面で、導入するサーバーを選択\n3. 必要な権限を許可\n4. 完了！\n\n導入後は「/help」コマンドで使い方を確認できます。',
  },
  {
    id: '5',
    question: 'バグを見つけた場合や機能リクエストはどこに送ればいいですか？',
    answer:
      'バグ報告や機能リクエストは以下の方法で受け付けています：\n\n- **お問い合わせフォーム**: このサイトのContactセクションから\n- **メール**: info.adalabtech@gmail.com\n- **X**: @ADA_Lab_tech へDMまたはリプライ\n- **GitHub Issues**: 各プロダクトのリポジトリにて\n\nユーザーからのフィードバックは大歓迎です！',
  },
  {
    id: '6',
    question: 'プライバシーやデータの取り扱いはどうなっていますか？',
    answer:
      'ユーザーのプライバシーは最優先で保護しています。\n\n- 必要最小限のデータのみを収集\n- データは暗号化して保存\n- 第三者への提供は行いません\n- いつでもデータの削除をリクエスト可能\n\n詳細はプライバシーポリシーをご確認ください。',
  },
  {
    id: '7',
    question: 'サポートの対応時間は？',
    answer:
      'メールやSNSでのお問い合わせは、8:00〜24:00（日本時間）で対応しています。\n\n個人開発のため、回答には数日お時間をいただく場合がありますが、必ず返信いたします。緊急の問題（セキュリティ関連など）については優先的に対応します。',
  },
  {
    id: '8',
    question: 'どのような技術を使っていますか？',
    answer:
      '主に以下の技術スタックを使用しています：\n\n- **フロントエンド**: React, Next.js, TypeScript, Tailwind CSS\n- **バックエンド**: Node.js, Python, Discord.js\n- **モバイル**: React Native, Expo\n- **インフラ**: Vercel, Google Cloud, MongoDB\n\n常に最新の技術をキャッチアップし、最適なものを選択しています。',
  },
];

interface FAQItemProps {
  faq: typeof faqs[0];
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
  return (
    <section id="faq" className="py-20 md:py-32 bg-muted/20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />

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
            よくあるご質問にお答えします
          </p>
        </motion.div>

        {/* FAQ List */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem key={faq.id} faq={faq} index={index} />
          ))}
        </div>

        {/* Additional Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <p className="text-lg text-muted-foreground mb-4">
            その他のご質問がございましたら、お気軽にお問い合わせください
          </p>
          <a
            href="#contact"
            className="text-primary hover:text-primary/80 font-semibold text-lg underline underline-offset-4"
          >
            お問い合わせ →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
