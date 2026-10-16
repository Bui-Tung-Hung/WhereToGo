import { describe, expect, it } from 'vitest';
import { createRandomSeed, createSeededRandom, pickRandom, shuffle } from './shuffle';

/** Lấy `count` số đầu tiên của một nguồn ngẫu nhiên. */
function take(random: () => number, count: number): number[] {
  return Array.from({ length: count }, () => random());
}

describe('shuffle', () => {
  it('giữ đủ phần tử và không đổi mảng gốc', () => {
    const items = [1, 2, 3, 4, 5, 6];
    const result = shuffle(items, createSeededRandom(42));
    expect([...result].sort((a, b) => a - b)).toEqual(items);
    expect(items).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('cho cùng thứ tự với cùng một nguồn ngẫu nhiên cố định', () => {
    const items = ['a', 'b', 'c', 'd', 'e', 'f'];
    expect(shuffle(items, createSeededRandom(7))).toEqual(shuffle(items, createSeededRandom(7)));
  });

  it('nguồn luôn trả 0 thì mỗi bước đổi chỗ với phần tử đầu', () => {
    expect(shuffle([1, 2, 3], () => 0)).toEqual([2, 3, 1]);
  });
});

describe('pickRandom', () => {
  it('mảng rỗng thì trả undefined', () => {
    expect(pickRandom([], () => 0.5)).toBeUndefined();
  });

  it('bốc đúng phần tử theo nguồn ngẫu nhiên', () => {
    expect(pickRandom(['a', 'b', 'c', 'd'], () => 0.5)).toBe('c');
  });
});

describe('createRandomSeed', () => {
  it('đổi số trong [0, 1) thành số nguyên 32 bit', () => {
    expect(createRandomSeed(() => 0.5)).toBe(2147483648);
    expect(createRandomSeed(() => 0)).toBe(0);
    expect(Number.isInteger(createRandomSeed())).toBe(true);
  });
});

describe('createSeededRandom', () => {
  it('cùng seed thì cùng dãy số', () => {
    expect(take(createSeededRandom(123), 5)).toEqual(take(createSeededRandom(123), 5));
  });

  it('seed 1 và 2 cho dãy khác nhau', () => {
    expect(take(createSeededRandom(1), 5)).not.toEqual(take(createSeededRandom(2), 5));
  });

  it('seed lớn 3000000000 và 3000000001 cho dãy khác nhau', () => {
    expect(take(createSeededRandom(3000000000), 5)).not.toEqual(
      take(createSeededRandom(3000000001), 5),
    );
  });

  it('mọi giá trị nằm trong [0, 1)', () => {
    for (const value of take(createSeededRandom(99), 200)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});
