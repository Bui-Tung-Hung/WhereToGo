import { OfflineError } from '../../lib/errors';
import { addPhotos, removePhoto, type PhotoUploadFailure } from '../photos/photoService';
import {
  deletePlaceRow,
  getPlace,
  insertPlace,
  replacePlaceTags,
  updatePlace as updatePlaceRow,
} from './placeRepository';
import type { Place, PlaceInput, PhotoRef, PlaceWithRelations } from './types';

function assertOnline(): void {
  if (!navigator.onLine) {
    throw new OfflineError();
  }
}

/** Tiến độ tải ảnh lên: chỉ số file (0-based trong lần gọi này) và phần trăm hoàn thành (0–1). */
export type PhotoUploadProgress = (fileIndex: number, fraction: number) => void;

/** Kết quả của một lần lưu (tạo hoặc sửa) địa điểm. */
export interface SavePlaceResult {
  place: Place;
  /** Ảnh không thêm được (D23) — địa điểm vẫn được lưu, nơi gọi tự báo số ảnh lỗi bằng toast. */
  photoErrors: PhotoUploadFailure[];
}

/**
 * Tạo một địa điểm mới: chèn dòng `places` → gắn nhãn → thêm ảnh (mục 6.6
 * PLAN.md). Ảnh lỗi không làm hỏng việc tạo địa điểm (D23).
 *
 * @throws {OfflineError} Khi đang offline (D13).
 */
export async function createPlace(
  input: PlaceInput,
  photos: readonly File[],
  onProgress?: PhotoUploadProgress,
): Promise<SavePlaceResult> {
  assertOnline();
  const place = await insertPlace(input);
  await replacePlaceTags(place.id, input.tagIds);
  const { errors } = await addPhotos(place.id, photos, [], onProgress);
  return { place, photoErrors: errors };
}

/**
 * Cập nhật một địa điểm đã có: cập nhật các cột → đồng bộ nhãn → xoá các
 * ảnh bị gỡ → thêm ảnh mới (mục 6.6 PLAN.md). Vị trí cho ảnh mới được tính
 * dựa trên danh sách ảnh còn lại SAU khi đã xoá (đọc lại từ server để luôn
 * đúng, không dựa vào trạng thái phía client).
 *
 * @throws {OfflineError} Khi đang offline (D13).
 */
export async function updatePlace(
  id: string,
  input: PlaceInput,
  newPhotos: readonly File[],
  removedPhotos: readonly PhotoRef[],
  onProgress?: PhotoUploadProgress,
): Promise<SavePlaceResult> {
  assertOnline();
  const place = await updatePlaceRow(id, input);
  await replacePlaceTags(id, input.tagIds);
  for (const photo of removedPhotos) {
    await removePhoto(photo);
  }
  const current = await getPlace(id);
  const { errors } = await addPhotos(id, newPhotos, current.photos, onProgress);
  return { place, photoErrors: errors };
}

/**
 * Xoá một địa điểm: xoá từng ảnh trên Google Drive trước, rồi xoá dòng
 * `places` (RLS + `on delete cascade` tự dọn `place_tags`/`photos`/`visits`
 * còn sót ở phía dữ liệu; xoá ảnh trên Drive phải làm thủ công vì Drive
 * không biết gì về Supabase).
 *
 * @throws {OfflineError} Khi đang offline (D13).
 */
export async function deletePlace(place: PlaceWithRelations): Promise<void> {
  assertOnline();
  for (const photo of place.photos) {
    await removePhoto(photo);
  }
  await deletePlaceRow(place.id);
}
