'use client';

import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

const techStack = {
  frontend: [
    {
      name: 'Next.js',
      version: '15.1',
      color: '#ffffff',
      reason: {
        ja: 'App Routerによる最新のReact機能とSSR/SSGの柔軟な選択',
        en: 'Latest React features with App Router and flexible SSR/SSG options',
      },
    },
    {
      name: 'React',
      version: '19',
      color: '#61DAFB',
      reason: {
        ja: 'コンポーネントベースのUI構築と豊富なエコシステム',
        en: 'Component-based UI development with rich ecosystem',
      },
    },
    {
      name: 'TypeScript',
      version: '5.x',
      color: '#3178C6',
      reason: {
        ja: '型安全性によるバグ防止と開発体験の向上',
        en: 'Type safety for bug prevention and improved DX',
      },
    },
    {
      name: 'Tailwind CSS',
      version: '3.4',
      color: '#06B6D4',
      reason: {
        ja: '高速なスタイリングとカスタマイズ性',
        en: 'Rapid styling with high customizability',
      },
    },
    {
      name: 'Framer Motion',
      version: '11.x',
      color: '#0055FF',
      reason: {
        ja: '宣言的なアニメーションAPIと優れたパフォーマンス',
        en: 'Declarative animation API with excellent performance',
      },
    },
  ],
  backend: [
    {
      name: 'Node.js',
      version: '20 LTS',
      color: '#339933',
      reason: {
        ja: 'JavaScriptランタイムの統一とnpmエコシステム',
        en: 'Unified JavaScript runtime with npm ecosystem',
      },
    },
    {
      name: 'Prisma',
      version: '5.x',
      color: '#2D3748',
      reason: {
        ja: '型安全なORMとマイグレーション管理',
        en: 'Type-safe ORM with migration management',
      },
    },
    {
      name: 'PostgreSQL',
      version: '16',
      color: '#4169E1',
      reason: {
        ja: '信頼性の高いリレーショナルデータベース',
        en: 'Reliable relational database',
      },
    },
  ],
  infrastructure: [
    {
      name: 'Cloudflare Pages',
      version: '-',
      color: '#F38020',
      reason: {
        ja: '高速なエッジデプロイとグローバルCDN',
        en: 'Fast edge deployment with global CDN',
      },
    },
    {
      name: 'Docker',
      version: '24.x',
      color: '#2496ED',
      reason: {
        ja: 'コンテナ化による環境の一貫性',
        en: 'Environment consistency through containerization',
      },
    },
    {
      name: 'GitHub Actions',
      version: '-',
      color: '#2088FF',
      reason: {
        ja: 'CI/CDパイプラインの自動化',
        en: 'CI/CD pipeline automation',
      },
    },
  ],
  tools: [
    {
      name: 'ESLint',
      version: '8.x',
      color: '#4B32C3',
      reason: {
        ja: 'コード品質の維持とベストプラクティスの強制',
        en: 'Code quality maintenance and best practices enforcement',
      },
    },
    {
      name: 'Prettier',
      version: '3.x',
      color: '#F7B93E',
      reason: {
        ja: '一貫したコードフォーマット',
        en: 'Consistent code formatting',
      },
    },
    {
      name: 'Husky',
      version: '9.x',
      color: '#ffffff',
      reason: {
        ja: 'Git hooksによる品質管理の自動化',
        en: 'Quality control automation with Git hooks',
      },
    },
  ],
};

const categories = {
  ja: {
    frontend: 'フロントエンド',
    backend: 'バックエンド',
    infrastructure: 'インフラストラクチャ',
    tools: '開発ツール',
  },
  en: {
    frontend: 'Frontend',
    backend: 'Backend',
    infrastructure: 'Infrastructure',
    tools: 'Development Tools',
  },
};

export default function TechStackPage() {
  const { language } = useLanguage();

  const content = {
    ja: {
      title: 'Tech Stack',
      subtitle: '使用技術スタック',
      version: 'バージョン',
      reason: '選定理由',
    },
    en: {
      title: 'Tech Stack',
      subtitle: 'Technology Stack',
      version: 'Version',
      reason: 'Selection Reason',
    },
  };

  return (
    <>
      <Navigation />
      <main id="main-content" className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="gradient-text">{content[language].title}</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                {content[language].subtitle}
              </p>
            </motion.div>

            <div className="space-y-12">
              {Object.entries(techStack).map(([category, techs], categoryIndex) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                >
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-neon-cyan" />
                    {categories[language][category as keyof typeof categories.ja]}
                  </h2>

                  <div className="grid gap-4">
                    {techs.map((tech, index) => (
                      <motion.div
                        key={tech.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        className="glass p-4 rounded-xl hover:border-neon-cyan/30 border border-transparent transition-colors"
                      >
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          <div className="flex items-center gap-3 md:w-48">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: tech.color }}
                            />
                            <span className="font-bold">{tech.name}</span>
                          </div>
                          <div className="md:w-24">
                            <span className="font-mono text-sm text-neon-cyan">
                              {tech.version}
                            </span>
                          </div>
                          <div className="flex-1 text-sm text-muted-foreground">
                            {tech.reason[language]}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
