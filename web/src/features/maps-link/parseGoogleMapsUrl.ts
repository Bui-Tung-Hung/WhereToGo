import { InvalidMapsLinkError } from '../../lib/errors';

/** Kết quả phân tích một link Google Maps. */
export interface ParsedMapsLink {
  name?: string;
  latitude?: number;
  longitude?: number;
  placeRef?: string;
  url: string;
}

/** `google.<tld>`, `www.google.<tld>`, `maps.google.<tld>` (tld có thể 2 phần, ví dụ `com.vn`). */
const GOOGLE_MAPS_HOST_PATTERN = /^(?:www\.|maps\.)?google\.[a-z]{2,3}(?:\.[a-z]{2,3})?$/i;

/** `lat,lng` (khoảng trắng tuỳ ý sau dấu phẩy). */
const LAT_LNG_PATTERN = /^(-?\d{1,3}(?:\.\d+)?),\s*(-?\d{1,3}(?:\.\d+)?)$/;

function tryParseUrl(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

function isValidLatLng(latitude: number, longitude: number): boolean {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function parseLatLngPair(value: string): { latitude: number; longitude: number } | null {
  const match = value.trim().match(LAT_LNG_PATTERN);
  if (!match) {
    return null;
  }
  const latitude = Number(match[1]);
  const longitude = Number(match[2]);
  return isValidLatLng(latitude, longitude) ? { latitude, longitude } : null;
}

/** `true` nếu là link rút gọn (`maps.app.goo.gl`, hoặc `goo.gl` với path `/maps…`). */
export function isShortMapsLink(url: string): boolean {
  const parsed = tryParseUrl(url);
  if (!parsed || parsed.protocol !== 'https:') {
    return false;
  }
  const host = parsed.hostname.toLowerCase();
  if (host === 'maps.app.goo.gl') {
    return true;
  }
  if (host === 'goo.gl') {
    return parsed.pathname.startsWith('/maps');
  }
  return false;
}

/** `true` nếu là link Google Maps đầy đủ hoặc link rút gọn phân tích được. */
export function isSupportedMapsUrl(url: string): boolean {
  const parsed = tryParseUrl(url);
  if (!parsed || parsed.protocol !== 'https:') {
    return false;
  }
  if (isShortMapsLink(url)) {
    return true;
  }
  if (!GOOGLE_MAPS_HOST_PATTERN.test(parsed.hostname.toLowerCase())) {
    return false;
  }
  if (parsed.pathname.startsWith('/maps')) {
    return true;
  }
  return parsed.searchParams.has('q') || parsed.searchParams.has('cid');
}

/** Đoạn path ngay sau `/place/`, đổi `+` thành khoảng trắng rồi decode. */
function extractNameFromPath(pathname: string): string | undefined {
  const match = pathname.match(/\/place\/([^/]+)/);
  const segment = match?.[1];
  if (!segment) {
    return undefined;
  }
  try {
    return decodeURIComponent(segment.replace(/\+/g, ' '));
  } catch {
    return undefined;
  }
}

/** Query `query` hoặc `q`, chỉ khi giá trị đó không phải là một cặp toạ độ. */
function extractNameFromQuery(url: URL): string | undefined {
  for (const key of ['query', 'q']) {
    const value = url.searchParams.get(key);
    if (value && !parseLatLngPair(value)) {
      return value;
    }
  }
  return undefined;
}

function extractName(url: URL): string | undefined {
  return extractNameFromPath(url.pathname) ?? extractNameFromQuery(url);
}

/** Toạ độ theo thứ tự ưu tiên: `!3d..!4d..`, rồi `@lat,lng`, rồi query `q`/`query`/`ll`. */
function extractCoordinates(url: URL): { latitude: number; longitude: number } | null {
  const dataPatternMatch = url.href.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if (dataPatternMatch) {
    const latitude = Number(dataPatternMatch[1]);
    const longitude = Number(dataPatternMatch[2]);
    if (isValidLatLng(latitude, longitude)) {
      return { latitude, longitude };
    }
  }

  const atMatch = url.pathname.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (atMatch) {
    const latitude = Number(atMatch[1]);
    const longitude = Number(atMatch[2]);
    if (isValidLatLng(latitude, longitude)) {
      return { latitude, longitude };
    }
  }

  for (const key of ['q', 'query', 'll']) {
    const value = url.searchParams.get(key);
    if (value) {
      const parsed = parseLatLngPair(value);
      if (parsed) {
        return parsed;
      }
    }
  }

  return null;
}

/**
 * Mã địa điểm Google (placeRef), theo thứ tự ưu tiên: ftid (`!1s..` hoặc
 * query `ftid`), rồi `query_place_id`/`place_id`, rồi `cid` (dạng `cid:<số>`).
 */
function extractPlaceRef(url: URL): string | undefined {
  const ftidFromPath = url.href.match(/!1s(0x[0-9a-fA-F]+:0x[0-9a-fA-F]+)/);
  if (ftidFromPath) {
    return ftidFromPath[1];
  }
  const ftidFromQuery = url.searchParams.get('ftid');
  if (ftidFromQuery) {
    return ftidFromQuery;
  }

  const queryPlaceId = url.searchParams.get('query_place_id') ?? url.searchParams.get('place_id');
  if (queryPlaceId) {
    return queryPlaceId;
  }
  for (const key of ['q', 'query']) {
    const value = url.searchParams.get(key);
    if (value?.startsWith('place_id:')) {
      return value.slice('place_id:'.length);
    }
  }

  const cid = url.searchParams.get('cid');
  if (cid) {
    return `cid:${cid}`;
  }

  return undefined;
}

/**
 * Phân tích một link Google Maps đầy đủ (không phải link rút gọn) thành
 * tên, toạ độ và mã địa điểm.
 *
 * @throws {InvalidMapsLinkError} `needs_resolve` nếu là link rút gọn (cần
 *   `POST /api/maps/resolve` trước — xem `mapsLinkService.ts`), hoặc lỗi
 *   mặc định nếu link không được hỗ trợ.
 */
export function parseGoogleMapsUrl(url: string): ParsedMapsLink {
  if (isShortMapsLink(url)) {
    throw new InvalidMapsLinkError('needs_resolve');
  }
  if (!isSupportedMapsUrl(url)) {
    throw new InvalidMapsLinkError();
  }

  const parsed = tryParseUrl(url);
  if (!parsed) {
    throw new InvalidMapsLinkError();
  }

  const coordinates = extractCoordinates(parsed);

  return {
    name: extractName(parsed),
    latitude: coordinates?.latitude,
    longitude: coordinates?.longitude,
    placeRef: extractPlaceRef(parsed),
    url,
  };
}
