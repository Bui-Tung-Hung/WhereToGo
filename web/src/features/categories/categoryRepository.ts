import { mapPostgrestError } from '../../lib/errors';
import { assertOnline } from '../../lib/onlineGuard';
import { supabase } from '../../lib/supabaseClient';
import { assertNoError, unwrap } from '../../lib/supabaseResult';
import type { CategoryInput } from './categorySchema';

/** Một nhóm địa điểm của user hiện tại (U39: nhóm hiện thành thẻ trên trang chủ). */
export interface Category {
  id: string;
  name: string;
  /** Câu gợi ý trên thẻ trang chủ; `null` = dùng câu mặc định. */
  prompt: string | null;
  /** Khoá biểu tượng (P2); `null` = dùng biểu tượng mặc định. */
  icon: string | null;
  createdAt: string;
}

interface CategoryRow {
  id: string;
  name: string;
  prompt: string | null;
  icon: string | null;
  created_at: string;
}

const CATEGORY_COLUMNS = 'id, name, prompt, icon, created_at';

function mapCategoryRow(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    prompt: row.prompt,
    icon: row.icon,
    createdAt: row.created_at,
  };
}

/** Danh sách nhóm của user hiện tại (RLS lọc theo `auth.uid()`), sắp theo thời điểm tạo rồi tên. */
export async function listCategories(): Promise<Category[]> {
  const rows = await unwrap<CategoryRow[]>(
    supabase.from('categories').select(CATEGORY_COLUMNS).order('created_at').order('name'),
  );
  return (rows ?? []).map(mapCategoryRow);
}

/**
 * Tạo một nhóm mới cho user hiện tại.
 *
 * @throws {OfflineError} Khi đang offline (D13).
 */
export async function createCategory(input: CategoryInput): Promise<Category> {
  assertOnline();
  const row = await unwrap<CategoryRow>(
    supabase
      .from('categories')
      .insert({ name: input.name, prompt: input.prompt, icon: input.icon })
      .select(CATEGORY_COLUMNS)
      .single(),
  );
  return mapCategoryRow(row);
}

/**
 * Sửa tên, câu gợi ý và biểu tượng của một nhóm.
 *
 * @throws {OfflineError} Khi đang offline (D13).
 */
export async function updateCategory(id: string, input: CategoryInput): Promise<Category> {
  assertOnline();
  const row = await unwrap<CategoryRow>(
    supabase
      .from('categories')
      .update({ name: input.name, prompt: input.prompt, icon: input.icon })
      .eq('id', id)
      .select(CATEGORY_COLUMNS)
      .single(),
  );
  return mapCategoryRow(row);
}

/**
 * Xoá một nhóm (`on delete cascade` của `place_categories` tự gỡ nhóm khỏi mọi địa điểm).
 * Nơi gọi phải chặn trước trường hợp có địa điểm chỉ thuộc riêng nhóm này (P18).
 *
 * @throws {OfflineError} Khi đang offline (D13).
 */
export async function deleteCategory(id: string): Promise<void> {
  assertOnline();
  await assertNoError(supabase.from('categories').delete().eq('id', id));
}

/**
 * Tạo 4 nhóm mặc định khi user chưa có nhóm nào (RPC `seed_default_categories`); nhóm mặc định
 * đã xoá hoặc đổi tên không bị tạo lại. An toàn gọi nhiều lần.
 *
 * @throws {OfflineError} Khi đang offline (D13).
 */
export async function seedDefaultCategories(): Promise<void> {
  assertOnline();
  const { error } = await supabase.rpc('seed_default_categories');
  if (error) {
    throw mapPostgrestError(error);
  }
}
