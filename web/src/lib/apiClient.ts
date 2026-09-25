import { env } from '../config/env';
import { getSupabaseAccessToken } from '../features/auth/authService';
import { ApiError, AuthRequiredError, GoogleReauthRequiredError, NetworkError } from './errors';

/** Thân lỗi JSON chuẩn mà server FastAPI trả về (xem PLAN.md mục 5.2). */
interface ApiErrorBody {
  code?: string;
  message?: string;
}

export interface ApiClientOptions {
  /** Gốc URL của server API, không có `/` cuối (ví dụ `https://api.example.com`). */
  baseUrl: string;
  /** Lấy access token Supabase hiện tại (ném lỗi nếu chưa đăng nhập). */
  getAccessToken: () => Promise<string>;
  /** Cho phép thay `fetch` bằng bản giả trong test. */
  fetchImpl?: typeof fetch;
}

export interface ApiClient {
  getJson<T>(path: string): Promise<T>;
  postJson<T>(path: string, body?: unknown): Promise<T>;
  getBlob(path: string): Promise<Blob>;
  delete(path: string): Promise<void>;
}

/**
 * Đọc thân lỗi JSON của response (nếu có) mà không ném lỗi khi body không
 * phải JSON hoặc rỗng.
 */
async function readErrorBody(response: Response): Promise<ApiErrorBody> {
  try {
    return (await response.clone().json()) as ApiErrorBody;
  } catch {
    return {};
  }
}

/** Ánh xạ một response lỗi (status ngoài 2xx) sang lớp lỗi tương ứng của app. */
async function throwForErrorResponse(response: Response): Promise<never> {
  const body = await readErrorBody(response);
  const code = body.code ?? 'unknown_error';

  if (response.status === 401) {
    throw new AuthRequiredError();
  }
  if (response.status === 409 && code === 'google_reauth_required') {
    throw new GoogleReauthRequiredError();
  }
  throw new ApiError(response.status, code, body.message);
}

/**
 * Tạo một API client gọi tới server FastAPI, tự gắn JWT Supabase vào mỗi
 * request và ánh xạ lỗi HTTP/mạng sang các lớp lỗi của `lib/errors.ts`.
 *
 * @param options - Cấu hình client (mục 6.5 PLAN.md).
 * @returns Client với các hàm `getJson`, `postJson`, `getBlob`, `delete`.
 */
export function createApiClient(options: ApiClientOptions): ApiClient {
  const { baseUrl, getAccessToken, fetchImpl = fetch } = options;

  async function request(path: string, init: RequestInit): Promise<Response> {
    const token = await getAccessToken();
    const headers = new Headers(init.headers);
    headers.set('Authorization', `Bearer ${token}`);

    let response: Response;
    try {
      response = await fetchImpl(`${baseUrl}${path}`, { ...init, headers });
    } catch (cause) {
      throw new NetworkError(cause);
    }

    if (!response.ok) {
      await throwForErrorResponse(response);
    }
    return response;
  }

  return {
    async getJson<T>(path: string): Promise<T> {
      const response = await request(path, { method: 'GET' });
      return (await response.json()) as T;
    },

    async postJson<T>(path: string, body?: unknown): Promise<T> {
      const response = await request(path, {
        method: 'POST',
        headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      if (response.status === 204) {
        return undefined as T;
      }
      return (await response.json()) as T;
    },

    async getBlob(path: string): Promise<Blob> {
      const response = await request(path, { method: 'GET' });
      return response.blob();
    },

    async delete(path: string): Promise<void> {
      await request(path, { method: 'DELETE' });
    },
  };
}

/** API client dùng chung cho toàn app, nối với token Supabase hiện tại. */
export const apiClient = createApiClient({
  baseUrl: env.apiBaseUrl,
  // Bọc trong arrow function (thay vì truyền thẳng tham chiếu hàm) để tránh
  // phụ thuộc vào thứ tự khởi tạo module vòng lặp (apiClient <-> authService).
  getAccessToken: () => getSupabaseAccessToken(),
});
