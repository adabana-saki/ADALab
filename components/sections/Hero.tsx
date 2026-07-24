'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';
import { useEffect, useState } from 'react';
import { MagneticButton } from '../effects/MagneticButton';
import { DotPattern } from '../effects/DotPattern';
import { scrollToSection } from '@/hooks/useKeyboardShortcuts';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

export function Hero() {
  const [showParticles, setShowParticles] = useState(false);
  const { language } = useLanguage();
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';

  useEffect(() => {
    // モバイルではパーティクルを無効化（パフォーマンス考慮）
    const isMobile = window.innerWidth < 768;
    setShowParticles(!isMobile);
  }, []);

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center"
    >
      {/* Dot Pattern Background */}
      <DotPattern
        dotSize={1.5}
        gap={28}
        dotColor="#06b6d4"
        fadeEdges={true}
        animate={showParticles}
      />

      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary/5" />

      {/* Subtle grid */}
      <div className={`absolute inset-0 bg-[size:3.5rem_3.5rem] ${
        isLight
          ? 'bg-[linear-gradient(to_right,#06b6d420_1px,transparent_1px),linear-gradient(to_bottom,#06b6d420_1px,transparent_1px)]'
          : 'bg-[linear-gradient(to_right,#06b6d40d_1px,transparent_1px),linear-gradient(to_bottom,#06b6d40d_1px,transparent_1px)]'
      }`} />

      {/* One soft accent glow */}
      <div className={`hidden md:block absolute top-1/3 left-1/2 -translate-x-1/2 w-[640px] h-[640px] rounded-full blur-[160px] ${
        isLight ? 'bg-primary/10' : 'bg-primary/15'
      }`} />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Eyebrow */}
          <motion.p
            className="text-sm sm:text-base font-medium tracking-wide text-primary mb-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            data-easter-egg="true"
          >
            {language === 'ja' ? '個人開発の学習集中アプリ' : 'A study-focus app, built solo'}
          </motion.p>

          {/* H1 — 名乗りではなく主張（和文・グリッチ/グラデなし） */}
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.18] mb-6 px-2 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          >
            {language === 'ja'
              ? '集中できない人のための、集中アプリ。'
              : 'A focus app for people who can’t focus.'}
          </motion.h1>

          {/* Sub — 具体的な機能と条件 */}
          <motion.p
            className="text-base sm:text-lg md:text-xl text-muted-foreground mb-10 px-4 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {language === 'ja'
              ? 'adalab focus — ポモドーロ・TODO・学習記録・誘惑サイトブロックを1つに。無料で今日から使えます。'
              : 'adalab focus — Pomodoro, to-dos, a study log and a site blocker in one. Free, and usable today.'}
          </motion.p>

          {/* CTA — 主力プロダクトへ */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <MagneticButton strength={0.2}>
              <a href="https://study.adalabtech.com" target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  className="w-full sm:w-auto min-w-[220px] neon-border-cyan bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 py-6 sm:py-4 font-semibold"
                >
                  {language === 'ja' ? '今すぐ使う（無料）' : 'Use it now (free)'}
                </Button>
              </a>
            </MagneticButton>
            <MagneticButton strength={0.2}>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollToSection('projects')}
                className="w-full sm:w-auto min-w-[200px] border-2 transition-all hover:scale-105 active:scale-95 py-6 sm:py-4"
              >
                {language === 'ja' ? 'どんなアプリか見る' : 'See what it does'}
              </Button>
            </MagneticButton>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.button
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground hover:text-foreground transition-colors"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.8,
          delay: 1.7,
          repeat: Infinity,
          repeatType: 'reverse',
          repeatDelay: 0.5,
        }}
        onClick={() => scrollToSection('about')}
        aria-label="Scroll to next section"
      >
        <ChevronDown size={32} />
      </motion.button>
    </section>
  );
}
