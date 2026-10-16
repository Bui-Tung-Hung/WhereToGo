import { describe, expect, it } from 'vitest';
import type { PlaceWithRelations } from '../places/types';
import { createDailyPickStore } from './dailyPick';

/** Tạo nhanh một `PlaceWithRelations` tối thiểu cho từng ca kiểm thử. */
function makePlace(id: string): PlaceWithRelations {
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
  };
}

describe('createDailyPickStore', () => {
  it('danh sách rỗng thì trả null', () => {
    expect(createDailyPickStore().pick([])).toBeNull();
  });

  it('giữ cùng một quán qua nhiều lần gọi trong một store', () => {
    const store = createDailyPickStore();
    const places = [makePlace('a'), makePlace('b'), makePlace('c')];
    const first = store.pick(places, () => 0.9);
    expect(first?.id).toBe('c');
    expect(store.pick(places, () => 0)?.id).toBe('c');
  });

  it('quán đã bốc bị xoá thì bốc lại', () => {
    const store = createDailyPickStore();
    expect(store.pick([makePlace('a'), makePlace('b')], () => 0.9)?.id).toBe('b');
    expect(store.pick([makePlace('a')], () => 0.9)?.id).toBe('a');
  });
});
