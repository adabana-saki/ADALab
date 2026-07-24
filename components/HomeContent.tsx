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
import { GamesHighlight } from '@/components/sections/GamesHighlight';
import { Projects } from '@/components/sections/Projects';
import { News } from '@/components/sections/News';
import { FAQ } from '@/components/sections/FAQ';
const Contact = dynamic(
  () => import('@/components/sections/Contact').then(mod => ({ default: mod.Contact })),
  { ssr: false }
);
import { LatestBlog } from '@/components/sections/LatestBlog';
import { scrollToSection, scrollToTop } from '@/hooks/useKeyboardShortcuts';
import type { BlogMeta } from '@/lib/blog';

// 機能系のみ遅延読み込み（装飾エフェクトはテンプレ感が強いため撤去）
const KonamiCode = dynamic(() => import('@/components/effects/KonamiCode').then(mod => ({ default: mod.KonamiCode })), { ssr: false });
const CommandPalette = dynamic(() => import('@/components/CommandPalette').then(mod => ({ default: mod.CommandPalette })), { ssr: false });
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

      // Single key shortcuts (guard against undefined or non-string e.key)
      if (!e.key || typeof e.key !== 'string') return;
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
        case 'g':
          e.preventDefault();
          scrollToSection('games');
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

      {/* Desktop only: 機能系のみ（コマンドパレット + Konami イースターエッグ） */}
      {!isMobile && (
        <>
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
        <LatestBlog posts={latestPosts} />
        <Projects />
        <GamesHighlight />
        <Technologies />
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
