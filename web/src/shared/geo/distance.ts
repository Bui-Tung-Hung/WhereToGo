/** Toạ độ địa lý (độ thập phân). */
export interface LatLng {
  latitude: number;
  longitude: number;
}

/** Bán kính trung bình Trái Đất (mét), dùng cho công thức Haversine. */
const EARTH_RADIUS_METERS = 6_371_008.8;

/** Đổi độ sang radian. */
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Tính khoảng cách đường chim bay giữa hai toạ độ bằng công thức Haversine.
 *
 * @param a - Toạ độ điểm thứ nhất.
 * @param b - Toạ độ điểm thứ hai.
 * @returns Khoảng cách theo mét.
 */
export function haversineMeters(a: LatLng, b: LatLng): number {
  const dLat = toRadians(b.latitude - a.latitude);
  const dLng = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(h));
}

/**
 * Định dạng khoảng cách để hiển thị: dưới 1000 m làm tròn tới 10 m gần nhất
 * (ví dụ `"350 m"`), từ 1000 m trở lên hiển thị theo km với 1 chữ số thập
 * phân và dấu phẩy kiểu Việt Nam (ví dụ `"1,2 km"`).
 *
 * @param meters - Khoảng cách theo mét (không âm).
 * @returns Chuỗi khoảng cách đã định dạng.
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    const roundedToTen = Math.round(meters / 10) * 10;
    return `${roundedToTen} m`;
  }
  const km = meters / 1000;
  return `${km.toFixed(1).replace('.', ',')} km`;
}
