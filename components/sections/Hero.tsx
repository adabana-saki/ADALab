'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { GlitchText } from '../effects/GlitchText';
import { TypingAnimation } from '../effects/TypingAnimation';
import { MagneticButton } from '../effects/MagneticButton';

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

  useEffect(() => {
    // モバイルではパーティクルを無効化（パフォーマンス考慮）
    const isMobile = window.innerWidth < 768;
    setShowParticles(!isMobile);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

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

      {/* Animated Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      {/* Cyberpunk Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/20 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-fuchsia/20 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-purple/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '0.5s' }} />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Main Heading with Glitch Effect */}
          <motion.h1
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl mb-6 px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            data-easter-egg="true"
          >
            <GlitchText className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl">
              <span className="logo-text text-4xl sm:text-5xl md:text-7xl lg:text-8xl" data-text="ADA LAB">
                ADA LAB
              </span>
            </GlitchText>
          </motion.h1>

          {/* Neon Divider */}
          <motion.div
            className="relative w-24 h-1 mx-auto mb-6"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan via-neon-fuchsia to-neon-purple" />
            <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan via-neon-fuchsia to-neon-purple blur-md opacity-75" />
          </motion.div>

          {/* Subtitle with Neon Glow */}
          <motion.p
            className="text-lg sm:text-xl md:text-3xl lg:text-4xl text-foreground/90 mb-4 font-light neon-cyan px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Build. Ship. Scale.
          </motion.p>

          <motion.div
            className="text-base sm:text-lg md:text-2xl text-muted-foreground mb-12 h-16 flex items-center justify-center px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <TypingAnimation
              texts={[
                '自社プロダクトで世界を変える',
                'Creating Products People Love',
                'イノベーションを生み出すプロダクトカンパニー',
                'Powered by Technology & Passion',
              ]}
              className="neon-purple font-medium"
            />
          </motion.div>

          {/* CTA Buttons with Neon Borders & Magnetic Effect */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 px-4 w-full"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <MagneticButton strength={0.2}>
              <Button
                size="lg"
                onClick={() => scrollToSection('#projects')}
                className="w-full sm:w-auto min-w-[200px] border-2 neon-border-cyan relative overflow-hidden group transition-all hover:scale-110 active:scale-95 py-6 sm:py-4"
              >
                <span className="relative z-10">プロダクトを見る</span>
                <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </MagneticButton>
            <MagneticButton strength={0.2}>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollToSection('#about')}
                className="w-full sm:w-auto min-w-[200px] border-2 neon-border-fuchsia relative overflow-hidden group transition-all hover:scale-110 active:scale-95 py-6 sm:py-4"
              >
                <span className="relative z-10">私たちについて</span>
                <div className="absolute inset-0 bg-gradient-to-r from-neon-fuchsia/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </MagneticButton>
          </motion.div>

          {/* Tech Stack Preview */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
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
          delay: 1.4,
          repeat: Infinity,
          repeatType: 'reverse',
          repeatDelay: 0.5,
        }}
        onClick={() => scrollToSection('#about')}
        aria-label="Scroll to next section"
      >
        <ChevronDown size={32} />
      </motion.button>
    </section>
  );
}
