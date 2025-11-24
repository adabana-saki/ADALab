export interface Service {
  title: string;
  description: string;
  icon: string;
}

export interface Technology {
  name: string;
  level: number;
}

export interface ProcessStep {
  number: number;
  title: string;
  description: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  category: 'web' | 'mobile' | 'design' | 'ai';
  image: string;
  images?: string[];
  technologies: string[];
  features?: string[];
  link?: string;
  github?: string;
  demoUrl?: string;
  duration?: string;
  teamSize?: string;
  role?: string;
  challenges?: string[];
  results?: string[];
  gradient: string;
  detailPath?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  projectType: string;
  message: string;
}
