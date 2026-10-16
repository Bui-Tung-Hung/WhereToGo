import { formatDistance, haversineMeters } from '../../shared/geo/distance';
import { useCurrentPosition } from '../location/useCurrentPosition';
import type { Place } from './types';

/**
 * Chuỗi khoảng cách từ vị trí hiện tại tới địa điểm (ví dụ "3,4 km"), dùng cho dòng "Cách bạn …".
 * Không tự bật hộp xin quyền vị trí (chỉ đọc khi quyền đã được cấp).
 *
 * @param place - Địa điểm (chỉ cần toạ độ); `null` thì trả `null`.
 * @param enabled - `false` thì không gọi định vị (ví dụ bảng trượt lên đang đóng).
 * @returns `null` khi chưa có vị trí hoặc địa điểm chưa có toạ độ.
 */
export function usePlaceDistance(
  place: Pick<Place, 'latitude' | 'longitude'> | null,
  enabled: boolean,
): string | null {
  const { position } = useCurrentPosition({ enabled, onlyIfPermissionGranted: true });
  if (!position || !place || place.latitude === null || place.longitude === null) {
    return null;
  }
  return formatDistance(
    haversineMeters(position, { latitude: place.latitude, longitude: place.longitude }),
  );
}
