import { describe, expect, it } from 'vitest';
import { formatDistance, haversineMeters } from './distance';

describe('haversineMeters', () => {
  it('Hà Nội → TP.HCM khoảng 1137 km (sai số ±1%)', () => {
    const hanoi = { latitude: 21.0285, longitude: 105.8542 };
    const hoChiMinh = { latitude: 10.8231, longitude: 106.6297 };

    const km = haversineMeters(hanoi, hoChiMinh) / 1000;

    expect(km).toBeGreaterThan(1137 * 0.99);
    expect(km).toBeLessThan(1137 * 1.01);
  });
});

describe('formatDistance', () => {
  it('dưới 1000 m làm tròn tới 10 m gần nhất', () => {
    expect(formatDistance(349)).toBe('350 m');
  });

  it('từ 1000 m trở lên hiển thị theo km với dấu phẩy', () => {
    expect(formatDistance(1234)).toBe('1,2 km');
  });
});
