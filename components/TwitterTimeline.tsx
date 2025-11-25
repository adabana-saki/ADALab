'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Twitter as XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: () => void;
      };
    };
  }
}

export function TwitterTimeline() {
  const { language } = useLanguage();
  const [isMounted, setIsMounted] = useState(false);

  const content = {
    ja: {
      title: 'X',
      follow: 'フォローする',
      loading: '読み込み中...',
    },
    en: {
      title: 'X',
      follow: 'Follow',
      loading: 'Loading...',
    },
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const script = document.createElement('script');
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    script.onload = () => {
      if (window.twttr) {
        window.twttr.widgets.load();
      }
    };
    document.body.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[src="https://platform.twitter.com/widgets.js"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, [isMounted]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass p-6 rounded-2xl h-full flex flex-col"
    >
      <div className="flex items-center gap-3 mb-4">
        <XIcon className="w-5 h-5 text-neon-cyan" />
        <h3 className="text-lg font-bold">{content[language].title}</h3>
      </div>

      <div className="flex-1 overflow-hidden rounded-lg">
        {isMounted ? (
          <a
            className="twitter-timeline"
            data-theme="dark"
            data-height="300"
            data-chrome="noheader nofooter noborders transparent"
            href="https://x.com/ADA_Lab_tech"
          >
            {content[language].loading}
          </a>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            {content[language].loading}
          </div>
        )}
      </div>

      <a
        href="https://x.com/ADA_Lab_tech"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 block text-center text-sm text-neon-cyan hover:text-neon-cyan/80 transition-colors"
      >
        {content[language].follow} →
      </a>
    </motion.div>
  );
}
