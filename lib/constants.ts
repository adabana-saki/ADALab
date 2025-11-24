export const SITE_CONFIG = {
  name: 'ADA Lab',
  description:
    'ADA Labは、シンプルで使いやすいアプリを開発する個人開発チームです。',
  url: 'https://adalab.pages.dev',
  email: 'info.adalabtech@gmail.com',
} as const;

export const TECHNOLOGIES = {
  frontend: [
    'React',
    'Next.js',
    'TypeScript',
    'JavaScript',
    'Tailwind CSS',
    'CSS/SCSS',
  ],
  backend: [
    'Node.js',
    'Python',
    'FastAPI',
    'Django',
    'Flask',
    'Go',
    'Java',
    'C# / .NET',
    'Ruby on Rails',
    'REST API',
    'Discord.js',
  ],
  database: [
    'PostgreSQL',
    'MySQL',
    'MongoDB',
    'SQLite',
    'Firebase Firestore',
  ],
  mobile: [
    'React Native',
    'Flutter',
    'Kotlin / Android',
  ],
  cloud: [
    'Vercel',
    'AWS',
    'Google Cloud',
    'Cloudflare',
    'Docker',
    'Kubernetes',
    'GitHub Actions',
    'Terraform',
  ],
  ai: [
    'OpenAI API',
    'Claude API',
    'Gemini API',
    'LangChain',
    'Hugging Face',
    'PyTorch',
  ],
  tools: [
    'Git',
    'Figma',
    'Notion',
    'VS Code',
    'Linux',
  ],
} as const;

// Note: Services and Process are no longer used as those sections were removed
