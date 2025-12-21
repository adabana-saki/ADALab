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
        ja: 'App Router + Static Export による高速な静的サイト生成',
        en: 'Fast static site generation with App Router + Static Export',
      },
    },
    {
      name: 'React',
      version: '19',
      color: '#61DAFB',
      reason: {
        ja: '最新のReact機能とServer Components対応',
        en: 'Latest React features with Server Components support',
      },
    },
    {
      name: 'TypeScript',
      version: '5.6',
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
        ja: 'ユーティリティファーストによる高速スタイリング',
        en: 'Rapid styling with utility-first approach',
      },
    },
    {
      name: 'Framer Motion',
      version: '11.x',
      color: '#0055FF',
      reason: {
        ja: '宣言的アニメーションAPIとジェスチャー対応',
        en: 'Declarative animation API with gesture support',
      },
    },
    {
      name: 'Three.js',
      version: '0.170',
      color: '#049EF4',
      reason: {
        ja: 'React Three Fiberによる3D背景エフェクト',
        en: '3D background effects with React Three Fiber',
      },
    },
  ],
  content: [
    {
      name: 'React Markdown',
      version: '10.x',
      color: '#ffffff',
      reason: {
        ja: 'ブログ記事のMarkdownレンダリング',
        en: 'Markdown rendering for blog posts',
      },
    },
    {
      name: 'Shiki',
      version: '3.x',
      color: '#FF4785',
      reason: {
        ja: 'シンタックスハイライト（VS Code互換）',
        en: 'Syntax highlighting (VS Code compatible)',
      },
    },
    {
      name: 'KaTeX',
      version: '0.16',
      color: '#329B85',
      reason: {
        ja: '数式レンダリング（LaTeX記法対応）',
        en: 'Math rendering with LaTeX syntax',
      },
    },
    {
      name: 'Mermaid',
      version: '11.x',
      color: '#FF3670',
      reason: {
        ja: 'フローチャート・ダイアグラム生成',
        en: 'Flowchart and diagram generation',
      },
    },
  ],
  infrastructure: [
    {
      name: 'Cloudflare Pages',
      version: '-',
      color: '#F38020',
      reason: {
        ja: 'エッジデプロイ・グローバルCDN・DDoS保護',
        en: 'Edge deployment, global CDN, DDoS protection',
      },
    },
    {
      name: 'GitHub Actions',
      version: '-',
      color: '#2088FF',
      reason: {
        ja: 'CI/CD・Lighthouse CI・セキュリティスキャン',
        en: 'CI/CD, Lighthouse CI, security scanning',
      },
    },
    {
      name: 'Upstash Redis',
      version: '-',
      color: '#00E9A3',
      reason: {
        ja: 'サーバーレスRedisによるレート制限',
        en: 'Rate limiting with serverless Redis',
      },
    },
  ],
  monitoring: [
    {
      name: 'Sentry',
      version: '10.x',
      color: '#362D59',
      reason: {
        ja: 'エラー監視・Session Replay・パフォーマンス計測',
        en: 'Error monitoring, Session Replay, performance tracking',
      },
    },
    {
      name: 'Google Analytics',
      version: 'GA4',
      color: '#E37400',
      reason: {
        ja: 'アクセス解析・ユーザー行動分析',
        en: 'Traffic analytics and user behavior analysis',
      },
    },
    {
      name: 'UptimeRobot',
      version: '-',
      color: '#3BD671',
      reason: {
        ja: '24時間稼働監視・ダウンタイム通知',
        en: '24/7 uptime monitoring and downtime alerts',
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
        en: 'Code quality maintenance and best practices',
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
        ja: 'Git hooksによるコミット前チェック',
        en: 'Pre-commit checks with Git hooks',
      },
    },
    {
      name: 'CodeQL',
      version: '-',
      color: '#00A4EF',
      reason: {
        ja: '静的解析によるセキュリティ脆弱性検出',
        en: 'Security vulnerability detection with static analysis',
      },
    },
  ],
};

const categories = {
  ja: {
    frontend: 'フロントエンド',
    content: 'コンテンツ処理',
    infrastructure: 'インフラ・ホスティング',
    monitoring: '監視・分析',
    tools: '開発ツール',
  },
  en: {
    frontend: 'Frontend',
    content: 'Content Processing',
    infrastructure: 'Infrastructure & Hosting',
    monitoring: 'Monitoring & Analytics',
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
