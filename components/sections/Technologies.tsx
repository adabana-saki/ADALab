'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { TECHNOLOGIES } from '@/lib/constants';
import {
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiJavascript,
  SiTailwindcss,
  SiCss3,
  SiNodedotjs,
  SiPython,
  SiFastapi,
  SiDjango,
  SiFlask,
  SiGo,
  SiRubyonrails,
  SiPostgresql,
  SiMysql,
  SiMongodb,
  SiSqlite,
  SiFirebase,
  SiFlutter,
  SiKotlin,
  SiVercel,
  SiAmazonwebservices,
  SiGooglecloud,
  SiCloudflare,
  SiDocker,
  SiKubernetes,
  SiGithubactions,
  SiTerraform,
  SiOpenai,
  SiHuggingface,
  SiPytorch,
  SiGit,
  SiFigma,
  SiNotion,
  SiLinux,
} from 'react-icons/si';
import { FaJava, FaMicrosoft } from 'react-icons/fa';
import { Code2 } from 'lucide-react';

type Category = keyof typeof TECHNOLOGIES;

// 技術名からアイコンへのマッピング
const techIcons: Record<string, React.ElementType> = {
  'React': SiReact,
  'Next.js': SiNextdotjs,
  'TypeScript': SiTypescript,
  'JavaScript': SiJavascript,
  'Tailwind CSS': SiTailwindcss,
  'CSS/SCSS': SiCss3,
  'Node.js': SiNodedotjs,
  'Python': SiPython,
  'FastAPI': SiFastapi,
  'Django': SiDjango,
  'Flask': SiFlask,
  'Go': SiGo,
  'Java': FaJava,
  'C# / .NET': FaMicrosoft,
  'Ruby on Rails': SiRubyonrails,
  'REST API': Code2,
  'Discord.js': Code2,
  'PostgreSQL': SiPostgresql,
  'MySQL': SiMysql,
  'MongoDB': SiMongodb,
  'SQLite': SiSqlite,
  'Firebase Firestore': SiFirebase,
  'React Native': SiReact,
  'Flutter': SiFlutter,
  'Kotlin / Android': SiKotlin,
  'Vercel': SiVercel,
  'AWS': SiAmazonwebservices,
  'Google Cloud': SiGooglecloud,
  'Cloudflare': SiCloudflare,
  'Docker': SiDocker,
  'Kubernetes': SiKubernetes,
  'GitHub Actions': SiGithubactions,
  'Terraform': SiTerraform,
  'OpenAI API': SiOpenai,
  'Claude API': Code2,
  'Gemini API': SiGooglecloud,
  'LangChain': Code2,
  'Hugging Face': SiHuggingface,
  'PyTorch': SiPytorch,
  'Git': SiGit,
  'Figma': SiFigma,
  'Notion': SiNotion,
  'VS Code': Code2,
  'Linux': SiLinux,
};

const categories: { id: Category; name: string }[] = [
  { id: 'frontend', name: 'Frontend' },
  { id: 'backend', name: 'Backend' },
  { id: 'database', name: 'Database' },
  { id: 'mobile', name: 'Mobile' },
  { id: 'cloud', name: 'Cloud & DevOps' },
  { id: 'ai', name: 'AI / ML' },
  { id: 'tools', name: 'Tools' },
];

export function Technologies() {
  const [activeCategory, setActiveCategory] = useState<Category>('frontend');

  return (
    <section id="technologies" className="py-20 md:py-32 bg-background relative">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px]" />

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
            Tech <span className="gradient-text">Stack</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            プロジェクトの要件に応じて最適な技術を選定し、品質とパフォーマンスを重視した開発を行っています
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-5 py-2.5 rounded-full font-medium text-sm transition-all ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/25 scale-105'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {category.name}
            </button>
          ))}
        </motion.div>

        {/* Technologies Grid */}
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex flex-wrap justify-center gap-3">
            {TECHNOLOGIES[activeCategory].map((tech, index) => {
              const Icon = techIcons[tech] || Code2;
              return (
                <motion.div
                  key={tech}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group relative"
                >
                  <div className="px-5 py-3 rounded-xl bg-gradient-to-br from-muted/80 to-muted/40 border border-border/50 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all cursor-default flex items-center gap-2">
                    <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {tech}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Tech Count */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground">
            <span className="text-primary font-semibold">
              {Object.values(TECHNOLOGIES).flat().length}+
            </span>{' '}
            の技術・ツールを活用しています
          </p>
        </motion.div>
      </div>
    </section>
  );
}
