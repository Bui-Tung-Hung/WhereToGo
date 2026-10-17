import type { QueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from './queryKeys';
import type { PlaceWithRelations } from './types';

/** Hàm biến đổi một địa điểm (trả bản mới, không sửa bản cũ). */
export type PlacePatch = (place: PlaceWithRelations) => PlaceWithRelations;

/**
 * Trả bản sao của danh sách `places` trong đó chỉ địa điểm có `id` được biến đổi bằng `patch`.
 * `places` là `undefined` (chưa có cache) thì trả `undefined`.
 */
export function patchPlace(
  places: readonly PlaceWithRelations[] | undefined,
  id: string,
  patch: PlacePatch,
): PlaceWithRelations[] | undefined {
  if (!places) {
    return undefined;
  }
  return places.map((place) => (place.id === id ? patch(place) : place));
}

/** Cộng `delta` vào điểm hứng thú của địa điểm. */
export function withInterestDelta(place: PlaceWithRelations, delta: number): PlaceWithRelations {
  return { ...place, interestScore: place.interestScore + delta };
}

/** Đặt `favoritedAt` của địa điểm. */
export function withFavoritedAt(
  place: PlaceWithRelations,
  favoritedAt: string | null,
): PlaceWithRelations {
  return { ...place, favoritedAt };
}

/**
 * Áp `patch` lên địa điểm `id` trong cache `['places']` và `['places', id]` (nếu có), dùng cho
 * cập nhật lạc quan (không tải lại cả danh sách).
 */
export function applyPlacePatch(queryClient: QueryClient, id: string, patch: PlacePatch): void {
  queryClient.setQueryData<PlaceWithRelations[]>(QUERY_KEYS.places, (places) =>
    patchPlace(places, id, patch),
  );
  queryClient.setQueryData<PlaceWithRelations>(QUERY_KEYS.place(id), (place) =>
    place ? patch(place) : place,
  );
}
