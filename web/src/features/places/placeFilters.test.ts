import { describe, expect, it } from 'vitest';
import { filterPlaces, sortPlaces } from './placeFilters';
import type { PlaceWithRelations } from './types';

/** Toạ độ Hà Nội, dùng làm `origin` cho các ca sắp theo khoảng cách. */
const HANOI = { latitude: 21.0285, longitude: 105.8542 };

let nextId = 0;

/** Tạo nhanh một `PlaceWithRelations` tối thiểu, ghi đè các trường cần thiết cho từng ca kiểm thử. */
function makePlace(overrides: Partial<PlaceWithRelations> = {}): PlaceWithRelations {
  nextId += 1;
  return {
    id: `place-${nextId}`,
    userId: 'user-1',
    name: 'Địa điểm',
    address: null,
    latitude: null,
    longitude: null,
    googleMapsUrl: null,
    googlePlaceRef: null,
    rating: null,
    priceMinVnd: null,
    priceMaxVnd: null,
    notes: null,
    status: 'not_visited',
    openingHours: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    tagIds: [],
    photos: [],
    visitDates: [],
    ...overrides,
  };
}

describe('filterPlaces', () => {
  it('tìm "pho" khớp "Phở Thìn"', () => {
    const phoThin = makePlace({ name: 'Phở Thìn' });
    const cafe = makePlace({ name: 'Cafe Giảng' });

    const result = filterPlaces(
      [phoThin, cafe],
      { query: 'pho', tagIds: [], status: 'all' },
      new Map(),
    );

    expect(result).toEqual([phoThin]);
  });

  it('lọc nhiều nhãn theo kiểu HOẶC', () => {
    const anUong = makePlace({ tagIds: ['tag-an-uong'] });
    const vuiChoi = makePlace({ tagIds: ['tag-vui-choi'] });
    const heTinh = makePlace({ tagIds: ['tag-he-thong'] });

    const result = filterPlaces(
      [anUong, vuiChoi, heTinh],
      { query: '', tagIds: ['tag-an-uong', 'tag-vui-choi'], status: 'all' },
      new Map(),
    );

    expect(result).toEqual([anUong, vuiChoi]);
  });

  it('lọc theo trạng thái', () => {
    const visited = makePlace({ status: 'visited' });
    const notVisited = makePlace({ status: 'not_visited' });

    const result = filterPlaces(
      [visited, notVisited],
      { query: '', tagIds: [], status: 'visited' },
      new Map(),
    );

    expect(result).toEqual([visited]);
  });

  it('so khớp cả tên nhãn trong từ khoá tìm kiếm', () => {
    const place = makePlace({ name: 'Quán A', tagIds: ['tag-1'] });
    const tagNameById = new Map([['tag-1', 'Hẹn hò']]);

    const result = filterPlaces(
      [place],
      { query: 'hen ho', tagIds: [], status: 'all' },
      tagNameById,
    );

    expect(result).toEqual([place]);
  });
});

describe('sortPlaces', () => {
  it('sắp theo rating giảm dần, null xuống cuối', () => {
    const fiveStars = makePlace({ rating: 5, updatedAt: '2026-01-01T00:00:00.000Z' });
    const threeStars = makePlace({ rating: 3, updatedAt: '2026-01-01T00:00:00.000Z' });
    const noRating = makePlace({ rating: null, updatedAt: '2026-01-03T00:00:00.000Z' });

    const { sorted, withoutCoordsCount } = sortPlaces([noRating, threeStars, fiveStars], 'rating');

    expect(sorted).toEqual([fiveStars, threeStars, noRating]);
    expect(withoutCoordsCount).toBe(0);
  });

  it('rating hoà nhau thì xếp theo cập nhật gần nhất', () => {
    const older = makePlace({ rating: 4, updatedAt: '2026-01-01T00:00:00.000Z' });
    const newer = makePlace({ rating: 4, updatedAt: '2026-01-05T00:00:00.000Z' });

    const { sorted } = sortPlaces([older, newer], 'rating');

    expect(sorted).toEqual([newer, older]);
  });

  it('sắp theo khoảng cách: loại địa điểm chưa có toạ độ và đếm đúng số lượng bị loại', () => {
    const near = makePlace({ latitude: 21.03, longitude: 105.85 });
    const far = makePlace({ latitude: 10.8231, longitude: 106.6297 });
    const noCoords1 = makePlace({ latitude: null, longitude: null });
    const noCoords2 = makePlace({ latitude: null, longitude: null });

    const { sorted, withoutCoordsCount } = sortPlaces(
      [far, noCoords1, near, noCoords2],
      'distance',
      HANOI,
    );

    expect(sorted).toEqual([near, far]);
    expect(withoutCoordsCount).toBe(2);
  });

  it('sắp theo cập nhật gần nhất khi mode là "recent"', () => {
    const older = makePlace({ updatedAt: '2026-01-01T00:00:00.000Z' });
    const newer = makePlace({ updatedAt: '2026-01-02T00:00:00.000Z' });

    const { sorted } = sortPlaces([older, newer], 'recent');

    expect(sorted).toEqual([newer, older]);
  });
});
