'use client';

import { ExternalLink, Github, Calendar, Users, Briefcase, CheckCircle2, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogBody } from './ui/dialog';
import { Button } from './ui/button';
import type { Project } from '@/types';

interface ProjectModalProps {
  project: Project | null;
  open: boolean;
  onClose: () => void;
}

export function ProjectModal({ project, open, onClose }: ProjectModalProps) {
  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent onClose={onClose}>
        {/* Header Image */}
        <div className={`h-64 bg-gradient-to-br ${project.gradient} relative`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-4xl font-bold text-white text-center px-4">
              {project.title}
            </h1>
          </div>
        </div>

        <DialogHeader>
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
        </DialogHeader>

        <DialogBody>
          {/* Project Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {project.duration && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={16} className="text-primary" />
                <span className="text-muted-foreground">{project.duration}</span>
              </div>
            )}
            {project.teamSize && (
              <div className="flex items-center gap-2 text-sm">
                <Users size={16} className="text-primary" />
                <span className="text-muted-foreground">{project.teamSize}</span>
              </div>
            )}
            {project.role && (
              <div className="flex items-center gap-2 text-sm">
                <Briefcase size={16} className="text-primary" />
                <span className="text-muted-foreground">{project.role}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">概要</h3>
            <p className="text-muted-foreground leading-relaxed">
              {project.longDescription || project.description}
            </p>
          </div>

          {/* Features */}
          {project.features && project.features.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">主な機能</h3>
              <ul className="grid md:grid-cols-2 gap-2">
                {project.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-primary mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Challenges */}
          {project.challenges && project.challenges.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">技術的な課題</h3>
              <ul className="space-y-2">
                {project.challenges.map((challenge, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground text-sm">{challenge}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Results */}
          {project.results && project.results.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <TrendingUp size={20} className="text-primary" />
                成果
              </h3>
              <ul className="space-y-2">
                {project.results.map((result, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground text-sm font-medium">{result}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Links */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
            {project.demoUrl && (
              <Button asChild variant="default">
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink size={16} />
                  デモを見る
                </a>
              </Button>
            )}
            {project.github && (
              <Button asChild variant="outline">
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Github size={16} />
                  GitHub
                </a>
              </Button>
            )}
            {project.link && (
              <Button asChild variant="outline">
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink size={16} />
                  サイトを見る
                </a>
              </Button>
            )}
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
