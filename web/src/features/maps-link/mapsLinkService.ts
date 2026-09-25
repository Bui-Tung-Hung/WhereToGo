import { apiClient } from '../../lib/apiClient';
import { InvalidMapsLinkError } from '../../lib/errors';
import { isShortMapsLink, parseGoogleMapsUrl, type ParsedMapsLink } from './parseGoogleMapsUrl';

/** Bắt URL http(s) đầu tiên trong một chuỗi văn bản tuỳ ý. */
const FIRST_URL_PATTERN = /https?:\/\/\S+/i;

interface ResolveMapsLinkResponse {
  resolved_url: string;
}

/**
 * Lấy tên/toạ độ/mã địa điểm từ một đoạn văn bản người dùng dán vào (có thể
 * là cả câu chứa link "Chia sẻ" từ app Google Maps).
 *
 * Link rút gọn (`maps.app.goo.gl`) được server đi theo redirect trước khi
 * phân tích, vì JS trên trình duyệt không đọc được URL đích của redirect
 * chéo miền.
 *
 * @throws {InvalidMapsLinkError} Khi không tìm thấy URL hoặc link không được hỗ trợ.
 */
export async function extractFromMapsLink(raw: string): Promise<ParsedMapsLink> {
  const match = raw.trim().match(FIRST_URL_PATTERN);
  if (!match) {
    throw new InvalidMapsLinkError();
  }
  const url = match[0];

  if (isShortMapsLink(url)) {
    const response = await apiClient.postJson<ResolveMapsLinkResponse>('/api/maps/resolve', { url });
    return parseGoogleMapsUrl(response.resolved_url);
  }

  return parseGoogleMapsUrl(url);
}
