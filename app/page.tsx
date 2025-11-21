'use client';

import { useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ScrollProgress } from '@/components/ScrollProgress';
import { ScrollToTop } from '@/components/ScrollToTop';
import { SkipToContent } from '@/components/SkipToContent';
import { KeyboardShortcutsHelper } from '@/components/KeyboardShortcutsHelper';
import { CyberGrid } from '@/components/effects/CyberGrid';
import { ScanLines } from '@/components/effects/ScanLines';
import { MouseGlow } from '@/components/effects/MouseGlow';
import { AnimatedBackground } from '@/components/effects/AnimatedBackground';
import { NeuralNetwork } from '@/components/effects/NeuralNetwork';
import { DynamicIsland } from '@/components/effects/DynamicIsland';
import { Hero } from '@/components/sections/Hero';
import { About } from '@/components/sections/About';
import { Technologies } from '@/components/sections/Technologies';
import { Projects } from '@/components/sections/Projects';
import { FAQ } from '@/components/sections/FAQ';
import { Contact } from '@/components/sections/Contact';
import { scrollToSection, scrollToTop } from '@/hooks/useKeyboardShortcuts';

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
      <NeuralNetwork />
      <AnimatedBackground />
      <CyberGrid />
      <ScanLines />
      <MouseGlow />
      <DynamicIsland />

      <SkipToContent />
      <ScrollProgress />
      <Navigation />
      <main id="main-content" tabIndex={-1} className="focus:outline-none relative z-10">
        <Hero />
        <About />
        <Technologies />
        <Projects />
        <FAQ />
        <Contact />
      </main>
      <Footer />
      <ScrollToTop />
      <KeyboardShortcutsHelper />
    </>
  );
}
