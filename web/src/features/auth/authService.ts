import { del } from 'idb-keyval';
import type { Session } from '@supabase/supabase-js';
import { AuthRequiredError } from '../../lib/errors';
import { logger } from '../../lib/logger';
import { supabase } from '../../lib/supabaseClient';
import { clearDriveAccessToken, storeRefreshToken } from '../google/googleTokenService';
import { clearThumbnails } from '../photos/thumbnailCache';

/**
 * Khoá IndexedDB nơi TanStack Query lưu cache đã persist (mục 6.7 PLAN.md).
 * Khai báo lặp lại như một hằng số ở đây (thay vì import từ `app/queryClient.ts`,
 * vốn thuộc Giai đoạn C) để `signOut` có thể xoá cache đã lưu tạm ngay từ Giai đoạn A.
 */
const QUERY_CACHE_PERSIST_KEY = 'wtg-query-cache';

/** user_id đã gửi `provider_refresh_token` thành công trong phiên chạy hiện tại. */
const forwardedRefreshTokenUserIds = new Set<string>();

/** Session Supabase kèm token nhà cung cấp (supabase-js không export kiểu này riêng). */
type SessionWithProviderToken = Session & { provider_refresh_token?: string | null };

/**
 * Gửi `provider_refresh_token` của Google (nếu Supabase vừa cấp) lên server
 * để lưu lâu dài — chỉ gửi một lần cho mỗi user trong phiên chạy hiện tại.
 * Lỗi được ghi log, không ném lại (không được chặn luồng đăng nhập).
 */
async function forwardProviderRefreshToken(session: Session | null): Promise<void> {
  const typedSession = session as SessionWithProviderToken | null;
  const refreshToken = typedSession?.provider_refresh_token;
  const userId = typedSession?.user.id;

  if (!refreshToken || !userId || forwardedRefreshTokenUserIds.has(userId)) {
    return;
  }

  try {
    await storeRefreshToken(refreshToken);
    forwardedRefreshTokenUserIds.add(userId);
  } catch (error) {
    // Giữ nguyên trạng thái "chưa gửi" để UI có thể báo cần kết nối lại Drive.
    logger.error('refresh_token_forward_failed', {
      userId,
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Khởi tạo trạng thái đăng nhập của app. Phải gọi và `await` xong TRƯỚC khi
 * render router, để xử lý `?code=` (đăng nhập OAuth PKCE) trước khi điều
 * hướng bất kỳ route nào (mục 6.1 PLAN.md).
 *
 * @returns Session hiện tại (đã đăng nhập) hoặc `null`.
 */
export async function initializeAuth(): Promise<Session | null> {
  // Đăng ký lắng nghe TRƯỚC khi lấy session, để không bỏ lỡ sự kiện xảy ra
  // trong lúc supabase-js đang đổi `?code=` lấy session.
  supabase.auth.onAuthStateChange((_event, session) => {
    if (session) {
      // Hoãn sang tick sau: supabase-js khuyến cáo không gọi hàm Supabase khác
      // ngay bên trong callback này (có thể kẹt khoá nội bộ).
      setTimeout(() => void forwardProviderRefreshToken(session), 0);
    }
  });

  const { data } = await supabase.auth.getSession();
  await forwardProviderRefreshToken(data.session);
  return data.session;
}

/**
 * Bắt đầu luồng đăng nhập Google (PKCE), xin thêm quyền `drive.file` và
 * `offline access` để lấy `provider_refresh_token` (mục 6.6 PLAN.md).
 */
export async function signInWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + import.meta.env.BASE_URL,
      scopes: 'https://www.googleapis.com/auth/drive.file',
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
  if (error) {
    throw error;
  }
}

/**
 * Đăng xuất và dọn mọi dữ liệu đã lưu tạm của phiên trước (ảnh thu nhỏ,
 * access token Drive, cache truy vấn đã persist).
 */
export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
  await clearThumbnails();
  clearDriveAccessToken();
  try {
    await del(QUERY_CACHE_PERSIST_KEY);
  } catch (error) {
    logger.warn('query_cache_persist_clear_failed', {
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Access token Supabase hiện tại, dùng để gọi server API.
 *
 * @throws {AuthRequiredError} Khi chưa đăng nhập.
 */
export async function getSupabaseAccessToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    throw new AuthRequiredError();
  }
  return data.session.access_token;
}
