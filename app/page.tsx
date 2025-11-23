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
const MatrixRain = dynamic(() => import('@/components/effects/MatrixRain').then(mod => ({ default: mod.MatrixRain })), { ssr: false });
const CommandPalette = dynamic(() => import('@/components/CommandPalette').then(mod => ({ default: mod.CommandPalette })), { ssr: false });

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
      {/* Background Effects - Optimized */}
      <MatrixRain />
      <NeuralNetwork />
      <AnimatedBackground />
      <CyberGrid />
      <ScanLines />
      <MouseGlow />
      <DynamicIsland />
      <CommandPalette />

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
