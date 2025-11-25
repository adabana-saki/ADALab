'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { FolderGit2 } from 'lucide-react';

export function WakaTimeProjects() {
  const { language } = useLanguage();

  const content = {
    ja: {
      title: 'Projects',
      viewProfile: 'WakaTimeで詳細を見る',
    },
    en: {
      title: 'Projects',
      viewProfile: 'View details on WakaTime',
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass p-6 rounded-2xl h-full flex flex-col"
    >
      <div className="flex items-center gap-3 mb-4">
        <FolderGit2 className="w-5 h-5 text-neon-cyan" />
        <h3 className="text-lg font-bold">{content[language].title}</h3>
      </div>

      <div className="flex-1 overflow-hidden rounded-lg bg-black/30 p-2 flex items-center justify-center">
        <img
          src="https://wakatime.com/share/@5128a5cc-3786-4b8f-8216-337972168b60/6185441d-0ea1-48c3-b012-e1f8c50d2836.svg"
          alt="WakaTime Projects"
          className="w-full h-auto"
        />
      </div>

      <a
        href="https://wakatime.com/@5128a5cc-3786-4b8f-8216-337972168b60"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 block text-center text-sm text-neon-cyan hover:text-neon-cyan/80 transition-colors"
      >
        {content[language].viewProfile} →
      </a>
    </motion.div>
  );
}
