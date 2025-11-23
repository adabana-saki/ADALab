'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

export function ArchitectureDiagram() {
  const { language } = useLanguage();

  const content = {
    ja: {
      title: 'システムアーキテクチャ',
      client: 'クライアント',
      cdn: 'CDN / Edge',
      app: 'アプリケーション',
      data: 'データストア',
    },
    en: {
      title: 'System Architecture',
      client: 'Client',
      cdn: 'CDN / Edge',
      app: 'Application',
      data: 'Data Store',
    },
  };

  const layers = [
    {
      name: content[language].client,
      items: ['Browser', 'Mobile App'],
      color: 'from-blue-500 to-cyan-500',
    },
    {
      name: content[language].cdn,
      items: ['Cloudflare Pages', 'Edge Functions'],
      color: 'from-orange-500 to-yellow-500',
    },
    {
      name: content[language].app,
      items: ['Next.js', 'API Routes', 'Server Components'],
      color: 'from-purple-500 to-pink-500',
    },
    {
      name: content[language].data,
      items: ['PostgreSQL', 'Redis Cache', 'S3 Storage'],
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass p-6 rounded-2xl"
    >
      <h3 className="text-lg font-bold mb-6 text-center">{content[language].title}</h3>

      <div className="space-y-4">
        {layers.map((layer, index) => (
          <motion.div
            key={layer.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <div className={`bg-gradient-to-r ${layer.color} p-0.5 rounded-lg`}>
              <div className="bg-background rounded-lg p-4">
                <div className="text-sm font-bold mb-2">{layer.name}</div>
                <div className="flex flex-wrap gap-2">
                  {layer.items.map((item) => (
                    <span
                      key={item}
                      className="text-xs px-2 py-1 bg-white/5 rounded border border-white/10"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            {index < layers.length - 1 && (
              <div className="flex justify-center py-2">
                <div className="w-0.5 h-4 bg-gradient-to-b from-white/30 to-transparent" />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
