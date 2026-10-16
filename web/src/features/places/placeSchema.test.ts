import { describe, expect, it } from 'vitest';
import { placeFormSchema, type PlaceFormValues } from './placeSchema';

/** Một bộ giá trị form hợp lệ tối thiểu; `overrides` ghi đè từng trường. */
function makeValues(overrides: Partial<PlaceFormValues> = {}): PlaceFormValues {
  return {
    name: 'Phở Thìn',
    address: null,
    latitude: null,
    longitude: null,
    googleMapsUrl: null,
    googlePlaceRef: null,
    rating: null,
    priceMinVnd: null,
    priceMaxVnd: null,
    notes: null,
    story: null,
    status: 'not_visited',
    openingHours: null,
    categoryIds: [crypto.randomUUID()],
    tagIds: [],
    ...overrides,
  };
}

describe('placeFormSchema', () => {
  it('chấp nhận dữ liệu hợp lệ', () => {
    expect(placeFormSchema.safeParse(makeValues()).success).toBe(true);
  });

  it('bắt buộc chọn ít nhất một nhóm', () => {
    const result = placeFormSchema.safeParse(makeValues({ categoryIds: [] }));
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Chọn ít nhất một nhóm');
  });

  it('câu chuyện tối đa 5000 ký tự', () => {
    const result = placeFormSchema.safeParse(makeValues({ story: 'a'.repeat(5001) }));
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Câu chuyện tối đa 5000 ký tự');
  });

  it('câu chuyện đúng 5000 ký tự vẫn hợp lệ', () => {
    expect(placeFormSchema.safeParse(makeValues({ story: 'a'.repeat(5000) })).success).toBe(true);
  });
});
