export const SITE_CONFIG = {
  name: 'ADA Lab',
  description:
    'ADA Labは、自分が困ったものを自分のために作っている個人開発です。集中管理アプリ「adalab focus」を中心にツールを公開しています。',
  url: 'https://adalabtech.com',
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
