/** Hàm sinh số ngẫu nhiên trong [0, 1), cùng chữ ký với `Math.random`. */
export type RandomSource = () => number;

/**
 * Trả một bản sao đã xáo trộn của `items` (thuật toán Fisher–Yates), không đổi mảng gốc.
 *
 * @param random - Nguồn ngẫu nhiên; truyền nguồn cố định để kết quả lặp lại được (test, bộ thẻ).
 */
export function shuffle<T>(items: readonly T[], random: RandomSource = Math.random): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const current = result[index] as T;
    result[index] = result[swapIndex] as T;
    result[swapIndex] = current;
  }
  return result;
}

/** Bốc ngẫu nhiên một phần tử của `items`; mảng rỗng thì trả `undefined`. */
export function pickRandom<T>(items: readonly T[], random: RandomSource = Math.random): T | undefined {
  if (items.length === 0) {
    return undefined;
  }
  return items[Math.floor(random() * items.length)];
}

/**
 * Tạo một seed là số nguyên 32 bit không dấu (0 … 4 294 967 295) cho {@link createSeededRandom}.
 * Gọi trong handler hoặc `useState` initializer, không gọi trực tiếp trong thân component (P30).
 */
export function createRandomSeed(random: RandomSource = Math.random): number {
  return Math.floor(random() * 4294967296);
}

/**
 * Nguồn ngẫu nhiên có seed (thuật toán mulberry32): cùng `seed` luôn cho cùng một dãy số trong
 * [0, 1). `seed` PHẢI là số nguyên 32 bit (dùng {@link createRandomSeed}); mulberry32 bỏ phần
 * thập phân nên mọi số thực trong [0, 1) sẽ cho cùng một dãy.
 */
export function createSeededRandom(seed: number): RandomSource {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
