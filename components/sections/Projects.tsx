'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { ExternalLink, Github } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { ProjectModal } from '../ProjectModal';
import { PROJECTS } from '@/lib/projects';
import type { Project } from '@/types';

type FilterCategory = 'all' | Project['category'];

const categories = [
  { id: 'all' as FilterCategory, name: 'すべて' },
  { id: 'web' as FilterCategory, name: 'Web' },
  { id: 'mobile' as FilterCategory, name: 'Mobile' },
  { id: 'design' as FilterCategory, name: 'Design' },
  { id: 'ai' as FilterCategory, name: 'AI' },
];

export function Projects() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filter, setFilter] = useState<FilterCategory>('all');

  const filteredProjects =
    filter === 'all'
      ? PROJECTS
      : PROJECTS.filter((project) => project.category === filter);

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
  };

  const handleCloseModal = () => {
    setSelectedProject(null);
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
              onClick={() => setFilter(category.id)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                filter === category.id
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg scale-105'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {category.name}
            </button>
          ))}
        </motion.div>

        {/* Projects Grid */}
        <motion.div
          key={filter}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 * index }}
              onClick={() => handleProjectClick(project)}
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
                    {project.github && (
                      <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                        <Github size={16} className="text-white" />
                      </div>
                    )}
                  </div>
                </div>

                <CardContent className="p-6">
                  <p className="text-muted-foreground text-sm mb-4">
                    {project.description}
                  </p>

                  {/* Technologies */}
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 4 && (
                      <span className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                        +{project.technologies.length - 4}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Project Modal */}
        <ProjectModal
          project={selectedProject}
          open={!!selectedProject}
          onClose={handleCloseModal}
        />

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground">
              このカテゴリーのプロジェクトはまだありません
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
