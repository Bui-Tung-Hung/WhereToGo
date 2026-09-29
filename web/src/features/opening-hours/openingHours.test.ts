import { describe, expect, it } from 'vitest';
import {
  ALL_DAY_RANGE,
  createDefaultWeek,
  formatRanges,
  isOpenAt,
  validateWeek,
  type OpeningHours,
  type TimeRange,
} from './openingHours';

/** Tuần rỗng (mọi ngày nghỉ), để lắp từng trường hợp test mà không lẫn dữ liệu ngày khác. */
function emptyWeek(): OpeningHours {
  return { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] };
}

describe('isOpenAt', () => {
  it('10:00 trong khung 08:00–22:00 (Thứ 2) → open', () => {
    const week = createDefaultWeek();
    // 2026-09-28 là Thứ 2.
    const date = new Date(2026, 8, 28, 10, 0);
    expect(isOpenAt(week, date)).toBe('open');
  });

  it('22:00 → closed (mốc đóng cửa là mốc loại trừ)', () => {
    const week = createDefaultWeek();
    const date = new Date(2026, 8, 28, 22, 0);
    expect(isOpenAt(week, date)).toBe('closed');
  });

  it('khung 18:00–02:00 của Thứ 6, xét lúc 01:00 Thứ 7 → open', () => {
    const week = emptyWeek();
    week.fri = [{ open: '18:00', close: '02:00' }];
    // 2026-09-25 là Thứ 6, 2026-09-26 là Thứ 7.
    const date = new Date(2026, 8, 26, 1, 0);
    expect(isOpenAt(week, date)).toBe('open');
  });

  it('khung 00:00–24:00 (mở 24h) → open bất kể giờ nào', () => {
    const week = emptyWeek();
    week.mon = [{ ...ALL_DAY_RANGE }];
    expect(isOpenAt(week, new Date(2026, 8, 28, 0, 0))).toBe('open');
    expect(isOpenAt(week, new Date(2026, 8, 28, 23, 59))).toBe('open');
  });

  it('hours null → unknown', () => {
    expect(isOpenAt(null, new Date(2026, 8, 28, 10, 0))).toBe('unknown');
  });

  it('mảng rỗng (ngày nghỉ) → closed', () => {
    const week = emptyWeek();
    expect(isOpenAt(week, new Date(2026, 8, 28, 10, 0))).toBe('closed');
  });
});

describe('validateWeek', () => {
  function weekWithMonday(ranges: TimeRange[]): OpeningHours {
    const week = emptyWeek();
    week.mon = ranges;
    return week;
  }

  it('tuần mặc định hợp lệ', () => {
    expect(validateWeek(createDefaultWeek())).toBe(true);
  });

  it('bắt lỗi phút không chia hết cho 5 (07)', () => {
    const week = weekWithMonday([{ open: '08:07', close: '22:00' }]);
    expect(validateWeek(week)).toBe(false);
  });

  it('bắt lỗi khung chồng nhau trong cùng ngày', () => {
    const week = weekWithMonday([
      { open: '08:00', close: '12:00' },
      { open: '10:00', close: '14:00' },
    ]);
    expect(validateWeek(week)).toBe(false);
  });

  it('bắt lỗi 4 khung trong 1 ngày (vượt quá tối đa 3)', () => {
    const week = weekWithMonday([
      { open: '06:00', close: '08:00' },
      { open: '09:00', close: '11:00' },
      { open: '12:00', close: '14:00' },
      { open: '15:00', close: '17:00' },
    ]);
    expect(validateWeek(week)).toBe(false);
  });
});

describe('formatRanges', () => {
  it('rỗng → "Nghỉ"', () => {
    expect(formatRanges([])).toBe('Nghỉ');
  });

  it('đúng một khung 00:00–24:00 → "Mở 24h"', () => {
    expect(formatRanges([{ ...ALL_DAY_RANGE }])).toBe('Mở 24h');
  });

  it('nhiều khung → nối bằng ", "', () => {
    const ranges: TimeRange[] = [
      { open: '08:00', close: '12:00' },
      { open: '17:00', close: '22:00' },
    ];
    expect(formatRanges(ranges)).toBe('08:00–12:00, 17:00–22:00');
  });
});
