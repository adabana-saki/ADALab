'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Github, GitCommit } from 'lucide-react';

export function GitHubContributions() {
  const { language } = useLanguage();

  const content = {
    ja: {
      title: 'Contribution Activity',
      viewProfile: 'GitHubプロフィールを見る',
    },
    en: {
      title: 'Contribution Activity',
      viewProfile: 'View GitHub Profile',
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
        <GitCommit className="w-5 h-5 text-neon-cyan" />
        <h3 className="text-lg font-bold">{content[language].title}</h3>
      </div>

      <div className="overflow-x-auto pb-2 flex-1 flex items-center">
        <img
          src="https://ghchart.rshah.org/00d4aa/adabana-saki"
          alt="GitHub Contributions"
          className="w-full min-w-[700px] h-auto"
        />
      </div>

      <a
        href="https://github.com/adabana-saki"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex items-center justify-center gap-2 text-sm text-neon-cyan hover:text-neon-cyan/80 transition-colors"
      >
        <Github className="w-4 h-4" />
        {content[language].viewProfile} →
      </a>
    </motion.div>
  );
}
