'use client';

import { motion } from 'framer-motion';
import { Sparkles, Zap, Shield, TrendingUp, Users, Rocket } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { TiltCard } from '../effects/TiltCard';

const products = [
  {
    icon: Sparkles,
    title: 'ADA Analytics',
    description:
      'AIを活用したデータ分析プラットフォーム。リアルタイムでビジネスインサイトを提供し、データドリブンな意思決定を支援します。',
    features: ['リアルタイム分析', 'AI予測モデル', 'カスタムダッシュボード', 'データビジュアライゼーション'],
    status: 'Live',
    color: 'cyan',
  },
  {
    icon: Zap,
    title: 'ADA Connect',
    description:
      'チーム間のコミュニケーションを革新するコラボレーションツール。シームレスな情報共有と効率的なワークフローを実現します。',
    features: ['リアルタイムチャット', 'タスク管理', 'ビデオ会議', 'ファイル共有'],
    status: 'Live',
    color: 'purple',
  },
  {
    icon: Shield,
    title: 'ADA Guard',
    description:
      '次世代セキュリティプラットフォーム。AIによる脅威検知と自動対応で、企業の重要なデータを守ります。',
    features: ['AI脅威検知', '自動セキュリティ対応', 'コンプライアンス管理', 'リスク分析'],
    status: 'Beta',
    color: 'green',
  },
  {
    icon: TrendingUp,
    title: 'ADA Growth',
    description:
      'マーケティングオートメーションツール。データに基づいた施策で、ビジネスの成長を加速させます。',
    features: ['マーケティング自動化', 'A/Bテスト', '顧客セグメント分析', 'ROI測定'],
    status: 'Coming Soon',
    color: 'fuchsia',
  },
  {
    icon: Users,
    title: 'ADA Talent',
    description:
      '採用管理プラットフォーム。AIマッチングで最適な人材を見つけ、採用プロセスを効率化します。',
    features: ['AIマッチング', '応募者管理', '面接スケジューリング', '採用分析'],
    status: 'Coming Soon',
    color: 'blue',
  },
  {
    icon: Rocket,
    title: 'ADA Launch',
    description:
      'スタートアップ支援プラットフォーム。アイデアから事業化まで、成功に必要なツールとリソースを提供します。',
    features: ['ビジネスプラン作成', '資金調達支援', 'メンター紹介', 'コミュニティ'],
    status: 'Planning',
    color: 'orange',
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
            Our <span className="gradient-text">Products</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            革新的なプロダクトで、ビジネスと日常を変革します
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
            >
              <TiltCard
                glowColor={
                  index % 3 === 0
                    ? 'rgba(6, 182, 212, 0.5)'
                    : index % 3 === 1
                      ? 'rgba(217, 70, 239, 0.5)'
                      : 'rgba(168, 85, 247, 0.5)'
                }
              >
                <Card className="h-full group cursor-pointer border-border/50 hover:border-primary/50 transition-all relative overflow-hidden">
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        product.status === 'Live'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : product.status === 'Beta'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : product.status === 'Coming Soon'
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                              : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                      }`}
                    >
                      {product.status}
                    </span>
                  </div>

                  <CardHeader>
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all">
                      <product.icon className="text-white" size={28} />
                    </div>
                    <CardTitle className="text-xl">{product.title}</CardTitle>
                    <CardDescription className="text-base">
                      {product.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {product.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center text-sm text-muted-foreground"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2 group-hover:animate-pulse" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TiltCard>
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
            より良いプロダクトを生み出すため、常に新しいチャレンジを続けています
          </p>
          <a
            href="#contact"
            className="text-primary hover:text-primary/80 font-semibold text-lg underline underline-offset-4"
          >
            最新情報をチェック →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
