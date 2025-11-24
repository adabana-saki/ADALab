'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

export function WakaTimeStats() {
  const { language } = useLanguage();

  const content = {
    ja: {
      title: 'Coding Activity',
      viewProfile: 'WakaTimeプロフィールを見る',
    },
    en: {
      title: 'Coding Activity',
      viewProfile: 'View WakaTime Profile',
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
        <Clock className="w-5 h-5 text-neon-cyan" />
        <h3 className="text-lg font-bold">{content[language].title}</h3>
      </div>

      <div className="space-y-4 flex-1">
        <div className="overflow-hidden rounded-lg bg-black/30 p-2">
          <img
            src="https://wakatime.com/share/@5128a5cc-3786-4b8f-8216-337972168b60/76fa8c4a-ca7c-43b9-b3da-d56cba668940.svg"
            alt="WakaTime Coding Activity"
            className="w-full h-auto"
          />
        </div>
        <div className="overflow-hidden rounded-lg bg-black/30 p-2">
          <img
            src="https://wakatime.com/share/@5128a5cc-3786-4b8f-8216-337972168b60/022cdbbe-3e09-452b-8d35-4abb2fbb86c6.svg"
            alt="WakaTime Languages"
            className="w-full h-auto"
          />
        </div>
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
