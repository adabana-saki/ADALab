export type TypingLanguage = 'en' | 'ja';
export type TypingDifficulty = 'easy' | 'normal' | 'hard';

export interface TypingWord {
  text: string;
  reading?: string; // 日本語の場合のローマ字読み
  language: TypingLanguage;
  difficulty: TypingDifficulty;
}

// 英語単語 - Easy
const ENGLISH_EASY: TypingWord[] = [
  { text: 'the', language: 'en', difficulty: 'easy' },
  { text: 'and', language: 'en', difficulty: 'easy' },
  { text: 'for', language: 'en', difficulty: 'easy' },
  { text: 'are', language: 'en', difficulty: 'easy' },
  { text: 'but', language: 'en', difficulty: 'easy' },
  { text: 'not', language: 'en', difficulty: 'easy' },
  { text: 'you', language: 'en', difficulty: 'easy' },
  { text: 'all', language: 'en', difficulty: 'easy' },
  { text: 'can', language: 'en', difficulty: 'easy' },
  { text: 'had', language: 'en', difficulty: 'easy' },
  { text: 'her', language: 'en', difficulty: 'easy' },
  { text: 'was', language: 'en', difficulty: 'easy' },
  { text: 'one', language: 'en', difficulty: 'easy' },
  { text: 'our', language: 'en', difficulty: 'easy' },
  { text: 'out', language: 'en', difficulty: 'easy' },
  { text: 'day', language: 'en', difficulty: 'easy' },
  { text: 'get', language: 'en', difficulty: 'easy' },
  { text: 'has', language: 'en', difficulty: 'easy' },
  { text: 'him', language: 'en', difficulty: 'easy' },
  { text: 'his', language: 'en', difficulty: 'easy' },
  { text: 'how', language: 'en', difficulty: 'easy' },
  { text: 'its', language: 'en', difficulty: 'easy' },
  { text: 'may', language: 'en', difficulty: 'easy' },
  { text: 'new', language: 'en', difficulty: 'easy' },
  { text: 'now', language: 'en', difficulty: 'easy' },
  { text: 'old', language: 'en', difficulty: 'easy' },
  { text: 'see', language: 'en', difficulty: 'easy' },
  { text: 'two', language: 'en', difficulty: 'easy' },
  { text: 'way', language: 'en', difficulty: 'easy' },
  { text: 'who', language: 'en', difficulty: 'easy' },
  { text: 'boy', language: 'en', difficulty: 'easy' },
  { text: 'did', language: 'en', difficulty: 'easy' },
  { text: 'own', language: 'en', difficulty: 'easy' },
  { text: 'say', language: 'en', difficulty: 'easy' },
  { text: 'she', language: 'en', difficulty: 'easy' },
  { text: 'too', language: 'en', difficulty: 'easy' },
  { text: 'use', language: 'en', difficulty: 'easy' },
  { text: 'cat', language: 'en', difficulty: 'easy' },
  { text: 'dog', language: 'en', difficulty: 'easy' },
  { text: 'run', language: 'en', difficulty: 'easy' },
  { text: 'big', language: 'en', difficulty: 'easy' },
  { text: 'red', language: 'en', difficulty: 'easy' },
  { text: 'sun', language: 'en', difficulty: 'easy' },
  { text: 'cup', language: 'en', difficulty: 'easy' },
  { text: 'pen', language: 'en', difficulty: 'easy' },
  { text: 'top', language: 'en', difficulty: 'easy' },
  { text: 'box', language: 'en', difficulty: 'easy' },
  { text: 'car', language: 'en', difficulty: 'easy' },
  { text: 'let', language: 'en', difficulty: 'easy' },
  { text: 'put', language: 'en', difficulty: 'easy' },
];

// 英語単語 - Normal
const ENGLISH_NORMAL: TypingWord[] = [
  { text: 'about', language: 'en', difficulty: 'normal' },
  { text: 'after', language: 'en', difficulty: 'normal' },
  { text: 'again', language: 'en', difficulty: 'normal' },
  { text: 'being', language: 'en', difficulty: 'normal' },
  { text: 'below', language: 'en', difficulty: 'normal' },
  { text: 'could', language: 'en', difficulty: 'normal' },
  { text: 'every', language: 'en', difficulty: 'normal' },
  { text: 'first', language: 'en', difficulty: 'normal' },
  { text: 'found', language: 'en', difficulty: 'normal' },
  { text: 'great', language: 'en', difficulty: 'normal' },
  { text: 'house', language: 'en', difficulty: 'normal' },
  { text: 'large', language: 'en', difficulty: 'normal' },
  { text: 'learn', language: 'en', difficulty: 'normal' },
  { text: 'never', language: 'en', difficulty: 'normal' },
  { text: 'other', language: 'en', difficulty: 'normal' },
  { text: 'place', language: 'en', difficulty: 'normal' },
  { text: 'plant', language: 'en', difficulty: 'normal' },
  { text: 'point', language: 'en', difficulty: 'normal' },
  { text: 'right', language: 'en', difficulty: 'normal' },
  { text: 'small', language: 'en', difficulty: 'normal' },
  { text: 'sound', language: 'en', difficulty: 'normal' },
  { text: 'spell', language: 'en', difficulty: 'normal' },
  { text: 'still', language: 'en', difficulty: 'normal' },
  { text: 'study', language: 'en', difficulty: 'normal' },
  { text: 'their', language: 'en', difficulty: 'normal' },
  { text: 'there', language: 'en', difficulty: 'normal' },
  { text: 'these', language: 'en', difficulty: 'normal' },
  { text: 'thing', language: 'en', difficulty: 'normal' },
  { text: 'think', language: 'en', difficulty: 'normal' },
  { text: 'three', language: 'en', difficulty: 'normal' },
  { text: 'water', language: 'en', difficulty: 'normal' },
  { text: 'where', language: 'en', difficulty: 'normal' },
  { text: 'which', language: 'en', difficulty: 'normal' },
  { text: 'while', language: 'en', difficulty: 'normal' },
  { text: 'world', language: 'en', difficulty: 'normal' },
  { text: 'would', language: 'en', difficulty: 'normal' },
  { text: 'write', language: 'en', difficulty: 'normal' },
  { text: 'music', language: 'en', difficulty: 'normal' },
  { text: 'paper', language: 'en', difficulty: 'normal' },
  { text: 'story', language: 'en', difficulty: 'normal' },
  { text: 'young', language: 'en', difficulty: 'normal' },
  { text: 'happy', language: 'en', difficulty: 'normal' },
  { text: 'light', language: 'en', difficulty: 'normal' },
  { text: 'night', language: 'en', difficulty: 'normal' },
  { text: 'table', language: 'en', difficulty: 'normal' },
  { text: 'chair', language: 'en', difficulty: 'normal' },
  { text: 'phone', language: 'en', difficulty: 'normal' },
  { text: 'email', language: 'en', difficulty: 'normal' },
  { text: 'break', language: 'en', difficulty: 'normal' },
  { text: 'dream', language: 'en', difficulty: 'normal' },
];

// 英語単語 - Hard
const ENGLISH_HARD: TypingWord[] = [
  { text: 'adventure', language: 'en', difficulty: 'hard' },
  { text: 'beautiful', language: 'en', difficulty: 'hard' },
  { text: 'challenge', language: 'en', difficulty: 'hard' },
  { text: 'dangerous', language: 'en', difficulty: 'hard' },
  { text: 'education', language: 'en', difficulty: 'hard' },
  { text: 'fantastic', language: 'en', difficulty: 'hard' },
  { text: 'generous', language: 'en', difficulty: 'hard' },
  { text: 'happiness', language: 'en', difficulty: 'hard' },
  { text: 'important', language: 'en', difficulty: 'hard' },
  { text: 'knowledge', language: 'en', difficulty: 'hard' },
  { text: 'landscape', language: 'en', difficulty: 'hard' },
  { text: 'mysterious', language: 'en', difficulty: 'hard' },
  { text: 'necessary', language: 'en', difficulty: 'hard' },
  { text: 'orchestra', language: 'en', difficulty: 'hard' },
  { text: 'paragraph', language: 'en', difficulty: 'hard' },
  { text: 'qualified', language: 'en', difficulty: 'hard' },
  { text: 'recognize', language: 'en', difficulty: 'hard' },
  { text: 'satisfied', language: 'en', difficulty: 'hard' },
  { text: 'technology', language: 'en', difficulty: 'hard' },
  { text: 'understand', language: 'en', difficulty: 'hard' },
  { text: 'vocabulary', language: 'en', difficulty: 'hard' },
  { text: 'wonderful', language: 'en', difficulty: 'hard' },
  { text: 'experience', language: 'en', difficulty: 'hard' },
  { text: 'yesterday', language: 'en', difficulty: 'hard' },
  { text: 'appreciate', language: 'en', difficulty: 'hard' },
  { text: 'basketball', language: 'en', difficulty: 'hard' },
  { text: 'comfortable', language: 'en', difficulty: 'hard' },
  { text: 'development', language: 'en', difficulty: 'hard' },
  { text: 'environment', language: 'en', difficulty: 'hard' },
  { text: 'fascinating', language: 'en', difficulty: 'hard' },
  { text: 'government', language: 'en', difficulty: 'hard' },
  { text: 'immediately', language: 'en', difficulty: 'hard' },
  { text: 'independent', language: 'en', difficulty: 'hard' },
  { text: 'opportunity', language: 'en', difficulty: 'hard' },
  { text: 'programming', language: 'en', difficulty: 'hard' },
  { text: 'responsible', language: 'en', difficulty: 'hard' },
  { text: 'significant', language: 'en', difficulty: 'hard' },
  { text: 'temperature', language: 'en', difficulty: 'hard' },
  { text: 'university', language: 'en', difficulty: 'hard' },
  { text: 'vocabulary', language: 'en', difficulty: 'hard' },
];

// 日本語 - Easy (ひらがなのみ)
const JAPANESE_EASY: TypingWord[] = [
  { text: 'あさ', reading: 'asa', language: 'ja', difficulty: 'easy' },
  { text: 'いま', reading: 'ima', language: 'ja', difficulty: 'easy' },
  { text: 'うみ', reading: 'umi', language: 'ja', difficulty: 'easy' },
  { text: 'えき', reading: 'eki', language: 'ja', difficulty: 'easy' },
  { text: 'おと', reading: 'oto', language: 'ja', difficulty: 'easy' },
  { text: 'かわ', reading: 'kawa', language: 'ja', difficulty: 'easy' },
  { text: 'きた', reading: 'kita', language: 'ja', difficulty: 'easy' },
  { text: 'くも', reading: 'kumo', language: 'ja', difficulty: 'easy' },
  { text: 'けさ', reading: 'kesa', language: 'ja', difficulty: 'easy' },
  { text: 'こえ', reading: 'koe', language: 'ja', difficulty: 'easy' },
  { text: 'さき', reading: 'saki', language: 'ja', difficulty: 'easy' },
  { text: 'しま', reading: 'shima', language: 'ja', difficulty: 'easy' },
  { text: 'すな', reading: 'suna', language: 'ja', difficulty: 'easy' },
  { text: 'せき', reading: 'seki', language: 'ja', difficulty: 'easy' },
  { text: 'そら', reading: 'sora', language: 'ja', difficulty: 'easy' },
  { text: 'たけ', reading: 'take', language: 'ja', difficulty: 'easy' },
  { text: 'ちず', reading: 'chizu', language: 'ja', difficulty: 'easy' },
  { text: 'つき', reading: 'tsuki', language: 'ja', difficulty: 'easy' },
  { text: 'てら', reading: 'tera', language: 'ja', difficulty: 'easy' },
  { text: 'とり', reading: 'tori', language: 'ja', difficulty: 'easy' },
  { text: 'なつ', reading: 'natsu', language: 'ja', difficulty: 'easy' },
  { text: 'にし', reading: 'nishi', language: 'ja', difficulty: 'easy' },
  { text: 'ぬの', reading: 'nuno', language: 'ja', difficulty: 'easy' },
  { text: 'ねこ', reading: 'neko', language: 'ja', difficulty: 'easy' },
  { text: 'のり', reading: 'nori', language: 'ja', difficulty: 'easy' },
  { text: 'はな', reading: 'hana', language: 'ja', difficulty: 'easy' },
  { text: 'ひと', reading: 'hito', language: 'ja', difficulty: 'easy' },
  { text: 'ふね', reading: 'fune', language: 'ja', difficulty: 'easy' },
  { text: 'へや', reading: 'heya', language: 'ja', difficulty: 'easy' },
  { text: 'ほし', reading: 'hoshi', language: 'ja', difficulty: 'easy' },
  { text: 'まち', reading: 'machi', language: 'ja', difficulty: 'easy' },
  { text: 'みず', reading: 'mizu', language: 'ja', difficulty: 'easy' },
  { text: 'むし', reading: 'mushi', language: 'ja', difficulty: 'easy' },
  { text: 'めし', reading: 'meshi', language: 'ja', difficulty: 'easy' },
  { text: 'もり', reading: 'mori', language: 'ja', difficulty: 'easy' },
  { text: 'やま', reading: 'yama', language: 'ja', difficulty: 'easy' },
  { text: 'ゆき', reading: 'yuki', language: 'ja', difficulty: 'easy' },
  { text: 'よる', reading: 'yoru', language: 'ja', difficulty: 'easy' },
  { text: 'わに', reading: 'wani', language: 'ja', difficulty: 'easy' },
  { text: 'いぬ', reading: 'inu', language: 'ja', difficulty: 'easy' },
];

// 日本語 - Normal
const JAPANESE_NORMAL: TypingWord[] = [
  { text: 'おはよう', reading: 'ohayou', language: 'ja', difficulty: 'normal' },
  { text: 'こんにちは', reading: 'konnichiwa', language: 'ja', difficulty: 'normal' },
  { text: 'ありがとう', reading: 'arigatou', language: 'ja', difficulty: 'normal' },
  { text: 'さようなら', reading: 'sayounara', language: 'ja', difficulty: 'normal' },
  { text: 'おやすみ', reading: 'oyasumi', language: 'ja', difficulty: 'normal' },
  { text: 'すみません', reading: 'sumimasen', language: 'ja', difficulty: 'normal' },
  { text: 'がんばって', reading: 'ganbatte', language: 'ja', difficulty: 'normal' },
  { text: 'たのしい', reading: 'tanoshii', language: 'ja', difficulty: 'normal' },
  { text: 'うれしい', reading: 'ureshii', language: 'ja', difficulty: 'normal' },
  { text: 'かなしい', reading: 'kanashii', language: 'ja', difficulty: 'normal' },
  { text: 'おいしい', reading: 'oishii', language: 'ja', difficulty: 'normal' },
  { text: 'あたらしい', reading: 'atarashii', language: 'ja', difficulty: 'normal' },
  { text: 'たかい', reading: 'takai', language: 'ja', difficulty: 'normal' },
  { text: 'やすい', reading: 'yasui', language: 'ja', difficulty: 'normal' },
  { text: 'ながい', reading: 'nagai', language: 'ja', difficulty: 'normal' },
  { text: 'みじかい', reading: 'mijikai', language: 'ja', difficulty: 'normal' },
  { text: 'おおきい', reading: 'ookii', language: 'ja', difficulty: 'normal' },
  { text: 'ちいさい', reading: 'chiisai', language: 'ja', difficulty: 'normal' },
  { text: 'あつい', reading: 'atsui', language: 'ja', difficulty: 'normal' },
  { text: 'さむい', reading: 'samui', language: 'ja', difficulty: 'normal' },
  { text: 'でんしゃ', reading: 'densha', language: 'ja', difficulty: 'normal' },
  { text: 'くるま', reading: 'kuruma', language: 'ja', difficulty: 'normal' },
  { text: 'ひこうき', reading: 'hikouki', language: 'ja', difficulty: 'normal' },
  { text: 'じてんしゃ', reading: 'jitensha', language: 'ja', difficulty: 'normal' },
  { text: 'がっこう', reading: 'gakkou', language: 'ja', difficulty: 'normal' },
  { text: 'しごと', reading: 'shigoto', language: 'ja', difficulty: 'normal' },
  { text: 'やすみ', reading: 'yasumi', language: 'ja', difficulty: 'normal' },
  { text: 'りょこう', reading: 'ryokou', language: 'ja', difficulty: 'normal' },
  { text: 'かいもの', reading: 'kaimono', language: 'ja', difficulty: 'normal' },
  { text: 'てんき', reading: 'tenki', language: 'ja', difficulty: 'normal' },
  { text: 'ともだち', reading: 'tomodachi', language: 'ja', difficulty: 'normal' },
  { text: 'かぞく', reading: 'kazoku', language: 'ja', difficulty: 'normal' },
  { text: 'せんせい', reading: 'sensei', language: 'ja', difficulty: 'normal' },
  { text: 'いしゃ', reading: 'isha', language: 'ja', difficulty: 'normal' },
  { text: 'けいさつ', reading: 'keisatsu', language: 'ja', difficulty: 'normal' },
  { text: 'しょうぼう', reading: 'shoubou', language: 'ja', difficulty: 'normal' },
  { text: 'ぎんこう', reading: 'ginkou', language: 'ja', difficulty: 'normal' },
  { text: 'ゆうびんきょく', reading: 'yuubinkyoku', language: 'ja', difficulty: 'normal' },
  { text: 'びょういん', reading: 'byouin', language: 'ja', difficulty: 'normal' },
  { text: 'えいが', reading: 'eiga', language: 'ja', difficulty: 'normal' },
];

// 日本語 - Hard
const JAPANESE_HARD: TypingWord[] = [
  { text: 'おめでとうございます', reading: 'omedetougozaimasu', language: 'ja', difficulty: 'hard' },
  { text: 'よろしくおねがいします', reading: 'yoroshikuonegaishimasu', language: 'ja', difficulty: 'hard' },
  { text: 'いただきます', reading: 'itadakimasu', language: 'ja', difficulty: 'hard' },
  { text: 'ごちそうさまでした', reading: 'gochisousamadeshita', language: 'ja', difficulty: 'hard' },
  { text: 'おつかれさまでした', reading: 'otsukaresama deshita', language: 'ja', difficulty: 'hard' },
  { text: 'しつれいします', reading: 'shitsureishimasu', language: 'ja', difficulty: 'hard' },
  { text: 'ごめんなさい', reading: 'gomennasai', language: 'ja', difficulty: 'hard' },
  { text: 'だいじょうぶです', reading: 'daijoubudesu', language: 'ja', difficulty: 'hard' },
  { text: 'わかりました', reading: 'wakarimashita', language: 'ja', difficulty: 'hard' },
  { text: 'ちょっとまってください', reading: 'chottomattekudasai', language: 'ja', difficulty: 'hard' },
  { text: 'しんぱいしないでください', reading: 'shinpaishinaidekudasai', language: 'ja', difficulty: 'hard' },
  { text: 'たいへんおまたせしました', reading: 'taihenomataseshimashita', language: 'ja', difficulty: 'hard' },
  { text: 'おひさしぶりです', reading: 'ohisashiburidesu', language: 'ja', difficulty: 'hard' },
  { text: 'おげんきですか', reading: 'ogenkidesuka', language: 'ja', difficulty: 'hard' },
  { text: 'きょうはいいてんきですね', reading: 'kyouwaiitenki desune', language: 'ja', difficulty: 'hard' },
  { text: 'なにをしていますか', reading: 'naniwoshiteimasuka', language: 'ja', difficulty: 'hard' },
  { text: 'どこにいきますか', reading: 'dokoniikim asuka', language: 'ja', difficulty: 'hard' },
  { text: 'いつがいいですか', reading: 'itsugaiidesuka', language: 'ja', difficulty: 'hard' },
  { text: 'だれがきますか', reading: 'daregakimasuka', language: 'ja', difficulty: 'hard' },
  { text: 'なぜそうおもいますか', reading: 'nazesouomoimasuka', language: 'ja', difficulty: 'hard' },
  { text: 'コンピューター', reading: 'konpyu-ta-', language: 'ja', difficulty: 'hard' },
  { text: 'プログラミング', reading: 'puroguramingu', language: 'ja', difficulty: 'hard' },
  { text: 'インターネット', reading: 'inta-netto', language: 'ja', difficulty: 'hard' },
  { text: 'スマートフォン', reading: 'suma-tofon', language: 'ja', difficulty: 'hard' },
  { text: 'アプリケーション', reading: 'apurike-shon', language: 'ja', difficulty: 'hard' },
  { text: 'ソフトウェア', reading: 'sofutowea', language: 'ja', difficulty: 'hard' },
  { text: 'ハードウェア', reading: 'ha-dowea', language: 'ja', difficulty: 'hard' },
  { text: 'データベース', reading: 'de-tabe-su', language: 'ja', difficulty: 'hard' },
  { text: 'セキュリティ', reading: 'sekyuriti', language: 'ja', difficulty: 'hard' },
  { text: 'パスワード', reading: 'pasuwa-do', language: 'ja', difficulty: 'hard' },
];

// 全単語リスト
export const ALL_ENGLISH_WORDS: TypingWord[] = [
  ...ENGLISH_EASY,
  ...ENGLISH_NORMAL,
  ...ENGLISH_HARD,
];

export const ALL_JAPANESE_WORDS: TypingWord[] = [
  ...JAPANESE_EASY,
  ...JAPANESE_NORMAL,
  ...JAPANESE_HARD,
];

export const ALL_WORDS: TypingWord[] = [...ALL_ENGLISH_WORDS, ...ALL_JAPANESE_WORDS];

// 難易度別取得
export function getWordsByDifficulty(
  language: 'en' | 'ja' | 'mixed',
  difficulty: 'easy' | 'normal' | 'hard'
): TypingWord[] {
  let words: TypingWord[] = [];

  if (language === 'en') {
    words = ALL_ENGLISH_WORDS;
  } else if (language === 'ja') {
    words = ALL_JAPANESE_WORDS;
  } else {
    words = ALL_WORDS;
  }

  return words.filter((w) => w.difficulty === difficulty);
}

// ランダム取得
export function getRandomWords(
  language: 'en' | 'ja' | 'mixed',
  difficulty: 'easy' | 'normal' | 'hard',
  count: number
): TypingWord[] {
  const pool = getWordsByDifficulty(language, difficulty);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// 混合難易度でランダム取得
export function getRandomWordsMixed(
  language: 'en' | 'ja' | 'mixed',
  count: number
): TypingWord[] {
  let words: TypingWord[] = [];

  if (language === 'en') {
    words = ALL_ENGLISH_WORDS;
  } else if (language === 'ja') {
    words = ALL_JAPANESE_WORDS;
  } else {
    words = ALL_WORDS;
  }

  const shuffled = [...words].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
