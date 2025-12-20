export type Language = 'ja' | 'en';

export interface TranslationSchema {
  nav: {
    home: string;
    about: string;
    technologies: string;
    projects: string;
    news: string;
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
      technologies: 'Technologies',
      projects: 'Products',
      news: 'News',
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
      technologies: 'Technologies',
      projects: 'Products',
      news: 'News',
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
