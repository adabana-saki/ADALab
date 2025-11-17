'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    id: '1',
    question: 'プロジェクトの開始から完了までどのくらいの期間がかかりますか？',
    answer:
      'プロジェクトの規模や複雑さによって異なりますが、一般的には以下のような期間を想定しています：\n\n- 小規模プロジェクト（LP、簡単なWebサイト）: 2-4週間\n- 中規模プロジェクト（Webアプリケーション）: 2-3ヶ月\n- 大規模プロジェクト（複雑なシステム）: 3-6ヶ月\n\n初回のヒアリングで、具体的なスケジュールをご提示させていただきます。',
  },
  {
    id: '2',
    question: '料金体系はどのようになっていますか？',
    answer:
      '料金は、プロジェクトの規模、技術要件、期間によって決定します。主な料金体系は以下の通りです：\n\n- 固定料金制：明確な要件定義が可能なプロジェクト\n- 時間単価制：要件が流動的なプロジェクト\n- 月額契約：継続的な開発・保守が必要な場合\n\nまずは無料相談で、プロジェクトの内容をお聞きし、お見積もりを作成させていただきます。',
  },
  {
    id: '3',
    question: 'どのような技術スタックを使用していますか？',
    answer:
      'プロジェクトの要件に応じて最適な技術を選定しますが、主に以下の技術を使用しています：\n\n- フロントエンド: React, Next.js, Vue.js, TypeScript\n- バックエンド: Node.js, Python, Go\n- データベース: PostgreSQL, MongoDB, MySQL\n- クラウド: AWS, Vercel, Google Cloud\n- モバイル: React Native, Flutter\n\n最新の技術トレンドをキャッチアップし、最適なソリューションを提供します。',
  },
  {
    id: '4',
    question: 'リモートでの対応は可能ですか？',
    answer:
      'はい、完全リモートでの対応が可能です。実際、多くのプロジェクトをリモートで成功裏に完了しています。\n\nコミュニケーションツール（Slack、Zoom、Google Meetなど）を活用し、定期的なミーティングや進捗報告を行います。必要に応じて、対面でのミーティングも対応可能です。',
  },
  {
    id: '5',
    question: 'プロジェクト完了後のサポートはありますか？',
    answer:
      'はい、プロジェクト完了後も継続的なサポートを提供しています：\n\n- 保守・運用サポート（バグ修正、セキュリティアップデート）\n- 機能追加・改善\n- パフォーマンス最適化\n- 技術コンサルティング\n\nサポート内容や期間は、プロジェクトに応じて柔軟に対応させていただきます。',
  },
  {
    id: '6',
    question: '小規模なプロジェクトでも対応可能ですか？',
    answer:
      'はい、小規模なプロジェクトも歓迎します。ランディングページの制作から、大規模なWebアプリケーションまで、幅広く対応しています。\n\n予算や規模に関わらず、お気軽にご相談ください。最適なソリューションをご提案させていただきます。',
  },
  {
    id: '7',
    question: 'デザインも一緒に依頼できますか？',
    answer:
      'はい、UI/UXデザインから開発まで一貫してお任せいただけます。\n\n- ワイヤーフレーム作成\n- UIデザイン（Figma、Adobe XD）\n- プロトタイピング\n- ユーザーテスト\n- 開発・実装\n\nデザインのみ、または開発のみのご依頼も可能です。',
  },
  {
    id: '8',
    question: '途中でプロジェクトの要件が変更になった場合はどうなりますか？',
    answer:
      'アジャイル開発を採用しているため、要件変更にも柔軟に対応できます。\n\n定期的なレビューとフィードバックを行いながら開発を進めるため、途中での方向転換も可能です。ただし、大きな変更の場合は、スケジュールや予算の調整が必要になる場合があります。\n\n変更内容については、都度ご相談させていただきます。',
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
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {faq.answer}
              </p>
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
