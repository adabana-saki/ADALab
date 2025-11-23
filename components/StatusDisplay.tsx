'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Activity, Clock, Server, Wifi } from 'lucide-react';

export function StatusDisplay() {
  const { language } = useLanguage();
  const [uptime, setUptime] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    // サイトローンチ日 (2024-01-01)
    const launchDate = new Date('2024-01-01');

    const updateTime = () => {
      const now = new Date();
      const diff = now.getTime() - launchDate.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setUptime(`${days}d ${hours}h ${minutes}m`);
      setCurrentTime(now.toLocaleTimeString('ja-JP', { hour12: false }));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const content = {
    ja: {
      status: 'システム稼働中',
      uptime: 'アップタイム',
      serverTime: 'サーバー時刻',
      connection: '接続状態',
      online: 'オンライン',
    },
    en: {
      status: 'System Online',
      uptime: 'Uptime',
      serverTime: 'Server Time',
      connection: 'Connection',
      online: 'Online',
    },
  };

  const stats = [
    {
      icon: Clock,
      label: content[language].uptime,
      value: uptime,
    },
    {
      icon: Server,
      label: content[language].serverTime,
      value: currentTime,
    },
    {
      icon: Wifi,
      label: content[language].connection,
      value: content[language].online,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass p-6 rounded-2xl"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          <Activity className="w-5 h-5 text-green-400" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        </div>
        <h3 className="text-lg font-bold">{content[language].status}</h3>
      </div>

      <div className="space-y-3">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <stat.icon className="w-4 h-4" />
              <span>{stat.label}</span>
            </div>
            <span className="font-mono text-neon-cyan">{stat.value}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
