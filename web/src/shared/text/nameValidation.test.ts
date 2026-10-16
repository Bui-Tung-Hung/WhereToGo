import { describe, expect, it } from 'vitest';
import { nameErrorMessage, validateName } from './nameValidation';

describe('validateName', () => {
  it('trả tên đã trim khi hợp lệ', () => {
    expect(validateName('  Hẹn hò  ', ['Quán ăn'], { maxLength: 50 })).toEqual({
      kind: 'ok',
      name: 'Hẹn hò',
    });
  });

  it('tên rỗng hoặc toàn khoảng trắng là empty', () => {
    expect(validateName('   ', [], { maxLength: 50 })).toEqual({ kind: 'empty' });
  });

  it('dài hơn maxLength là too_long', () => {
    expect(validateName('a'.repeat(51), [], { maxLength: 50 })).toEqual({ kind: 'too_long' });
  });

  it('trùng tên (khác dấu, hoa thường) là duplicate', () => {
    expect(validateName('hen ho', ['Hẹn Hò'], { maxLength: 50 })).toEqual({ kind: 'duplicate' });
  });

  it('bỏ qua tên đang sửa khi kiểm trùng', () => {
    expect(
      validateName('Hẹn hò', ['Hẹn hò', 'Quán ăn'], { maxLength: 50, excludeName: 'Hẹn hò' }),
    ).toEqual({ kind: 'ok', name: 'Hẹn hò' });
  });
});

describe('nameErrorMessage', () => {
  it('giữ đúng câu lỗi cũ của nhãn', () => {
    expect(nameErrorMessage('empty', 'nhãn', 50)).toBe('Tên nhãn phải từ 1 đến 50 ký tự.');
    expect(nameErrorMessage('too_long', 'nhãn', 50)).toBe('Tên nhãn phải từ 1 đến 50 ký tự.');
    expect(nameErrorMessage('duplicate', 'nhãn', 50)).toBe('Nhãn này đã tồn tại.');
  });

  it('dùng được cho nhóm', () => {
    expect(nameErrorMessage('duplicate', 'nhóm', 50)).toBe('Nhóm này đã tồn tại.');
  });
});
