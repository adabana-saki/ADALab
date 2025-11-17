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
  image: string;
  technologies: string[];
  link?: string;
  github?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  projectType: string;
  message: string;
}
