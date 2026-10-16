/**
 * Mở một link Google Maps (từ `buildGoogleMapsLink`) ở tab/app mới, không gửi `opener` và
 * `referrer` (dùng chung cho trang chi tiết và bảng trượt lên — U13).
 */
export function openMapsLink(link: string): void {
  window.open(link, '_blank', 'noopener,noreferrer');
}
