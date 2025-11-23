'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
}

// シンプルなシンタックスハイライト
const highlightCode = (code: string, lang: string) => {
  const keywords = {
    js: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'import', 'export', 'from', 'async', 'await', 'class', 'extends', 'new', 'this', 'try', 'catch', 'throw'],
    ts: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'import', 'export', 'from', 'async', 'await', 'class', 'extends', 'new', 'this', 'try', 'catch', 'throw', 'interface', 'type', 'enum', 'implements', 'private', 'public', 'protected'],
    python: ['def', 'class', 'if', 'elif', 'else', 'for', 'while', 'import', 'from', 'return', 'try', 'except', 'with', 'as', 'lambda', 'yield', 'pass', 'break', 'continue'],
    bash: ['echo', 'cd', 'ls', 'mkdir', 'rm', 'cp', 'mv', 'cat', 'grep', 'npm', 'yarn', 'git', 'docker'],
  };

  const types = ['string', 'number', 'boolean', 'null', 'undefined', 'void', 'any', 'never', 'object', 'Array', 'Promise', 'React'];

  let highlighted = code
    // Strings
    .replace(/(["'`])(?:(?=(\\?))\2.)*?\1/g, '<span class="text-green-400">$&</span>')
    // Comments
    .replace(/(\/\/.*$|\/\*[\s\S]*?\*\/|#.*$)/gm, '<span class="text-gray-500">$&</span>')
    // Numbers
    .replace(/\b(\d+\.?\d*)\b/g, '<span class="text-orange-400">$1</span>');

  // Keywords
  const langKeywords = keywords[lang as keyof typeof keywords] || keywords.js;
  langKeywords.forEach((keyword) => {
    const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
    highlighted = highlighted.replace(regex, '<span class="text-purple-400">$1</span>');
  });

  // Types
  types.forEach((type) => {
    const regex = new RegExp(`\\b(${type})\\b`, 'g');
    highlighted = highlighted.replace(regex, '<span class="text-cyan-400">$1</span>');
  });

  // Functions
  highlighted = highlighted.replace(/\b([a-zA-Z_]\w*)\s*(?=\()/g, '<span class="text-yellow-400">$1</span>');

  return highlighted;
};

export function CodeBlock({
  code,
  language = 'typescript',
  filename,
  showLineNumbers = true,
}: CodeBlockProps) {
  const { language: lang } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split('\n');
  const highlightedCode = highlightCode(code, language);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg overflow-hidden border border-white/10"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/50 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          {filename && (
            <span className="text-xs text-muted-foreground font-mono ml-2">
              {filename}
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="p-1.5 hover:bg-white/10 rounded transition-colors"
          title={lang === 'ja' ? 'コピー' : 'Copy'}
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Code */}
      <div className="bg-black/30 p-4 overflow-x-auto">
        <pre className="font-mono text-sm">
          <code>
            {showLineNumbers ? (
              <table className="border-collapse">
                <tbody>
                  {lines.map((line, i) => (
                    <tr key={i} className="hover:bg-white/5">
                      <td className="pr-4 text-right text-muted-foreground select-none w-8">
                        {i + 1}
                      </td>
                      <td
                        dangerouslySetInnerHTML={{
                          __html: highlightCode(line, language) || '&nbsp;',
                        }}
                      />
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: highlightedCode }} />
            )}
          </code>
        </pre>
      </div>
    </motion.div>
  );
}
