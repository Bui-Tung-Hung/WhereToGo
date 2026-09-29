import type { PostgrestError } from '@supabase/supabase-js';
import { mapPostgrestError, OfflineError } from '../../lib/errors';
import { supabase } from '../../lib/supabaseClient';

/** Một nhãn (thẻ phân loại) của user hiện tại. */
export interface Tag {
  id: string;
  name: string;
  createdAt: string;
}

interface TagRow {
  id: string;
  name: string;
  created_at: string;
}

const TAG_COLUMNS = 'id, name, created_at';

function mapTagRow(row: TagRow): Tag {
  return { id: row.id, name: row.name, createdAt: row.created_at };
}

/** Đọc `{ data, error }` của supabase-js, ném `ApiError` (qua `mapPostgrestError`) nếu có lỗi. */
async function unwrap<T>(
  promise: PromiseLike<{ data: T | null; error: PostgrestError | null }>,
): Promise<T> {
  const { data, error } = await promise;
  if (error) {
    throw mapPostgrestError(error);
  }
  return data as T;
}

/** Chỉ kiểm tra lỗi của một lời gọi supabase-js không trả dữ liệu (ví dụ `delete`). */
async function assertNoError(
  promise: PromiseLike<{ error: PostgrestError | null }>,
): Promise<void> {
  const { error } = await promise;
  if (error) {
    throw mapPostgrestError(error);
  }
}

/**
 * Không có `tagService.ts` riêng cho tính năng nhãn (danh sách file của kế
 * hoạch chỉ có `tagRepository.ts`) nên việc chặn khi offline (D13) nằm
 * ngay tại đây cho 3 hàm ghi dữ liệu bên dưới.
 */
function assertOnline(): void {
  if (!navigator.onLine) {
    throw new OfflineError();
  }
}

/**
 * Danh sách nhãn của user hiện tại (RLS lọc theo `auth.uid()`), sắp theo tên
 * (collation mặc định của Postgres).
 */
export async function listTags(): Promise<Tag[]> {
  const rows = await unwrap<TagRow[]>(supabase.from('tags').select(TAG_COLUMNS).order('name'));
  return (rows ?? []).map(mapTagRow);
}

/**
 * Tạo một nhãn mới cho user hiện tại.
 *
 * @param name - Tên nhãn (1–50 ký tự, việc kiểm định dạng do nơi gọi đảm nhiệm).
 */
export async function createTag(name: string): Promise<Tag> {
  assertOnline();
  const row = await unwrap<TagRow>(
    supabase.from('tags').insert({ name }).select(TAG_COLUMNS).single(),
  );
  return mapTagRow(row);
}

/** Đổi tên một nhãn đã có. */
export async function renameTag(id: string, name: string): Promise<Tag> {
  assertOnline();
  const row = await unwrap<TagRow>(
    supabase.from('tags').update({ name }).eq('id', id).select(TAG_COLUMNS).single(),
  );
  return mapTagRow(row);
}

/** Xoá một nhãn (RLS + `on delete cascade` của `place_tags` tự gỡ nhãn khỏi mọi địa điểm). */
export async function deleteTag(id: string): Promise<void> {
  assertOnline();
  await assertNoError(supabase.from('tags').delete().eq('id', id));
}

/**
 * Tạo 4 nhãn mặc định cho user hiện tại nếu chưa có (RPC `seed_default_tags`,
 * an toàn gọi nhiều lần — `on conflict ... do nothing` ở phía SQL).
 */
export async function seedDefaultTags(): Promise<void> {
  const { error } = await supabase.rpc('seed_default_tags');
  if (error) {
    throw mapPostgrestError(error);
  }
}
