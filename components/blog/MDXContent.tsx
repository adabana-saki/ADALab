'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import Link from 'next/link';
import Image from 'next/image';
import { CodeBlock, parseCodeMeta } from './CodeBlock';
import { Callout, parseCalloutType } from './Callout';
import { Details } from './Details';
import { MermaidDiagram } from './MermaidDiagram';

interface MDXContentProps {
  content: string;
}

// 見出しテキストからIDを生成
function generateId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF-]/g, '')
    .replace(/\s+/g, '-');
}

// childrenからテキストを抽出
function extractText(children: React.ReactNode): string {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) {
    return children.map(extractText).join('');
  }
  if (typeof children === 'object' && children !== null && 'props' in children) {
    return extractText((children as { props: { children: React.ReactNode } }).props.children);
  }
  return '';
}

// カスタム記法をパースしてReactコンポーネントに変換
function parseCustomSyntax(content: string): string {
  let result = content;

  // :::note type から :::note までをパース
  // 一時的にプレースホルダーに変換（ReactMarkdownで処理）
  result = result.replace(
    /:::note\s+(info|tip|warn|warning|alert|danger|success)(?:\s+([^\n]*))?\n([\s\S]*?):::/gm,
    (_, type, title, body) => {
      const escapedBody = body.trim();
      const escapedTitle = title?.trim() || '';
      return `<callout type="${type}" title="${escapedTitle}">\n\n${escapedBody}\n\n</callout>`;
    }
  );

  // :::details タイトル から ::: までをパース
  result = result.replace(
    /:::details\s+([^\n]+)\n([\s\S]*?):::/gm,
    (_, title, body) => {
      const escapedBody = body.trim();
      return `<details-block title="${title.trim()}">\n\n${escapedBody}\n\n</details-block>`;
    }
  );

  return result;
}

export function MDXContent({ content }: MDXContentProps) {
  // カスタム記法をパース
  const parsedContent = parseCustomSyntax(content);

  return (
    <div className="prose prose-invert max-w-none blog-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, { strict: false }]]}
        components={{
          h1: ({ children }) => {
            const text = extractText(children);
            const id = generateId(text);
            return (
              <h1
                id={id}
                className="group text-3xl font-bold mt-10 mb-4 pb-3 border-b border-border/50 scroll-mt-24"
              >
                <a href={`#${id}`} className="anchor-link">
                  {children}
                </a>
              </h1>
            );
          },
          h2: ({ children }) => {
            const text = extractText(children);
            const id = generateId(text);
            return (
              <h2
                id={id}
                className="group text-2xl font-semibold mt-10 mb-4 pb-2 border-b border-border/30 scroll-mt-24"
              >
                <a href={`#${id}`} className="anchor-link">
                  {children}
                </a>
              </h2>
            );
          },
          h3: ({ children }) => {
            const text = extractText(children);
            const id = generateId(text);
            return (
              <h3
                id={id}
                className="group text-xl font-semibold mt-8 mb-3 scroll-mt-24"
              >
                <a href={`#${id}`} className="anchor-link">
                  {children}
                </a>
              </h3>
            );
          },
          h4: ({ children }) => {
            const text = extractText(children);
            const id = generateId(text);
            return (
              <h4
                id={id}
                className="group text-lg font-semibold mt-6 mb-2 scroll-mt-24"
              >
                <a href={`#${id}`} className="anchor-link">
                  {children}
                </a>
              </h4>
            );
          },
          p: ({ children }) => {
            // カスタムコンポーネントのプレースホルダーをチェック
            const text = extractText(children);

            // 空のパラグラフをスキップ
            if (!text.trim()) return null;

            return <p className="mb-4 leading-relaxed text-gray-200">{children}</p>;
          },
          a: ({ href, children }) => {
            const isExternal = href?.startsWith('http');
            if (isExternal) {
              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 underline underline-offset-2 decoration-primary/50 hover:decoration-primary transition-colors"
                >
                  {children}
                </a>
              );
            }
            return (
              <Link
                href={href || '#'}
                className="text-primary hover:text-primary/80 underline underline-offset-2 decoration-primary/50 hover:decoration-primary transition-colors"
              >
                {children}
              </Link>
            );
          },
          ul: ({ children }) => (
            <ul className="list-disc pl-6 mb-4 space-y-2 marker:text-primary/60">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 mb-4 space-y-2 marker:text-primary/60">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed pl-2 text-gray-200">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/50 pl-4 py-3 my-6 bg-primary/5 rounded-r-lg">
              <div className="text-gray-300 italic">{children}</div>
            </blockquote>
          ),
          code: ({ className, children }) => {
            const match = /language-(\w+)(:?.+)?/.exec(className || '');
            const code = String(children).replace(/\n$/, '');

            // 複数行のコードはブロックコードとして処理（ASCIIアートや図表を含む）
            const isInline = !code.includes('\n') && !match;

            if (isInline) {
              return (
                <code className="bg-muted/80 px-1.5 py-0.5 rounded text-sm font-mono text-primary border border-border/30">
                  {children}
                </code>
              );
            }

            const language = match?.[1] || 'plaintext';
            const meta = match?.[2]?.slice(1); // :以降を取得

            // Mermaidダイアグラム
            if (language === 'mermaid') {
              return <MermaidDiagram chart={code} />;
            }

            // 通常のコードブロック
            const { filename, showLineNumbers, highlightLines } = parseCodeMeta(meta);

            return (
              <CodeBlock
                code={code}
                language={language}
                filename={filename}
                showLineNumbers={showLineNumbers}
                highlightLines={highlightLines}
              />
            );
          },
          pre: ({ children }) => {
            // CodeBlockコンポーネントが処理するので、ここでは単純にchildrenを返す
            return <>{children}</>;
          },
          img: ({ src, alt }) => {
            if (!src || typeof src !== 'string') return null;
            const isExternal = src.startsWith('http');
            return (
              <figure className="my-6">
                {isExternal ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={src}
                    alt={alt || ''}
                    className="rounded-xl max-w-full h-auto shadow-lg"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <Image
                    src={src}
                    alt={alt || ''}
                    width={800}
                    height={450}
                    className="rounded-xl max-w-full h-auto shadow-lg"
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIBAAAgEEAgMBAAAAAAAAAAAAAQIDAAQFESExBhJBUf/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCzx3Py4mCVJkgkdnlLbRB0AOh6qT/RL/0pSg//2Q=="
                    style={{ width: '100%', height: 'auto' }}
                  />
                )}
                {alt && (
                  <figcaption className="text-center text-sm text-muted-foreground mt-3">
                    {alt}
                  </figcaption>
                )}
              </figure>
            );
          },
          hr: () => (
            <hr className="my-10 border-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-6 rounded-lg border border-border/50">
              <table className="w-full border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted/50">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border-b border-border/50 px-4 py-3 text-left font-semibold text-foreground">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-border/30 px-4 py-3 text-gray-300">
              {children}
            </td>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-muted/20 transition-colors">{children}</tr>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-foreground">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-gray-300">{children}</em>
          ),
          del: ({ children }) => (
            <del className="text-muted-foreground line-through">{children}</del>
          ),
          // カスタムコンポーネント用（HTMLタグとして処理）
          // @ts-expect-error - カスタムHTML要素
          callout: ({ type, title, children }) => {
            const { type: parsedType, title: parsedTitle } = parseCalloutType(
              title ? `${type} ${title}` : type
            );
            return (
              <Callout type={parsedType} title={parsedTitle || undefined}>
                {children}
              </Callout>
            );
          },
          // @ts-expect-error - カスタムHTML要素
          'details-block': ({ title, children }) => (
            <Details title={title}>{children}</Details>
          ),
        }}
      >
        {parsedContent}
      </ReactMarkdown>
    </div>
  );
}
