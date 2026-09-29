import type { Place } from './types';

/** Các trường của `Place` cần để dựng link Google Maps (dùng `Pick` để hàm dễ kiểm thử/tái sử dụng). */
export type PlaceForMapsLink = Pick<
  Place,
  'googleMapsUrl' | 'latitude' | 'longitude' | 'name' | 'address'
>;

/**
 * Xây link Google Maps để mở một địa điểm ở ngoài app, theo thứ tự ưu tiên
 * (mục 6.6 PLAN.md):
 * 1. `googleMapsUrl` đã lưu (link gốc người dùng đã dán).
 * 2. Toạ độ, nếu có.
 * 3. Tên (kèm địa chỉ nếu có), nếu có tên.
 * 4. Không có gì dùng được → `null`.
 */
export function buildGoogleMapsLink(place: PlaceForMapsLink): string | null {
  if (place.googleMapsUrl) {
    return place.googleMapsUrl;
  }

  if (place.latitude !== null && place.longitude !== null) {
    return `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`;
  }

  if (place.name) {
    const query = place.address ? `${place.name}, ${place.address}` : place.name;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }

  return null;
}
