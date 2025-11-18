'use client';

import { motion } from 'framer-motion';
import { Code2, Sparkles, Rocket, Shield } from 'lucide-react';
import { CounterAnimation } from '../effects/CounterAnimation';

const features = [
  {
    icon: Code2,
    title: 'テクノロジードリブン',
    description:
      '最新技術を駆使し、革新的なプロダクトを生み出し続けます',
  },
  {
    icon: Sparkles,
    title: 'ユーザーファースト',
    description:
      '使う人の体験を第一に考え、愛されるプロダクトを作ります',
  },
  {
    icon: Rocket,
    title: 'スピード',
    description:
      '迅速なリリースと改善サイクルで、市場の変化に素早く対応します',
  },
  {
    icon: Shield,
    title: '品質への こだわり',
    description:
      '妥協のない品質管理で、安心して使えるプロダクトを提供します',
  },
];

const stats = [
  { value: 6, suffix: '+', label: 'Products' },
  { value: 50, suffix: 'K+', label: 'Active Users' },
  { value: 99, suffix: '%', label: 'Uptime' },
  { value: 20, suffix: '+', label: 'Team Members' },
];

export function About() {
  return (
    <section id="about" className="py-20 md:py-32 bg-background relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />

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
            About <span className="gradient-text">ADA Lab</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            テクノロジーの力で世界を変えるプロダクトカンパニー。
            人々の生活やビジネスをより良くする、革新的なプロダクトを生み出し続けています。
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold mb-2">
                <span className="holographic-text">
                  <CounterAnimation
                    end={stat.value}
                    suffix={stat.suffix}
                    duration={2.5}
                    className="text-4xl md:text-5xl"
                  />
                </span>
              </div>
              <div className="text-sm text-muted-foreground neon-cyan/50">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              whileHover={{ y: -10 }}
              className="glass p-6 rounded-lg group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 text-center max-w-4xl mx-auto"
        >
          <div className="glass p-8 md:p-12 rounded-2xl">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              私たちのミッション
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              最先端の技術と創造性を融合させ、ビジネスを次のレベルへと導くソフトウェアソリューションを提供します。
              単なるコードではなく、ユーザー体験と価値を生み出すことに焦点を当てています。
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
