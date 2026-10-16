import { mapPostgrestError } from '../../lib/errors';
import { assertOnline } from '../../lib/onlineGuard';
import { supabase } from '../../lib/supabaseClient';
import { assertNoError, unwrap } from '../../lib/supabaseResult';

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
 * Tạo nhãn mặc định "Hẹn hò" khi user chưa có nhãn nào (RPC `seed_default_tags`;
 * 3 nhãn cũ đã thành nhóm — mục 2.1.J PLAN-UI-1.md); nhãn mặc định đã xoá
 * hoặc đổi tên không bị tạo lại. An toàn gọi nhiều lần.
 */
export async function seedDefaultTags(): Promise<void> {
  const { error } = await supabase.rpc('seed_default_tags');
  if (error) {
    throw mapPostgrestError(error);
  }
}
