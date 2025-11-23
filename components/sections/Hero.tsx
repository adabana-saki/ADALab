'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { GlitchText } from '../effects/GlitchText';
import { TypingAnimation } from '../effects/TypingAnimation';
import { MagneticButton } from '../effects/MagneticButton';
import { scrollToSection } from '@/hooks/useKeyboardShortcuts';
import { useLanguage } from '@/contexts/LanguageContext';

// 3D背景を動的インポート（パフォーマンス最適化）
const ParticleField = dynamic(
  () => import('../3d/ParticleField').then((mod) => mod.ParticleField),
  { ssr: false }
);

const FloatingLogo3D = dynamic(
  () => import('../effects/FloatingLogo3D').then((mod) => mod.FloatingLogo3D),
  { ssr: false }
);

export function Hero() {
  const [showParticles, setShowParticles] = useState(false);
  const { language, t } = useLanguage();

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
      {/* 3D Particle Background */}
      {showParticles && <ParticleField />}

      {/* 3D Floating Logo */}
      {showParticles && <FloatingLogo3D />}

      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/10" />

      {/* Animated Grid - More Visible */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f5ff15_1px,transparent_1px),linear-gradient(to_bottom,#00f5ff15_1px,transparent_1px)] bg-[size:3rem_3rem]" />

      {/* Secondary diagonal grid for depth */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,#ff00ff10_1px,transparent_1px)] bg-[size:4rem_4rem] animate-pulse" style={{ animationDuration: '4s' }} />

      {/* Holographic rotating rings - More Visible */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border-2 border-neon-cyan/30 rounded-full animate-spin" style={{ animationDuration: '30s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border-2 border-neon-fuchsia/25 rounded-full animate-spin" style={{ animationDuration: '40s', animationDirection: 'reverse' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-2 border-neon-purple/20 rounded-full animate-spin" style={{ animationDuration: '50s' }} />

      {/* Hexagon pattern overlay - More Visible */}
      <div className="absolute inset-0 opacity-[0.08]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='none' stroke='%2300f5ff' stroke-width='1'/%3E%3C/svg%3E")`,
        backgroundSize: '60px 60px'
      }} />

      {/* Cyberpunk Glow Effects - Enhanced */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-neon-cyan/30 rounded-full blur-[150px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-neon-fuchsia/30 rounded-full blur-[150px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-purple/20 rounded-full blur-[180px] animate-pulse" style={{ animationDelay: '0.5s' }} />

      {/* Corner accent glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-neon-cyan/20 rounded-full blur-[120px] animate-float" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-neon-fuchsia/20 rounded-full blur-[120px] animate-float" style={{ animationDelay: '2s' }} />

      {/* Data stream lines - More Visible */}
      <div className="absolute top-0 left-1/4 w-0.5 h-full bg-gradient-to-b from-transparent via-neon-cyan/40 to-transparent animate-pulse" style={{ animationDuration: '3s' }} />
      <div className="absolute top-0 right-1/3 w-0.5 h-full bg-gradient-to-b from-transparent via-neon-fuchsia/40 to-transparent animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
      <div className="absolute top-0 left-2/3 w-0.5 h-full bg-gradient-to-b from-transparent via-neon-purple/40 to-transparent animate-pulse" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }} />

      {/* Horizontal scan line - More Visible */}
      <div className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-cyan/50 to-transparent animate-scan-line" />

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
              <span className="logo-text text-5xl sm:text-6xl md:text-8xl lg:text-9xl xl:text-[10rem] drop-shadow-[0_0_30px_rgba(0,245,255,0.5)]" data-text="ADA LAB">
                ADA LAB
              </span>
            </GlitchText>
          </motion.h1>

          {/* Neon Divider - Enhanced */}
          <motion.div
            className="relative w-32 h-1.5 mx-auto mb-8"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 128, opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan via-neon-fuchsia to-neon-purple rounded-full" />
            <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan via-neon-fuchsia to-neon-purple blur-lg opacity-80" />
            <div className="absolute -inset-1 bg-gradient-to-r from-neon-cyan via-neon-fuchsia to-neon-purple blur-xl opacity-50 animate-pulse" />
          </motion.div>

          {/* Subtitle with Neon Glow - Enhanced */}
          <motion.p
            className="text-xl sm:text-2xl md:text-4xl lg:text-5xl text-foreground/90 mb-4 font-semibold tracking-wider px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <span className="bg-gradient-to-r from-neon-cyan via-white to-neon-fuchsia bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(0,245,255,0.3)]">
              Build. Ship. Scale.
            </span>
          </motion.p>

          <motion.div
            className="text-base sm:text-lg md:text-2xl text-muted-foreground mb-8 h-16 flex items-center justify-center px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <TypingAnimation
              texts={language === 'ja' ? [
                '自社プロダクトで世界を変える',
                'Creating Products People Love',
                'イノベーションを生み出すプロダクトカンパニー',
                'Powered by Technology & Passion',
              ] : [
                'Creating Products People Love',
                'Powered by Technology & Passion',
                'Building the Future, One App at a Time',
                'Simple Solutions for Complex Problems',
              ]}
              className="neon-purple font-medium"
            />
          </motion.div>

          {/* CTA Buttons with Neon Borders & Magnetic Effect */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 px-4 w-full"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.3 }}
          >
            <MagneticButton strength={0.2}>
              <Button
                size="lg"
                onClick={() => scrollToSection('projects')}
                className="w-full sm:w-auto min-w-[200px] border-2 neon-border-cyan relative overflow-hidden group transition-all hover:scale-110 active:scale-95 py-6 sm:py-4"
              >
                <span className="relative z-10">{t.hero.viewWork}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </MagneticButton>
            <MagneticButton strength={0.2}>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollToSection('about')}
                className="w-full sm:w-auto min-w-[200px] border-2 neon-border-fuchsia relative overflow-hidden group transition-all hover:scale-110 active:scale-95 py-6 sm:py-4"
              >
                <span className="relative z-10">{language === 'ja' ? '私たちについて' : 'About Us'}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-neon-fuchsia/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
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
