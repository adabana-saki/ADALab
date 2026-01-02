'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  Gamepad2,
  Play,
  Zap,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const games = [
  {
    id: 'games',
    title: 'Games',
    description: 'テトリス、2048、スネーク、タイピングなど、ブラウザで遊べるミニゲームコレクション！',
    thumbnail: '/images/games/tetris-thumbnail.png',
    features: ['テトリス', '2048', 'スネーク', 'タイピング', 'オンライン対戦'],
    gradient: 'from-cyan-500 via-blue-500 to-purple-500',
    href: '/games',
  },
];

export function GamesHighlight() {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';

  return (
    <section id="games" className="py-20 md:py-32 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

      {/* Animated Grid */}
      <div className={`absolute inset-0 bg-[size:3rem_3rem] ${
        isLight
          ? 'bg-[linear-gradient(to_right,#06b6d420_1px,transparent_1px),linear-gradient(to_bottom,#06b6d420_1px,transparent_1px)]'
          : 'bg-[linear-gradient(to_right,#00f5ff10_1px,transparent_1px),linear-gradient(to_bottom,#00f5ff10_1px,transparent_1px)]'
      }`} />

      {/* Glow Effects */}
      <div className={`hidden md:block absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[150px] ${
        isLight ? 'bg-neon-cyan/10' : 'bg-neon-cyan/20'
      }`} />
      <div className={`hidden md:block absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[150px] ${
        isLight ? 'bg-neon-fuchsia/10' : 'bg-neon-fuchsia/20'
      }`} />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6"
          >
            <Gamepad2 size={18} />
            <span className="text-sm font-medium">ブラウザゲーム</span>
            <Sparkles size={14} className="text-yellow-500" />
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Play <span className="gradient-text">Games</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            ブラウザで今すぐプレイ可能！オンライン対戦でスキルを競い合おう
          </p>
        </motion.div>

        {/* Games Grid */}
        <div className="max-w-5xl mx-auto">
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link
                href={game.href}
                className="group block relative overflow-hidden rounded-2xl border border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20"
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-r ${game.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                <div className="flex flex-col lg:flex-row">
                  {/* Thumbnail */}
                  <div className="relative lg:w-1/2 h-64 lg:h-auto overflow-hidden">
                    <Image
                      src={game.thumbnail}
                      alt={game.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-background via-background/50 to-transparent" />

                    {/* Play Button Overlay */}
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="w-20 h-20 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-primary/50">
                        <Play size={32} className="text-primary-foreground ml-1" fill="currentColor" />
                      </div>
                    </motion.div>

                  </div>

                  {/* Content */}
                  <div className="lg:w-1/2 p-6 lg:p-8 flex flex-col justify-center">
                    <h3 className="text-2xl lg:text-3xl font-bold mb-3 group-hover:text-primary transition-colors">
                      {game.title}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {game.description}
                    </p>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {game.features.map((feature) => (
                        <span
                          key={feature}
                          className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>


                    {/* CTA */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1"
                      >
                        <span className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-shadow">
                          <Zap size={18} />
                          今すぐプレイ
                          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                      </motion.div>
                      <Link
                        href="/games"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-primary text-primary font-medium hover:bg-primary/10 transition-colors"
                      >
                        <Gamepad2 size={18} />
                        ゲーム一覧へ
                      </Link>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* More Games Coming */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <Link
            href="/games"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border hover:border-primary/50 text-muted-foreground hover:text-foreground transition-all duration-300 group"
          >
            <Gamepad2 size={18} />
            <span>すべてのゲームを見る</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
