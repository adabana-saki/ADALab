'use client';

import { useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2, RefreshCw } from 'lucide-react';

interface MermaidDiagramProps {
  chart: string;
  caption?: string;
}

export function MermaidDiagram({ chart, caption }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!containerRef.current) return;

      setIsLoading(true);
      setError(null);

      try {
        const mermaid = (await import('mermaid')).default;

        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          themeVariables: {
            primaryColor: '#3b82f6',
            primaryTextColor: '#fff',
            primaryBorderColor: '#60a5fa',
            lineColor: '#6b7280',
            secondaryColor: '#1e293b',
            tertiaryColor: '#0f172a',
            background: '#1e293b',
            mainBkg: '#1e293b',
            nodeBorder: '#60a5fa',
            clusterBkg: '#0f172a',
            clusterBorder: '#475569',
            defaultLinkColor: '#9ca3af',
            titleColor: '#f1f5f9',
            edgeLabelBackground: '#1e293b',
            actorTextColor: '#f1f5f9',
            actorBkg: '#1e293b',
            actorBorder: '#60a5fa',
            signalColor: '#f1f5f9',
            signalTextColor: '#f1f5f9',
            labelBoxBkgColor: '#1e293b',
            labelBoxBorderColor: '#475569',
            labelTextColor: '#f1f5f9',
            loopTextColor: '#f1f5f9',
            noteBorderColor: '#475569',
            noteBkgColor: '#0f172a',
            noteTextColor: '#f1f5f9',
            activationBorderColor: '#60a5fa',
            activationBkgColor: '#1e293b',
            sequenceNumberColor: '#1e293b',
            sectionBkgColor: '#0f172a',
            altSectionBkgColor: '#1e293b',
            sectionBkgColor2: '#1e293b',
            excludeBkgColor: '#0f172a',
            taskBorderColor: '#60a5fa',
            taskBkgColor: '#1e293b',
            taskTextColor: '#f1f5f9',
            taskTextLightColor: '#f1f5f9',
            taskTextOutsideColor: '#f1f5f9',
            taskTextClickableColor: '#60a5fa',
            activeTaskBorderColor: '#60a5fa',
            activeTaskBkgColor: '#3b82f6',
            gridColor: '#475569',
            doneTaskBkgColor: '#22c55e',
            doneTaskBorderColor: '#22c55e',
            critBorderColor: '#ef4444',
            critBkgColor: '#7f1d1d',
            todayLineColor: '#f59e0b',
            personBorder: '#60a5fa',
            personBkg: '#1e293b',
          },
          flowchart: {
            htmlLabels: true,
            curve: 'basis',
          },
          sequence: {
            diagramMarginX: 50,
            diagramMarginY: 10,
            actorMargin: 50,
            width: 150,
            height: 65,
            boxMargin: 10,
            boxTextMargin: 5,
            noteMargin: 10,
            messageMargin: 35,
          },
        });

        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg: renderedSvg } = await mermaid.render(id, chart);
        setSvg(renderedSvg);
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        setError(err instanceof Error ? err.message : 'Failed to render diagram');
      } finally {
        setIsLoading(false);
      }
    };

    renderDiagram();
  }, [chart]);

  const handleRefresh = async () => {
    setIsLoading(true);
    setError(null);
    setSvg('');

    // 短いディレイを入れてから再レンダリング
    await new Promise(resolve => setTimeout(resolve, 100));

    const mermaid = (await import('mermaid')).default;
    try {
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      const { svg: renderedSvg } = await mermaid.render(id, chart);
      setSvg(renderedSvg);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to render diagram');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <figure className="my-8">
      <div
        className={`relative rounded-xl border border-border/50 bg-slate-900/50 overflow-hidden transition-all ${
          isFullscreen
            ? 'fixed inset-4 z-50 bg-slate-900'
            : ''
        }`}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-border/30">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4"
              fill="currentColor"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
            <span>Mermaid Diagram</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleRefresh}
              className="p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              aria-label="Refresh diagram"
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          </div>
        </div>

        {/* ダイアグラム本体 */}
        <div
          ref={containerRef}
          className={`flex items-center justify-center p-6 ${
            isFullscreen ? 'min-h-[calc(100%-44px)]' : 'min-h-[200px]'
          }`}
        >
          {isLoading && (
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-5 h-5 border-2 border-gray-600 border-t-primary rounded-full animate-spin" />
              <span className="text-sm">Loading diagram...</span>
            </div>
          )}
          {error && (
            <div className="text-red-400 text-sm p-4 bg-red-500/10 rounded-lg border border-red-500/30">
              <p className="font-medium mb-1">Failed to render diagram</p>
              <p className="text-xs text-red-300/70">{error}</p>
            </div>
          )}
          {svg && !isLoading && (
            <div
              className="mermaid-svg w-full overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          )}
        </div>
      </div>

      {/* フルスクリーン時のオーバーレイ */}
      {isFullscreen && (
        <div
          className="fixed inset-0 bg-black/80 z-40"
          onClick={() => setIsFullscreen(false)}
        />
      )}

      {/* キャプション */}
      {caption && (
        <figcaption className="text-center text-sm text-muted-foreground mt-3">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
