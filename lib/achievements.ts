export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
  progress?: number;
  maxProgress?: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-visit',
    title: 'First Visit',
    description: '初めてADA Labへようこそ！',
    icon: '👋',
    unlocked: false,
  },
  {
    id: 'konami-master',
    title: 'Konami Master',
    description: '伝説のコマンドを発動',
    icon: '🎮',
    unlocked: false,
  },
  {
    id: 'speed-demon',
    title: 'Speed Demon',
    description: '10秒以内に全セクション到達',
    icon: '⚡',
    unlocked: false,
  },
  {
    id: 'explorer',
    title: 'Explorer',
    description: '全セクションを訪問',
    icon: '🗺️',
    unlocked: false,
    progress: 0,
    maxProgress: 9,
  },
  {
    id: '3d-enthusiast',
    title: '3D Enthusiast',
    description: '3Dロゴを10秒以上注視',
    icon: '🎨',
    unlocked: false,
    progress: 0,
    maxProgress: 10,
  },
  {
    id: 'sound-master',
    title: 'Sound Master',
    description: 'サウンドを5回切り替え',
    icon: '🔊',
    unlocked: false,
    progress: 0,
    maxProgress: 5,
  },
  {
    id: 'metrics-watcher',
    title: 'Metrics Watcher',
    description: 'メトリクスパネルを開く',
    icon: '📊',
    unlocked: false,
  },
  {
    id: 'night-owl',
    title: 'Night Owl',
    description: '深夜2-5時に訪問',
    icon: '🦉',
    unlocked: false,
  },
  {
    id: 'particle-clicker',
    title: 'Particle Clicker',
    description: '50回クリック',
    icon: '💥',
    unlocked: false,
    progress: 0,
    maxProgress: 50,
  },
  {
    id: 'scroll-champion',
    title: 'Scroll Champion',
    description: '合計10,000pxスクロール',
    icon: '📜',
    unlocked: false,
    progress: 0,
    maxProgress: 10000,
  },
  {
    id: 'tech-stack-fan',
    title: 'Tech Stack Fan',
    description: '技術スタックを全てホバー',
    icon: '💻',
    unlocked: false,
    progress: 0,
    maxProgress: 5,
  },
  {
    id: 'form-filler',
    title: 'Form Filler',
    description: 'コンタクトフォーム送信',
    icon: '📝',
    unlocked: false,
  },
  {
    id: 'social-butterfly',
    title: 'Social Butterfly',
    description: 'SNSリンク全てクリック',
    icon: '🦋',
    unlocked: false,
    progress: 0,
    maxProgress: 4,
  },
  {
    id: 'easter-hunter',
    title: 'Easter Hunter',
    description: '隠しエリアを発見',
    icon: '🥚',
    unlocked: false,
  },
  {
    id: 'ultimate-user',
    title: 'Ultimate User',
    description: '全実績コンプリート',
    icon: '👑',
    unlocked: false,
    progress: 0,
    maxProgress: 14,
  },
];

export const getAchievements = (): Achievement[] => {
  if (typeof window === 'undefined') return ACHIEVEMENTS;

  const stored = localStorage.getItem('achievements');
  if (!stored) return ACHIEVEMENTS;

  try {
    return JSON.parse(stored);
  } catch {
    return ACHIEVEMENTS;
  }
};

export const saveAchievements = (achievements: Achievement[]) => {
  localStorage.setItem('achievements', JSON.stringify(achievements));
};

export const unlockAchievement = (id: string): Achievement | null => {
  const achievements = getAchievements();
  const achievement = achievements.find((a) => a.id === id);

  if (!achievement || achievement.unlocked) return null;

  achievement.unlocked = true;
  achievement.unlockedAt = Date.now();

  // Check for ultimate user
  const unlockedCount = achievements.filter((a) => a.unlocked && a.id !== 'ultimate-user').length;
  if (unlockedCount === 14) {
    const ultimate = achievements.find((a) => a.id === 'ultimate-user');
    if (ultimate && !ultimate.unlocked) {
      ultimate.unlocked = true;
      ultimate.unlockedAt = Date.now();
    }
  }

  saveAchievements(achievements);
  return achievement;
};

export const updateAchievementProgress = (id: string, progress: number): Achievement | null => {
  const achievements = getAchievements();
  const achievement = achievements.find((a) => a.id === id);

  if (!achievement || achievement.unlocked) return null;

  achievement.progress = progress;

  // Auto-unlock if progress reaches max
  if (achievement.maxProgress && progress >= achievement.maxProgress) {
    achievement.unlocked = true;
    achievement.unlockedAt = Date.now();
  }

  saveAchievements(achievements);
  return achievement.unlocked ? achievement : null;
};

export const getUnlockedCount = (): number => {
  return getAchievements().filter((a) => a.unlocked).length;
};

export const getCompletionPercentage = (): number => {
  const achievements = getAchievements();
  const unlocked = achievements.filter((a) => a.unlocked).length;
  return Math.round((unlocked / achievements.length) * 100);
};
