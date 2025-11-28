'use client';

import { useState, useEffect, useMemo } from 'react';
import { List, ChevronRight } from 'lucide-react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(true);

  // Markdownから見出しを抽出（useMemoでメモ化）
  const headings = useMemo(() => {
    const items: TocItem[] = [];
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
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

  // スクロール位置に応じてアクティブな見出しを更新
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -80% 0px' }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) {
    return null;
  }

  const scrollToHeading = (id: string) => {
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
  };

  return (
    <nav className="bg-card border border-border/50 rounded-lg p-4 mb-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full text-left font-semibold text-sm"
      >
        <List size={16} />
        目次
        <ChevronRight
          size={16}
          className={`ml-auto transition-transform ${isOpen ? 'rotate-90' : ''}`}
        />
      </button>

      {isOpen && (
        <ul className="mt-3 space-y-1 text-sm">
          {headings.map((heading, index) => (
            <li
              key={`${heading.id}-${index}`}
              style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}
            >
              <button
                onClick={() => scrollToHeading(heading.id)}
                className={`text-left w-full py-1 px-2 rounded hover:bg-muted/50 transition-colors line-clamp-1 ${
                  activeId === heading.id
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {heading.text}
              </button>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
