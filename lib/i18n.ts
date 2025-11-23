export type Language = 'ja' | 'en';

export interface TranslationSchema {
  nav: {
    home: string;
    about: string;
    services: string;
    technologies: string;
    projects: string;
    news: string;
    process: string;
    contact: string;
    getInTouch: string;
  };
  hero: {
    viewWork: string;
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
      news: 'News',
      process: 'Process',
      contact: 'Contact',
      getInTouch: 'お問い合わせ',
    },
    hero: {
      viewWork: 'プロダクトを見る',
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
      news: 'News',
      process: 'Process',
      contact: 'Contact',
      getInTouch: 'Get in Touch',
    },
    hero: {
      viewWork: 'View Products',
    },
    ui: {
      openMenu: 'Open Menu',
      closeMenu: 'Close Menu',
    },
  },
};
