import { OfflineError } from './errors';

/**
 * Chặn thao tác ghi dữ liệu khi đang offline (D13 PLAN.md). Dùng chung cho
 * mọi service/repository có ghi dữ liệu.
 *
 * @throws {OfflineError} Khi `navigator.onLine` là `false`.
 */
export function assertOnline(): void {
  if (!navigator.onLine) {
    throw new OfflineError();
  }
}
