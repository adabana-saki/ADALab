'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Github, GitCommit, Star, GitFork } from 'lucide-react';

const activityData = [
  {
    type: 'commit',
    repo: 'ADALab/website',
    message: 'feat: ✨ 多言語対応を追加',
    time: '2h ago',
  },
  {
    type: 'star',
    repo: 'ADALab/rem-bot',
    message: 'Starred',
    time: '5h ago',
  },
  {
    type: 'commit',
    repo: 'ADALab/navi-app',
    message: 'fix: 🐛 ナビゲーションバグを修正',
    time: '1d ago',
  },
  {
    type: 'fork',
    repo: 'ADALab/rem-bot',
    message: 'Forked by user',
    time: '2d ago',
  },
];

const typeIcons = {
  commit: GitCommit,
  star: Star,
  fork: GitFork,
};

export function GitHubActivity() {
  const { language } = useLanguage();

  const content = {
    ja: {
      title: 'GitHub Activity',
      viewMore: 'GitHubで見る',
    },
    en: {
      title: 'GitHub Activity',
      viewMore: 'View on GitHub',
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass p-6 rounded-2xl"
    >
      <div className="flex items-center gap-3 mb-4">
        <Github className="w-5 h-5 text-neon-cyan" />
        <h3 className="text-lg font-bold">{content[language].title}</h3>
      </div>

      <div className="space-y-3">
        {activityData.map((activity, index) => {
          const Icon = typeIcons[activity.type as keyof typeof typeIcons];
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-start gap-3 text-sm"
            >
              <Icon className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="font-mono text-xs text-neon-fuchsia truncate">
                  {activity.repo}
                </p>
                <p className="text-muted-foreground truncate">{activity.message}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {activity.time}
              </span>
            </motion.div>
          );
        })}
      </div>

      <a
        href="https://github.com/adabana-saki"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 block text-center text-sm text-neon-cyan hover:text-neon-cyan/80 transition-colors"
      >
        {content[language].viewMore} →
      </a>
    </motion.div>
  );
}
