'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Download, Users, Server, Zap } from 'lucide-react';
import { CounterAnimation } from './effects/CounterAnimation';

export function StatsDisplay() {
  const { language } = useLanguage();

  const stats = [
    {
      icon: Download,
      value: 1500,
      suffix: '+',
      label: {
        ja: 'ダウンロード数',
        en: 'Downloads',
      },
      color: 'text-neon-cyan',
    },
    {
      icon: Users,
      value: 500,
      suffix: '+',
      label: {
        ja: 'アクティブユーザー',
        en: 'Active Users',
      },
      color: 'text-neon-fuchsia',
    },
    {
      icon: Server,
      value: 99.9,
      suffix: '%',
      label: {
        ja: '稼働率',
        en: 'Uptime',
      },
      color: 'text-green-400',
    },
    {
      icon: Zap,
      value: 45,
      suffix: 'ms',
      label: {
        ja: '平均レスポンス',
        en: 'Avg Response',
      },
      color: 'text-yellow-400',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass p-6 rounded-2xl"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label.en}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="text-center"
          >
            <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
            <div className="text-2xl md:text-3xl font-bold mb-1">
              <CounterAnimation
                end={stat.value}
                suffix={stat.suffix}
                duration={2}
                decimals={stat.value % 1 !== 0 ? 1 : 0}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {stat.label[language]}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
