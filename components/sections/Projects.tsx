'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Github } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

// ダミープロジェクトデータ（後で実際のデータに置き換え可能）
const projects = [
  {
    id: '1',
    title: 'E-Commerce Platform',
    description:
      '最新のNext.js 14とStripeを使用した、モダンなECプラットフォーム。管理画面、在庫管理、決済機能を実装。',
    image: '/images/project-placeholder.jpg',
    technologies: ['Next.js', 'TypeScript', 'Stripe', 'PostgreSQL'],
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    id: '2',
    title: 'Task Management App',
    description:
      'リアルタイム同期機能を持つタスク管理アプリ。Drag & Drop、通知機能、チーム協業機能を搭載。',
    image: '/images/project-placeholder.jpg',
    technologies: ['React', 'Firebase', 'Tailwind CSS', 'Framer Motion'],
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    id: '3',
    title: 'Healthcare Dashboard',
    description:
      '医療機関向けダッシュボード。患者データの可視化、予約管理、レポート生成機能を提供。',
    image: '/images/project-placeholder.jpg',
    technologies: ['Vue.js', 'Node.js', 'MongoDB', 'Chart.js'],
    gradient: 'from-green-500 to-teal-500',
  },
  {
    id: '4',
    title: 'AI Chat Application',
    description:
      'OpenAI APIを活用したAIチャットアプリケーション。マルチモーダル対応、会話履歴管理機能付き。',
    image: '/images/project-placeholder.jpg',
    technologies: ['Next.js', 'OpenAI API', 'Vercel AI SDK', 'Prisma'],
    gradient: 'from-orange-500 to-red-500',
  },
  {
    id: '5',
    title: 'Portfolio Website',
    description:
      '3Dエフェクトとアニメーションを活用したポートフォリオサイト。CMSと連携し、コンテンツ管理が容易。',
    image: '/images/project-placeholder.jpg',
    technologies: ['Next.js', 'Three.js', 'Sanity CMS', 'GSAP'],
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    id: '6',
    title: 'Fitness Tracking App',
    description:
      'モバイルファーストのフィットネストラッキングアプリ。運動記録、栄養管理、進捗可視化機能。',
    image: '/images/project-placeholder.jpg',
    technologies: ['React Native', 'Expo', 'Supabase', 'TypeScript'],
    gradient: 'from-yellow-500 to-orange-500',
  },
];

export function Projects() {
  return (
    <section id="projects" className="py-20 md:py-32 bg-muted/20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Featured <span className="gradient-text">Projects</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            これまでに手がけたプロジェクトの一部をご紹介します
          </p>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
            >
              <Card className="h-full group hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden border-border/50 hover:border-primary/50">
                {/* Project Image Placeholder */}
                <div
                  className={`h-48 bg-gradient-to-br ${project.gradient} relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center p-4">
                      <h3 className="text-2xl font-bold mb-2">
                        {project.title}
                      </h3>
                    </div>
                  </div>
                  {/* Hover Icons */}
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                      <ExternalLink size={16} className="text-white" />
                    </div>
                    <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                      <Github size={16} className="text-white" />
                    </div>
                  </div>
                </div>

                <CardContent className="p-6">
                  <p className="text-muted-foreground text-sm mb-4">
                    {project.description}
                  </p>

                  {/* Technologies */}
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground">
            ※ 実際のプロジェクト画像とリンクは後ほど追加できます
          </p>
        </motion.div>
      </div>
    </section>
  );
}
