export type Language = 'ja' | 'en';

export const translations = {
  ja: {
    nav: {
      home: 'Home',
      about: 'About',
      services: 'Services',
      technologies: 'Technologies',
      projects: 'Projects',
      process: 'Process',
      contact: 'Contact',
      getInTouch: 'お問い合わせ',
    },
    hero: {
      title: 'ADA Lab',
      subtitle: 'Crafting Digital Excellence',
      description: '最先端の技術で未来を創造する',
      viewWork: 'プロジェクトを見る',
      contact: 'お問い合わせ',
      techStack: ['React', 'Next.js', 'TypeScript', 'Node.js', 'Python'],
    },
    about: {
      title: 'About',
      titleHighlight: 'ADA Lab',
      description:
        '革新的なソフトウェアとアプリケーションを開発する個人事業です。技術への情熱と、クライアントの成功へのコミットメントを大切にしています。',
      stats: {
        projects: 'プロジェクト完了',
        experience: '年の経験',
        satisfaction: 'お客様満足度',
        support: 'サポート',
      },
      values: [
        {
          title: '最先端技術',
          description:
            '常に最新のテクノロジーをキャッチアップし、最適な技術スタックで開発します',
        },
        {
          title: '高品質な成果物',
          description:
            'コードの品質、パフォーマンス、セキュリティを重視し、長期的に価値のあるソフトウェアを提供します',
        },
        {
          title: 'クライアント第一',
          description:
            'お客様のビジネス目標の達成を最優先に、密なコミュニケーションと柔軟な対応を心がけています',
        },
        {
          title: '継続的な成長',
          description:
            '技術の進化に合わせて常に学び続け、より良いソリューションを提供できるよう努めています',
        },
      ],
    },
    footer: {
      description: '最先端の技術で革新的なソフトウェアとアプリを開発',
      rights: 'All rights reserved.',
      quickLinks: 'クイックリンク',
      services: 'サービス',
      contact: 'お問い合わせ',
    },
    ui: {
      openMenu: 'メニューを開く',
      closeMenu: 'メニューを閉じる',
    },
  },
  en: {
    nav: {
      home: 'Home',
      about: 'About',
      services: 'Services',
      technologies: 'Technologies',
      projects: 'Projects',
      process: 'Process',
      contact: 'Contact',
      getInTouch: 'Get in Touch',
    },
    hero: {
      title: 'ADA Lab',
      subtitle: 'Crafting Digital Excellence',
      description: 'Creating the future with cutting-edge technology',
      viewWork: 'View Our Work',
      contact: 'Get in Touch',
      techStack: ['React', 'Next.js', 'TypeScript', 'Node.js', 'Python'],
    },
    about: {
      title: 'About',
      titleHighlight: 'ADA Lab',
      description:
        'We are a software development business creating innovative software and applications. We value passion for technology and commitment to client success.',
      stats: {
        projects: 'Projects Completed',
        experience: 'Years Experience',
        satisfaction: 'Client Satisfaction',
        support: 'Support',
      },
      values: [
        {
          title: 'Cutting-Edge Technology',
          description:
            'Always staying up-to-date with the latest technologies and developing with the optimal tech stack',
        },
        {
          title: 'High-Quality Deliverables',
          description:
            'Focusing on code quality, performance, and security to deliver long-term valuable software',
        },
        {
          title: 'Client-First Approach',
          description:
            'Prioritizing client business goals with close communication and flexible responses',
        },
        {
          title: 'Continuous Growth',
          description:
            'Constantly learning alongside technological evolution to provide better solutions',
        },
      ],
    },
    footer: {
      description: 'Developing innovative software and apps with cutting-edge technology',
      rights: 'All rights reserved.',
      quickLinks: 'Quick Links',
      services: 'Services',
      contact: 'Contact',
    },
    ui: {
      openMenu: 'Open Menu',
      closeMenu: 'Close Menu',
    },
  },
} as const;

export type Translations = typeof translations;
