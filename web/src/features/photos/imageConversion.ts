import { DriveUploadError } from '../../lib/errors';

/** Ảnh trên 8192×8192 điểm ảnh không được chuyển đổi (giới hạn an toàn cho canvas). */
const MAX_PIXEL_COUNT = 67_108_864;

const HEIC_MIME_TYPES = new Set(['image/heic', 'image/heif']);
const HEIC_EXTENSION_PATTERN = /\.(heic|heif)$/i;
const SUPPORTED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const HEIC_UNSUPPORTED_MESSAGE = 'Trình duyệt này không đọc được ảnh HEIC, hãy chọn ảnh JPEG';

function isHeicFile(file: File): boolean {
  return HEIC_MIME_TYPES.has(file.type) || HEIC_EXTENSION_PATTERN.test(file.name);
}

/**
 * Chuẩn bị một file ảnh để upload lên Google Drive.
 *
 * HEIC/HEIF (iOS không tự đổi định dạng) được chuyển sang JPEG chất lượng
 * 0.92 vì Drive không tạo ảnh xem trước cho HEIC (D6b). JPEG/PNG/WebP được
 * giữ nguyên. Các định dạng khác bị từ chối.
 *
 * @throws {DriveUploadError} `unsupported_type`, `image_too_large`, hoặc `heic_unsupported`.
 */
export async function prepareImageForUpload(file: File): Promise<File> {
  if (isHeicFile(file)) {
    return convertHeicToJpeg(file);
  }
  if (SUPPORTED_MIME_TYPES.has(file.type)) {
    return file;
  }
  throw new DriveUploadError('unsupported_type');
}

/** Vẽ một HEIC/HEIF đã giải mã lên canvas rồi xuất JPEG chất lượng 0.92. */
async function convertHeicToJpeg(file: File): Promise<File> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch (cause) {
    throw new DriveUploadError('heic_unsupported', HEIC_UNSUPPORTED_MESSAGE, cause);
  }

  try {
    if (bitmap.width * bitmap.height > MAX_PIXEL_COUNT) {
      throw new DriveUploadError('image_too_large');
    }

    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new DriveUploadError('heic_unsupported', HEIC_UNSUPPORTED_MESSAGE);
    }
    context.drawImage(bitmap, 0, 0);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.92),
    );
    if (!blob) {
      throw new DriveUploadError('heic_unsupported', HEIC_UNSUPPORTED_MESSAGE);
    }

    const baseName = file.name.replace(HEIC_EXTENSION_PATTERN, '') || 'photo';
    return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
  } finally {
    bitmap.close();
  }
}
