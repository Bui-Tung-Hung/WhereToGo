import { describe, expect, it } from 'vitest';
import { normalizeVi } from './viNormalize';

describe('normalizeVi', () => {
  it('xoá dấu và hạ chữ thường', () => {
    expect(normalizeVi('Phở Đặc Biệt')).toBe('pho dac biet');
  });

  it('gộp khoảng trắng liên tiếp và cắt khoảng trắng đầu/cuối', () => {
    expect(normalizeVi('  Cà   phê ')).toBe('ca phe');
  });

  it('hạ chữ thường chữ in hoa có dấu', () => {
    expect(normalizeVi('ĐÀ LẠT')).toBe('da lat');
  });
});
