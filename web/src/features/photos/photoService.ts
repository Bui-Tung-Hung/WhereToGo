import { apiClient } from '../../lib/apiClient';
import { DriveUploadError, OfflineError, toUserMessage } from '../../lib/errors';
import { logger } from '../../lib/logger';
import { getPhotoFolderId } from '../google/driveFolderApi';
import { uploadFileToDrive } from '../google/driveUpload';
import { getDriveAccessToken } from '../google/googleTokenService';
import type { PhotoRef } from '../places/types';
import { prepareImageForUpload } from './imageConversion';
import { deletePhotoRow, insertPhoto } from './photoRepository';

/** Tối đa 20 ảnh mỗi địa điểm (D23 PLAN.md). */
const MAX_PHOTOS_PER_PLACE = 20;
/** Tối đa 25 MB mỗi file (D23 PLAN.md). */
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;

/** `prepareImageForUpload` chỉ còn trả về 1 trong 3 định dạng này (mục 6.6 PLAN.md). */
const MIME_TO_EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function assertOnline(): void {
  if (!navigator.onLine) {
    throw new OfflineError();
  }
}

/** Dấu thời gian `yyyyMMddHHmmss` theo giờ hệ thống, dùng để đặt tên file trên Drive. */
function timestampForFileName(date: Date): string {
  const pad = (value: number): string => String(value).padStart(2, '0');
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  );
}

/**
 * Tên file trên Drive: `wtg_<placeId>_<yyyyMMddHHmmss>_<chỉ số>.<ext>` (mục
 * 6.6 PLAN.md). `index` là vị trí (`position`) của ảnh trong địa điểm.
 */
function buildFileName(placeId: string, index: number, mimeType: string): string {
  const extension = MIME_TO_EXTENSION[mimeType] ?? 'jpg';
  return `wtg_${placeId}_${timestampForFileName(new Date())}_${index}.${extension}`;
}

/** Một ảnh không thêm được, kèm lý do (D23, hoặc lỗi trong lúc chuẩn bị/tải lên). */
export interface PhotoUploadFailure {
  fileName: string;
  message: string;
}

export interface AddPhotosResult {
  successCount: number;
  errors: PhotoUploadFailure[];
}

/**
 * Thêm nhiều ảnh vào một địa điểm (mục 1, 6.6, D23 PLAN.md).
 *
 * - Vị trí bắt đầu = (`position` lớn nhất trong `existingPhotos`, hoặc −1) + 1;
 *   mỗi ảnh thêm thành công tiếp theo +1.
 * - Chỉ nhận `20 − existingPhotos.length` file đầu tiên (theo thứ tự trong
 *   `files`); phần dư được báo lỗi, không upload (D23).
 * - Mỗi file phải ≤ 25 MB (kiểm trước khi qua `prepareImageForUpload`, vì
 *   file HEIC gốc có thể đã hợp lệ nhưng ảnh JPEG sau chuyển đổi lại phình
 *   to hơn — D6b không giới hạn kích thước sau chuyển đổi ngoài số điểm ảnh).
 * - Chạy TUẦN TỰ từng ảnh một: `prepareImageForUpload` → lấy folder → lấy
 *   token → upload lên Drive → chèn dòng `photos`.
 * - Chèn dòng lỗi → xoá file vừa upload trên Drive (bù trừ, tránh ảnh mồ
 *   côi) rồi ghi nhận ảnh đó là lỗi, tiếp tục ảnh kế tiếp.
 *
 * @returns Số ảnh thêm thành công và danh sách ảnh lỗi (kèm lý do).
 * @throws {OfflineError} Khi đang offline (D13).
 */
export async function addPhotos(
  placeId: string,
  files: readonly File[],
  existingPhotos: readonly PhotoRef[],
  onProgress?: (fileIndex: number, fraction: number) => void,
): Promise<AddPhotosResult> {
  assertOnline();

  const errors: PhotoUploadFailure[] = [];
  const remainingSlots = Math.max(0, MAX_PHOTOS_PER_PLACE - existingPhotos.length);
  const accepted = files.slice(0, remainingSlots);
  const rejected = files.slice(remainingSlots);
  for (const file of rejected) {
    errors.push({
      fileName: file.name,
      message: `Chỉ thêm được ${remainingSlots} ảnh (giới hạn ${MAX_PHOTOS_PER_PLACE} ảnh/địa điểm)`,
    });
  }

  let nextPosition =
    existingPhotos.length > 0 ? Math.max(...existingPhotos.map((photo) => photo.position)) + 1 : 0;
  let successCount = 0;

  for (let index = 0; index < accepted.length; index += 1) {
    const file = accepted[index];
    if (!file) {
      continue;
    }
    onProgress?.(index, 0);

    try {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        throw new DriveUploadError('image_too_large');
      }
      const prepared = await prepareImageForUpload(file);
      const folderId = await getPhotoFolderId();
      const accessToken = await getDriveAccessToken();
      const fileName = buildFileName(placeId, nextPosition, prepared.type);

      const uploaded = await uploadFileToDrive({
        file: prepared,
        folderId,
        accessToken,
        fileName,
        onProgress: (fraction) => onProgress?.(index, fraction),
      });

      try {
        await insertPhoto({
          placeId,
          driveFileId: uploaded.id,
          mimeType: uploaded.mimeType,
          width: uploaded.width,
          height: uploaded.height,
          sizeBytes: uploaded.size,
          position: nextPosition,
        });
        successCount += 1;
        nextPosition += 1;
      } catch (insertError) {
        // Chèn dòng thất bại: xoá file mồ côi trên Drive (bù trừ, mục 1 PLAN.md).
        await apiClient.delete(`/api/photos/${uploaded.id}`).catch((cleanupError: unknown) => {
          logger.error('orphan_photo_cleanup_failed', {
            driveFileId: uploaded.id,
            message: cleanupError instanceof Error ? cleanupError.message : String(cleanupError),
          });
        });
        throw insertError;
      }
    } catch (error) {
      logger.error('photo_upload_failed', { fileName: file.name, placeId });
      errors.push({ fileName: file.name, message: toUserMessage(error) });
    }
  }

  return { successCount, errors };
}

/** Xoá một ảnh: xoá file trên Google Drive trước, rồi mới xoá dòng dữ liệu. */
export async function removePhoto(photo: PhotoRef): Promise<void> {
  assertOnline();
  await apiClient.delete(`/api/photos/${photo.driveFileId}`);
  await deletePhotoRow(photo.id);
}
