import { describe, expect, it } from 'vitest';
import { formatVnd, formatVndInput, formatVndRange, parseVndInput } from './vnd';

describe('formatVnd', () => {
  it('định dạng số nguyên VNĐ kèm hậu tố "₫"', () => {
    expect(formatVnd(150000)).toBe('150.000 ₫');
  });
});

describe('formatVndRange', () => {
  it('có cả hai giá trị', () => {
    expect(formatVndRange(150000, 300000)).toBe('150.000 ₫ – 300.000 ₫');
  });

  it('chỉ có giá thấp nhất', () => {
    expect(formatVndRange(150000, null)).toBe('Từ 150.000 ₫');
  });

  it('chỉ có giá cao nhất', () => {
    expect(formatVndRange(null, 300000)).toBe('Đến 300.000 ₫');
  });

  it('không có giá nào', () => {
    expect(formatVndRange(null, null)).toBeNull();
  });
});

describe('parseVndInput', () => {
  it('chỉ giữ lại chữ số', () => {
    expect(parseVndInput('150.000đ')).toBe(150000);
  });

  it('chuỗi rỗng trả về null', () => {
    expect(parseVndInput('')).toBeNull();
  });

  it('vượt quá giới hạn trả về null', () => {
    expect(parseVndInput('3.000.000.000')).toBeNull();
  });
});

describe('formatVndInput', () => {
  it('định dạng dấu chấm ngăn cách hàng nghìn khi đang gõ', () => {
    expect(formatVndInput('150000')).toBe('150.000');
  });

  it('chuỗi rỗng trả về rỗng', () => {
    expect(formatVndInput('')).toBe('');
  });
});
