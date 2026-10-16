import type { PhotoRef, PlaceWithRelations } from '../places/types';
import type { Category } from './categoryRepository';

/** So sánh theo thời điểm tạo rồi theo tên (P19). */
function compareByCreation(a: Category, b: Category): number {
  const byTime = a.createdAt.localeCompare(b.createdAt);
  return byTime !== 0 ? byTime : a.name.localeCompare(b.name, 'vi');
}

/** Số địa điểm của từng nhóm (một địa điểm thuộc nhiều nhóm thì được đếm ở mỗi nhóm). */
export function countPlacesByCategory(
  places: readonly PlaceWithRelations[],
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const place of places) {
    for (const categoryId of place.categoryIds) {
      counts.set(categoryId, (counts.get(categoryId) ?? 0) + 1);
    }
  }
  return counts;
}

/** Nhóm sắp theo thời điểm tạo, rồi tên (P19) — dùng cho form, bộ lọc, Quản lý nhóm, chip. */
export function sortCategoriesByCreation(categories: readonly Category[]): Category[] {
  return [...categories].sort(compareByCreation);
}

/** Nhóm sắp cho trang chủ (M2, P20): nhiều địa điểm nhất trước, hoà thì theo P19. */
export function sortCategoriesForHome(
  categories: readonly Category[],
  counts: ReadonlyMap<string, number>,
): Category[] {
  return [...categories].sort((a, b) => {
    const byCount = (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0);
    return byCount !== 0 ? byCount : compareByCreation(a, b);
  });
}

/**
 * Tối đa `limit` ảnh mới thêm gần đây nhất trong các địa điểm của một nhóm (U3, P21); có thể
 * nhiều ảnh cùng một địa điểm. Hoà `createdAt` thì so `id` để kết quả ổn định.
 */
export function recentPhotosForCategory(
  places: readonly PlaceWithRelations[],
  categoryId: string,
  limit: number,
): PhotoRef[] {
  return places
    .filter((place) => place.categoryIds.includes(categoryId))
    .flatMap((place) => place.photos)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id))
    .slice(0, limit);
}

/** Các địa điểm chỉ thuộc riêng nhóm này — xoá nhóm sẽ làm chúng mất nhóm cuối cùng (P18). */
export function findPlacesOnlyInCategory(
  places: readonly PlaceWithRelations[],
  categoryId: string,
): PlaceWithRelations[] {
  return places.filter(
    (place) => place.categoryIds.length === 1 && place.categoryIds[0] === categoryId,
  );
}

/**
 * Các nhóm của một địa điểm, sắp theo P19, bỏ id không còn tồn tại. "Nhóm đầu" của địa điểm
 * luôn là phần tử 0 của kết quả này.
 */
export function resolvePlaceCategories(
  place: Pick<PlaceWithRelations, 'categoryIds'>,
  categories: readonly Category[],
): Category[] {
  return sortCategoriesByCreation(
    categories.filter((category) => place.categoryIds.includes(category.id)),
  );
}
