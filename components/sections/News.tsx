'use client';

import { motion } from 'framer-motion';
import { Bell, Megaphone, AlertTriangle, Wrench, Sparkles } from 'lucide-react';

type NewsType = 'release' | 'update' | 'maintenance' | 'incident' | 'announcement';

interface NewsItem {
  id: string;
  type: NewsType;
  title: string;
  description: string;
  date: string;
  product?: string;
}

const newsTypeConfig: Record<NewsType, { icon: typeof Bell; color: string; label: string }> = {
  release: { icon: Sparkles, color: 'text-green-500', label: 'リリース' },
  update: { icon: Bell, color: 'text-blue-500', label: 'アップデート' },
  maintenance: { icon: Wrench, color: 'text-yellow-500', label: 'メンテナンス' },
  incident: { icon: AlertTriangle, color: 'text-red-500', label: '障害情報' },
  announcement: { icon: Megaphone, color: 'text-primary', label: 'お知らせ' },
};

// お知らせデータ（実際の運用ではAPIから取得）
const newsItems: NewsItem[] = [
  {
    id: '1',
    type: 'announcement',
    title: 'ADA Lab ホームページ公開',
    description: '新しいホームページを公開しました。プロダクト情報やお問い合わせはこちらから。',
    date: '2025-11-23',
  },
];

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function News() {
  return (
    <section id="news" className="py-20 md:py-32 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />

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
            <Megaphone className="text-primary" size={40} />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">News</span> & Updates
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            プロダクトの最新情報をお届けします
          </p>
        </motion.div>

        {/* News List */}
        <div className="max-w-3xl mx-auto space-y-4">
          {newsItems.map((item, index) => {
            const config = newsTypeConfig[item.type];
            const Icon = config.icon;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.05 * index }}
                className="glass rounded-lg p-6 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className={`mt-1 ${config.color}`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${config.color} bg-current/10`}>
                        {config.label}
                      </span>
                      {item.product && (
                        <span className="text-xs text-muted-foreground px-2 py-1 rounded bg-muted">
                          {item.product}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {formatDate(item.date)}
                      </span>
                    </div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* View All Link */}
        {newsItems.length > 5 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-8"
          >
            <a
              href="/news"
              className="text-primary hover:text-primary/80 font-semibold underline underline-offset-4"
            >
              すべてのお知らせを見る →
            </a>
          </motion.div>
        )}
      </div>
    </section>
  );
}
