'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export function GiscusComments() {
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 既存のスクリプトをクリア
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-repo', 'adabana-saki/ADALab');
    script.setAttribute('data-repo-id', 'R_kgDOQXS8mw');
    script.setAttribute('data-category', 'Announcements');
    script.setAttribute('data-category-id', 'DIC_kwDOQXS8m84C0Cux');
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'top');
    script.setAttribute('data-theme', resolvedTheme === 'dark' ? 'dark_dimmed' : 'light');
    script.setAttribute('data-lang', 'ja');
    script.setAttribute('data-loading', 'lazy');

    containerRef.current.appendChild(script);
  }, [resolvedTheme]);

  return (
    <section className="mt-12 pt-8 border-t border-border/50">
      <h2 className="text-xl font-bold mb-6">コメント</h2>
      <div ref={containerRef} className="giscus min-h-[200px]" />
    </section>
  );
}
