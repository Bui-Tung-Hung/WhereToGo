import { InvalidMapsLinkError } from '../../lib/errors';

/** Kết quả phân tích một link Google Maps. */
export interface ParsedMapsLink {
  name?: string;
  /** Địa chỉ (hiện chỉ có ở link chỉ đường, lấy từ `daddr`). */
  address?: string;
  latitude?: number;
  longitude?: number;
  placeRef?: string;
  url: string;
}

/** `google.<tld>`, `www.google.<tld>`, `maps.google.<tld>` (tld có thể 2 phần, ví dụ `com.vn`). */
const GOOGLE_MAPS_HOST_PATTERN = /^(?:www\.|maps\.)?google\.[a-z]{2,3}(?:\.[a-z]{2,3})?$/i;

/** `lat,lng` (khoảng trắng tuỳ ý sau dấu phẩy). */
const LAT_LNG_PATTERN = /^(-?\d{1,3}(?:\.\d+)?),\s*(-?\d{1,3}(?:\.\d+)?)$/;

/** Toạ độ nằm ngay trong path: `/maps/search/<lat>,<lng>` hoặc `/maps/place/<lat>,<lng>`. */
const PATH_LAT_LNG_PATTERN =
  /\/maps\/(?:search|place)\/(-?\d{1,3}(?:\.\d+)?),[+\s]*(-?\d{1,3}(?:\.\d+)?)(?:[/?#]|$)/;

/** Query cho biết một URL `google.<tld>` (không có path `/maps`) là link bản đồ. */
const MAPS_QUERY_KEYS = ['q', 'query', 'cid', 'll', 'ftid', 'daddr'];

/** Tag protobuf trong tham số `geocode`: 0x15 = vĩ độ, 0x1d = kinh độ (int32 LE, ×1e6). */
const GEOCODE_LAT_TAG = 0x15;
const GEOCODE_LNG_TAG = 0x1d;
/** Tag 64-bit (ftid/cid) trong `geocode`, được bỏ qua. */
const GEOCODE_FIXED64_TAGS = new Set([0x29, 0x31]);

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
  return MAPS_QUERY_KEYS.some((key) => parsed.searchParams.has(key));
}

/** Đoạn path ngay sau `/place/`, đổi `+` thành khoảng trắng rồi decode. */
function extractNameFromPath(pathname: string): string | undefined {
  const match = pathname.match(/\/place\/([^/]+)/);
  const segment = match?.[1];
  if (!segment) {
    return undefined;
  }
  try {
    const name = decodeURIComponent(segment.replace(/\+/g, ' '));
    // `/maps/place/<lat>,<lng>` là một ghim toạ độ, không phải tên địa điểm.
    return parseLatLngPair(name) ? undefined : name;
  } catch {
    return undefined;
  }
}

/**
 * Nơi đến của link chỉ đường (`daddr`), tách thành tên (trước dấu phẩy đầu
 * tiên) và địa chỉ (phần còn lại). Bỏ qua khi `daddr` chỉ là toạ độ.
 */
function splitDestination(url: URL): { name?: string; address?: string } {
  const destination = url.searchParams.get('daddr')?.trim();
  if (!destination || parseLatLngPair(destination)) {
    return {};
  }
  const commaIndex = destination.indexOf(',');
  if (commaIndex === -1) {
    return { name: destination };
  }
  const name = destination.slice(0, commaIndex).trim();
  const address = destination.slice(commaIndex + 1).trim();
  return { name: name || undefined, address: address || undefined };
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
  return extractNameFromPath(url.pathname) ?? extractNameFromQuery(url) ?? splitDestination(url).name;
}

/**
 * Toạ độ nơi đến giấu trong tham số `geocode` của link chỉ đường (định dạng
 * nội bộ của Google, không có tài liệu): lấy đoạn CUỐI (nơi đến; đoạn đầu là
 * điểm xuất phát = vị trí của người chia sẻ), giải base64 rồi đọc tag protobuf
 * 0x15/0x1d. Sai định dạng → `null` (bỏ qua toạ độ, không ném lỗi).
 */
function decodeGeocodeDestination(url: URL): { latitude: number; longitude: number } | null {
  const geocode = url.searchParams.get('geocode');
  if (!geocode) {
    return null;
  }
  const lastSegment = geocode.split(';').pop();
  if (!lastSegment) {
    return null;
  }

  let bytes: Uint8Array;
  try {
    // URLSearchParams đổi `+` thành khoảng trắng; trả lại `+` cho base64.
    const binary = atob(lastSegment.replace(/ /g, '+'));
    bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  } catch {
    return null;
  }

  const view = new DataView(bytes.buffer);
  let latitude: number | undefined;
  let longitude: number | undefined;
  let offset = 0;
  while (offset < bytes.length) {
    const tag = bytes[offset];
    offset += 1;
    if (tag === GEOCODE_LAT_TAG || tag === GEOCODE_LNG_TAG) {
      if (offset + 4 > bytes.length) {
        break;
      }
      const value = view.getInt32(offset, true) / 1e6;
      if (tag === GEOCODE_LAT_TAG) {
        latitude = value;
      } else {
        longitude = value;
      }
      offset += 4;
    } else if (tag !== undefined && GEOCODE_FIXED64_TAGS.has(tag)) {
      offset += 8;
    } else {
      break;
    }
  }

  if (latitude === undefined || longitude === undefined || !isValidLatLng(latitude, longitude)) {
    return null;
  }
  return { latitude, longitude };
}

/**
 * Toạ độ theo thứ tự ưu tiên: `!3d..!4d..`, rồi `@lat,lng`, rồi toạ độ trong
 * path `/maps/search|place/<lat>,<lng>`, rồi query `q`/`query`/`ll`, rồi nơi
 * đến trong `geocode`. KHÔNG dùng `saddr` (điểm xuất phát = vị trí người chia sẻ).
 */
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

  let decodedPath: string | null = null;
  try {
    decodedPath = decodeURIComponent(url.pathname);
  } catch {
    decodedPath = null;
  }
  const pathMatch = decodedPath?.match(PATH_LAT_LNG_PATTERN);
  if (pathMatch) {
    const latitude = Number(pathMatch[1]);
    const longitude = Number(pathMatch[2]);
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

  return decodeGeocodeDestination(url);
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
    address: splitDestination(parsed).address,
    latitude: coordinates?.latitude,
    longitude: coordinates?.longitude,
    placeRef: extractPlaceRef(parsed),
    url,
  };
}
