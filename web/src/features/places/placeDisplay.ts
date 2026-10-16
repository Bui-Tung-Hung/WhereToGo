import type { PhotoRef, PlaceWithRelations } from './types';

/** Ảnh bìa của địa điểm: ảnh có `position` nhỏ nhất; không có ảnh thì `null`. */
export function getCoverPhoto(place: Pick<PlaceWithRelations, 'photos'>): PhotoRef | null {
  let cover: PhotoRef | null = null;
  for (const photo of place.photos) {
    if (cover === null || photo.position < cover.position) {
      cover = photo;
    }
  }
  return cover;
}

/** Kết quả của {@link limitChips}. */
export interface LimitedChips {
  /** Các tên được hiện thành chip. */
  visible: string[];
  /** Số tên bị ẩn (hiện thành chip "+N"); 0 khi không ẩn gì. */
  extraCount: number;
}

/** Giữ tối đa `max` tên đầu tiên để hiện thành chip, phần còn lại gộp thành số đếm. */
export function limitChips(names: readonly string[], max: number): LimitedChips {
  return { visible: names.slice(0, max), extraCount: Math.max(0, names.length - max) };
}
