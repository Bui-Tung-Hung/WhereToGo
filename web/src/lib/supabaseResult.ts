import type { PostgrestError } from '@supabase/supabase-js';
import { mapPostgrestError } from './errors';

/**
 * Đọc `{ data, error }` của supabase-js, ném `ApiError` (qua `mapPostgrestError`) nếu có lỗi.
 * Dùng chung cho mọi repository (trước đây mỗi repository chép một bản riêng).
 */
export async function unwrap<T>(
  promise: PromiseLike<{ data: T | null; error: PostgrestError | null }>,
): Promise<T> {
  const { data, error } = await promise;
  if (error) {
    throw mapPostgrestError(error);
  }
  return data as T;
}

/** Chỉ kiểm tra lỗi của một lời gọi supabase-js không trả dữ liệu (ví dụ `delete`). */
export async function assertNoError(
  promise: PromiseLike<{ error: PostgrestError | null }>,
): Promise<void> {
  const { error } = await promise;
  if (error) {
    throw mapPostgrestError(error);
  }
}
