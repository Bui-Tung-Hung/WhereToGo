/**
 * Khoá truy vấn dùng chung cho toàn bộ cụm tính năng địa điểm (places, tags,
 * categories, visits — mục 6.6 PLAN.md, mục 4.5 PLAN-UI-1.md).
 * `tagQueries.ts`, `categoryQueries.ts` và `visitQueries.ts` import từ đây thay vì tự viết lại
 * chuỗi khoá, để tránh gõ nhầm/khoá trôi dạt giữa các file.
 * Tách khỏi `placeQueries.ts` để `placeCache.ts` (hàm thuần) không import vòng.
 */
export const QUERY_KEYS = {
  places: ['places'] as const,
  place: (id: string) => ['places', id] as const,
  tags: ['tags'] as const,
  categories: ['categories'] as const,
  visits: (placeId: string) => ['visits', placeId] as const,
};
