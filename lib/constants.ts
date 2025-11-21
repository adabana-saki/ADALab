export const SITE_CONFIG = {
  name: 'ADA Lab',
  description:
    'ADA Labは、シンプルで使いやすいアプリを開発する個人開発チームです。',
  url: 'https://adalab.dev',
  email: 'info.adalabtech@gmail.com',
} as const;

export const TECHNOLOGIES = {
  frontend: [
    { name: 'React', level: 90 },
    { name: 'Next.js', level: 90 },
    { name: 'TypeScript', level: 85 },
    { name: 'Tailwind CSS', level: 90 },
    { name: 'Framer Motion', level: 80 },
  ],
  backend: [
    { name: 'Node.js', level: 85 },
    { name: 'Python', level: 80 },
    { name: 'Discord.js', level: 90 },
    { name: 'MongoDB', level: 80 },
    { name: 'PostgreSQL', level: 75 },
  ],
  mobile: [
    { name: 'React Native', level: 80 },
    { name: 'Expo', level: 85 },
  ],
  cloud: [
    { name: 'Vercel', level: 90 },
    { name: 'Google Cloud', level: 75 },
    { name: 'Docker', level: 70 },
  ],
} as const;

// Note: Services and Process are no longer used as those sections were removed
