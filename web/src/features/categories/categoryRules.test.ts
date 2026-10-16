import { describe, expect, it } from 'vitest';
import type { PhotoRef, PlaceWithRelations } from '../places/types';
import type { Category } from './categoryRepository';
import {
  countPlacesByCategory,
  findPlacesOnlyInCategory,
  recentPhotosForCategory,
  resolvePlaceCategories,
  sortCategoriesByCreation,
  sortCategoriesForHome,
} from './categoryRules';

function makeCategory(id: string, name: string, createdAt: string): Category {
  return { id, name, prompt: null, icon: null, createdAt };
}

function makePhoto(id: string, createdAt: string): PhotoRef {
  return { id, driveFileId: `drive-${id}`, position: 0, createdAt };
}

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

const QUAN_AN = makeCategory('an', 'Quán ăn', '2026-10-16T00:00:00.000Z');
const QUAN_UONG = makeCategory('uong', 'Quán uống', '2026-10-16T00:00:00.001Z');
const CHO_CHOI = makeCategory('choi', 'Chỗ chơi', '2026-10-16T00:00:00.002Z');
const DU_LICH = makeCategory('dulich', 'Du lịch', '2026-10-16T00:00:00.003Z');

describe('countPlacesByCategory', () => {
  it('đếm địa điểm ở mỗi nhóm, kể cả địa điểm thuộc nhiều nhóm', () => {
    const counts = countPlacesByCategory([
      makePlace('1', { categoryIds: ['an'] }),
      makePlace('2', { categoryIds: ['an', 'uong'] }),
    ]);
    expect(counts.get('an')).toBe(2);
    expect(counts.get('uong')).toBe(1);
    expect(counts.get('choi')).toBeUndefined();
  });
});

describe('sortCategoriesByCreation', () => {
  it('sắp theo thời điểm tạo, hoà thì theo tên', () => {
    const sameTimeA = makeCategory('x', 'Bánh', '2026-10-16T00:00:00.000Z');
    expect(sortCategoriesByCreation([DU_LICH, QUAN_UONG, sameTimeA, QUAN_AN])).toEqual([
      sameTimeA,
      QUAN_AN,
      QUAN_UONG,
      DU_LICH,
    ]);
  });
});

describe('sortCategoriesForHome', () => {
  it('nhiều địa điểm nhất lên đầu, hoà thì theo thời điểm tạo', () => {
    const counts = new Map([
      ['dulich', 3],
      ['uong', 1],
      ['choi', 1],
    ]);
    expect(sortCategoriesForHome([QUAN_AN, QUAN_UONG, CHO_CHOI, DU_LICH], counts)).toEqual([
      DU_LICH,
      QUAN_UONG,
      CHO_CHOI,
      QUAN_AN,
    ]);
  });
});

describe('recentPhotosForCategory', () => {
  it('lấy tối đa N ảnh mới nhất của các địa điểm trong nhóm', () => {
    const places = [
      makePlace('1', {
        categoryIds: ['an'],
        photos: [makePhoto('p1', '2026-10-01T00:00:00.000Z'), makePhoto('p2', '2026-10-05T00:00:00.000Z')],
      }),
      makePlace('2', { categoryIds: ['an'], photos: [makePhoto('p3', '2026-10-03T00:00:00.000Z')] }),
      makePlace('3', { categoryIds: ['uong'], photos: [makePhoto('p4', '2026-10-09T00:00:00.000Z')] }),
    ];
    expect(recentPhotosForCategory(places, 'an', 2).map((photo) => photo.id)).toEqual(['p2', 'p3']);
  });

  it('hoà thời điểm thì so id', () => {
    const places = [
      makePlace('1', {
        categoryIds: ['an'],
        photos: [makePhoto('b', '2026-10-01T00:00:00.000Z'), makePhoto('a', '2026-10-01T00:00:00.000Z')],
      }),
    ];
    expect(recentPhotosForCategory(places, 'an', 5).map((photo) => photo.id)).toEqual(['a', 'b']);
  });
});

describe('findPlacesOnlyInCategory', () => {
  it('chỉ trả địa điểm có đúng một nhóm là nhóm đó', () => {
    const onlyAn = makePlace('1', { categoryIds: ['an'] });
    const both = makePlace('2', { categoryIds: ['an', 'uong'] });
    expect(findPlacesOnlyInCategory([onlyAn, both], 'an')).toEqual([onlyAn]);
  });
});

describe('resolvePlaceCategories', () => {
  it('trả nhóm theo thứ tự tạo và bỏ id không còn tồn tại', () => {
    const place = makePlace('1', { categoryIds: ['dulich', 'khong-con', 'an'] });
    expect(resolvePlaceCategories(place, [DU_LICH, QUAN_AN, QUAN_UONG])).toEqual([
      QUAN_AN,
      DU_LICH,
    ]);
  });
});
