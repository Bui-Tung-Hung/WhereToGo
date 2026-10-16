import { describe, expect, it } from 'vitest';
import { patchPlace, withFavoritedAt, withInterestDelta } from './placeCache';
import type { PlaceWithRelations } from './types';

/** Tạo nhanh một `PlaceWithRelations` tối thiểu cho từng ca kiểm thử. */
function makePlace(id: string, overrides: Partial<PlaceWithRelations> = {}): PlaceWithRelations {
  return {
    id,
    userId: 'user-1',
    name: `Địa điểm ${id}`,
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
    interestScore: 0,
    favoritedAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    categoryIds: [],
    tagIds: [],
    photos: [],
    visitDates: [],
    ...overrides,
  };
}

describe('patchPlace', () => {
  it('chỉ đổi đúng địa điểm có id và trả mảng mới', () => {
    const places = [makePlace('a'), makePlace('b')];
    const result = patchPlace(places, 'b', (place) => withInterestDelta(place, 1));
    expect(result).not.toBe(places);
    expect(result?.[0]).toBe(places[0]);
    expect(result?.[1]?.interestScore).toBe(1);
    expect(places[1]?.interestScore).toBe(0);
  });

  it('cache chưa có (undefined) thì giữ nguyên undefined', () => {
    expect(patchPlace(undefined, 'a', (place) => place)).toBeUndefined();
  });
});

describe('withInterestDelta', () => {
  it('cộng được cả số âm', () => {
    expect(withInterestDelta(makePlace('a', { interestScore: 2 }), -1).interestScore).toBe(1);
    expect(withInterestDelta(makePlace('a'), -1).interestScore).toBe(-1);
  });
});

describe('withFavoritedAt', () => {
  it('đặt và bỏ thời điểm Yêu thích', () => {
    const favorited = withFavoritedAt(makePlace('a'), '2026-10-17T00:00:00.000Z');
    expect(favorited.favoritedAt).toBe('2026-10-17T00:00:00.000Z');
    expect(withFavoritedAt(favorited, null).favoritedAt).toBeNull();
  });
});
