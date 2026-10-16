import { describe, expect, it } from 'vitest';
import { getCoverPhoto, limitChips } from './placeDisplay';

/** Tạo nhanh một ảnh với `position` cho trước. */
function photo(id: string, position: number) {
  return { id, driveFileId: `drive-${id}`, position, createdAt: '2026-01-01T00:00:00.000Z' };
}

describe('getCoverPhoto', () => {
  it('không có ảnh thì trả null', () => {
    expect(getCoverPhoto({ photos: [] })).toBeNull();
  });

  it('chọn ảnh có position nhỏ nhất', () => {
    expect(getCoverPhoto({ photos: [photo('b', 2), photo('a', 0), photo('c', 1)] })?.id).toBe('a');
  });
});

describe('limitChips', () => {
  it('không vượt quá giới hạn thì không ẩn gì', () => {
    expect(limitChips(['Quán ăn', 'Hẹn hò'], 3)).toEqual({
      visible: ['Quán ăn', 'Hẹn hò'],
      extraCount: 0,
    });
  });

  it('vượt giới hạn thì đếm phần bị ẩn', () => {
    expect(limitChips(['a', 'b', 'c', 'd', 'e'], 3)).toEqual({
      visible: ['a', 'b', 'c'],
      extraCount: 2,
    });
  });
});
