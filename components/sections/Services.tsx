'use client';

import { motion } from 'framer-motion';
import { Globe, Smartphone, Palette, Lightbulb, Database, Cloud } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

const services = [
  {
    icon: Globe,
    title: 'Webアプリケーション開発',
    description:
      'モダンなフロントエンド技術（React, Next.js, Vue.js）とスケーラブルなバックエンドで、高品質なWebアプリケーションを開発します。',
    features: ['レスポンシブデザイン', 'PWA対応', 'SEO最適化', 'パフォーマンス最適化'],
  },
  {
    icon: Smartphone,
    title: 'モバイルアプリ開発',
    description:
      'iOS/Android対応のネイティブアプリケーションや、React Native・Flutterを使用したクロスプラットフォーム開発を提供します。',
    features: ['iOS/Android対応', 'クロスプラットフォーム', 'ネイティブパフォーマンス', 'App Store申請サポート'],
  },
  {
    icon: Palette,
    title: 'UI/UXデザイン',
    description:
      'ユーザー中心設計に基づいた、美しく使いやすいインターフェースを提供。プロトタイピングから実装まで一貫してサポートします。',
    features: ['ユーザーリサーチ', 'ワイヤーフレーム', 'プロトタイピング', 'デザインシステム'],
  },
  {
    icon: Lightbulb,
    title: '技術コンサルティング',
    description:
      'アーキテクチャ設計、技術選定、パフォーマンス最適化など、技術的な課題を解決します。コードレビューやメンタリングも対応可能です。',
    features: ['アーキテクチャ設計', 'コードレビュー', 'パフォーマンス改善', '技術選定支援'],
  },
  {
    icon: Database,
    title: 'バックエンド開発',
    description:
      'スケーラブルで安全なバックエンドシステムの構築。REST API、GraphQL、データベース設計など幅広く対応します。',
    features: ['REST/GraphQL API', 'データベース設計', '認証・認可', 'マイクロサービス'],
  },
  {
    icon: Cloud,
    title: 'クラウドインフラ',
    description:
      'AWS、Google Cloud、Azureなどのクラウドプラットフォームを活用したインフラ構築とDevOps支援を提供します。',
    features: ['クラウド構築', 'CI/CD構築', 'コンテナ化', '監視・ログ管理'],
  },
];

export function Services() {
  return (
    <section id="services" className="py-20 md:py-32 bg-muted/20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-[120px]" />

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
            Our <span className="gradient-text">Services</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            幅広い技術領域で、お客様のビジネスを成功に導くソリューションを提供します
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
            >
              <Card className="h-full group hover:scale-105 transition-all duration-300 cursor-pointer border-border/50 hover:border-primary/50">
                <CardHeader>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <service.icon className="text-white" size={28} />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <CardDescription className="text-base">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {service.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center text-sm text-muted-foreground"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
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
            上記以外のご要望も柔軟に対応いたします
          </p>
          <a
            href="#contact"
            className="text-primary hover:text-primary/80 font-semibold text-lg underline underline-offset-4"
          >
            お気軽にご相談ください →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
