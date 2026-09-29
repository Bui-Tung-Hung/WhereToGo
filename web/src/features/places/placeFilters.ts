import { haversineMeters, type LatLng } from '../../shared/geo/distance';
import { normalizeVi } from '../../shared/text/viNormalize';
import type { PlaceStatus, PlaceWithRelations } from './types';

/** Cách sắp xếp danh sách địa điểm (mục 6.6 PLAN.md). */
export type SortMode = 'recent' | 'rating' | 'distance';

/** Bộ lọc trạng thái: một giá trị cụ thể, hoặc `'all'` để bỏ qua lọc trạng thái. */
export type StatusFilter = PlaceStatus | 'all';

export interface PlaceFilterCriteria {
  /** Từ khoá tìm kiếm thô (chưa chuẩn hoá) — rỗng nghĩa là không lọc theo từ khoá. */
  query: string;
  /** Các id nhãn đã chọn — rỗng nghĩa là không lọc theo nhãn; nhiều nhãn là lọc kiểu HOẶC (D19). */
  tagIds: string[];
  /** `'all'` để bỏ qua lọc trạng thái. */
  status: StatusFilter;
}

export interface SortResult {
  sorted: PlaceWithRelations[];
  /** Số địa điểm bị loại khỏi kết quả vì chưa có toạ độ (chỉ khác 0 khi `mode === 'distance'`). */
  withoutCoordsCount: number;
}

/** Chuỗi để so khớp tìm kiếm của một địa điểm: tên + địa chỉ + ghi chú + tên các nhãn, đã chuẩn hoá. */
function buildSearchableText(
  place: PlaceWithRelations,
  tagNameById: ReadonlyMap<string, string>,
): string {
  const tagNames = place.tagIds.map((tagId) => tagNameById.get(tagId) ?? '').join(' ');
  return normalizeVi([place.name, place.address ?? '', place.notes ?? '', tagNames].join(' '));
}

/**
 * Lọc danh sách địa điểm theo từ khoá tìm kiếm, nhãn và trạng thái (mục 6.6
 * PLAN.md):
 * - `query`: chuẩn hoá (bỏ dấu/hoa thường), tách token theo khoảng trắng;
 *   MỌI token phải xuất hiện trong chuỗi tìm kiếm của địa điểm (tên + địa
 *   chỉ + ghi chú + tên nhãn).
 * - `tagIds`: rỗng thì bỏ qua; khi có, địa điểm phải mang ÍT NHẤT MỘT trong
 *   các nhãn đã chọn (D19 — kiểu HOẶC).
 * - `status`: `'all'` bỏ qua lọc; ngược lại chỉ giữ đúng trạng thái đó.
 *
 * @param tagNameById - Tra tên nhãn theo id, dùng để so khớp `query` với tên nhãn.
 */
export function filterPlaces(
  places: readonly PlaceWithRelations[],
  criteria: PlaceFilterCriteria,
  tagNameById: ReadonlyMap<string, string>,
): PlaceWithRelations[] {
  const tokens = normalizeVi(criteria.query)
    .split(' ')
    .filter((token) => token.length > 0);

  return places.filter((place) => {
    if (criteria.status !== 'all' && place.status !== criteria.status) {
      return false;
    }
    if (
      criteria.tagIds.length > 0 &&
      !place.tagIds.some((tagId) => criteria.tagIds.includes(tagId))
    ) {
      return false;
    }
    if (tokens.length > 0) {
      const haystack = buildSearchableText(place, tagNameById);
      if (!tokens.every((token) => haystack.includes(token))) {
        return false;
      }
    }
    return true;
  });
}

/** Sắp theo cập nhật gần nhất trước (giảm dần theo `updatedAt`, ISO nên so chuỗi là đủ). */
function compareRecent(a: PlaceWithRelations, b: PlaceWithRelations): number {
  return b.updatedAt.localeCompare(a.updatedAt);
}

/** Sắp theo đánh giá giảm dần; `null` xuống cuối; hoà nhau thì xếp theo `recent`. */
function compareRating(a: PlaceWithRelations, b: PlaceWithRelations): number {
  if (a.rating === null && b.rating === null) {
    return compareRecent(a, b);
  }
  if (a.rating === null) {
    return 1;
  }
  if (b.rating === null) {
    return -1;
  }
  if (a.rating === b.rating) {
    return compareRecent(a, b);
  }
  return b.rating - a.rating;
}

/** Sắp theo cập nhật gần nhất, hoặc theo đánh giá (không cần vị trí hiện tại). */
export function sortPlaces(
  places: readonly PlaceWithRelations[],
  mode: 'recent' | 'rating',
): SortResult;
/** Sắp theo khoảng cách tới `origin`; địa điểm chưa có toạ độ bị loại khỏi kết quả. */
export function sortPlaces(
  places: readonly PlaceWithRelations[],
  mode: 'distance',
  origin: LatLng,
): SortResult;
export function sortPlaces(
  places: readonly PlaceWithRelations[],
  mode: SortMode,
  origin?: LatLng,
): SortResult {
  if (mode === 'rating') {
    return { sorted: [...places].sort(compareRating), withoutCoordsCount: 0 };
  }

  if (mode === 'distance') {
    if (!origin) {
      throw new Error('sortPlaces("distance") cần tham số origin');
    }
    const withDistance: Array<{ place: PlaceWithRelations; distanceMeters: number }> = [];
    let withoutCoordsCount = 0;
    for (const place of places) {
      if (place.latitude === null || place.longitude === null) {
        withoutCoordsCount += 1;
        continue;
      }
      withDistance.push({
        place,
        distanceMeters: haversineMeters(origin, {
          latitude: place.latitude,
          longitude: place.longitude,
        }),
      });
    }
    withDistance.sort((a, b) => a.distanceMeters - b.distanceMeters);
    return { sorted: withDistance.map((entry) => entry.place), withoutCoordsCount };
  }

  return { sorted: [...places].sort(compareRecent), withoutCoordsCount: 0 };
}
