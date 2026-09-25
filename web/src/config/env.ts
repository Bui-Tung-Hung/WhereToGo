import { z } from 'zod';

/** Biến môi trường bắt buộc của app, đọc từ `import.meta.env` (tiền tố `VITE_`). */
const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_PUBLISHABLE_KEY: z.string().startsWith('sb_publishable_'),
  VITE_API_BASE_URL: z
    .string()
    .url()
    .refine((value) => !value.endsWith('/'), {
      message: 'không được kết thúc bằng "/"',
    }),
});

/** Cấu hình môi trường của app, đã kiểm tra hợp lệ và đổi sang camelCase. */
export interface AppEnv {
  supabaseUrl: string;
  supabasePublishableKey: string;
  apiBaseUrl: string;
}

/**
 * Đọc và kiểm tra các biến môi trường bắt buộc từ `import.meta.env`.
 *
 * @returns Cấu hình môi trường đã kiểm tra hợp lệ, dạng camelCase.
 * @throws {Error} Khi thiếu biến hoặc giá trị sai định dạng — liệt kê rõ từng lỗi.
 */
export function loadEnv(): AppEnv {
  const result = envSchema.safeParse(import.meta.env);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Cấu hình môi trường không hợp lệ (${details})`);
  }

  return {
    supabaseUrl: result.data.VITE_SUPABASE_URL,
    supabasePublishableKey: result.data.VITE_SUPABASE_PUBLISHABLE_KEY,
    apiBaseUrl: result.data.VITE_API_BASE_URL,
  };
}

/** Cấu hình môi trường đã kiểm tra, dùng ở khắp app. */
export const env = loadEnv();
