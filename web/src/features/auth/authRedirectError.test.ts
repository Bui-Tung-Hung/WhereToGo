import { describe, expect, it } from 'vitest';
import { authRedirectErrorMessage, parseAuthRedirectError } from './authRedirectError';

const SIGNUP_DISABLED_PARAMS =
  'error=access_denied&error_code=signup_disabled&error_description=Signups+not+allowed+for+this+instance';

describe('parseAuthRedirectError', () => {
  it('đọc được URL Supabase trả về khi tắt đăng ký (lỗi ở cả query lẫn hash)', () => {
    expect(
      parseAuthRedirectError(`?${SIGNUP_DISABLED_PARAMS}`, `#${SIGNUP_DISABLED_PARAMS}`),
    ).toEqual({
      error: 'access_denied',
      code: 'signup_disabled',
    });
  });

  it('đọc được lỗi chỉ nằm ở hash', () => {
    expect(parseAuthRedirectError('', `#${SIGNUP_DISABLED_PARAMS}`)).toEqual({
      error: 'access_denied',
      code: 'signup_disabled',
    });
  });

  it('đọc được lỗi chỉ nằm ở query', () => {
    expect(parseAuthRedirectError('?error=server_error', '')).toEqual({
      error: 'server_error',
      code: null,
    });
  });

  it('không coi `?code=` của lần đăng nhập thành công là lỗi', () => {
    expect(parseAuthRedirectError('?code=abc', '')).toBeNull();
  });

  it('bỏ qua hash là route của app', () => {
    expect(parseAuthRedirectError('', '#/tabs/explore')).toBeNull();
  });
});

describe('authRedirectErrorMessage', () => {
  it('báo không có quyền khi đăng ký bị tắt, các lỗi khác báo chung', () => {
    expect(authRedirectErrorMessage({ error: 'access_denied', code: 'signup_disabled' })).toBe(
      'Tài khoản Google này không có quyền dùng WhereToGo. Hãy đăng nhập bằng tài khoản của chủ app.',
    );
    expect(authRedirectErrorMessage({ error: 'server_error', code: 'unexpected_failure' })).toBe(
      'Đăng nhập Google không thành công. Vui lòng thử lại.',
    );
    expect(authRedirectErrorMessage({ error: 'access_denied', code: null })).toBe(
      'Đăng nhập Google không thành công. Vui lòng thử lại.',
    );
  });
});
