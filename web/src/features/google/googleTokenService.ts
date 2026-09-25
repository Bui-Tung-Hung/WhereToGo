import { apiClient } from '../../lib/apiClient';

interface AccessTokenResponse {
  access_token: string;
  expires_at: number;
}

interface CachedAccessToken {
  value: string;
  /** Epoch giây (giống server) khi access token hết hạn. */
  expiresAt: number;
}

/** Coi token là hết hạn khi còn dưới ngần này giây (khớp GoogleTokenService phía server). */
const EXPIRY_SAFETY_MARGIN_SECONDS = 60;

let cachedToken: CachedAccessToken | null = null;
let inFlightRequest: Promise<string> | null = null;

/** Gửi provider refresh token của Google lên server để server mã hoá và lưu lâu dài. */
export async function storeRefreshToken(refreshToken: string): Promise<void> {
  await apiClient.postJson('/api/google/credentials', { refresh_token: refreshToken });
}

/**
 * Lấy access token Google Drive hiện tại.
 *
 * Dùng cache trong bộ nhớ tới khi còn dưới 60 giây thì mới gọi lại server;
 * nhiều lời gọi đồng thời trong lúc đang xin token mới chỉ phát ra một
 * request duy nhất (gộp vào cùng một promise).
 */
export async function getDriveAccessToken(): Promise<string> {
  const nowSeconds = Date.now() / 1000;
  if (cachedToken && cachedToken.expiresAt - EXPIRY_SAFETY_MARGIN_SECONDS > nowSeconds) {
    return cachedToken.value;
  }
  if (inFlightRequest) {
    return inFlightRequest;
  }

  inFlightRequest = apiClient
    .postJson<AccessTokenResponse>('/api/google/access-token')
    .then((response) => {
      cachedToken = { value: response.access_token, expiresAt: response.expires_at };
      return response.access_token;
    })
    .finally(() => {
      inFlightRequest = null;
    });

  return inFlightRequest;
}

/** Xoá access token Drive đã lưu trong bộ nhớ (gọi khi đăng xuất). */
export function clearDriveAccessToken(): void {
  cachedToken = null;
  inFlightRequest = null;
}
