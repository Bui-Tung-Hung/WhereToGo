import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { del, get, set } from 'idb-keyval';
import { ApiError, AuthRequiredError, GoogleReauthRequiredError } from '../lib/errors';

/** Thời gian giữ cache trong bộ nhớ trước khi bị dọn (7 ngày, mục 6.7 PLAN.md). */
const GC_TIME_MS = 7 * 24 * 60 * 60 * 1000;

/** Thời gian dữ liệu còn được coi là "mới" (mục 6.7 PLAN.md). */
const STALE_TIME_MS = 30_000;

/** Số lần thử lại tối đa khi request lỗi (mục 6.7 PLAN.md). */
const MAX_RETRY_COUNT = 2;

/** Khoá lưu cache của TanStack Query trong IndexedDB (mục 6.7 PLAN.md). */
const PERSIST_CACHE_KEY = 'wtg-query-cache';

/**
 * `false` khi lỗi không đáng thử lại: hết phiên đăng nhập, cần kết nối lại
 * Google Drive, hoặc lỗi 4xx từ API (dữ liệu/yêu cầu sai, thử lại vô ích).
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof AuthRequiredError || error instanceof GoogleReauthRequiredError) {
    return false;
  }
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
    return false;
  }
  return true;
}

/** Hàm `retry` dùng chung cho query: tối đa {@link MAX_RETRY_COUNT} lần, bỏ qua lỗi không đáng thử lại. */
function retry(failureCount: number, error: unknown): boolean {
  return isRetryableError(error) && failureCount < MAX_RETRY_COUNT;
}

/**
 * Tạo `QueryClient` dùng chung cho toàn app (mục 6.7 PLAN.md):
 * - `gcTime` 7 ngày, `staleTime` 30 giây.
 * - `networkMode: 'offlineFirst'` — vẫn trả dữ liệu cache khi offline thay
 *   vì chặn request.
 * - `retry` tối đa {@link MAX_RETRY_COUNT} lần, không thử lại lỗi 4xx /
 *   `AuthRequiredError` / `GoogleReauthRequiredError`.
 * - `refetchOnWindowFocus: true`.
 *
 * @returns `QueryClient` mới, chưa gắn persister.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: GC_TIME_MS,
        staleTime: STALE_TIME_MS,
        networkMode: 'offlineFirst',
        refetchOnWindowFocus: true,
        retry,
      },
    },
  });
}

/**
 * Tạo persister lưu cache của TanStack Query vào IndexedDB (qua
 * `idb-keyval`), dưới một khoá duy nhất `wtg-query-cache` (mục 6.7 PLAN.md).
 *
 * @returns Persister dùng cho `PersistQueryClientProvider`.
 */
export function createPersister() {
  return createAsyncStoragePersister({
    key: PERSIST_CACHE_KEY,
    storage: {
      getItem: (key: string) => get<string>(key),
      setItem: (key: string, value: string) => set(key, value),
      removeItem: (key: string) => del(key),
    },
  });
}

/**
 * `QueryClient` đang hoạt động của app (được `App.tsx` đăng ký ngay sau khi
 * tạo), để `authService.signOut()` có thể xoá cache trong bộ nhớ của nó mà
 * không tạo phụ thuộc vòng `app/` → `features/auth/` (yêu cầu bổ sung ghi
 * nhận từ Giai đoạn A — xem PLAN.md bước 68).
 */
let activeQueryClient: QueryClient | null = null;

/** Đăng ký `QueryClient` duy nhất của app. Chỉ gọi một lần, trong `App.tsx`. */
export function registerActiveQueryClient(client: QueryClient): void {
  activeQueryClient = client;
}

/**
 * Xoá cache trong bộ nhớ của `QueryClient` đang hoạt động (không làm gì nếu
 * chưa có client nào được đăng ký — ví dụ trong lúc chạy unit test). Được
 * `authService.signOut()` gọi, bên cạnh việc xoá cache đã persist trong
 * IndexedDB đã có sẵn.
 */
export function clearActiveQueryClient(): void {
  activeQueryClient?.clear();
}
