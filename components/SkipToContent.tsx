'use client';

export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-4 focus-visible:left-4 focus-visible:z-50 focus-visible:px-6 focus-visible:py-3 focus-visible:bg-primary focus-visible:text-primary-foreground focus-visible:rounded-lg focus-visible:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all"
    >
      メインコンテンツへスキップ
    </a>
  );
}
