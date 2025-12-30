export interface TypingWord {
  text: string;
  reading?: string; // 日本語の場合のローマ字読み
}

// 英語単語（難易度別）
export const englishWords = {
  easy: [
    'cat', 'dog', 'sun', 'run', 'fun', 'red', 'blue', 'tree', 'book', 'fish',
    'bird', 'rain', 'snow', 'wind', 'fire', 'moon', 'star', 'lake', 'hill', 'road',
    'home', 'food', 'milk', 'cake', 'ball', 'game', 'play', 'jump', 'walk', 'talk',
    'hand', 'foot', 'head', 'face', 'eyes', 'nose', 'ears', 'door', 'room', 'desk',
    'time', 'week', 'year', 'love', 'hope', 'help', 'work', 'rest', 'sing', 'song',
  ],
  medium: [
    'apple', 'water', 'bread', 'music', 'happy', 'smile', 'phone', 'table', 'chair', 'window',
    'garden', 'flower', 'summer', 'winter', 'spring', 'autumn', 'bridge', 'river', 'forest', 'island',
    'coffee', 'orange', 'banana', 'potato', 'tomato', 'cheese', 'butter', 'sugar', 'honey', 'paper',
    'pencil', 'eraser', 'school', 'teacher', 'student', 'library', 'office', 'market', 'station', 'airport',
    'family', 'friend', 'mother', 'father', 'sister', 'brother', 'cousin', 'uncle', 'dinner', 'breakfast',
  ],
  hard: [
    'beautiful', 'wonderful', 'important', 'different', 'difficult', 'dangerous', 'adventure', 'celebrate', 'chocolate', 'delicious',
    'education', 'experience', 'fantastic', 'government', 'happiness', 'incredible', 'knowledge', 'mysterious', 'necessary', 'opportunity',
    'particular', 'photograph', 'president', 'professor', 'restaurant', 'successful', 'technology', 'temperature', 'understand', 'university',
    'vocabulary', 'yesterday', 'accomplish', 'atmosphere', 'basketball', 'comfortable', 'competition', 'communicate', 'congratulate', 'conversation',
    'development', 'environment', 'explanation', 'imagination', 'independent', 'information', 'interesting', 'international', 'organization', 'relationship',
  ],
};

// 日本語単語（ひらがな → ローマ字）
export const japaneseWords = {
  easy: [
    { text: 'ねこ', reading: 'neko' },
    { text: 'いぬ', reading: 'inu' },
    { text: 'そら', reading: 'sora' },
    { text: 'うみ', reading: 'umi' },
    { text: 'やま', reading: 'yama' },
    { text: 'かわ', reading: 'kawa' },
    { text: 'はな', reading: 'hana' },
    { text: 'ほし', reading: 'hoshi' },
    { text: 'つき', reading: 'tsuki' },
    { text: 'ひ', reading: 'hi' },
    { text: 'みず', reading: 'mizu' },
    { text: 'くも', reading: 'kumo' },
    { text: 'かぜ', reading: 'kaze' },
    { text: 'あめ', reading: 'ame' },
    { text: 'ゆき', reading: 'yuki' },
    { text: 'さくら', reading: 'sakura' },
    { text: 'りんご', reading: 'ringo' },
    { text: 'みかん', reading: 'mikan' },
    { text: 'ごはん', reading: 'gohan' },
    { text: 'おちゃ', reading: 'ocha' },
    { text: 'パン', reading: 'pan' },
    { text: 'いえ', reading: 'ie' },
    { text: 'まち', reading: 'machi' },
    { text: 'くるま', reading: 'kuruma' },
    { text: 'でんしゃ', reading: 'densha' },
    { text: 'えき', reading: 'eki' },
    { text: 'ほん', reading: 'hon' },
    { text: 'えんぴつ', reading: 'enpitsu' },
    { text: 'かみ', reading: 'kami' },
    { text: 'つくえ', reading: 'tsukue' },
  ],
  medium: [
    { text: 'コンピュータ', reading: 'konpyuuta' },
    { text: 'インターネット', reading: 'intaanetto' },
    { text: 'プログラム', reading: 'puroguramu' },
    { text: 'キーボード', reading: 'kiiboodo' },
    { text: 'マウス', reading: 'mausu' },
    { text: 'スマートフォン', reading: 'sumaatofon' },
    { text: 'アプリケーション', reading: 'apurikeeshon' },
    { text: 'ダウンロード', reading: 'daunroodo' },
    { text: 'アップロード', reading: 'appuroodo' },
    { text: 'パスワード', reading: 'pasuwaado' },
    { text: 'データベース', reading: 'deetabeesu' },
    { text: 'サーバー', reading: 'saabaa' },
    { text: 'ネットワーク', reading: 'nettowaaku' },
    { text: 'セキュリティ', reading: 'sekyuriti' },
    { text: 'ソフトウェア', reading: 'sofutowea' },
    { text: 'ハードウェア', reading: 'haadowea' },
    { text: 'オペレーティング', reading: 'opereetingu' },
    { text: 'システム', reading: 'shisutemu' },
    { text: 'メモリ', reading: 'memori' },
    { text: 'ストレージ', reading: 'sutooreeji' },
  ],
  hard: [
    { text: 'アルゴリズム', reading: 'arugorizumu' },
    { text: 'フレームワーク', reading: 'fureemuwaaku' },
    { text: 'オブジェクト指向', reading: 'obujiekutoshikou' },
    { text: 'リファクタリング', reading: 'rifakutaringu' },
    { text: 'デバッグ', reading: 'debaggu' },
    { text: 'コンパイラ', reading: 'konpaira' },
    { text: 'インタプリタ', reading: 'intapurita' },
    { text: 'バージョン管理', reading: 'baajonkanri' },
    { text: 'プルリクエスト', reading: 'pururikuesuto' },
    { text: 'マージコンフリクト', reading: 'maajikonhurikuto' },
    { text: 'タイプスクリプト', reading: 'taipusukuriputo' },
    { text: 'ジャバスクリプト', reading: 'jabasukuriputo' },
    { text: 'コンポーネント', reading: 'konpoonento' },
    { text: 'レスポンシブ', reading: 'resuponshibu' },
    { text: 'パフォーマンス', reading: 'pafoomansu' },
  ],
};

// プログラミング用語（英語）
export const programmingWords = [
  'function', 'variable', 'constant', 'array', 'object', 'string', 'number', 'boolean',
  'interface', 'class', 'method', 'property', 'argument', 'parameter', 'return', 'async',
  'await', 'promise', 'callback', 'closure', 'scope', 'hoisting', 'prototype', 'inheritance',
  'component', 'props', 'state', 'effect', 'hook', 'context', 'reducer', 'dispatch',
  'import', 'export', 'module', 'package', 'dependency', 'middleware', 'router', 'endpoint',
  'database', 'query', 'mutation', 'schema', 'migration', 'index', 'primary', 'foreign',
  'algorithm', 'iteration', 'recursion', 'binary', 'linear', 'hash', 'tree', 'graph',
  'frontend', 'backend', 'fullstack', 'deployment', 'container', 'kubernetes', 'docker', 'nginx',
];

export type Language = 'en' | 'ja';
export type Difficulty = 'easy' | 'medium' | 'hard';

export function getWords(language: Language, difficulty: Difficulty): TypingWord[] {
  if (language === 'ja') {
    return japaneseWords[difficulty];
  }
  return englishWords[difficulty].map((text) => ({ text }));
}

export function getProgrammingWords(): TypingWord[] {
  return programmingWords.map((text) => ({ text }));
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
