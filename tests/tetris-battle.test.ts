import { describe, it, expect, vi } from 'vitest';

// テスト用にTetrisBattle.tsxから抽出したロジック
const FIELD_COL = 10;
const FIELD_ROW = 20;

// シード付き乱数生成（TetrisBattle.tsxと同じ実装）
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// お邪魔ブロック追加ロジック（70%穴位置継続ルール）
function addGarbageLines(
  field: number[][],
  lines: number,
  random: () => number
): { field: number[][]; holePositions: number[] } {
  const newField = field.map(row => [...row]);
  let holePos = Math.floor(random() * FIELD_COL);
  const holePositions: number[] = [];

  for (let i = 0; i < lines; i++) {
    newField.shift();
    const garbageLine = Array(FIELD_COL).fill(8); // 8 = garbage color
    garbageLine[holePos] = 0;
    newField.push(garbageLine);
    holePositions.push(holePos);

    // ぷよテト仕様: 70%の確率で同じ穴位置、30%で変更
    if (random() > 0.7) {
      holePos = Math.floor(random() * FIELD_COL);
    }
  }

  return { field: newField, holePositions };
}

// consumeGarbageロジックのシミュレーション
function simulateLockPieceGarbageConsumption(
  localPendingGarbage: number,
  linesCleared: number
): { garbageAdded: number; consumeGarbageCalled: number } {
  let garbageAdded = 0;
  let consumeGarbageCalled = 0;

  if (linesCleared > 0) {
    // ラインを消した場合はお邪魔を追加しない
    return { garbageAdded, consumeGarbageCalled };
  }

  // ラインを消さなかった場合
  if (localPendingGarbage > 0) {
    const linesToAdd = localPendingGarbage; // 先に値を保存
    garbageAdded = linesToAdd;
    // setLocalPendingGarbage(0) の後でも正しい値を使える
    consumeGarbageCalled = linesToAdd;
  }

  return { garbageAdded, consumeGarbageCalled };
}

// バグのある古い実装（テスト用）
function simulateLockPieceGarbageConsumptionBuggy(
  localPendingGarbage: number,
  linesCleared: number
): { garbageAdded: number; consumeGarbageCalled: number } {
  let garbageAdded = 0;
  let consumeGarbageCalled = 0;
  let currentPending = localPendingGarbage;

  if (linesCleared > 0) {
    return { garbageAdded, consumeGarbageCalled };
  }

  if (currentPending > 0) {
    garbageAdded = currentPending;
    currentPending = 0; // setLocalPendingGarbage(0)
    consumeGarbageCalled = currentPending; // バグ: 0になっている
  }

  return { garbageAdded, consumeGarbageCalled };
}

describe('TetrisBattle お邪魔ブロック', () => {
  describe('consumeGarbage 引数バグ修正', () => {
    it('修正版: consumeGarbageに正しい値が渡される', () => {
      const pendingGarbage = 3;
      const result = simulateLockPieceGarbageConsumption(pendingGarbage, 0);

      expect(result.garbageAdded).toBe(3);
      expect(result.consumeGarbageCalled).toBe(3); // 正しい値
    });

    it('バグ版: consumeGarbageに0が渡されてしまう', () => {
      const pendingGarbage = 3;
      const result = simulateLockPieceGarbageConsumptionBuggy(pendingGarbage, 0);

      expect(result.garbageAdded).toBe(3);
      expect(result.consumeGarbageCalled).toBe(0); // バグ: 0になる
    });

    it('ラインを消した場合はお邪魔を追加しない', () => {
      const pendingGarbage = 5;
      const result = simulateLockPieceGarbageConsumption(pendingGarbage, 2);

      expect(result.garbageAdded).toBe(0);
      expect(result.consumeGarbageCalled).toBe(0);
    });

    it('pendingGarbageが0の場合は何もしない', () => {
      const result = simulateLockPieceGarbageConsumption(0, 0);

      expect(result.garbageAdded).toBe(0);
      expect(result.consumeGarbageCalled).toBe(0);
    });
  });

  describe('70%穴位置継続ルール', () => {
    it('お邪魔ブロックがフィールドの下に追加される', () => {
      const field = Array(FIELD_ROW).fill(null).map(() => Array(FIELD_COL).fill(0));
      const random = seededRandom(12345);

      const { field: newField } = addGarbageLines(field, 3, random);

      // 下3行がお邪魔ブロック（8）で埋まっている
      for (let row = FIELD_ROW - 3; row < FIELD_ROW; row++) {
        const garbageCount = newField[row].filter(cell => cell === 8).length;
        expect(garbageCount).toBe(FIELD_COL - 1); // 穴が1つ
      }
    });

    it('各行に穴が1つずつある', () => {
      const field = Array(FIELD_ROW).fill(null).map(() => Array(FIELD_COL).fill(0));
      const random = seededRandom(12345);

      const { field: newField, holePositions } = addGarbageLines(field, 5, random);

      // 全ての穴位置が有効範囲内
      holePositions.forEach(pos => {
        expect(pos).toBeGreaterThanOrEqual(0);
        expect(pos).toBeLessThan(FIELD_COL);
      });

      // 下5行それぞれに穴が1つ
      for (let i = 0; i < 5; i++) {
        const row = newField[FIELD_ROW - 5 + i];
        const holeCount = row.filter(cell => cell === 0).length;
        expect(holeCount).toBe(1);
      }
    });

    it('穴位置が約70%の確率で継続する（統計テスト）', () => {
      const iterations = 1000;
      let sameHoleCount = 0;

      for (let i = 0; i < iterations; i++) {
        const field = Array(FIELD_ROW).fill(null).map(() => Array(FIELD_COL).fill(0));
        const random = seededRandom(i * 12345);

        const { holePositions } = addGarbageLines(field, 2, random);

        if (holePositions[0] === holePositions[1]) {
          sameHoleCount++;
        }
      }

      const sameHoleRate = sameHoleCount / iterations;

      // 70%±10%の範囲内であることを確認
      expect(sameHoleRate).toBeGreaterThan(0.6);
      expect(sameHoleRate).toBeLessThan(0.8);
    });

    it('多段お邪魔でも穴位置ルールが適用される', () => {
      const field = Array(FIELD_ROW).fill(null).map(() => Array(FIELD_COL).fill(0));
      // 固定シードで再現可能なテスト
      const random = seededRandom(42);

      const { holePositions } = addGarbageLines(field, 10, random);

      // 10行全てに穴位置が設定されている
      expect(holePositions.length).toBe(10);

      // 連続して同じ穴位置が続く箇所がある（70%ルールの証拠）
      let consecutiveSameCount = 0;
      for (let i = 1; i < holePositions.length; i++) {
        if (holePositions[i] === holePositions[i - 1]) {
          consecutiveSameCount++;
        }
      }

      // 10行中、少なくとも3回は同じ穴位置が続くはず
      expect(consecutiveSameCount).toBeGreaterThanOrEqual(3);
    });
  });

  describe('シード付き乱数生成', () => {
    it('同じシードで同じ結果を返す', () => {
      const random1 = seededRandom(12345);
      const random2 = seededRandom(12345);

      for (let i = 0; i < 10; i++) {
        expect(random1()).toBe(random2());
      }
    });

    it('異なるシードで異なる結果を返す', () => {
      const random1 = seededRandom(12345);
      const random2 = seededRandom(54321);

      let different = false;
      for (let i = 0; i < 10; i++) {
        if (random1() !== random2()) {
          different = true;
          break;
        }
      }
      expect(different).toBe(true);
    });

    it('0-1の範囲の値を返す', () => {
      const random = seededRandom(99999);

      for (let i = 0; i < 100; i++) {
        const value = random();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      }
    });
  });
});
