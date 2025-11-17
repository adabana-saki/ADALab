'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

const testimonials = [
  {
    id: '1',
    name: '田中 太郎',
    company: '株式会社テックイノベーション',
    role: 'CEO',
    content:
      'ADA Labには、ECプラットフォームの開発を依頼しました。技術力の高さはもちろん、こちらの要望を的確に理解し、期待以上のものを提供してくれました。プロジェクト後も継続的なサポートがあり、本当に頼りになるパートナーです。',
    rating: 5,
    avatar: '/images/avatar-placeholder.jpg',
  },
  {
    id: '2',
    name: '佐藤 花子',
    company: 'ヘルスケアソリューションズ',
    role: 'プロダクトマネージャー',
    content:
      '医療機関向けダッシュボードの開発をお願いしました。セキュリティとプライバシーに関する厳格な要件にも柔軟に対応していただき、HIPAA準拠のシステムを構築できました。プロフェッショナルな対応に感謝しています。',
    rating: 5,
    avatar: '/images/avatar-placeholder.jpg',
  },
  {
    id: '3',
    name: '鈴木 一郎',
    company: 'クリエイティブエージェンシーX',
    role: 'アートディレクター',
    content:
      'ポートフォリオサイトの制作を依頼しました。3Dエフェクトとアニメーションを駆使した、まさに求めていた「他とは違う」サイトに仕上がりました。デザインと技術の両面で高いクオリティを実現してくれました。',
    rating: 5,
    avatar: '/images/avatar-placeholder.jpg',
  },
  {
    id: '4',
    name: '山田 美咲',
    company: 'スタートアップLab',
    role: 'CTO',
    content:
      'AIチャットアプリケーションの開発で協力いただきました。最新技術へのキャッチアップが早く、OpenAI APIの統合やストリーミング実装など、技術的に難しい部分もスムーズに進めてくれました。',
    rating: 5,
    avatar: '/images/avatar-placeholder.jpg',
  },
  {
    id: '5',
    name: '伊藤 健太',
    company: 'フィットネスプラス',
    role: 'COO',
    content:
      'モバイルアプリの開発を依頼しました。ユーザー体験を最優先に考えた設計で、リリース後のユーザー評価も非常に高いです。継続利用率60%という数字がその証拠です。',
    rating: 5,
    avatar: '/images/avatar-placeholder.jpg',
  },
  {
    id: '6',
    name: '中村 由美',
    company: 'プロジェクトマネジメント株式会社',
    role: 'プロジェクトリード',
    content:
      'タスク管理アプリの開発でお世話になりました。アジャイル開発で定期的なフィードバックを行いながら、スムーズにプロジェクトが進行しました。コミュニケーションも円滑で、ストレスなく開発を進められました。',
    rating: 5,
    avatar: '/images/avatar-placeholder.jpg',
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-20 md:py-32 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-accent/5 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Client <span className="gradient-text">Testimonials</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            お客様からいただいた声をご紹介します
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
            >
              <Card className="h-full group hover:scale-105 transition-all duration-300 border-border/50 hover:border-primary/50">
                <CardContent className="p-6">
                  {/* Quote Icon */}
                  <div className="mb-4">
                    <Quote className="text-primary" size={32} />
                  </div>

                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className="fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                    {testimonial.content}
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {testimonial.role} at {testimonial.company}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-16"
        >
          <p className="text-lg text-muted-foreground mb-4">
            次のサクセスストーリーを一緒に作りましょう
          </p>
          <a
            href="#contact"
            className="text-primary hover:text-primary/80 font-semibold text-lg underline underline-offset-4"
          >
            プロジェクトを始める →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
