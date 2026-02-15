/**
 * タイピングゲーム用文章データ
 * 英語・日本語の文章をカテゴリ別に収録
 */

export type SentenceLanguage = 'en' | 'ja';
export type SentenceCategory = 'quotes' | 'proverb' | 'daily' | 'programming' | 'literature';
export type SentenceDifficulty = 'easy' | 'normal' | 'hard';

export interface TypingSentence {
  text: string;
  hiragana?: string; // 日本語のひらがな読み（ローマ字変換用）
  reading?: string; // 日本語のローマ字読み（後方互換性・フォールバック用）
  language: SentenceLanguage;
  category: SentenceCategory;
  difficulty: SentenceDifficulty;
  source?: string;
}

// 難易度判定（文字数ベース）
function getDifficulty(text: string): SentenceDifficulty {
  const len = text.length;
  if (len <= 30) return 'easy';
  if (len <= 60) return 'normal';
  return 'hard';
}

// ===== 英語名言 =====
const ENGLISH_QUOTES: TypingSentence[] = [
  // Easy (30文字以下)
  { text: 'Stay hungry, stay foolish.', language: 'en', category: 'quotes', difficulty: 'easy', source: 'Steve Jobs' },
  { text: 'Less is more.', language: 'en', category: 'quotes', difficulty: 'easy', source: 'Mies van der Rohe' },
  { text: 'Just do it.', language: 'en', category: 'quotes', difficulty: 'easy', source: 'Nike' },
  { text: 'Think different.', language: 'en', category: 'quotes', difficulty: 'easy', source: 'Apple' },
  { text: 'Be the change you wish to see.', language: 'en', category: 'quotes', difficulty: 'easy', source: 'Gandhi' },
  { text: 'Knowledge is power.', language: 'en', category: 'quotes', difficulty: 'easy', source: 'Francis Bacon' },
  { text: 'Time is money.', language: 'en', category: 'quotes', difficulty: 'easy', source: 'Benjamin Franklin' },
  { text: 'Actions speak louder than words.', language: 'en', category: 'quotes', difficulty: 'easy', source: 'Proverb' },
  { text: 'Simplicity is the ultimate sophistication.', language: 'en', category: 'quotes', difficulty: 'normal', source: 'Leonardo da Vinci' },
  { text: 'Innovation distinguishes between a leader and a follower.', language: 'en', category: 'quotes', difficulty: 'normal', source: 'Steve Jobs' },

  // Normal (31-60文字)
  { text: 'The only way to do great work is to love what you do.', language: 'en', category: 'quotes', difficulty: 'normal', source: 'Steve Jobs' },
  { text: 'In the middle of difficulty lies opportunity.', language: 'en', category: 'quotes', difficulty: 'normal', source: 'Albert Einstein' },
  { text: 'The best way to predict the future is to create it.', language: 'en', category: 'quotes', difficulty: 'normal', source: 'Peter Drucker' },
  { text: 'Success is not final, failure is not fatal.', language: 'en', category: 'quotes', difficulty: 'normal', source: 'Winston Churchill' },
  { text: 'Be yourself, everyone else is already taken.', language: 'en', category: 'quotes', difficulty: 'normal', source: 'Oscar Wilde' },
  { text: 'The journey of a thousand miles begins with one step.', language: 'en', category: 'quotes', difficulty: 'normal', source: 'Lao Tzu' },
  { text: 'Quality is not an act, it is a habit.', language: 'en', category: 'quotes', difficulty: 'normal', source: 'Aristotle' },
  { text: 'Dream big and dare to fail.', language: 'en', category: 'quotes', difficulty: 'easy', source: 'Norman Vaughan' },
  { text: 'What we think, we become.', language: 'en', category: 'quotes', difficulty: 'easy', source: 'Buddha' },
  { text: 'Everything you can imagine is real.', language: 'en', category: 'quotes', difficulty: 'normal', source: 'Pablo Picasso' },

  // Hard (61文字以上)
  { text: 'The only thing we have to fear is fear itself.', language: 'en', category: 'quotes', difficulty: 'normal', source: 'Franklin D. Roosevelt' },
  { text: 'It is during our darkest moments that we must focus to see the light.', language: 'en', category: 'quotes', difficulty: 'hard', source: 'Aristotle' },
  { text: 'The greatest glory in living lies not in never falling, but in rising every time we fall.', language: 'en', category: 'quotes', difficulty: 'hard', source: 'Nelson Mandela' },
  { text: 'Life is what happens when you are busy making other plans.', language: 'en', category: 'quotes', difficulty: 'hard', source: 'John Lennon' },
  { text: 'You must be the change you wish to see in the world.', language: 'en', category: 'quotes', difficulty: 'normal', source: 'Mahatma Gandhi' },
];

// ===== 英語日常フレーズ =====
const ENGLISH_DAILY: TypingSentence[] = [
  { text: 'Good morning, how are you today?', language: 'en', category: 'daily', difficulty: 'normal' },
  { text: 'Thank you for your help.', language: 'en', category: 'daily', difficulty: 'easy' },
  { text: 'Nice to meet you.', language: 'en', category: 'daily', difficulty: 'easy' },
  { text: 'Have a great day!', language: 'en', category: 'daily', difficulty: 'easy' },
  { text: 'See you later.', language: 'en', category: 'daily', difficulty: 'easy' },
  { text: 'Could you please help me with this?', language: 'en', category: 'daily', difficulty: 'normal' },
  { text: 'I appreciate your time and effort.', language: 'en', category: 'daily', difficulty: 'normal' },
  { text: 'What time does the meeting start?', language: 'en', category: 'daily', difficulty: 'normal' },
  { text: 'Let me know if you have any questions.', language: 'en', category: 'daily', difficulty: 'normal' },
  { text: 'I will get back to you as soon as possible.', language: 'en', category: 'daily', difficulty: 'normal' },
  { text: 'Please feel free to contact me anytime.', language: 'en', category: 'daily', difficulty: 'normal' },
  { text: 'It was a pleasure meeting you today.', language: 'en', category: 'daily', difficulty: 'normal' },
  { text: 'I look forward to hearing from you.', language: 'en', category: 'daily', difficulty: 'normal' },
  { text: 'Thank you for your understanding.', language: 'en', category: 'daily', difficulty: 'normal' },
  { text: 'I hope this email finds you well.', language: 'en', category: 'daily', difficulty: 'normal' },
];

// ===== プログラミング関連 =====
const ENGLISH_PROGRAMMING: TypingSentence[] = [
  { text: 'Hello, World!', language: 'en', category: 'programming', difficulty: 'easy' },
  { text: 'const result = await fetchData();', language: 'en', category: 'programming', difficulty: 'normal' },
  { text: 'function calculateSum(a, b) { return a + b; }', language: 'en', category: 'programming', difficulty: 'normal' },
  { text: 'if (condition) { doSomething(); }', language: 'en', category: 'programming', difficulty: 'normal' },
  { text: 'for (let i = 0; i < array.length; i++) {}', language: 'en', category: 'programming', difficulty: 'normal' },
  { text: 'const [state, setState] = useState(null);', language: 'en', category: 'programming', difficulty: 'normal' },
  { text: 'import React from "react";', language: 'en', category: 'programming', difficulty: 'easy' },
  { text: 'export default function App() {}', language: 'en', category: 'programming', difficulty: 'normal' },
  { text: 'console.log("Debug message");', language: 'en', category: 'programming', difficulty: 'easy' },
  { text: 'npm install package-name --save', language: 'en', category: 'programming', difficulty: 'normal' },
  { text: 'git commit -m "Initial commit"', language: 'en', category: 'programming', difficulty: 'normal' },
  { text: 'docker build -t myapp .', language: 'en', category: 'programming', difficulty: 'easy' },
  { text: 'SELECT * FROM users WHERE id = 1;', language: 'en', category: 'programming', difficulty: 'normal' },
  { text: 'async function getData() { return fetch(url); }', language: 'en', category: 'programming', difficulty: 'normal' },
  { text: 'interface User { id: number; name: string; }', language: 'en', category: 'programming', difficulty: 'normal' },
];

// ===== 日本語ことわざ =====
const JAPANESE_PROVERBS: TypingSentence[] = [
  // Easy
  { text: '七転び八起き', hiragana: 'ななころびやおき', reading: 'nanakorobiyaoki', language: 'ja', category: 'proverb', difficulty: 'easy' },
  { text: '一期一会', hiragana: 'いちごいちえ', reading: 'ichigoichie', language: 'ja', category: 'proverb', difficulty: 'easy' },
  { text: '花より団子', hiragana: 'はなよりだんご', reading: 'hanayoridango', language: 'ja', category: 'proverb', difficulty: 'easy' },
  { text: '猿も木から落ちる', hiragana: 'さるもきからおちる', reading: 'sarumokikaraochiru', language: 'ja', category: 'proverb', difficulty: 'easy' },
  { text: '塵も積もれば山となる', hiragana: 'ちりもつもればやまとなる', reading: 'chirimotsumorebayamatonaru', language: 'ja', category: 'proverb', difficulty: 'normal' },
  { text: '石の上にも三年', hiragana: 'いしのうえにもさんねん', reading: 'ishinouenimosannen', language: 'ja', category: 'proverb', difficulty: 'easy' },
  { text: '井の中の蛙大海を知らず', hiragana: 'いのなかのかわずたいかいをしらず', reading: 'inonakanokawazutaikaiwoshirazu', language: 'ja', category: 'proverb', difficulty: 'normal' },
  { text: '継続は力なり', hiragana: 'けいぞくはちからなり', reading: 'keizokuwachikaranari', language: 'ja', category: 'proverb', difficulty: 'easy' },
  { text: '百聞は一見に如かず', hiragana: 'ひゃくぶんはいっけんにしかず', reading: 'hyakubunwaikkennnishikazu', language: 'ja', category: 'proverb', difficulty: 'normal' },
  { text: '急がば回れ', hiragana: 'いそがばまわれ', reading: 'isogabamaware', language: 'ja', category: 'proverb', difficulty: 'easy' },
  { text: '初心忘るべからず', hiragana: 'しょしんわするべからず', reading: 'shoshinwasurubekarazu', language: 'ja', category: 'proverb', difficulty: 'easy' },
  { text: '案ずるより産むが易し', hiragana: 'あんずるよりうむがやすし', reading: 'anzuruyoriumugayasushi', language: 'ja', category: 'proverb', difficulty: 'normal' },
  { text: '雨降って地固まる', hiragana: 'あめふってじかたまる', reading: 'amefuttejikatamaru', language: 'ja', category: 'proverb', difficulty: 'easy' },
  { text: '失敗は成功のもと', hiragana: 'しっぱいはせいこうのもと', reading: 'shippaiwaseikounomoto', language: 'ja', category: 'proverb', difficulty: 'easy' },
  { text: '笑う門には福来る', hiragana: 'わらうかどにはふくきたる', reading: 'waraukadoniwafukukitaru', language: 'ja', category: 'proverb', difficulty: 'easy' },
  { text: '時は金なり', hiragana: 'ときはかねなり', reading: 'tokiwakanenari', language: 'ja', category: 'proverb', difficulty: 'easy' },
  { text: '習うより慣れろ', hiragana: 'ならうよりなれろ', reading: 'narauyorinarero', language: 'ja', category: 'proverb', difficulty: 'easy' },
  { text: '能ある鷹は爪を隠す', hiragana: 'のうあるたかはつめをかくす', reading: 'nouarutakawatsumewokakusu', language: 'ja', category: 'proverb', difficulty: 'normal' },
  { text: '鉄は熱いうちに打て', hiragana: 'てつはあついうちにうて', reading: 'tetsuwaatsuiuchiniute', language: 'ja', category: 'proverb', difficulty: 'easy' },
  { text: '転ばぬ先の杖', hiragana: 'ころばぬさきのつえ', reading: 'korobanusakinotsue', language: 'ja', category: 'proverb', difficulty: 'easy' },
];

// ===== 日本語日常フレーズ =====
const JAPANESE_DAILY: TypingSentence[] = [
  { text: 'おはようございます', reading: 'ohayougozaimasu', language: 'ja', category: 'daily', difficulty: 'easy' },
  { text: 'こんにちは', reading: 'konnnichiwa', language: 'ja', category: 'daily', difficulty: 'easy' },
  { text: 'こんばんは', reading: 'konnbannwa', language: 'ja', category: 'daily', difficulty: 'easy' },
  { text: 'ありがとうございます', reading: 'arigatougozaimasu', language: 'ja', category: 'daily', difficulty: 'easy' },
  { text: 'よろしくおねがいします', reading: 'yoroshikuonegaishimasu', language: 'ja', category: 'daily', difficulty: 'normal' },
  { text: 'おつかれさまでした', reading: 'otsukaresamadeshita', language: 'ja', category: 'daily', difficulty: 'easy' },
  { text: 'いただきます', reading: 'itadakimasu', language: 'ja', category: 'daily', difficulty: 'easy' },
  { text: 'ごちそうさまでした', reading: 'gochisousamadeshita', language: 'ja', category: 'daily', difficulty: 'easy' },
  { text: 'すみません', reading: 'sumimasenn', language: 'ja', category: 'daily', difficulty: 'easy' },
  { text: 'ごめんなさい', reading: 'gomennnasai', language: 'ja', category: 'daily', difficulty: 'easy' },
  { text: 'おやすみなさい', reading: 'oyasuminasai', language: 'ja', category: 'daily', difficulty: 'easy' },
  { text: 'いってきます', reading: 'ittekimasu', language: 'ja', category: 'daily', difficulty: 'easy' },
  { text: 'ただいま', reading: 'tadaima', language: 'ja', category: 'daily', difficulty: 'easy' },
  { text: 'おかえりなさい', reading: 'okaerinasai', language: 'ja', category: 'daily', difficulty: 'easy' },
  { text: 'お元気ですか', hiragana: 'おげんきですか', reading: 'ogennkidesuka', language: 'ja', category: 'daily', difficulty: 'easy' },
  { text: '今日はいい天気ですね', hiragana: 'きょうはいいてんきですね', reading: 'kyouhaiitennnkidesune', language: 'ja', category: 'daily', difficulty: 'normal' },
  { text: 'お会いできてうれしいです', hiragana: 'おあいできてうれしいです', reading: 'oaidekiteureshiidesu', language: 'ja', category: 'daily', difficulty: 'normal' },
  { text: 'お手伝いしましょうか', hiragana: 'おてつだいしましょうか', reading: 'otetsudaishimashouka', language: 'ja', category: 'daily', difficulty: 'normal' },
  { text: 'どうぞよろしくおねがいします', reading: 'douzoyoroshikuonegaishimasu', language: 'ja', category: 'daily', difficulty: 'normal' },
  { text: 'お先に失礼します', hiragana: 'おさきにしつれいします', reading: 'osakinishitsureishimasu', language: 'ja', category: 'daily', difficulty: 'normal' },
];

// ===== 日本語名言 =====
const JAPANESE_QUOTES: TypingSentence[] = [
  { text: '努力は必ず報われる', hiragana: 'どりょくはかならずむくわれる', reading: 'doryokuwakanarazumukuwareru', language: 'ja', category: 'quotes', difficulty: 'easy' },
  { text: '夢は逃げない、逃げるのはいつも自分だ', hiragana: 'ゆめはにげない、にげるのはいつもじぶんだ', reading: 'yumewanigenai,nigerunowaitumojibunnda', language: 'ja', category: 'quotes', difficulty: 'normal' },
  { text: '今日できることを明日に延ばすな', hiragana: 'きょうできることをあしたにのばすな', reading: 'kyoudekirukotowoashitaninobasuna', language: 'ja', category: 'quotes', difficulty: 'normal' },
  { text: '挑戦しなければ何も始まらない', hiragana: 'ちょうせんしなければなにもはじまらない', reading: 'chousennshinnakerebananimohajimaranai', language: 'ja', category: 'quotes', difficulty: 'normal' },
  { text: '自分を信じることが成功への第一歩', hiragana: 'じぶんをしんじることがせいこうへのだいいっぽ', reading: 'jibunnwoshinnjirukotogaseikouhenodaiippo', language: 'ja', category: 'quotes', difficulty: 'normal' },
  { text: '諦めなければ夢は叶う', hiragana: 'あきらめなければゆめはかなう', reading: 'akiramenakerebayumewakanau', language: 'ja', category: 'quotes', difficulty: 'easy' },
  { text: '一歩一歩進めば必ず目標に届く', hiragana: 'いっぽいっぽすすめばかならずもくひょうにとどく', reading: 'ippoipposusumebakanarazumokuhyounitodoku', language: 'ja', category: 'quotes', difficulty: 'normal' },
  { text: '過去は変えられないが未来は変えられる', hiragana: 'かこはかえられないがみらいはかえられる', reading: 'kakowakaerareenaigamiraiwakaerareru', language: 'ja', category: 'quotes', difficulty: 'normal' },
  { text: '失敗を恐れるな、挑戦しないことを恐れろ', hiragana: 'しっぱいをおそれるな、ちょうせんしないことをおそれろ', reading: 'shippaiwoosorerunna,chousennshinnaikotowoosorero', language: 'ja', category: 'quotes', difficulty: 'hard' },
  { text: '今この瞬間を大切に生きよう', hiragana: 'いまこのしゅんかんをたいせつにいきよう', reading: 'imakonoshunnkannwotaisetsuniikyou', language: 'ja', category: 'quotes', difficulty: 'normal' },
];

// ===== 全文章リスト =====
export const ALL_ENGLISH_SENTENCES: TypingSentence[] = [
  ...ENGLISH_QUOTES,
  ...ENGLISH_DAILY,
  ...ENGLISH_PROGRAMMING,
];

export const ALL_JAPANESE_SENTENCES: TypingSentence[] = [
  ...JAPANESE_PROVERBS,
  ...JAPANESE_DAILY,
  ...JAPANESE_QUOTES,
];

export const ALL_SENTENCES: TypingSentence[] = [
  ...ALL_ENGLISH_SENTENCES,
  ...ALL_JAPANESE_SENTENCES,
];

// カテゴリ別取得
export function getSentencesByCategory(
  language: 'en' | 'ja' | 'mixed',
  category?: SentenceCategory
): TypingSentence[] {
  let sentences: TypingSentence[] = [];

  if (language === 'en') {
    sentences = ALL_ENGLISH_SENTENCES;
  } else if (language === 'ja') {
    sentences = ALL_JAPANESE_SENTENCES;
  } else {
    sentences = ALL_SENTENCES;
  }

  if (category) {
    return sentences.filter((s) => s.category === category);
  }

  return sentences;
}

// 難易度別取得
export function getSentencesByDifficulty(
  language: 'en' | 'ja' | 'mixed',
  difficulty: SentenceDifficulty
): TypingSentence[] {
  const sentences = getSentencesByCategory(language);
  return sentences.filter((s) => s.difficulty === difficulty);
}

// ランダム取得
export function getRandomSentences(
  language: 'en' | 'ja' | 'mixed',
  count: number,
  options?: {
    category?: SentenceCategory;
    difficulty?: SentenceDifficulty;
  }
): TypingSentence[] {
  let pool = getSentencesByCategory(language, options?.category);

  if (options?.difficulty) {
    pool = pool.filter((s) => s.difficulty === options.difficulty);
  }

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// カテゴリラベル
export const CATEGORY_LABELS: Record<SentenceCategory, string> = {
  quotes: '名言',
  proverb: 'ことわざ',
  daily: '日常フレーズ',
  programming: 'プログラミング',
  literature: '文学',
};

// 難易度ラベル
export const DIFFICULTY_LABELS: Record<SentenceDifficulty, string> = {
  easy: '易しい',
  normal: '普通',
  hard: '難しい',
};
