import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearDriveAccessToken, getDriveAccessToken } from './googleTokenService';

// `vi.mock` bị hoisted lên đầu file, nên biến mock phải tạo qua `vi.hoisted`
// (không thể tham chiếu một `const` khai báo bên dưới).
const { postJsonMock } = vi.hoisted(() => ({ postJsonMock: vi.fn() }));

vi.mock('../../lib/apiClient', () => ({
  apiClient: { postJson: postJsonMock },
}));

describe('getDriveAccessToken', () => {
  beforeEach(() => {
    postJsonMock.mockReset();
    clearDriveAccessToken();
  });

  it('dùng cache khi access token còn hạn', async () => {
    const farFuture = Date.now() / 1000 + 3600;
    postJsonMock.mockResolvedValueOnce({ access_token: 'token-1', expires_at: farFuture });

    const first = await getDriveAccessToken();
    const second = await getDriveAccessToken();

    expect(first).toBe('token-1');
    expect(second).toBe('token-1');
    expect(postJsonMock).toHaveBeenCalledTimes(1);
  });

  it('gọi lại server khi access token còn dưới 60 giây', async () => {
    const almostExpired = Date.now() / 1000 + 30;
    postJsonMock.mockResolvedValueOnce({ access_token: 'token-1', expires_at: almostExpired });
    await getDriveAccessToken();

    const farFuture = Date.now() / 1000 + 3600;
    postJsonMock.mockResolvedValueOnce({ access_token: 'token-2', expires_at: farFuture });
    const second = await getDriveAccessToken();

    expect(second).toBe('token-2');
    expect(postJsonMock).toHaveBeenCalledTimes(2);
  });

  it('gộp các lời gọi đồng thời vào một request', async () => {
    const farFuture = Date.now() / 1000 + 3600;
    let resolveResponse!: (value: { access_token: string; expires_at: number }) => void;
    postJsonMock.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveResponse = resolve;
      }),
    );

    const call1 = getDriveAccessToken();
    const call2 = getDriveAccessToken();
    resolveResponse({ access_token: 'token-concurrent', expires_at: farFuture });

    const [result1, result2] = await Promise.all([call1, call2]);

    expect(result1).toBe('token-concurrent');
    expect(result2).toBe('token-concurrent');
    expect(postJsonMock).toHaveBeenCalledTimes(1);
  });
});
