'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

const technologies = [
  { name: 'React', color: '#61DAFB' },
  { name: 'Next.js', color: '#ffffff' },
  { name: 'TypeScript', color: '#3178C6' },
  { name: 'Tailwind', color: '#06B6D4' },
  { name: 'Framer', color: '#0055FF' },
  { name: 'Node.js', color: '#339933' },
  { name: 'Prisma', color: '#2D3748' },
  { name: 'PostgreSQL', color: '#4169E1' },
  { name: 'Docker', color: '#2496ED' },
  { name: 'Git', color: '#F05032' },
  { name: 'GitHub', color: '#ffffff' },
  { name: 'Cloudflare', color: '#F38020' },
];

export function TechStackBadges() {
  const { language } = useLanguage();

  const content = {
    ja: {
      title: 'Tech Stack',
    },
    en: {
      title: 'Tech Stack',
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass p-6 rounded-2xl"
    >
      <h3 className="text-lg font-bold mb-4">{content[language].title}</h3>
      <div className="flex flex-wrap gap-2">
        {technologies.map((tech, index) => (
          <motion.div
            key={tech.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10 hover:border-neon-cyan/50 transition-colors group"
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: tech.color }}
            />
            <span className="text-xs font-medium">{tech.name}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
