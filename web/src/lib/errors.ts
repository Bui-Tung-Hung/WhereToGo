/**
 * Lỗi nghiệp vụ cơ sở của app: mọi lỗi đã phân loại đều là `AppError`
 * (hoặc lớp con), mang theo `code` ổn định để so khớp trong logic và UI.
 */
export class AppError extends Error {
  readonly code: string;

  constructor(code: string, message: string, cause?: unknown) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = new.target.name;
    this.code = code;
  }
}

/** Chưa đăng nhập hoặc phiên đăng nhập đã hết hạn. */
export class AuthRequiredError extends AppError {
  constructor(cause?: unknown) {
    super('auth_required', 'Authentication required', cause);
  }
}

/** Cần đăng nhập lại Google để cấp quyền Drive (refresh token đã mất/hỏng). */
export class GoogleReauthRequiredError extends AppError {
  constructor(cause?: unknown) {
    super('google_reauth_required', 'Google reauthorization required', cause);
  }
}

/** Không gọi được mạng (mất kết nối, timeout tầng vận chuyển, v.v.). */
export class NetworkError extends AppError {
  constructor(cause?: unknown) {
    super('network_error', 'Network request failed', cause);
  }
}

/** Server trả lỗi HTTP (4xx/5xx) kèm mã lỗi nghiệp vụ riêng của API. */
export class ApiError extends AppError {
  readonly status: number;

  constructor(status: number, code: string, message?: string, cause?: unknown) {
    super(code, message ?? `API error ${status}`, cause);
    this.status = status;
  }
}

/** Dữ liệu nhập không hợp lệ (ngoài phạm vi zod resolver của form). */
export class ValidationError extends AppError {
  constructor(message: string, cause?: unknown) {
    super('validation_error', message, cause);
  }
}

/** Lý do cụ thể khiến việc tải ảnh lên Google Drive thất bại. */
export type DriveUploadErrorReason =
  | 'no_session_uri'
  | 'image_too_large'
  | 'heic_unsupported'
  | 'unsupported_type'
  | string;

/** Lỗi trong luồng chuẩn bị/tải ảnh lên Google Drive. */
export class DriveUploadError extends AppError {
  constructor(reason: DriveUploadErrorReason, message?: string, cause?: unknown) {
    super(reason, message ?? `Drive upload failed: ${reason}`, cause);
  }
}

/** Lý do trình duyệt không lấy được vị trí hiện tại. */
export type LocationErrorReason = 'denied' | 'unavailable' | 'timeout';

/** Không lấy được vị trí hiện tại từ Geolocation API. */
export class LocationError extends AppError {
  constructor(reason: LocationErrorReason, cause?: unknown) {
    super(reason, `Geolocation failed: ${reason}`, cause);
  }
}

/** Link Google Maps không phân tích được (sai định dạng, hoặc cần resolve trước). */
export class InvalidMapsLinkError extends AppError {
  constructor(reason = 'unsupported', cause?: unknown) {
    super(reason, `Invalid Google Maps link: ${reason}`, cause);
  }
}

/** App đang offline nên không thể thực hiện thao tác cần ghi dữ liệu. */
export class OfflineError extends AppError {
  constructor(cause?: unknown) {
    super('offline', 'App is offline', cause);
  }
}

/**
 * Đổi một lỗi bất kỳ (đã phân loại hay chưa) thành câu thông báo tiếng Việt
 * hiển thị được cho người dùng.
 *
 * @param error - Lỗi bắt được, kiểu bất kỳ (từ `catch`).
 * @returns Câu thông báo tiếng Việt, ngắn gọn, phù hợp hiển thị trong toast/alert.
 */
export function toUserMessage(error: unknown): string {
  if (error instanceof GoogleReauthRequiredError) {
    return 'Cần kết nối lại Google Drive.';
  }
  if (error instanceof AuthRequiredError) {
    return 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.';
  }
  if (error instanceof NetworkError) {
    return 'Không có kết nối mạng, vui lòng thử lại.';
  }
  if (error instanceof OfflineError) {
    return 'Bạn đang offline, không thể thực hiện thao tác này.';
  }
  if (error instanceof DriveUploadError) {
    switch (error.code) {
      case 'no_session_uri':
        return 'Không thể bắt đầu tải ảnh lên Google Drive.';
      case 'image_too_large':
        return 'Ảnh quá lớn, vui lòng chọn ảnh khác.';
      case 'heic_unsupported':
        return 'Trình duyệt này không đọc được ảnh HEIC, hãy chọn ảnh JPEG.';
      case 'unsupported_type':
        return 'Định dạng ảnh không được hỗ trợ.';
      default:
        return 'Không thể tải ảnh lên, vui lòng thử lại.';
    }
  }
  if (error instanceof LocationError) {
    switch (error.code) {
      case 'denied':
        return 'Bạn chưa cho phép truy cập vị trí.';
      case 'unavailable':
        return 'Không xác định được vị trí hiện tại.';
      case 'timeout':
        return 'Hết thời gian chờ xác định vị trí.';
      default:
        return 'Không lấy được vị trí hiện tại.';
    }
  }
  if (error instanceof InvalidMapsLinkError) {
    return error.code === 'needs_resolve'
      ? 'Không lấy được link đầy đủ, vui lòng thử lại.'
      : 'Link Google Maps không hợp lệ.';
  }
  if (error instanceof ValidationError) {
    return error.message || 'Dữ liệu không hợp lệ.';
  }
  if (error instanceof ApiError) {
    return 'Đã có lỗi xảy ra, vui lòng thử lại.';
  }
  if (error instanceof AppError) {
    return 'Đã có lỗi xảy ra, vui lòng thử lại.';
  }
  return 'Đã có lỗi không mong muốn xảy ra.';
}
