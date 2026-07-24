'use client';

import { motion } from 'framer-motion';
import { ChevronDown, Gamepad2 } from 'lucide-react';
import { Button } from '../ui/button';
import { useEffect, useState } from 'react';
import { GlitchText } from '../effects/GlitchText';
import { MagneticButton } from '../effects/MagneticButton';
import { DotPattern } from '../effects/DotPattern';
import { scrollToSection } from '@/hooks/useKeyboardShortcuts';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

export function Hero() {
  const [showParticles, setShowParticles] = useState(false);
  const { language, t } = useLanguage();
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
          {/* Main Heading with Glitch Effect - Larger & More Impact */}
          <motion.h1
            className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl xl:text-[10rem] mb-8 px-4"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            data-easter-egg="true"
          >
            <GlitchText className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl xl:text-[10rem]">
              <span className="logo-text drop-shadow-[0_0_30px_rgba(0,245,255,0.5)]" data-text="ADA LAB">
                ADA LAB
              </span>
            </GlitchText>
          </motion.h1>

          {/* Divider - 単色シアンの細線 */}
          <motion.div
            className="w-16 h-0.5 mx-auto mb-8 bg-primary/70 rounded-full"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 64, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          />

          {/* Subtitle — 一人称の具体文 */}
          <motion.p
            className="text-xl sm:text-2xl md:text-4xl lg:text-5xl text-foreground mb-4 font-bold tracking-tight px-4 max-w-4xl mx-auto leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            {language === 'ja'
              ? '勉強に集中できなかったので、集中するためのアプリを作りました。'
              : 'I couldn\'t focus on studying, so I built an app that makes me focus.'}
          </motion.p>

          <motion.p
            className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 px-4 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            {language === 'ja'
              ? 'adalab focus — ポモドーロ + 学習記録 + 誘惑サイトブロック。個人開発、無料で公開中。'
              : 'adalab focus — Pomodoro + study log + site blocker. A free, one-person project.'}
          </motion.p>

          {/* CTA Buttons with Neon Borders & Magnetic Effect */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 px-4 w-full"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.3 }}
          >
            <MagneticButton strength={0.2}>
              <a href="https://study.adalabtech.com" target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  className="w-full sm:w-auto min-w-[220px] border-2 neon-border-cyan bg-neon-cyan/10 hover:bg-neon-cyan/20 relative overflow-hidden group transition-all hover:scale-105 active:scale-95 py-6 sm:py-4"
                >
                  <span className="relative z-10">{language === 'ja' ? 'adalab focus を使う' : 'Try adalab focus'}</span>
                </Button>
              </a>
            </MagneticButton>
            <MagneticButton strength={0.2}>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollToSection('projects')}
                className="w-full sm:w-auto min-w-[200px] border-2 relative overflow-hidden group transition-all hover:scale-105 active:scale-95 py-6 sm:py-4"
              >
                <span className="relative z-10">{t.hero.viewWork}</span>
              </Button>
            </MagneticButton>
            <MagneticButton strength={0.2}>
              <Link href="/games">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto min-w-[200px] border-2 relative overflow-hidden group transition-all hover:scale-105 active:scale-95 py-6 sm:py-4"
                >
                  <Gamepad2 className="w-5 h-5 mr-2 relative z-10" />
                  <span className="relative z-10">{language === 'ja' ? 'ゲームで遊ぶ' : 'Play Games'}</span>
                </Button>
              </Link>
            </MagneticButton>
          </motion.div>

          {/* Tech Stack Preview */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.5 }}
          >
            <span data-tech-stack="react" className="cursor-pointer hover:text-neon-cyan transition-colors">React</span>
            <span className="text-primary">•</span>
            <span data-tech-stack="nextjs" className="cursor-pointer hover:text-neon-cyan transition-colors">Next.js</span>
            <span className="text-primary">•</span>
            <span data-tech-stack="typescript" className="cursor-pointer hover:text-neon-cyan transition-colors">TypeScript</span>
            <span className="text-primary">•</span>
            <span data-tech-stack="nodejs" className="cursor-pointer hover:text-neon-cyan transition-colors">Node.js</span>
            <span className="text-primary">•</span>
            <span data-tech-stack="python" className="cursor-pointer hover:text-neon-cyan transition-colors">Python</span>
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
