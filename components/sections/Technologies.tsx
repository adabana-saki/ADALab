'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { TECHNOLOGIES } from '@/lib/constants';

type Category = 'frontend' | 'backend' | 'mobile' | 'cloud';

const categories = [
  { id: 'frontend' as Category, name: 'Frontend' },
  { id: 'backend' as Category, name: 'Backend' },
  { id: 'mobile' as Category, name: 'Mobile' },
  { id: 'cloud' as Category, name: 'Cloud & DevOps' },
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
            常に最新の技術をキャッチアップし、最適なツールで開発を行っています
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg scale-105'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {category.name}
            </button>
          ))}
        </motion.div>

        {/* Technologies List */}
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <div className="grid gap-4">
            {TECHNOLOGIES[activeCategory].map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="glass p-6 rounded-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-semibold">{tech.name}</h3>
                  <span className="text-sm font-mono text-muted-foreground">
                    {tech.level}%
                  </span>
                </div>
                {/* Progress Bar */}
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${tech.level}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: index * 0.05 + 0.2 }}
                    className="h-full bg-gradient-to-r from-primary via-secondary to-accent rounded-full"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground">
            その他にも、プロジェクトに応じて様々な技術・ツールを活用しています
          </p>
        </motion.div>
      </div>
    </section>
  );
}
