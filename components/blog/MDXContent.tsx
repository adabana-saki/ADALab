import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import Image from 'next/image';

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

export function MDXContent({ content }: MDXContentProps) {
  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => {
            const text = extractText(children);
            const id = generateId(text);
            return (
              <h1
                id={id}
                className="text-3xl font-bold mt-8 mb-4 pb-2 border-b border-border/50 scroll-mt-24"
              >
                {children}
              </h1>
            );
          },
          h2: ({ children }) => {
            const text = extractText(children);
            const id = generateId(text);
            return (
              <h2
                id={id}
                className="text-2xl font-semibold mt-8 mb-3 scroll-mt-24"
              >
                {children}
              </h2>
            );
          },
          h3: ({ children }) => {
            const text = extractText(children);
            const id = generateId(text);
            return (
              <h3
                id={id}
                className="text-xl font-semibold mt-6 mb-2 scroll-mt-24"
              >
                {children}
              </h3>
            );
          },
          p: ({ children }) => (
            <p className="mb-4 leading-relaxed">{children}</p>
          ),
          a: ({ href, children }) => {
            const isExternal = href?.startsWith('http');
            if (isExternal) {
              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {children}
                </a>
              );
            }
            return (
              <Link href={href || '#'} className="text-primary hover:underline">
                {children}
              </Link>
            );
          },
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/50 pl-4 py-2 my-4 bg-muted/30 rounded-r italic">
              {children}
            </blockquote>
          ),
          code: ({ className, children }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary">
                  {children}
                </code>
              );
            }
            return <code className={className}>{children}</code>;
          },
          pre: ({ children }) => (
            <pre className="bg-muted/50 border border-border/50 rounded-lg p-4 overflow-x-auto mb-4 text-sm">
              {children}
            </pre>
          ),
          img: ({ src, alt }) => {
            if (!src || typeof src !== 'string') return null;
            // 外部URLかローカルパスか判定
            const isExternal = src.startsWith('http');
            return (
              <span className="block my-4">
                {isExternal ? (
                  // 外部画像は通常のimgタグを使用（lazy loading付き）
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={src}
                    alt={alt || ''}
                    className="rounded-lg max-w-full h-auto"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  // ローカル画像はnext/imageを使用
                  <Image
                    src={src}
                    alt={alt || ''}
                    width={800}
                    height={450}
                    className="rounded-lg max-w-full h-auto"
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIBAAAgEEAgMBAAAAAAAAAAAAAQIDAAQFESExBhJBUf/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCzx3Py4mCVJkgkdnlLbRB0AOh6qT/RL/0pSg//2Q=="
                    style={{ width: '100%', height: 'auto' }}
                  />
                )}
              </span>
            );
          },
          hr: () => <hr className="my-8 border-border/50" />,
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="w-full border-collapse border border-border/50">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-border/50 bg-muted/50 px-4 py-2 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border/50 px-4 py-2">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
