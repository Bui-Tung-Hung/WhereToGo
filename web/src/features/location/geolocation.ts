import { LocationError } from '../../lib/errors';
import type { LatLng } from '../../shared/geo/distance';

export type { LatLng };

/** Toạ độ hiện tại kèm độ chính xác (mét) do trình duyệt báo cáo. */
export type CurrentPosition = LatLng & { accuracy: number };

/**
 * `true` nếu người dùng ĐÃ cấp quyền vị trí cho trang (Permissions API). Không
 * bao giờ bật hộp xin quyền. Trình duyệt không hỗ trợ API này hoặc lỗi → `false`.
 */
export async function isLocationPermissionGranted(): Promise<boolean> {
  try {
    const status = await navigator.permissions?.query({ name: 'geolocation' });
    return status?.state === 'granted';
  } catch {
    return false;
  }
}

/**
 * Độ chính xác cao, chờ tối đa 15 giây, chấp nhận vị trí đã có trong bộ nhớ
 * đệm của trình duyệt tối đa 60 giây trước khi hỏi lại (mục 6.6 PLAN.md).
 */
const POSITION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 60000,
};

/** Ánh xạ mã lỗi của `GeolocationPositionError` sang `LocationError` của app. */
function mapGeolocationError(error: GeolocationPositionError): LocationError {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return new LocationError('denied', error);
    case error.POSITION_UNAVAILABLE:
      return new LocationError('unavailable', error);
    case error.TIMEOUT:
      return new LocationError('timeout', error);
    default:
      return new LocationError('unavailable', error);
  }
}

/**
 * Lấy vị trí hiện tại của thiết bị qua Geolocation API của trình duyệt.
 *
 * @throws {LocationError} `'denied'` (từ chối quyền), `'unavailable'`
 *   (không xác định được vị trí, kể cả khi trình duyệt không hỗ trợ), hoặc
 *   `'timeout'` (hết thời gian chờ).
 */
export function getCurrentPosition(): Promise<CurrentPosition> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new LocationError('unavailable'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => reject(mapGeolocationError(error)),
      POSITION_OPTIONS,
    );
  });
}
