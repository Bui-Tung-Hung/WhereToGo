/** Kích thước ảnh thu nhỏ server hỗ trợ (mục 5.7/5.9 PLAN.md). */
export type ThumbnailSize = 400 | 1600;

/** Tên Cache Storage lưu ảnh thu nhỏ, để xem offline và tránh tải lại. */
const CACHE_NAME = 'wtg-thumbnails-v1';

/** URL giả dùng làm khoá cache — không có server nào thật ở địa chỉ này. */
function cacheKeyFor(fileId: string, size: ThumbnailSize): string {
  return `https://thumb.local/${fileId}/${size}`;
}

/**
 * Đọc ảnh thu nhỏ đã lưu tạm, hoặc `null` nếu chưa có hoặc Cache Storage
 * không dùng được (lỗi bị nuốt, không ảnh hưởng luồng chính).
 */
export async function getCachedThumbnail(
  fileId: string,
  size: ThumbnailSize,
): Promise<Blob | null> {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(cacheKeyFor(fileId, size));
    return response ? await response.blob() : null;
  } catch {
    return null;
  }
}

/** Lưu một ảnh thu nhỏ vào Cache Storage; bỏ qua lặng lẽ nếu lỗi. */
export async function putThumbnail(
  fileId: string,
  size: ThumbnailSize,
  blob: Blob,
): Promise<void> {
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(cacheKeyFor(fileId, size), new Response(blob));
  } catch {
    // Cache Storage không khả dụng (ví dụ duyệt web riêng tư) — bỏ qua.
  }
}

/** Xoá toàn bộ ảnh thu nhỏ đã lưu tạm (gọi khi đăng xuất hoặc theo yêu cầu). */
export async function clearThumbnails(): Promise<void> {
  try {
    await caches.delete(CACHE_NAME);
  } catch {
    // bỏ qua
  }
}
