'use client';

import { motion } from 'framer-motion';
import { Code2, Sparkles, Rocket, Zap, Target, Heart, Github } from 'lucide-react';
import { CounterAnimation } from '../effects/CounterAnimation';
import dynamic from 'next/dynamic';

const GitHubHologram = dynamic(
  () => import('../effects/GitHubHologram').then((mod) => mod.GitHubHologram),
  { ssr: false }
);

const QiitaArticles = dynamic(
  () => import('../effects/QiitaArticles').then((mod) => mod.QiitaArticles),
  { ssr: false }
);

const CodeSandbox = dynamic(
  () => import('../effects/CodeSandbox').then((mod) => mod.CodeSandbox),
  { ssr: false }
);

const TerminalEmulator = dynamic(
  () => import('../effects/TerminalEmulator').then((mod) => mod.TerminalEmulator),
  { ssr: false }
);

const features = [
  {
    icon: Code2,
    title: 'テクノロジードリブン',
    description:
      '最新技術を駆使し、革新的なプロダクトを生み出し続けます',
    size: 'normal',
  },
  {
    icon: Sparkles,
    title: 'ユーザーファースト',
    description:
      '使う人の体験を第一に考え、愛されるプロダクトを作ります',
    size: 'normal',
  },
  {
    icon: Rocket,
    title: 'スピード',
    description:
      '迅速なリリースと改善サイクルで、アイデアを素早く形にします',
    size: 'normal',
  },
  {
    icon: Zap,
    title: 'シンプル',
    description:
      '複雑さを排除し、誰でも使いやすいプロダクトを提供します',
    size: 'normal',
  },
];

const stats = [
  { value: 2, suffix: '', label: 'Products' },
  { value: 2025, suffix: '', label: 'Since' },
  { value: 50, suffix: '+', label: 'Technologies' },
  { value: 1, suffix: '', label: 'Developer' },
];

export function About() {
  return (
    <section id="about" className="py-20 md:py-32 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
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
            About <span className="gradient-text">ADA Lab</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            あなたの&quot;ほしい&quot;を、カタチに。
            日常の「あったらいいな」を形にするプロダクトカンパニーです。
          </p>
        </motion.div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 md:gap-6">
          {/* Mission Statement - Large Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="col-span-1 md:col-span-4 lg:col-span-8 row-span-2"
          >
            <div className="bento-card h-full p-8 md:p-10 rounded-3xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/10 via-transparent to-neon-fuchsia/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 h-full flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neon-cyan to-neon-fuchsia flex items-center justify-center">
                    <Target className="text-white" size={24} />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Mission</span>
                </div>
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                  Build. Ship. <span className="gradient-text">Scale.</span>
                </h3>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                  素早く作り、素早く届け、成長させる。
                  完璧を目指すよりも、まず価値を届けることを大切にしています。
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="col-span-1 md:col-span-2 lg:col-span-4 row-span-2"
          >
            <div className="bento-card h-full p-6 md:p-8 rounded-3xl">
              <div className="grid grid-cols-2 gap-6 h-full content-center">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    className="text-center"
                  >
                    <div className="text-3xl md:text-4xl font-bold mb-1">
                      <span className="holographic-text">
                        <CounterAnimation
                          end={stat.value}
                          suffix={stat.suffix}
                          duration={2.5}
                          className="text-3xl md:text-4xl"
                        />
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Feature Cards - Bento Layout */}
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 * (index + 2) }}
              className={`col-span-1 ${index < 2 ? 'md:col-span-3 lg:col-span-6' : 'md:col-span-3 lg:col-span-6'}`}
            >
              <div className="bento-card p-6 rounded-3xl h-full group cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:border-neon-cyan/50 transition-all duration-300">
                    <feature.icon className="text-neon-cyan" size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-neon-cyan transition-colors">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Philosophy Card - Wide */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="col-span-1 md:col-span-6 lg:col-span-12"
          >
            <div className="bento-card p-6 md:p-8 rounded-3xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/5 via-neon-purple/5 to-neon-fuchsia/5" />
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-fuchsia to-neon-purple flex items-center justify-center flex-shrink-0">
                  <Heart className="text-white" size={28} />
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-xl md:text-2xl font-bold mb-2">ユーザーからのフィードバックを大切に</h3>
                  <p className="text-muted-foreground">
                    継続的な改善を重ね、本当に必要とされるプロダクトを追求します。
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* GitHub 3D Hologram Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="col-span-1 md:col-span-6 lg:col-span-12"
          >
            <div className="bento-card p-6 md:p-8 rounded-3xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/5 via-transparent to-neon-purple/5" />
              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
                    <Github className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">GitHub Stats</h3>
                    <p className="text-sm text-muted-foreground">3D Holographic Display</p>
                  </div>
                </div>

                {/* Hologram Stats */}
                <GitHubHologram />

                {/* Contribution Calendar */}
                <div className="mt-6 bg-black/40 rounded-xl p-4 border border-neon-green/30">
                  <div className="font-mono text-xs text-neon-green mb-3">{'>'} CONTRIBUTION_GRAPH</div>
                  <div className="overflow-x-auto">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://ghchart.rshah.org/06b6d4/adabana-saki"
                      alt="GitHub Contribution Graph"
                      className="w-full h-auto min-w-[600px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Qiita Articles Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="col-span-1 md:col-span-6 lg:col-span-12"
          >
            <div className="bento-card p-6 md:p-8 rounded-3xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-green-500/5" />
              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">Q</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Qiita Articles</h3>
                    <p className="text-sm text-muted-foreground">Tech Blog Posts</p>
                  </div>
                </div>

                {/* Qiita Articles */}
                <QiitaArticles />
              </div>
            </div>
          </motion.div>

          {/* Interactive Demo Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="col-span-1 md:col-span-3 lg:col-span-6"
          >
            <div className="bento-card p-6 md:p-8 rounded-3xl relative overflow-hidden h-full">
              <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/5 via-transparent to-neon-purple/5" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-purple to-neon-fuchsia flex items-center justify-center">
                    <Code2 className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Code Sandbox</h3>
                    <p className="text-xs text-muted-foreground">Try running JavaScript</p>
                  </div>
                </div>
                <CodeSandbox />
              </div>
            </div>
          </motion.div>

          {/* Terminal Emulator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="col-span-1 md:col-span-3 lg:col-span-6"
          >
            <div className="bento-card p-6 md:p-8 rounded-3xl relative overflow-hidden h-full">
              <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/5 via-transparent to-neon-cyan/5" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-green flex items-center justify-center">
                    <Zap className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Terminal</h3>
                    <p className="text-xs text-muted-foreground">Type &quot;help&quot; to start</p>
                  </div>
                </div>
                <TerminalEmulator />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
