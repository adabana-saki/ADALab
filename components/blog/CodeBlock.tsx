'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Check, Copy, FileCode } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
}

// 言語の表示名マッピング
const languageNames: Record<string, string> = {
  js: 'JavaScript',
  javascript: 'JavaScript',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  tsx: 'TSX',
  jsx: 'JSX',
  py: 'Python',
  python: 'Python',
  rb: 'Ruby',
  ruby: 'Ruby',
  go: 'Go',
  rust: 'Rust',
  rs: 'Rust',
  java: 'Java',
  cpp: 'C++',
  'c++': 'C++',
  c: 'C',
  cs: 'C#',
  csharp: 'C#',
  php: 'PHP',
  swift: 'Swift',
  kotlin: 'Kotlin',
  kt: 'Kotlin',
  scala: 'Scala',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  sass: 'Sass',
  less: 'Less',
  json: 'JSON',
  yaml: 'YAML',
  yml: 'YAML',
  toml: 'TOML',
  xml: 'XML',
  md: 'Markdown',
  markdown: 'Markdown',
  sql: 'SQL',
  sh: 'Shell',
  bash: 'Bash',
  zsh: 'Zsh',
  shell: 'Shell',
  powershell: 'PowerShell',
  ps1: 'PowerShell',
  dockerfile: 'Dockerfile',
  docker: 'Docker',
  nginx: 'Nginx',
  apache: 'Apache',
  graphql: 'GraphQL',
  gql: 'GraphQL',
  vue: 'Vue',
  svelte: 'Svelte',
  diff: 'Diff',
  plaintext: 'Text',
  text: 'Text',
  txt: 'Text',
};

// 言語に応じた色を取得
const getLanguageColor = (lang: string): string => {
  const colors: Record<string, string> = {
    javascript: '#f7df1e',
    js: '#f7df1e',
    typescript: '#3178c6',
    ts: '#3178c6',
    tsx: '#3178c6',
    jsx: '#61dafb',
    python: '#3776ab',
    py: '#3776ab',
    ruby: '#cc342d',
    rb: '#cc342d',
    go: '#00add8',
    rust: '#dea584',
    rs: '#dea584',
    java: '#b07219',
    cpp: '#f34b7d',
    'c++': '#f34b7d',
    c: '#555555',
    cs: '#178600',
    csharp: '#178600',
    php: '#777bb4',
    swift: '#fa7343',
    kotlin: '#a97bff',
    kt: '#a97bff',
    html: '#e34c26',
    css: '#563d7c',
    scss: '#c6538c',
    json: '#292929',
    yaml: '#cb171e',
    yml: '#cb171e',
    sh: '#89e051',
    bash: '#89e051',
    shell: '#89e051',
    dockerfile: '#384d54',
    graphql: '#e10098',
    vue: '#41b883',
    svelte: '#ff3e00',
    diff: '#41b883',
  };
  return colors[lang.toLowerCase()] || '#6b7280';
};

export function CodeBlock({
  code,
  language = 'plaintext',
  filename,
  showLineNumbers = false,
  highlightLines = [],
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState<string>('');
  const codeRef = useRef<HTMLDivElement>(null);

  // Shikiでハイライト
  useEffect(() => {
    const highlight = async () => {
      try {
        const { codeToHtml } = await import('shiki');
        const html = await codeToHtml(code, {
          lang: language === 'plaintext' ? 'text' : language,
          theme: 'github-dark-dimmed',
        });
        setHighlightedCode(html);
      } catch {
        // フォールバック: プレーンテキスト
        setHighlightedCode(`<pre><code>${escapeHtml(code)}</code></pre>`);
      }
    };
    highlight();
  }, [code, language]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [code]);

  const displayLanguage = languageNames[language.toLowerCase()] || language.toUpperCase();
  const languageColor = getLanguageColor(language);
  const isDiff = language === 'diff';

  return (
    <div className="group relative my-6 rounded-xl overflow-hidden border border-border/50 bg-[#22272e]">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d333b] border-b border-border/30">
        <div className="flex items-center gap-3">
          {/* 言語バッジ */}
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: languageColor }}
            />
            <span className="text-xs font-medium text-gray-400">
              {displayLanguage}
            </span>
          </div>
          {/* ファイル名 */}
          {filename && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400 border-l border-border/30 pl-3">
              <FileCode size={14} />
              <span className="font-mono">{filename}</span>
            </div>
          )}
        </div>
        {/* コピーボタン */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
          aria-label={copied ? 'Copied!' : 'Copy code'}
        >
          {copied ? (
            <>
              <Check size={14} className="text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span className="hidden sm:inline">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* コード本体 */}
      <div className="relative overflow-x-auto">
        {showLineNumbers && (
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#1c2128] border-r border-border/20 pointer-events-none">
            <div className="py-4 text-right pr-3">
              {code.split('\n').map((_, i) => (
                <div
                  key={i}
                  className={`text-xs leading-6 font-mono ${
                    highlightLines.includes(i + 1)
                      ? 'text-primary'
                      : 'text-gray-600'
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          ref={codeRef}
          className={`code-block-content ${showLineNumbers ? 'pl-14' : ''} ${isDiff ? 'diff-code' : ''}`}
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </div>
    </div>
  );
}

// HTML エスケープ
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// メタ情報をパースするヘルパー
export function parseCodeMeta(meta: string | undefined): {
  filename?: string;
  showLineNumbers: boolean;
  highlightLines: number[];
} {
  if (!meta) {
    return { showLineNumbers: false, highlightLines: [] };
  }

  // ファイル名を抽出（language:filename形式）
  const filenameMatch = meta.match(/^([^{\s]+)/);
  const filename = filenameMatch ? filenameMatch[1] : undefined;

  // 行番号表示
  const showLineNumbers = meta.includes('showLineNumbers') || meta.includes('lineNumbers');

  // ハイライト行を抽出（{1,3-5}形式）
  const highlightMatch = meta.match(/\{([^}]+)\}/);
  const highlightLines: number[] = [];
  if (highlightMatch) {
    const parts = highlightMatch[1].split(',');
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split("-").map(Number);
        if (isNaN(start) || isNaN(end) || start > end) continue;
        for (let i = start; i <= end; i++) {
          highlightLines.push(i);
        }
      } else {
        highlightLines.push(Number(part));
      }
    }
  }

  return { filename, showLineNumbers, highlightLines };
}
