/**
 * Seeded Random Number Generator
 *
 * Provides deterministic random numbers based on a seed value.
 * Used for multiplayer games to ensure both players get the same sequence.
 */

export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) {
      this.seed += 2147483646;
    }
  }

  /**
   * Returns a random number between 0 and 1 (exclusive)
   */
  next(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }

  /**
   * Returns a random integer between min (inclusive) and max (exclusive)
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }

  /**
   * Returns a random element from an array
   */
  pick<T>(array: T[]): T {
    return array[this.nextInt(0, array.length)];
  }

  /**
   * Shuffles an array in place using Fisher-Yates algorithm
   */
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Returns the current seed (useful for serialization)
   */
  getSeed(): number {
    return this.seed;
  }
}

/**
 * Creates a new seeded random number generator
 */
export function createSeededRandom(seed: number): SeededRandom {
  return new SeededRandom(seed);
}

/**
 * Generates a random seed
 */
export function generateRandomSeed(): number {
  return Math.floor(Math.random() * 2147483647);
}
