'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Twitter } from 'lucide-react';
import { useEffect } from 'react';

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

  const content = {
    ja: {
      title: 'Twitter',
      follow: 'フォローする',
    },
    en: {
      title: 'Twitter',
      follow: 'Follow',
    },
  };

  useEffect(() => {
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
      document.body.removeChild(script);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass p-6 rounded-2xl h-full flex flex-col"
    >
      <div className="flex items-center gap-3 mb-4">
        <Twitter className="w-5 h-5 text-neon-cyan" />
        <h3 className="text-lg font-bold">{content[language].title}</h3>
      </div>

      <div className="flex-1 overflow-hidden rounded-lg">
        <a
          className="twitter-timeline"
          data-theme="dark"
          data-height="300"
          data-chrome="noheader nofooter noborders transparent"
          href="https://twitter.com/ADA_Lab_tech"
        >
          Loading...
        </a>
      </div>

      <a
        href="https://twitter.com/ADA_Lab_tech"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 block text-center text-sm text-neon-cyan hover:text-neon-cyan/80 transition-colors"
      >
        {content[language].follow} →
      </a>
    </motion.div>
  );
}
