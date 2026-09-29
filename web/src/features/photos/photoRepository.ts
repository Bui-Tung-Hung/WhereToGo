import type { PostgrestError } from '@supabase/supabase-js';
import { mapPostgrestError } from '../../lib/errors';
import { supabase } from '../../lib/supabaseClient';
import type { PhotoRef } from '../places/types';

interface PhotoRow {
  id: string;
  drive_file_id: string;
  position: number;
}

const PHOTO_COLUMNS = 'id, drive_file_id, position';

function mapPhotoRow(row: PhotoRow): PhotoRef {
  return { id: row.id, driveFileId: row.drive_file_id, position: row.position };
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

/** Danh sách ảnh của một địa điểm, sắp theo `position` tăng dần. */
export async function listPhotos(placeId: string): Promise<PhotoRef[]> {
  const rows = await unwrap<PhotoRow[]>(
    supabase
      .from('photos')
      .select(PHOTO_COLUMNS)
      .eq('place_id', placeId)
      .order('position', { ascending: true }),
  );
  return (rows ?? []).map(mapPhotoRow);
}

/** Các trường cần để chèn một dòng `photos` mới, sau khi đã upload file lên Google Drive. */
export interface InsertPhotoInput {
  placeId: string;
  driveFileId: string;
  mimeType: string;
  width?: number;
  height?: number;
  sizeBytes: number;
  position: number;
}

/** Chèn một dòng ảnh mới. */
export async function insertPhoto(input: InsertPhotoInput): Promise<PhotoRef> {
  const row = await unwrap<PhotoRow>(
    supabase
      .from('photos')
      .insert({
        place_id: input.placeId,
        drive_file_id: input.driveFileId,
        mime_type: input.mimeType,
        width: input.width ?? null,
        height: input.height ?? null,
        size_bytes: input.sizeBytes,
        position: input.position,
      })
      .select(PHOTO_COLUMNS)
      .single(),
  );
  return mapPhotoRow(row);
}

/**
 * Xoá một dòng `photos`. KHÔNG đụng tới file trên Google Drive — nơi gọi
 * (`photoService.removePhoto`) phải tự xoá file trên Drive trước.
 */
export async function deletePhotoRow(id: string): Promise<void> {
  await assertNoError(supabase.from('photos').delete().eq('id', id));
}
