'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Github, ChevronDown, Check } from 'lucide-react';
import { FaDiscord } from 'react-icons/fa';
import { Card, CardContent } from '../ui/card';
import { PROJECTS } from '@/lib/projects';
import type { Project } from '@/types';

export function Projects() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

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
            Our <span className="gradient-text">Products</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            私たちが開発・運営している革新的なプロダクトをご紹介します
          </p>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {PROJECTS.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
            >
              <Card className="h-full overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300">
                {/* Project Header - Always Visible */}
                <div
                  className={`h-48 bg-gradient-to-br ${project.gradient} relative overflow-hidden cursor-pointer`}
                  onClick={() => toggleExpand(project.id)}
                >
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center p-4">
                      <h3 className="text-2xl font-bold mb-2">
                        {project.title}
                      </h3>
                      <span className="px-3 py-1 bg-yellow-500/90 text-black text-xs font-bold rounded-full">
                        Coming Soon
                      </span>
                    </div>
                  </div>
                  {/* Action Icons */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    {project.id === '1' && (
                      <a
                        href="https://discord.com/oauth2/authorize?client_id=1288117077237248072"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/40 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FaDiscord size={16} className="text-white" />
                      </a>
                    )}
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/40 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Github size={16} className="text-white" />
                      </a>
                    )}
                  </div>
                  {/* Expand Indicator */}
                  <motion.div
                    className="absolute bottom-4 left-1/2 -translate-x-1/2"
                    animate={{ rotate: expandedId === project.id ? 180 : 0 }}
                  >
                    <ChevronDown size={24} className="text-white/70" />
                  </motion.div>
                </div>

                <CardContent className="p-6">
                  <p className="text-muted-foreground text-sm mb-4">
                    {project.description}
                  </p>

                  {/* Technologies */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Expandable Details */}
                  <AnimatePresence>
                    {expandedId === project.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 border-t border-border/50">
                          {/* Long Description */}
                          <p className="text-sm text-muted-foreground mb-4">
                            {project.longDescription}
                          </p>

                          {/* Features */}
                          {project.features && project.features.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold mb-2">主な機能</h4>
                              <ul className="grid grid-cols-2 gap-2">
                                {project.features.map((feature) => (
                                  <li key={feature} className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Check size={12} className="text-primary flex-shrink-0" />
                                    {feature}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Challenges */}
                          {project.challenges && project.challenges.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold mb-2">技術的チャレンジ</h4>
                              <ul className="space-y-1">
                                {project.challenges.map((challenge) => (
                                  <li key={challenge} className="text-xs text-muted-foreground">
                                    • {challenge}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
