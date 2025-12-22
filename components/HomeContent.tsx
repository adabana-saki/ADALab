'use client';

import { useEffect, useState } from 'react';
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
import { LatestBlog } from '@/components/sections/LatestBlog';
import { scrollToSection, scrollToTop } from '@/hooks/useKeyboardShortcuts';
import type { BlogMeta } from '@/lib/blog';

// 遅延読み込みエフェクト（軽量化済み）
const AnimatedBackground = dynamic(() => import('@/components/effects/AnimatedBackground').then(mod => ({ default: mod.AnimatedBackground })), { ssr: false });
const CyberGrid = dynamic(() => import('@/components/effects/CyberGrid').then(mod => ({ default: mod.CyberGrid })), { ssr: false });
const ScanLines = dynamic(() => import('@/components/effects/ScanLines').then(mod => ({ default: mod.ScanLines })), { ssr: false });
const MouseGlow = dynamic(() => import('@/components/effects/MouseGlow').then(mod => ({ default: mod.MouseGlow })), { ssr: false });
const KonamiCode = dynamic(() => import('@/components/effects/KonamiCode').then(mod => ({ default: mod.KonamiCode })), { ssr: false });
const MatrixRain = dynamic(() => import('@/components/effects/MatrixRain').then(mod => ({ default: mod.MatrixRain })), { ssr: false });
const CommandPalette = dynamic(() => import('@/components/CommandPalette').then(mod => ({ default: mod.CommandPalette })), { ssr: false });
const FloatingElements = dynamic(() => import('@/components/effects/FloatingElements').then(mod => ({ default: mod.FloatingElements })), { ssr: false });
const CinematicIntro = dynamic(() => import('@/components/effects/CinematicIntro').then(mod => ({ default: mod.CinematicIntro })), { ssr: false });
const PageLoader = dynamic(() => import('@/components/PageLoader').then(mod => ({ default: mod.PageLoader })), { ssr: false });

interface HomeContentProps {
  latestPosts: BlogMeta[];
}

export function HomeContent({ latestPosts }: HomeContentProps) {
  const [isMobile, setIsMobile] = useState(true); // Mobile-first

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const checkMobile = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsMobile(window.innerWidth < 768);
      }, 150);
    };
    // 初回は即時実行
    setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', checkMobile);
    return () => {
      window.removeEventListener('resize', checkMobile);
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or contentEditable
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
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
        case 'b':
          e.preventDefault();
          scrollToSection('blog');
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

      {/* Desktop only: all effects disabled on mobile for performance */}
      {!isMobile && (
        <>
          <AnimatedBackground />
          <CyberGrid />
          <ScanLines />
          <MatrixRain />
          <MouseGlow />
          <FloatingElements />
          <CinematicIntro />
          <KonamiCode />
          <CommandPalette />
        </>
      )}

      <SkipToContent />
      <ScrollProgress />
      <Navigation />
      <main id="main-content" tabIndex={-1} className="focus:outline-none relative z-10">
        <Hero />
        <About />
        <Technologies />
        <Projects />
        <LatestBlog posts={latestPosts} />
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
