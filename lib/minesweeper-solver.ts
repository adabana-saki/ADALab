/**
 * マインスイーパー制約伝播ソルバー
 * 盤面が論理的に（推測なしで）解けるかどうかを判定する
 */

interface SolverCell {
  isMine: boolean;
  adjacentMines: number;
}

/** 制約: cells の中に exactlyMines 個の地雷がある */
interface Constraint {
  cells: Set<number>; // セルのインデックス (y * width + x)
  mines: number;
}

/** 隣接セルの座標を取得 */
function getNeighbors(
  x: number,
  y: number,
  width: number,
  height: number
): number[] {
  const neighbors: number[] = [];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        neighbors.push(ny * width + nx);
      }
    }
  }
  return neighbors;
}

/**
 * 初手クリックのflood-fillをシミュレーションして初期公開セルを求める
 */
function simulateReveal(
  board: SolverCell[],
  width: number,
  height: number,
  startX: number,
  startY: number
): Set<number> {
  const revealed = new Set<number>();
  const queue: number[] = [startY * width + startX];

  while (queue.length > 0) {
    const idx = queue.pop()!;
    if (revealed.has(idx)) continue;
    if (board[idx].isMine) continue;

    revealed.add(idx);

    // adjacentMines === 0 なら周囲も開く
    if (board[idx].adjacentMines === 0) {
      const x = idx % width;
      const y = (idx - x) / width;
      for (const nIdx of getNeighbors(x, y, width, height)) {
        if (!revealed.has(nIdx)) {
          queue.push(nIdx);
        }
      }
    }
  }

  return revealed;
}

/**
 * 盤面が論理的に解けるかどうかを判定する
 *
 * @param board - Cell[][] の盤面（isMine, adjacentMines が設定済み）
 * @param width - 盤面の幅
 * @param height - 盤面の高さ
 * @param safeX - 初手クリックのX座標
 * @param safeY - 初手クリックのY座標
 * @returns 推測なしで解けるなら true
 */
export function isBoardSolvable(
  board: { isMine: boolean; adjacentMines: number }[][],
  width: number,
  height: number,
  safeX: number,
  safeY: number
): boolean {
  const totalCells = width * height;
  const totalSafeCells = totalCells - board.flat().filter((c) => c.isMine).length;

  // 1次元配列に変換
  const flat: SolverCell[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      flat.push({ isMine: board[y][x].isMine, adjacentMines: board[y][x].adjacentMines });
    }
  }

  // 初手のflood-fillをシミュレーション
  const revealed = simulateReveal(flat, width, height, safeX, safeY);

  // 既知の地雷/安全セル
  const knownSafe = new Set(revealed);
  const knownMine = new Set<number>();

  // 新しく公開されたセルから制約を生成するヘルパー
  function buildConstraints(): Constraint[] {
    const constraints: Constraint[] = [];
    for (const idx of knownSafe) {
      const cell = flat[idx];
      if (cell.adjacentMines === 0) continue;

      const x = idx % width;
      const y = (idx - x) / width;
      const neighbors = getNeighbors(x, y, width, height);

      const unknownNeighbors = new Set<number>();
      let adjacentKnownMines = 0;

      for (const nIdx of neighbors) {
        if (knownMine.has(nIdx)) {
          adjacentKnownMines++;
        } else if (!knownSafe.has(nIdx)) {
          unknownNeighbors.add(nIdx);
        }
      }

      const remainingMines = cell.adjacentMines - adjacentKnownMines;

      if (unknownNeighbors.size > 0) {
        constraints.push({ cells: unknownNeighbors, mines: remainingMines });
      }
    }
    return constraints;
  }

  // 反復ソルバーループ
  let changed = true;
  while (changed) {
    changed = false;

    if (knownSafe.size === totalSafeCells) return true;

    const constraints = buildConstraints();

    // ルール1: 自明な制約を解決
    for (const constraint of constraints) {
      if (constraint.cells.size === 0) continue;

      // 残り地雷数 = 0 → 全て安全
      if (constraint.mines === 0) {
        for (const idx of constraint.cells) {
          if (!knownSafe.has(idx)) {
            knownSafe.add(idx);
            changed = true;
            // 新しく安全と判明したセルがadjacent=0なら、さらにflood-fill
            if (flat[idx].adjacentMines === 0) {
              const x = idx % width;
              const y = (idx - x) / width;
              const extraRevealed = simulateReveal(flat, width, height, x, y);
              for (const rIdx of extraRevealed) {
                if (!knownSafe.has(rIdx)) {
                  knownSafe.add(rIdx);
                }
              }
            }
          }
        }
        continue;
      }

      // 残り地雷数 = 未知セル数 → 全て地雷
      if (constraint.mines === constraint.cells.size) {
        for (const idx of constraint.cells) {
          if (!knownMine.has(idx)) {
            knownMine.add(idx);
            changed = true;
          }
        }
        continue;
      }
    }

    if (changed) continue;

    // ルール2: 制約間の差集合推論
    const constraintList = buildConstraints();
    for (let i = 0; i < constraintList.length; i++) {
      for (let j = 0; j < constraintList.length; j++) {
        if (i === j) continue;
        const a = constraintList[i];
        const b = constraintList[j];

        // AがBの部分集合かチェック
        if (a.cells.size >= b.cells.size) continue;

        let isSubset = true;
        for (const cell of a.cells) {
          if (!b.cells.has(cell)) {
            isSubset = false;
            break;
          }
        }

        if (!isSubset) continue;

        // B - A の差集合から新しい制約を導出
        const diffCells = new Set<number>();
        for (const cell of b.cells) {
          if (!a.cells.has(cell)) {
            diffCells.add(cell);
          }
        }
        const diffMines = b.mines - a.mines;

        if (diffCells.size === 0) continue;

        // 差集合の制約から自明な推論
        if (diffMines === 0) {
          for (const idx of diffCells) {
            if (!knownSafe.has(idx)) {
              knownSafe.add(idx);
              changed = true;
              if (flat[idx].adjacentMines === 0) {
                const x = idx % width;
                const y = (idx - x) / width;
                const extraRevealed = simulateReveal(flat, width, height, x, y);
                for (const rIdx of extraRevealed) {
                  if (!knownSafe.has(rIdx)) {
                    knownSafe.add(rIdx);
                  }
                }
              }
            }
          }
        } else if (diffMines === diffCells.size) {
          for (const idx of diffCells) {
            if (!knownMine.has(idx)) {
              knownMine.add(idx);
              changed = true;
            }
          }
        }
      }
    }
  }

  return knownSafe.size === totalSafeCells;
}
