/** Dữ liệu phụ đính kèm một dòng log. */
export type LogData = Record<string, unknown>;

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/** Khoá coi là nhạy cảm — giá trị bị che trước khi in ra console. */
const SENSITIVE_KEY_PATTERN = /token|secret|key|authorization/i;

/**
 * Che giá trị của các khoá nhạy cảm (token/secret/key/authorization)
 * trước khi ghi log, để không bao giờ in bí mật ra console.
 */
function redact(data: LogData | undefined): LogData | undefined {
  if (!data) {
    return undefined;
  }
  const result: LogData = {};
  for (const [key, value] of Object.entries(data)) {
    result[key] = SENSITIVE_KEY_PATTERN.test(key) ? '[redacted]' : value;
  }
  return result;
}

function emit(level: LogLevel, event: string, data?: LogData): void {
  const payload = { level, event, ...redact(data) };
  console[level](payload);
}

/**
 * Logger có cấu trúc dùng chung cho toàn bộ web app.
 *
 * `debug` chỉ in khi đang chạy dev (`import.meta.env.DEV`); mọi khoá
 * dữ liệu khớp `/token|secret|key|authorization/i` bị che tự động.
 */
export const logger = {
  debug(event: string, data?: LogData): void {
    if (import.meta.env.DEV) {
      emit('debug', event, data);
    }
  },
  info(event: string, data?: LogData): void {
    emit('info', event, data);
  },
  warn(event: string, data?: LogData): void {
    emit('warn', event, data);
  },
  error(event: string, data?: LogData): void {
    emit('error', event, data);
  },
};
