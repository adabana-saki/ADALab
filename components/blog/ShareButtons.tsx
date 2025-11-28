'use client';

import { useState } from 'react';
import { Twitter, Facebook, Link2, Check, Share2 } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';

interface ShareButtonsProps {
  title: string;
  slug: string;
}

export function ShareButtons({ title, slug }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const baseUrl = SITE_CONFIG.url;
  const url = `${baseUrl}/blog/${slug}`;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    line: `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`,
    hatena: `https://b.hatena.ne.jp/entry/s/${url.replace('https://', '')}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // フォールバック
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const buttonClass =
    'flex items-center justify-center w-10 h-10 rounded-full border border-border/50 hover:border-primary/50 hover:bg-primary/10 transition-all duration-300';

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground flex items-center gap-1">
        <Share2 size={14} />
        共有
      </span>

      <a
        href={shareLinks.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClass}
        title="Xでシェア"
        aria-label="Xでシェア"
      >
        <Twitter size={18} />
      </a>

      <a
        href={shareLinks.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClass}
        title="Facebookでシェア"
        aria-label="Facebookでシェア"
      >
        <Facebook size={18} />
      </a>

      <a
        href={shareLinks.line}
        target="_blank"
        rel="noopener noreferrer"
        className={`${buttonClass} text-[#00B900]`}
        title="LINEでシェア"
        aria-label="LINEでシェア"
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-[18px] h-[18px]"
        >
          <path d="M12 2C6.48 2 2 5.82 2 10.5c0 4.17 3.68 7.67 8.66 8.35.34.07.8.22.91.51.1.26.07.66.03.92l-.15.9c-.04.27-.2 1.06.93.58 1.13-.48 6.1-3.59 8.33-6.15C22.16 13.15 22 11.82 22 10.5 22 5.82 17.52 2 12 2zm-2.5 11.5h-2c-.28 0-.5-.22-.5-.5v-4c0-.28.22-.5.5-.5s.5.22.5.5v3.5h1.5c.28 0 .5.22.5.5s-.22.5-.5.5zm1.5-.5c0 .28-.22.5-.5.5s-.5-.22-.5-.5v-4c0-.28.22-.5.5-.5s.5.22.5.5v4zm4.5.5h-2c-.28 0-.5-.22-.5-.5v-4c0-.28.22-.5.5-.5s.5.22.5.5v3.5h1.5c.28 0 .5.22.5.5s-.22.5-.5.5zm2.5-2.5c.28 0 .5.22.5.5s-.22.5-.5.5h-1v.5h1c.28 0 .5.22.5.5s-.22.5-.5.5h-1.5c-.28 0-.5-.22-.5-.5v-4c0-.28.22-.5.5-.5h1.5c.28 0 .5.22.5.5s-.22.5-.5.5h-1v.5h1z" />
        </svg>
      </a>

      <a
        href={shareLinks.hatena}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClass}
        title="はてなブックマーク"
        aria-label="はてなブックマーク"
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-[18px] h-[18px]"
        >
          <path d="M20.47 21.22H3.53A1.53 1.53 0 0 1 2 19.69V4.31A1.53 1.53 0 0 1 3.53 2.78h16.94A1.53 1.53 0 0 1 22 4.31v15.38a1.53 1.53 0 0 1-1.53 1.53zM8.84 17.87a1.44 1.44 0 1 0-1.44-1.44 1.44 1.44 0 0 0 1.44 1.44zm0-4.32h-.1a2.49 2.49 0 0 1-1.78-.78 2.67 2.67 0 0 1-.74-1.94v-4.7h2.62v4.44a.69.69 0 0 0 .17.49.57.57 0 0 0 .43.17h.6v2.32zm7.08 4.32h-2.62v-6.1h2.62zm0-7.22h-2.62V6.13h2.62z" />
        </svg>
      </a>

      <button
        onClick={copyToClipboard}
        className={buttonClass}
        title="URLをコピー"
        aria-label="URLをコピー"
      >
        {copied ? (
          <Check size={18} className="text-green-500" />
        ) : (
          <Link2 size={18} />
        )}
      </button>
    </div>
  );
}
