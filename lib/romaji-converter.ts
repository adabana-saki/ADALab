/**
 * 日本語ローマ字変換ユーティリティ
 * ひらがな→複数ローマ字パターンの変換と部分入力マッチングを提供
 */

// ひらがな→ローマ字変換テーブル（複数候補対応）
export const HIRAGANA_TO_ROMAJI: Record<string, string[]> = {
  // 基本母音
  'あ': ['a'], 'い': ['i'], 'う': ['u'], 'え': ['e'], 'お': ['o'],

  // か行
  'か': ['ka'], 'き': ['ki'], 'く': ['ku'], 'け': ['ke'], 'こ': ['ko'],

  // さ行
  'さ': ['sa'], 'し': ['shi', 'si', 'ci'], 'す': ['su'], 'せ': ['se'], 'そ': ['so'],

  // た行
  'た': ['ta'], 'ち': ['chi', 'ti'], 'つ': ['tsu', 'tu'], 'て': ['te'], 'と': ['to'],

  // な行
  'な': ['na'], 'に': ['ni'], 'ぬ': ['nu'], 'ね': ['ne'], 'の': ['no'],

  // は行
  'は': ['ha'], 'ひ': ['hi'], 'ふ': ['fu', 'hu'], 'へ': ['he'], 'ほ': ['ho'],

  // ま行
  'ま': ['ma'], 'み': ['mi'], 'む': ['mu'], 'め': ['me'], 'も': ['mo'],

  // や行
  'や': ['ya'], 'ゆ': ['yu'], 'よ': ['yo'],

  // ら行
  'ら': ['ra'], 'り': ['ri'], 'る': ['ru'], 'れ': ['re'], 'ろ': ['ro'],

  // わ行
  'わ': ['wa'], 'を': ['wo', 'o'], 'ん': ['n', 'nn', 'xn'],
  // 古語かな
  'ゐ': ['wi', 'wyi'], 'ゑ': ['we', 'wye'],

  // 濁音 - が行
  'が': ['ga'], 'ぎ': ['gi'], 'ぐ': ['gu'], 'げ': ['ge'], 'ご': ['go'],

  // 濁音 - ざ行
  'ざ': ['za'], 'じ': ['ji', 'zi'], 'ず': ['zu'], 'ぜ': ['ze'], 'ぞ': ['zo'],

  // 濁音 - だ行
  'だ': ['da'], 'ぢ': ['di', 'zi'], 'づ': ['du', 'zu'], 'で': ['de'], 'ど': ['do'],

  // 濁音 - ば行
  'ば': ['ba'], 'び': ['bi'], 'ぶ': ['bu'], 'べ': ['be'], 'ぼ': ['bo'],

  // 半濁音 - ぱ行
  'ぱ': ['pa'], 'ぴ': ['pi'], 'ぷ': ['pu'], 'ぺ': ['pe'], 'ぽ': ['po'],

  // 拗音 - きゃ行
  'きゃ': ['kya'], 'きゅ': ['kyu'], 'きょ': ['kyo'],

  // 拗音 - しゃ行
  'しゃ': ['sha', 'sya', 'siya'], 'しゅ': ['shu', 'syu', 'siyu'], 'しょ': ['sho', 'syo', 'siyo'],
  'しぇ': ['she', 'sye'],

  // 拗音 - ちゃ行
  'ちゃ': ['cha', 'tya', 'cya', 'tiya'], 'ちゅ': ['chu', 'tyu', 'cyu', 'tiyu'], 'ちょ': ['cho', 'tyo', 'cyo', 'tiyo'],
  'ちぇ': ['che', 'tye', 'cye'],

  // 拗音 - にゃ行
  'にゃ': ['nya'], 'にゅ': ['nyu'], 'にょ': ['nyo'],

  // 拗音 - ひゃ行
  'ひゃ': ['hya'], 'ひゅ': ['hyu'], 'ひょ': ['hyo'],

  // 拗音 - みゃ行
  'みゃ': ['mya'], 'みゅ': ['myu'], 'みょ': ['myo'],

  // 拗音 - りゃ行
  'りゃ': ['rya'], 'りゅ': ['ryu'], 'りょ': ['ryo'],

  // 拗音 - ぎゃ行
  'ぎゃ': ['gya'], 'ぎゅ': ['gyu'], 'ぎょ': ['gyo'],

  // 拗音 - じゃ行
  'じゃ': ['ja', 'jya', 'zya', 'jiya', 'ziya'], 'じゅ': ['ju', 'jyu', 'zyu', 'jiyu', 'ziyu'], 'じょ': ['jo', 'jyo', 'zyo', 'jiyo', 'ziyo'],
  'じぇ': ['je', 'jye', 'zye'],

  // 拗音 - ぢゃ行
  'ぢゃ': ['dya', 'diya'], 'ぢゅ': ['dyu', 'diyu'], 'ぢょ': ['dyo', 'diyo'],

  // 拗音 - びゃ行
  'びゃ': ['bya'], 'びゅ': ['byu'], 'びょ': ['byo'],

  // 拗音 - ぴゃ行
  'ぴゃ': ['pya'], 'ぴゅ': ['pyu'], 'ぴょ': ['pyo'],

  // 拗音 - ふぁ行
  'ふぁ': ['fa', 'fua', 'hua'], 'ふぃ': ['fi', 'fui', 'hui'], 'ふぇ': ['fe', 'fue', 'hue'], 'ふぉ': ['fo', 'fuo', 'huo'],
  'ふゅ': ['fyu', 'fuyu', 'huyu'],

  // 拗音 - うぃ行
  'うぃ': ['wi', 'ui'], 'うぇ': ['we', 'ue'], 'うぉ': ['who', 'uo'],

  // 拗音 - てぃ行
  'てぃ': ['thi', 'texi', 'teli', 'ti'], 'でぃ': ['dhi', 'dexi', 'deli', 'di'],
  'てゅ': ['thu', 'texyu', 'telyu'], 'でゅ': ['dhu', 'dexyu', 'delyu'],

  // 拗音 - とぅ行
  'とぅ': ['twu', 'toxu'], 'どぅ': ['dwu', 'doxu'],

  // 拗音 - くぁ行 (qua系)
  'くぁ': ['qa', 'qua', 'kwa', 'kuxa'], 'くぃ': ['qi', 'qui', 'kwi', 'kuxi'],
  'くぅ': ['qwu', 'kuwu'], 'くぇ': ['qe', 'que', 'kwe', 'kuxe'], 'くぉ': ['qo', 'quo', 'kwo', 'kuxo'],

  // 拗音 - ぐぁ行
  'ぐぁ': ['gwa', 'guxa'], 'ぐぃ': ['gwi', 'guxi'], 'ぐぅ': ['gwu'], 'ぐぇ': ['gwe', 'guxe'], 'ぐぉ': ['gwo', 'guxo'],

  // 拗音 - つぁ行
  'つぁ': ['tsa', 'tuxa'], 'つぃ': ['tsi', 'tuxi'], 'つぇ': ['tse', 'tuxe'], 'つぉ': ['tso', 'tuxo'],

  // 拗音 - すぃ行
  'すぃ': ['swi', 'suxi'],

  // 拗音 - ずぃ行
  'ずぃ': ['zwi', 'zuxi'],

  // ヴ行 (外来語用)
  'ゔ': ['vu'],
  'ゔぁ': ['va', 'vuxa'], 'ゔぃ': ['vi', 'vuxi', 'vyi'], 'ゔぇ': ['ve', 'vuxe', 'vye'], 'ゔぉ': ['vo', 'vuxo'],
  'ゔゅ': ['vyu'],

  // イェ
  'いぇ': ['ye', 'ixe'],

  // ぁ行の組み合わせ（既存のしぇ、ちぇ、じぇ等は上記で定義済み）
  'きぃ': ['kixi', 'kilyi'], 'きぇ': ['kye', 'kixe'],
  'しぃ': ['sixi', 'shilyi', 'syi'],
  'にぃ': ['nixi', 'nilyi'], 'にぇ': ['nye', 'nixe'],
  'ひぃ': ['hixi', 'hilyi'], 'ひぇ': ['hye', 'hixe'],
  'みぃ': ['mixi', 'milyi'], 'みぇ': ['mye', 'mixe'],
  'りぃ': ['rixi', 'rilyi'], 'りぇ': ['rye', 'rixe'],
  'ぎぃ': ['gixi', 'gilyi'], 'ぎぇ': ['gye', 'gixe'],
  'びぃ': ['bixi', 'bilyi'], 'びぇ': ['bye', 'bixe'],
  'ぴぃ': ['pixi', 'pilyi'], 'ぴぇ': ['pye', 'pixe'],
  'ちぃ': ['chixi', 'chilyi', 'tixi'], 'ぢぃ': ['dixi', 'dilyi'],

  // 小文字（直接入力用）
  'ぁ': ['xa', 'la'], 'ぃ': ['xi', 'li', 'xyi', 'lyi'], 'ぅ': ['xu', 'lu'], 'ぇ': ['xe', 'le', 'xye', 'lye'], 'ぉ': ['xo', 'lo'],
  'っ': ['xtu', 'ltu', 'xtsu', 'ltsu'],
  'ゃ': ['xya', 'lya'], 'ゅ': ['xyu', 'lyu'], 'ょ': ['xyo', 'lyo'],
  'ゎ': ['xwa', 'lwa'],
  'ヵ': ['xka', 'lka'], 'ヶ': ['xke', 'lke'],

  // 記号
  'ー': ['-'],
  '。': ['.'],
  '、': [','],
  '！': ['!'],
  '？': ['?'],
  '「': ['['],
  '」': [']'],
  '（': ['('],
  '）': [')'],
  '・': ['/'],
};

// カタカナ→ひらがな変換テーブル
const KATAKANA_TO_HIRAGANA: Record<string, string> = {
  'ア': 'あ', 'イ': 'い', 'ウ': 'う', 'エ': 'え', 'オ': 'お',
  'カ': 'か', 'キ': 'き', 'ク': 'く', 'ケ': 'け', 'コ': 'こ',
  'サ': 'さ', 'シ': 'し', 'ス': 'す', 'セ': 'せ', 'ソ': 'そ',
  'タ': 'た', 'チ': 'ち', 'ツ': 'つ', 'テ': 'て', 'ト': 'と',
  'ナ': 'な', 'ニ': 'に', 'ヌ': 'ぬ', 'ネ': 'ね', 'ノ': 'の',
  'ハ': 'は', 'ヒ': 'ひ', 'フ': 'ふ', 'ヘ': 'へ', 'ホ': 'ほ',
  'マ': 'ま', 'ミ': 'み', 'ム': 'む', 'メ': 'め', 'モ': 'も',
  'ヤ': 'や', 'ユ': 'ゆ', 'ヨ': 'よ',
  'ラ': 'ら', 'リ': 'り', 'ル': 'る', 'レ': 'れ', 'ロ': 'ろ',
  'ワ': 'わ', 'ヲ': 'を', 'ン': 'ん',
  'ヰ': 'ゐ', 'ヱ': 'ゑ',
  'ガ': 'が', 'ギ': 'ぎ', 'グ': 'ぐ', 'ゲ': 'げ', 'ゴ': 'ご',
  'ザ': 'ざ', 'ジ': 'じ', 'ズ': 'ず', 'ゼ': 'ぜ', 'ゾ': 'ぞ',
  'ダ': 'だ', 'ヂ': 'ぢ', 'ヅ': 'づ', 'デ': 'で', 'ド': 'ど',
  'バ': 'ば', 'ビ': 'び', 'ブ': 'ぶ', 'ベ': 'べ', 'ボ': 'ぼ',
  'パ': 'ぱ', 'ピ': 'ぴ', 'プ': 'ぷ', 'ペ': 'ぺ', 'ポ': 'ぽ',
  'ァ': 'ぁ', 'ィ': 'ぃ', 'ゥ': 'ぅ', 'ェ': 'ぇ', 'ォ': 'ぉ',
  'ッ': 'っ',
  'ャ': 'ゃ', 'ュ': 'ゅ', 'ョ': 'ょ',
  'ヮ': 'ゎ',
  'ヴ': 'ゔ',
  'ヵ': 'ヵ', 'ヶ': 'ヶ',
  'ー': 'ー',
};

/**
 * カタカナをひらがなに変換
 */
export function katakanaToHiragana(text: string): string {
  return text.split('').map(char => KATAKANA_TO_HIRAGANA[char] || char).join('');
}

/**
 * 「ん」の後に母音やy行が来るかチェック
 * 来る場合は'n'単独では確定できない
 */
function needsDoubleN(text: string, index: number): boolean {
  const nextChar = text[index + 1];
  if (!nextChar) return false;

  // 次が母音(あいうえお)またはy行(やゆよ)または「ん」の場合
  const vowelAndYPattern = /^[あいうえおやゆよアイウエオヤユヨ]/;
  if (vowelAndYPattern.test(nextChar)) {
    return true;
  }

  // 次がな行の場合（例: かんな → kanna）
  if (/^[なにぬねのナニヌネノ]/.test(nextChar)) {
    return true;
  }

  return false;
}

/**
 * 促音（っ）の処理
 * 次の文字の子音を取得
 */
function getSokuonConsonants(text: string, index: number): string[] {
  const nextIndex = index + 1;
  if (nextIndex >= text.length) {
    // 文末の「っ」
    return ['xtu', 'ltu', 'xtsu', 'ltsu'];
  }

  // 次の文字（拗音は2文字）
  let nextChars = text.slice(nextIndex, nextIndex + 2);
  let nextHiragana = katakanaToHiragana(nextChars);

  // まず拗音をチェック
  let romajiPatterns = HIRAGANA_TO_ROMAJI[nextHiragana];
  if (!romajiPatterns) {
    // 拗音でなければ1文字
    nextChars = text[nextIndex];
    nextHiragana = katakanaToHiragana(nextChars);
    romajiPatterns = HIRAGANA_TO_ROMAJI[nextHiragana];
  }

  if (!romajiPatterns) {
    return ['xtu', 'ltu', 'xtsu', 'ltsu'];
  }

  const consonants: string[] = [];
  for (const romaji of romajiPatterns) {
    const consonant = romaji[0];
    // 子音のみを抽出（母音以外）
    if ('kstcnhfmyrwgzdbpj'.includes(consonant.toLowerCase())) {
      consonants.push(consonant);
    }
  }

  // 重複を除去して、小さい「っ」の直接入力も追加
  const uniqueConsonants = [...new Set(consonants)];
  return [...uniqueConsonants, 'xtu', 'ltu', 'xtsu', 'ltsu'];
}

export interface MatchResult {
  isValid: boolean;           // 入力が有効か
  confirmedChars: number;     // 確定したひらがなの文字数
  matchedHiragana: number;    // confirmedCharsのエイリアス（互換性のため）
  confirmedInput: string;     // 確定した入力文字列
  pendingInput: string;       // 未確定の入力
  isComplete: boolean;        // 完全に一致したか
}

/**
 * ひらがな文字列に対してローマ字入力が有効かどうかを判定
 * 部分一致も考慮する
 */
export function matchPartialRomaji(hiragana: string, input: string): MatchResult {
  // カタカナをひらがなに変換
  const normalizedHiragana = katakanaToHiragana(hiragana);

  let hiraganaIndex = 0;
  let inputIndex = 0;

  // 結果を生成するヘルパー関数
  const makeResult = (isValid: boolean, isComplete: boolean): MatchResult => ({
    isValid,
    confirmedChars: hiraganaIndex,
    matchedHiragana: hiraganaIndex,
    confirmedInput: input.slice(0, inputIndex),
    pendingInput: input.slice(inputIndex),
    isComplete,
  });

  while (hiraganaIndex < normalizedHiragana.length && inputIndex < input.length) {
    const currentChar = normalizedHiragana[hiraganaIndex];

    // 促音（っ）の特別処理
    if (currentChar === 'っ') {
      const sokuonPatterns = getSokuonConsonants(normalizedHiragana, hiraganaIndex);
      const remainingInput = input.slice(inputIndex);

      // 各パターンで一致をチェック
      let matched = false;
      for (const pattern of sokuonPatterns) {
        if (remainingInput.startsWith(pattern)) {
          // 完全一致
          if (pattern.length <= 2 && 'kstcnhfmyrwgzdbpj'.includes(pattern[0])) {
            // 子音の重ね（次の文字の一部として処理される）
            inputIndex += 1; // 1文字だけ進める
          } else {
            inputIndex += pattern.length;
          }
          hiraganaIndex += 1;
          matched = true;
          break;
        } else if (pattern.startsWith(remainingInput)) {
          // 部分一致（まだ入力中）
          return makeResult(true, false);
        }
      }

      if (!matched) {
        // どのパターンにも一致しない
        return makeResult(false, false);
      }
      continue;
    }

    // 「ん」の特別処理
    if (currentChar === 'ん') {
      const remainingInput = input.slice(inputIndex);
      const requiresDoubleN = needsDoubleN(normalizedHiragana, hiraganaIndex);

      // 「ん」のパターン
      let nPatterns = ['n', 'nn', 'xn'];

      // 次が母音/y行/な行の場合、'n'単独は使えない
      if (requiresDoubleN) {
        // 'n'の後に次の文字のローマ字が続く場合のみ'n'を許可
        const nextChar = normalizedHiragana[hiraganaIndex + 1];
        if (nextChar) {
          // 次の文字のローマ字パターンを取得
          let nextPatterns: string[] = [];
          const twoChar = normalizedHiragana.slice(hiraganaIndex + 1, hiraganaIndex + 3);
          if (HIRAGANA_TO_ROMAJI[twoChar]) {
            nextPatterns = HIRAGANA_TO_ROMAJI[twoChar];
          } else if (HIRAGANA_TO_ROMAJI[nextChar]) {
            nextPatterns = HIRAGANA_TO_ROMAJI[nextChar];
          }

          // 'n' + 次の文字のローマ字で始まるかチェック
          let nWithNextMatched = false;
          for (const nextRomaji of nextPatterns) {
            const combined = 'n' + nextRomaji;
            if (remainingInput.startsWith(combined.slice(0, remainingInput.length))) {
              if (remainingInput.length >= combined.length) {
                // 完全一致
                nWithNextMatched = true;
              } else if (combined.startsWith(remainingInput)) {
                // 部分一致
                return makeResult(true, false);
              }
            }
          }

          if (nWithNextMatched) {
            inputIndex += 1; // 'n'の分だけ進める
            hiraganaIndex += 1;
            continue;
          }
        }

        // 'n'単独は使えないので、'nn'か'xn'のみ
        nPatterns = ['nn', 'xn'];
      }

      // パターンマッチング
      let matched = false;
      for (const pattern of nPatterns) {
        if (remainingInput.startsWith(pattern)) {
          inputIndex += pattern.length;
          hiraganaIndex += 1;
          matched = true;
          break;
        } else if (pattern.startsWith(remainingInput)) {
          // 部分一致
          return makeResult(true, false);
        }
      }

      if (matched) continue;

      // 'n'単独で次の文字に進む場合
      if (!requiresDoubleN && remainingInput.startsWith('n')) {
        inputIndex += 1;
        hiraganaIndex += 1;
        continue;
      }

      // 一致しない場合
      return makeResult(false, false);
    }

    // 拗音(2文字)を優先チェック
    const twoChar = normalizedHiragana.slice(hiraganaIndex, hiraganaIndex + 2);
    let patterns = HIRAGANA_TO_ROMAJI[twoChar];
    let charLength = 2;

    if (!patterns) {
      // 1文字でチェック
      patterns = HIRAGANA_TO_ROMAJI[currentChar];
      charLength = 1;
    }

    if (!patterns) {
      // 対応するローマ字がない（英数字など）
      // そのまま比較
      if (input[inputIndex] === currentChar) {
        inputIndex += 1;
        hiraganaIndex += 1;
        continue;
      } else {
        return makeResult(false, false);
      }
    }

    const remainingInput = input.slice(inputIndex);
    let matched = false;

    for (const pattern of patterns) {
      if (remainingInput.startsWith(pattern)) {
        // 完全一致
        inputIndex += pattern.length;
        hiraganaIndex += charLength;
        matched = true;
        break;
      } else if (pattern.startsWith(remainingInput)) {
        // 部分一致（まだ入力中）
        return makeResult(true, false);
      }
    }

    if (!matched) {
      // どのパターンにも一致しない
      return makeResult(false, false);
    }
  }

  // 入力がひらがなより長い場合は無効
  if (inputIndex < input.length) {
    return makeResult(false, false);
  }

  return makeResult(true, hiraganaIndex === normalizedHiragana.length);
}

/**
 * ひらがな文字列の最初の有効なローマ字表記を取得（表示用）
 */
export function getFirstRomajiPattern(hiragana: string): string {
  const normalizedHiragana = katakanaToHiragana(hiragana);
  let result = '';
  let i = 0;

  while (i < normalizedHiragana.length) {
    const currentChar = normalizedHiragana[i];

    // 促音の処理
    if (currentChar === 'っ') {
      const nextIndex = i + 1;
      if (nextIndex < normalizedHiragana.length) {
        // 次の文字の最初のローマ字の子音を取得
        const twoChar = normalizedHiragana.slice(nextIndex, nextIndex + 2);
        let nextPatterns = HIRAGANA_TO_ROMAJI[twoChar];
        if (!nextPatterns) {
          nextPatterns = HIRAGANA_TO_ROMAJI[normalizedHiragana[nextIndex]];
        }
        if (nextPatterns && nextPatterns[0]) {
          const consonant = nextPatterns[0][0];
          if ('kstcnhfmyrwgzdbpj'.includes(consonant)) {
            result += consonant;
          } else {
            result += 'xtu';
          }
        } else {
          result += 'xtu';
        }
      } else {
        result += 'xtu';
      }
      i++;
      continue;
    }

    // 拗音を優先チェック
    const twoChar = normalizedHiragana.slice(i, i + 2);
    let patterns = HIRAGANA_TO_ROMAJI[twoChar];
    let charLength = 2;

    if (!patterns) {
      patterns = HIRAGANA_TO_ROMAJI[currentChar];
      charLength = 1;
    }

    if (patterns && patterns[0]) {
      result += patterns[0];
      i += charLength;
    } else {
      // 対応がない場合はそのまま
      result += currentChar;
      i++;
    }
  }

  return result;
}
