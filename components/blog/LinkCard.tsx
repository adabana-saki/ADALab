'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, Globe } from 'lucide-react';
import Image from 'next/image';

interface LinkCardProps {
  url: string;
}

interface OGPData {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  favicon?: string;
}

export function LinkCard({ url }: LinkCardProps) {
  const [ogpData, setOgpData] = useState<OGPData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchOGP = async () => {
      setIsLoading(true);
      setError(false);

      try {
        // 簡易的なOGP取得（本番ではAPI経由が望ましい）
        const response = await fetch(`/api/ogp?url=${encodeURIComponent(url)}`);
        if (response.ok) {
          const data = await response.json();
          setOgpData(data);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOGP();
  }, [url]);

  let hostname = url;
  try {
    hostname = new URL(url).hostname;
  } catch {
    // 不正なURLの場合はフォールバック
  }

  if (isLoading) {
    return (
      <div className="my-6 rounded-xl border border-border/50 bg-muted/20 overflow-hidden animate-pulse">
        <div className="flex items-stretch">
          <div className="flex-1 p-4">
            <div className="h-4 bg-muted/50 rounded w-3/4 mb-2" />
            <div className="h-3 bg-muted/30 rounded w-full mb-1" />
            <div className="h-3 bg-muted/30 rounded w-2/3" />
          </div>
          <div className="w-32 h-24 bg-muted/30" />
        </div>
      </div>
    );
  }

  if (error || !ogpData) {
    // フォールバック: シンプルなリンク表示
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="my-6 flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors group"
      >
        <Globe size={20} className="text-muted-foreground flex-shrink-0" />
        <span className="flex-1 text-primary group-hover:underline truncate">
          {url}
        </span>
        <ExternalLink size={16} className="text-muted-foreground flex-shrink-0" />
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="my-6 flex rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/30 hover:border-primary/30 transition-all overflow-hidden group"
    >
      {/* コンテンツ */}
      <div className="flex-1 p-4 min-w-0">
        <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1">
          {ogpData.title || url}
        </h3>
        {ogpData.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {ogpData.description}
          </p>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {ogpData.favicon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={ogpData.favicon}
              alt=""
              className="w-4 h-4 rounded"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <Globe size={14} />
          )}
          <span className="truncate">{ogpData.siteName || hostname}</span>
        </div>
      </div>

      {/* OGP画像 */}
      {ogpData.image && (
        <div className="relative w-32 sm:w-40 flex-shrink-0 bg-muted/30">
          <Image
            src={ogpData.image}
            alt={ogpData.title || ''}
            fill
            className="object-cover"
            sizes="160px"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
    </a>
  );
}
