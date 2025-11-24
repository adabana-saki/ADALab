'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ScrollProgress } from '@/components/ScrollProgress';
import { ScrollToTop } from '@/components/ScrollToTop';
import { SkipToContent } from '@/components/SkipToContent';
import { KeyboardShortcutsHelper } from '@/components/KeyboardShortcutsHelper';
import { Hero } from '@/components/sections/Hero';
import { About } from '@/components/sections/About';
import { Technologies } from '@/components/sections/Technologies';
import { Projects } from '@/components/sections/Projects';
import { News } from '@/components/sections/News';
import { FAQ } from '@/components/sections/FAQ';
import { Contact } from '@/components/sections/Contact';
import { scrollToSection, scrollToTop } from '@/hooks/useKeyboardShortcuts';

// 遅延読み込みエフェクト
const NeuralNetwork = dynamic(() => import('@/components/effects/NeuralNetwork').then(mod => ({ default: mod.NeuralNetwork })), { ssr: false });
const AnimatedBackground = dynamic(() => import('@/components/effects/AnimatedBackground').then(mod => ({ default: mod.AnimatedBackground })), { ssr: false });
const CyberGrid = dynamic(() => import('@/components/effects/CyberGrid').then(mod => ({ default: mod.CyberGrid })), { ssr: false });
const ScanLines = dynamic(() => import('@/components/effects/ScanLines').then(mod => ({ default: mod.ScanLines })), { ssr: false });
const MouseGlow = dynamic(() => import('@/components/effects/MouseGlow').then(mod => ({ default: mod.MouseGlow })), { ssr: false });
const DynamicIsland = dynamic(() => import('@/components/effects/DynamicIsland').then(mod => ({ default: mod.DynamicIsland })), { ssr: false });
const KonamiCode = dynamic(() => import('@/components/effects/KonamiCode').then(mod => ({ default: mod.KonamiCode })), { ssr: false });
const RippleEffect = dynamic(() => import('@/components/effects/RippleEffect').then(mod => ({ default: mod.RippleEffect })), { ssr: false });
const ParallaxLayers = dynamic(() => import('@/components/effects/ParallaxScroll').then(mod => ({ default: mod.ParallaxLayers })), { ssr: false });
const MatrixRain = dynamic(() => import('@/components/effects/MatrixRain').then(mod => ({ default: mod.MatrixRain })), { ssr: false });
const CommandPalette = dynamic(() => import('@/components/CommandPalette').then(mod => ({ default: mod.CommandPalette })), { ssr: false });
const TextScrambleEffect = dynamic(() => import('@/components/effects/TextScrambleEffect').then(mod => ({ default: mod.TextScrambleEffect })), { ssr: false });
const FloatingElements = dynamic(() => import('@/components/effects/FloatingElements').then(mod => ({ default: mod.FloatingElements })), { ssr: false });
const BloomEffect = dynamic(() => import('@/components/effects/BloomEffect').then(mod => ({ default: mod.BloomEffect })), { ssr: false });
const DataStream = dynamic(() => import('@/components/effects/DataStream').then(mod => ({ default: mod.DataStream })), { ssr: false });
const CinematicIntro = dynamic(() => import('@/components/effects/CinematicIntro').then(mod => ({ default: mod.CinematicIntro })), { ssr: false });
const PageLoader = dynamic(() => import('@/components/PageLoader').then(mod => ({ default: mod.PageLoader })), { ssr: false });
const GlitchEffect = dynamic(() => import('@/components/effects/GlitchEffect').then(mod => ({ default: mod.GlitchEffect })), { ssr: false });
const ChromaticAberration = dynamic(() => import('@/components/effects/ChromaticAberration').then(mod => ({ default: mod.ChromaticAberration })), { ssr: false });
const EnhancedParticles = dynamic(() => import('@/components/effects/EnhancedParticles').then(mod => ({ default: mod.EnhancedParticles })), { ssr: false });
const LiquidCursor = dynamic(() => import('@/components/effects/LiquidCursor').then(mod => ({ default: mod.LiquidCursor })), { ssr: false });
const ParticleBurst = dynamic(() => import('@/components/effects/ParticleBurst').then(mod => ({ default: mod.ParticleBurst })), { ssr: false });
const WaveShader = dynamic(() => import('@/components/effects/WaveShader').then(mod => ({ default: mod.WaveShader })), { ssr: false });
const HolographicScene = dynamic(() => import('@/components/effects/HolographicScene').then(mod => ({ default: mod.HolographicScene })), { ssr: false });
const MagneticElements = dynamic(() => import('@/components/effects/MagneticElements').then(mod => ({ default: mod.MagneticElements })), { ssr: false });

export default function Home() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Single key shortcuts
      switch (e.key.toLowerCase()) {
        case 'h':
          e.preventDefault();
          scrollToTop();
          break;
        case 'a':
          e.preventDefault();
          scrollToSection('about');
          break;
        case 't':
          e.preventDefault();
          scrollToSection('technologies');
          break;
        case 'p':
          e.preventDefault();
          scrollToSection('projects');
          break;
        case 'n':
          e.preventDefault();
          scrollToSection('news');
          break;
        case 'f':
          e.preventDefault();
          scrollToSection('faq');
          break;
        case 'c':
          e.preventDefault();
          scrollToSection('contact');
          break;
        case 'arrowup':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            scrollToTop();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Page Loader */}
      <PageLoader />

      {/* Background Effects - Optimized */}
      <ParallaxLayers />
      <MatrixRain />
      <NeuralNetwork />
      <AnimatedBackground />
      <CyberGrid />
      <ScanLines />
      <MouseGlow />
      <DynamicIsland />
      <KonamiCode />
      <RippleEffect />
      <CommandPalette />
      <TextScrambleEffect />
      <FloatingElements />
      <BloomEffect />
      <DataStream />
      <CinematicIntro />
      <GlitchEffect />
      <ChromaticAberration />
      <EnhancedParticles />
      <LiquidCursor />
      <ParticleBurst />
      <WaveShader />
      <HolographicScene />
      <MagneticElements />

      <SkipToContent />
      <ScrollProgress />
      <Navigation />
      <main id="main-content" tabIndex={-1} className="focus:outline-none relative z-10">
        <Hero />
        <About />
        <Technologies />
        <Projects />
        <News />
        <FAQ />
        <Contact />
      </main>
      <Footer />
      <ScrollToTop />
      <KeyboardShortcutsHelper />
    </>
  );
}
