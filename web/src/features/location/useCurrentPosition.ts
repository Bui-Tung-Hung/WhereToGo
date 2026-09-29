import { useCallback, useEffect, useRef, useState } from 'react';
import { LocationError } from '../../lib/errors';
import {
  getCurrentPosition,
  isLocationPermissionGranted,
  type CurrentPosition,
} from './geolocation';

export interface UseCurrentPositionOptions {
  /** Chỉ tự gọi Geolocation API khi `true`. Mặc định `true`. */
  enabled?: boolean;
  /**
   * Khi `true`, lần tự gọi chỉ chạy nếu quyền vị trí ĐÃ được cấp từ trước,
   * để không bật hộp xin quyền ở những màn hình chỉ dùng vị trí cho thông tin
   * phụ (vd. khoảng cách ở trang chi tiết). `refresh()` vẫn gọi thẳng.
   */
  onlyIfPermissionGranted?: boolean;
}

export type CurrentPositionStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UseCurrentPositionResult {
  position: CurrentPosition | null;
  error: LocationError | null;
  status: CurrentPositionStatus;
  /** Gọi lại `getCurrentPosition()` thủ công, bất kể `enabled`. */
  refresh: () => void;
}

/**
 * Hook lấy vị trí hiện tại của thiết bị, dùng cho tab "Gần tôi" (sắp theo
 * khoảng cách) và nút "Dùng vị trí hiện tại" trong form địa điểm.
 *
 * Tự gọi `getCurrentPosition()` khi `enabled` là `true` (hoặc khi nó chuyển
 * từ `false` sang `true`); `refresh()` cho phép gọi lại thủ công, ví dụ khi
 * người dùng bấm "Thử lại" sau khi bị từ chối quyền.
 */
export function useCurrentPosition(
  options: UseCurrentPositionOptions = {},
): UseCurrentPositionResult {
  const { enabled = true, onlyIfPermissionGranted = false } = options;
  const [position, setPosition] = useState<CurrentPosition | null>(null);
  const [error, setError] = useState<LocationError | null>(null);
  const [status, setStatus] = useState<CurrentPositionStatus>('idle');
  // Tăng lên mỗi khi cần gọi lại thủ công (kể cả khi `enabled` không đổi).
  const [manualRefreshCount, setManualRefreshCount] = useState(0);
  // Đánh dấu lần gọi mới nhất để bỏ qua kết quả của lần gọi cũ hơn.
  const latestRequestId = useRef(0);

  const refresh = useCallback(() => {
    setManualRefreshCount((count) => count + 1);
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const requestId = ++latestRequestId.current;
    const isManualRefresh = manualRefreshCount > 0;

    async function run(): Promise<void> {
      if (onlyIfPermissionGranted && !isManualRefresh && !(await isLocationPermissionGranted())) {
        return;
      }
      if (latestRequestId.current !== requestId) {
        return;
      }
      setStatus('loading');
      setError(null);
      try {
        const result = await getCurrentPosition();
        if (latestRequestId.current !== requestId) {
          return;
        }
        setPosition(result);
        setStatus('success');
      } catch (rejected) {
        if (latestRequestId.current !== requestId) {
          return;
        }
        setError(
          rejected instanceof LocationError ? rejected : new LocationError('unavailable', rejected),
        );
        setStatus('error');
      }
    }

    void run();
    // `manualRefreshCount` chỉ dùng để buộc effect chạy lại khi gọi `refresh()`.
  }, [enabled, manualRefreshCount, onlyIfPermissionGranted]);

  return { position, error, status, refresh };
}
