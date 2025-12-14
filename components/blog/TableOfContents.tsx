'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { List, ChevronDown, ArrowUp } from 'lucide-react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  variant?: 'inline' | 'sidebar';
}

export function TableOfContents({ content, variant = 'inline' }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(true);
  const [readProgress, setReadProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const tocRef = useRef<HTMLDivElement>(null);

  // Markdownから見出しを抽出（useMemoでメモ化）
  const headings = useMemo(() => {
    const items: TocItem[] = [];

    // コードブロックを除外してから見出しを抽出
    // ```で囲まれた部分を一時的に削除
    const contentWithoutCodeBlocks = content.replace(/```[\s\S]*?```/g, '');

    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    let match;

    while ((match = headingRegex.exec(contentWithoutCodeBlocks)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF-]/g, '')
        .replace(/\s+/g, '-');

      items.push({ id, text, level });
    }

    return items;
  }, [content]);

  // 現在のセクションのインデックス
  const activeIndex = useMemo(() => {
    return headings.findIndex((h) => h.id === activeId);
  }, [headings, activeId]);

  // スクロール位置に応じてアクティブな見出しを更新
  useEffect(() => {
    const handleScroll = () => {
      // 読了率の計算
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrollTop = window.scrollY;
      const progress = Math.min((scrollTop / documentHeight) * 100, 100);
      setReadProgress(progress);
      setShowBackToTop(scrollTop > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserverでアクティブなセクションを検出
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // 可視のエントリを収集
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          // 最も上にある見出しをアクティブに
          const topEntry = visibleEntries.reduce((prev, curr) => {
            const prevRect = prev.boundingClientRect;
            const currRect = curr.boundingClientRect;
            return prevRect.top < currRect.top ? prev : curr;
          });
          setActiveId(topEntry.target.id);
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  // 目次内の位置をアクティブ項目に自動スクロール（目次コンテナ内のみ）
  useEffect(() => {
    if (variant === 'sidebar' && tocRef.current && activeId) {
      const activeElement = tocRef.current.querySelector(`[data-heading-id="${activeId}"]`) as HTMLElement | null;
      if (activeElement) {
        // scrollIntoViewはページ全体をスクロールしてしまうため、コンテナ内でのみスクロール
        const container = tocRef.current;
        const elementTop = activeElement.offsetTop;
        const containerHeight = container.clientHeight;
        const elementHeight = activeElement.clientHeight;

        // 要素がコンテナの表示範囲外にある場合のみスクロール
        if (elementTop < container.scrollTop || elementTop + elementHeight > container.scrollTop + containerHeight) {
          container.scrollTo({
            top: elementTop - containerHeight / 2 + elementHeight / 2,
            behavior: 'smooth',
          });
        }
      }
    }
  }, [activeId, variant]);

  const scrollToHeading = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (headings.length < 2) {
    return null;
  }

  // サイドバー版（Qiita/Zenn風）
  if (variant === 'sidebar') {
    return (
      <nav className="hidden xl:block">
        <div className="sticky top-24 max-h-[calc(100vh-8rem)] flex flex-col">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <List size={14} />
              目次
            </h3>
            <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
              {Math.round(readProgress)}%
            </span>
          </div>

          {/* プログレスバー */}
          <div className="h-1 bg-muted/30 rounded-full mb-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full transition-all duration-300 ease-out"
              style={{ width: `${readProgress}%` }}
            />
          </div>

          {/* 目次リスト */}
          <div
            ref={tocRef}
            className="overflow-y-auto flex-1 pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
          >
            <ul className="space-y-0.5 text-sm relative">
              {/* アクティブインジケーター（縦線） */}
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-border/30 rounded-full" />

              {headings.map((heading, index) => {
                const isActive = activeId === heading.id;
                const isPast = activeIndex >= 0 && index < activeIndex;

                return (
                  <li
                    key={`${heading.id}-${index}`}
                    data-heading-id={heading.id}
                    className="relative"
                  >
                    {/* アクティブ/過去のインジケーター */}
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-0.5 rounded-full transition-colors duration-200 ${
                        isActive
                          ? 'bg-primary'
                          : isPast
                          ? 'bg-primary/40'
                          : 'bg-transparent'
                      }`}
                    />

                    <button
                      onClick={() => scrollToHeading(heading.id)}
                      className={`text-left w-full py-1.5 pr-2 transition-all duration-200 line-clamp-2 text-xs leading-relaxed rounded-r ${
                        isActive
                          ? 'text-primary font-medium bg-primary/5 pl-4'
                          : isPast
                          ? 'text-muted-foreground/70 hover:text-foreground pl-4'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/30 pl-4'
                      }`}
                      style={{ paddingLeft: `${(heading.level - 1) * 12 + 16}px` }}
                    >
                      {heading.text}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* トップに戻るボタン */}
          <button
            onClick={scrollToTop}
            className={`mt-4 flex items-center justify-center gap-2 py-2 px-3 text-xs text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/50 rounded-lg transition-all duration-200 ${
              showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
            }`}
          >
            <ArrowUp size={14} />
            トップに戻る
          </button>
        </div>
      </nav>
    );
  }

  // インライン版（モバイル用）
  return (
    <nav className="bg-card border border-border/50 rounded-xl overflow-hidden mb-8 xl:hidden">
      {/* ヘッダー */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full text-left font-semibold text-sm p-4 hover:bg-muted/20 transition-colors"
      >
        <List size={16} />
        目次
        <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full ml-2">
          {headings.length}セクション
        </span>
        <ChevronDown
          size={16}
          className={`ml-auto transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* プログレスバー */}
      <div className="h-0.5 bg-muted/30">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${readProgress}%` }}
        />
      </div>

      {/* 目次リスト */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[60vh] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <ul className="p-4 pt-2 space-y-0.5 text-sm border-l-2 border-border/50 ml-4 max-h-[50vh] overflow-y-auto">
          {headings.map((heading, index) => {
            const isActive = activeId === heading.id;
            const isPast = activeIndex >= 0 && index < activeIndex;

            return (
              <li key={`${heading.id}-${index}`}>
                <button
                  onClick={() => scrollToHeading(heading.id)}
                  className={`text-left w-full py-1.5 pr-2 rounded transition-all duration-200 line-clamp-1 ${
                    isActive
                      ? 'text-primary font-medium bg-primary/10'
                      : isPast
                      ? 'text-muted-foreground/60 hover:text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                  }`}
                  style={{ paddingLeft: `${(heading.level - 1) * 12 + 8}px` }}
                >
                  {heading.text}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
