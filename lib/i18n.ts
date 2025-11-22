export type Language = 'ja' | 'en';

export interface TranslationSchema {
  nav: {
    home: string;
    about: string;
    services: string;
    technologies: string;
    projects: string;
    process: string;
    contact: string;
    getInTouch: string;
  };
  hero: {
    title: string;
    subtitle: string;
    description: string;
    viewWork: string;
    contact: string;
    techStack: string[];
  };
  about: {
    title: string;
    titleHighlight: string;
    description: string;
    stats: {
      projects: string;
      experience: string;
      satisfaction: string;
      support: string;
    };
    values: Array<{
      title: string;
      description: string;
    }>;
  };
  footer: {
    description: string;
    rights: string;
    quickLinks: string;
    services: string;
    contact: string;
  };
  ui: {
    openMenu: string;
    closeMenu: string;
  };
}

export const translations: Record<Language, TranslationSchema> = {
  ja: {
    nav: {
      home: 'Home',
      about: 'About',
      services: 'Services',
      technologies: 'Technologies',
      projects: 'Products',
      process: 'Process',
      contact: 'Contact',
      getInTouch: 'お問い合わせ',
    },
    hero: {
      title: 'ADA Lab',
      subtitle: 'あなたの"ほしい"を、カタチに。',
      description: 'シンプルで使いやすい、ちょうどいいアプリを',
      viewWork: 'プロダクトを見る',
      contact: 'お問い合わせ',
      techStack: ['React', 'Next.js', 'TypeScript', 'Node.js', 'Python'],
    },
    about: {
      title: 'About',
      titleHighlight: 'ADA Lab',
      description:
        '世の中の「かゆいところに手が届く」便利なアプリやサービスを開発しています。シンプルで使いやすく、本当に必要な機能だけを提供することを大切にしています。',
      stats: {
        projects: 'プロダクト開発中',
        experience: '設立',
        satisfaction: 'スピード開発',
        support: 'サポート',
      },
      values: [
        {
          title: 'シンプルさ',
          description:
            '必要な機能だけをピンポイントで提供。複雑すぎず、使いやすいプロダクトを目指します',
        },
        {
          title: 'スピード感',
          description:
            '素早い開発と迅速な対応で、アイデアをすぐにカタチにします',
        },
        {
          title: '低コスト',
          description:
            '個人開発だからこそ実現できる、リーズナブルな価格設定',
        },
        {
          title: '親しみやすさ',
          description:
            '堅苦しくない、フレンドリーなコミュニケーションを大切にしています',
        },
      ],
    },
    footer: {
      description: 'あなたの"ほしい"を、カタチに',
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
      projects: 'Products',
      process: 'Process',
      contact: 'Contact',
      getInTouch: 'Get in Touch',
    },
    hero: {
      title: 'ADA Lab',
      subtitle: 'Simple tools for everyday needs.',
      description: 'Building apps that just work',
      viewWork: 'View Products',
      contact: 'Get in Touch',
      techStack: ['React', 'Next.js', 'TypeScript', 'Node.js', 'Python'],
    },
    about: {
      title: 'About',
      titleHighlight: 'ADA Lab',
      description:
        'We develop useful apps and services that solve real everyday problems. We focus on simplicity and usability, providing only the features you actually need.',
      stats: {
        projects: 'Products in Development',
        experience: 'Founded',
        satisfaction: 'Fast Development',
        support: 'Support',
      },
      values: [
        {
          title: 'Simplicity',
          description:
            'Pinpoint solutions with just the features you need. No bloat, just usefulness',
        },
        {
          title: 'Speed',
          description:
            'Quick development and fast responses to turn ideas into reality',
        },
        {
          title: 'Affordable',
          description:
            'Reasonable pricing made possible by indie development',
        },
        {
          title: 'Friendly',
          description:
            'Casual, approachable communication without the corporate stiffness',
        },
      ],
    },
    footer: {
      description: 'Simple tools for everyday needs',
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
};
