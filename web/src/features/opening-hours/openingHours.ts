/**
 * Giờ mở cửa theo tuần: hàm thuần, không phụ thuộc UI (mục 6.6, D18 PLAN.md).
 *
 * Ngữ nghĩa quan trọng:
 * - Một `TimeRange` có `close` nhỏ hơn hoặc bằng `open` là khung "qua đêm":
 *   bắt đầu lúc `open` của chính ngày đó và kết thúc lúc `close` vào SÁNG
 *   HÔM SAU (D18: "đóng cửa sau nửa đêm được hiểu là qua ngày hôm sau").
 * - Giờ đóng cửa là mốc loại trừ (`isOpenAt` coi đúng giờ đóng là đã đóng).
 * - `close` có thể là chuỗi đặc biệt `'24:00'` (hết ngày), không phải giờ
 *   hợp lệ để dùng làm `open`.
 * - `OpeningHours` bằng `null` nghĩa là "chưa rõ giờ" (không phải "đóng cửa
 *   cả tuần").
 */

/** Thứ trong tuần, thứ tự Thứ 2 → Chủ nhật. */
export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

/** Một khung giờ mở cửa trong ngày, dạng `'HH:MM'` (`close` có thể là `'24:00'`). */
export interface TimeRange {
  open: string;
  close: string;
}

/** Giờ mở cửa cả tuần: mỗi ngày tối đa `MAX_RANGES_PER_DAY` khung. */
export type OpeningHours = Record<Weekday, TimeRange[]>;

/** Thứ tự chuẩn Thứ 2 → Chủ nhật, dùng để lặp và tra ngày liền trước. */
export const WEEKDAYS: readonly Weekday[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

/** Nhãn hiển thị tiếng Việt cho từng thứ. */
export const WEEKDAY_LABELS: Record<Weekday, string> = {
  mon: 'T2',
  tue: 'T3',
  wed: 'T4',
  thu: 'T5',
  fri: 'T6',
  sat: 'T7',
  sun: 'CN',
};

/** Số khung giờ tối đa cho mỗi ngày (D18). */
export const MAX_RANGES_PER_DAY = 3;

/** Giờ mặc định khi tạo một khung/ngày mới. */
const DEFAULT_RANGE: TimeRange = { open: '08:00', close: '22:00' };

/** Khung "mở 24h", dùng bởi nút "Mở 24h" / "Mở 24h cả tuần". */
export const ALL_DAY_RANGE: TimeRange = { open: '00:00', close: '24:00' };

const END_OF_DAY = '24:00';
/** `HH:MM` với giờ 00–23, phút 00–59 (kiểm chia hết cho 5 riêng, xem {@link isValidTimeFormat}). */
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

const JS_DAY_INDEX_TO_WEEKDAY: readonly Weekday[] = [
  'sun',
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
];

/** Thứ (theo lịch của `date`) tương ứng với `Weekday` dùng trong `OpeningHours`. */
export function weekdayOf(date: Date): Weekday {
  const weekday = JS_DAY_INDEX_TO_WEEKDAY[date.getDay()];
  // date.getDay() luôn 0–6 nên chỉ số luôn hợp lệ.
  return weekday as Weekday;
}

/** Thứ liền trước `day` trong tuần (dùng để xét khung qua đêm bắt đầu từ hôm trước). */
function previousWeekday(day: Weekday): Weekday {
  const index = WEEKDAYS.indexOf(day);
  const previousIndex = (index + WEEKDAYS.length - 1) % WEEKDAYS.length;
  return WEEKDAYS[previousIndex] as Weekday;
}

/** Đổi `'HH:MM'` (hoặc `'24:00'`) sang số phút kể từ 00:00. */
export function timeToMinutes(time: string): number {
  if (time === END_OF_DAY) {
    return 24 * 60;
  }
  const match = TIME_PATTERN.exec(time);
  if (!match) {
    throw new RangeError(`Giờ không hợp lệ: "${time}"`);
  }
  return Number(match[1]) * 60 + Number(match[2]);
}

/** Đổi số phút kể từ 00:00 (0–1440) sang chuỗi `'HH:MM'` (1440 → `'24:00'`). */
export function minutesToTime(totalMinutes: number): string {
  if (totalMinutes === 24 * 60) {
    return END_OF_DAY;
  }
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Giờ mở cửa mặc định khi tạo địa điểm mới: mọi ngày trong tuần cùng một
 * khung `08:00–22:00` (D18).
 */
export function createDefaultWeek(): OpeningHours {
  const week = {} as OpeningHours;
  for (const day of WEEKDAYS) {
    week[day] = [{ ...DEFAULT_RANGE }];
  }
  return week;
}

/** Có `true` khi định dạng giờ hợp lệ: `'HH:MM'` (phút chia hết cho 5), hoặc `'24:00'` nếu `allowEndOfDay`. */
function isValidTimeFormat(time: string, allowEndOfDay: boolean): boolean {
  if (allowEndOfDay && time === END_OF_DAY) {
    return true;
  }
  const match = TIME_PATTERN.exec(time);
  if (!match) {
    return false;
  }
  const minutes = Number(match[2]);
  return minutes % 5 === 0;
}

/**
 * Khoảng phút [bắt đầu, kết thúc) của một khung trong ngày; khung qua đêm
 * (`close <= open`) được kéo dài qua mốc 1440 để so sánh chồng lấn cho đúng.
 */
function toMinuteInterval(range: TimeRange): { start: number; end: number } {
  const start = timeToMinutes(range.open);
  const closeMinutes = timeToMinutes(range.close);
  const end = closeMinutes > start ? closeMinutes : closeMinutes + 24 * 60;
  return { start, end };
}

/** Có khung nào trong danh sách chồng lấn (hoặc trùng) khung khác không. */
function hasOverlap(ranges: readonly TimeRange[]): boolean {
  const intervals = ranges.map(toMinuteInterval);
  for (let i = 0; i < intervals.length; i += 1) {
    for (let j = i + 1; j < intervals.length; j += 1) {
      const a = intervals[i];
      const b = intervals[j];
      if (a && b && a.start < b.end && b.start < a.end) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Kiểm tra một tuần giờ mở cửa có hợp lệ không: định dạng `HH:MM`, phút
 * chia hết cho 5, tối đa {@link MAX_RANGES_PER_DAY} khung/ngày, và các
 * khung trong cùng một ngày không chồng lấn/trùng nhau.
 */
export function validateWeek(week: OpeningHours): boolean {
  return WEEKDAYS.every((day) => {
    const ranges = week[day];
    if (ranges.length > MAX_RANGES_PER_DAY) {
      return false;
    }
    const formatOk = ranges.every(
      (range) => isValidTimeFormat(range.open, false) && isValidTimeFormat(range.close, true),
    );
    return formatOk && !hasOverlap(ranges);
  });
}

/**
 * Trạng thái mở cửa tại một thời điểm cụ thể.
 *
 * `hours` là `null` → `'unknown'`. Nếu không, xét các khung của chính
 * ngày đó, RỒI xét khung qua đêm của ngày hôm trước (có thể vẫn đang mở
 * vào sáng sớm hôm nay).
 */
export function isOpenAt(hours: OpeningHours | null, date: Date): 'open' | 'closed' | 'unknown' {
  if (!hours) {
    return 'unknown';
  }
  const currentMinutes = date.getHours() * 60 + date.getMinutes();
  const today = weekdayOf(date);
  const yesterday = previousWeekday(today);

  for (const range of hours[today]) {
    const openMinutes = timeToMinutes(range.open);
    const closeMinutes = timeToMinutes(range.close);
    if (closeMinutes > openMinutes) {
      // Khung trong cùng ngày.
      if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
        return 'open';
      }
    } else if (currentMinutes >= openMinutes) {
      // Khung qua đêm bắt đầu hôm nay, còn đang mở tới hết ngày hôm nay.
      return 'open';
    }
  }

  for (const range of hours[yesterday]) {
    const openMinutes = timeToMinutes(range.open);
    const closeMinutes = timeToMinutes(range.close);
    if (closeMinutes <= openMinutes && currentMinutes < closeMinutes) {
      // Khung qua đêm bắt đầu hôm qua, còn đang mở tới đầu giờ sáng hôm nay.
      return 'open';
    }
  }

  return 'closed';
}

/**
 * Hiển thị các khung giờ của một ngày: `"08:00–22:00, 17:00–23:00"`;
 * rỗng → `"Nghỉ"`; đúng một khung `00:00–24:00` → `"Mở 24h"`.
 */
export function formatRanges(ranges: readonly TimeRange[]): string {
  if (ranges.length === 0) {
    return 'Nghỉ';
  }
  if (ranges.length === 1) {
    const only = ranges[0];
    if (only && only.open === ALL_DAY_RANGE.open && only.close === ALL_DAY_RANGE.close) {
      return 'Mở 24h';
    }
  }
  return ranges.map((range) => `${range.open}–${range.close}`).join(', ');
}

/** Sao chép các khung giờ của `day` sang mọi ngày còn lại trong tuần. */
export function copyDayToAll(week: OpeningHours, day: Weekday): OpeningHours {
  const source = week[day];
  const next = {} as OpeningHours;
  for (const weekday of WEEKDAYS) {
    next[weekday] = source.map((range) => ({ ...range }));
  }
  return next;
}
