import { logger } from '../../lib/logger';

/** Lỗi đăng nhập mà Supabase trả về qua URL khi redirect về app. */
export interface AuthRedirectError {
  /** Giá trị `error`, ví dụ `'access_denied'`. */
  error: string;
  /** Giá trị `error_code`, ví dụ `'signup_disabled'`; `null` khi không có. */
  code: string | null;
}

/** Mã lỗi Supabase trả về khi đăng ký tài khoản mới đang bị tắt (D24 PLAN.md). */
const SIGNUP_DISABLED_CODE = 'signup_disabled';

/** Thông báo đã bắt được lúc khởi động app; chỉ đặt một lần trong mỗi lần tải trang. */
let capturedMessage: string | null = null;

/**
 * Đọc lỗi đăng nhập từ phần query (`?…`) và phần hash (`#…`) của URL.
 *
 * Supabase đặt `error`, `error_code`, `error_description` vào cả hai phần.
 * Hash bắt đầu bằng `/` là route của app (HashRouter) nên được bỏ qua.
 *
 * @returns Lỗi đọc được, hoặc `null` khi URL không chứa lỗi đăng nhập.
 */
export function parseAuthRedirectError(search: string, hash: string): AuthRedirectError | null {
  const queryParams = new URLSearchParams(search);
  const hashBody = hash.startsWith('#') ? hash.slice(1) : hash;
  const hashParams = hashBody.startsWith('/')
    ? new URLSearchParams()
    : new URLSearchParams(hashBody);

  const error = queryParams.get('error') ?? hashParams.get('error');
  const code = queryParams.get('error_code') ?? hashParams.get('error_code');
  if (error === null && code === null) {
    return null;
  }
  return { error: error ?? 'unspecified_error', code };
}

/** Câu thông báo tiếng Việt cho người dùng ứng với một lỗi đăng nhập. */
export function authRedirectErrorMessage(redirectError: AuthRedirectError): string {
  if (redirectError.code === SIGNUP_DISABLED_CODE) {
    return 'Tài khoản Google này không có quyền dùng WhereToGo. Hãy đăng nhập bằng tài khoản của chủ app.';
  }
  return 'Đăng nhập Google không thành công. Vui lòng thử lại.';
}

/**
 * Bắt lỗi đăng nhập trong URL hiện tại. Phải gọi TRƯỚC khi render router:
 * nếu không, HashRouter coi `#error=…` là một route và không khớp route nào.
 *
 * Có lỗi → ghi log (chỉ mã lỗi), lưu thông báo cho `LoginPage` rồi đổi URL
 * thành `#/login`. Không có lỗi → không đụng tới URL (giữ nguyên `?code=`
 * cho supabase-js đổi lấy session).
 */
export function captureAuthRedirectError(): void {
  const redirectError = parseAuthRedirectError(window.location.search, window.location.hash);
  if (redirectError === null) {
    return;
  }
  capturedMessage = authRedirectErrorMessage(redirectError);
  logger.warn('auth_redirect_error', { error: redirectError.error, code: redirectError.code });
  window.history.replaceState(null, '', `${window.location.pathname}#/login`);
}

/** Thông báo lỗi đăng nhập đã bắt được lúc khởi động, hoặc `null` nếu không có. */
export function getAuthRedirectErrorMessage(): string | null {
  return capturedMessage;
}
