import { IonButton, IonIcon, IonItem, IonLabel, IonToggle } from '@ionic/react';
import { addOutline, timeOutline, trashOutline } from 'ionicons/icons';
import { useEffect, useRef, useState } from 'react';
import {
  ALL_DAY_RANGE,
  copyDayToAll,
  createDefaultWeek,
  MAX_RANGES_PER_DAY,
  minutesToTime,
  timeToMinutes,
  WEEKDAYS,
  WEEKDAY_LABELS,
  type OpeningHours,
  type TimeRange,
  type Weekday,
} from './openingHours';
import { TimeWheelSheet } from './TimeWheelSheet';

/** Độ dài khung giờ mới được gợi ý khi bấm "+ Khung giờ". */
const NEW_RANGE_MINUTES = 60;

export interface OpeningHoursEditorProps {
  /** `null` nghĩa là "chưa rõ giờ". */
  value: OpeningHours | null;
  onChange: (value: OpeningHours | null) => void;
}

/** Khung giờ mặc định khi bật lại một ngày hoặc thêm khung mới. */
const DEFAULT_NEW_RANGE: TimeRange = { open: '08:00', close: '22:00' };
/** Giá trị hiển thị tạm cho `TimeWheelSheet` khi chưa có khung nào đang sửa. */
const FALLBACK_TIME = '08:00';

/**
 * Khung gợi ý cho "+ Khung giờ": bắt đầu ngay khi khung cuối cùng của ngày
 * đóng cửa, dài 1 giờ, để không trùng khung sẵn có. Khung cuối qua đêm, đóng
 * lúc 24:00 hoặc sau 23:00 → dùng khung mặc định (người dùng tự chỉnh).
 */
function suggestNextRange(ranges: TimeRange[]): TimeRange {
  const last = ranges[ranges.length - 1];
  if (!last) {
    return { ...DEFAULT_NEW_RANGE };
  }
  const start = timeToMinutes(last.close);
  const lastEndsSameDay = start > timeToMinutes(last.open);
  if (!lastEndsSameDay || start >= 23 * 60) {
    return { ...DEFAULT_NEW_RANGE };
  }
  return { open: last.close, close: minutesToTime(Math.min(start + NEW_RANGE_MINUTES, 24 * 60)) };
}

interface EditingTarget {
  day: Weekday;
  index: number;
  field: 'open' | 'close';
}

/**
 * Sửa giờ mở cửa cả tuần (mục 6.6 PLAN.md): công tắc "Chưa rõ giờ", nút
 * "Mở 24h cả tuần", và 7 dòng (mỗi dòng: bật/tắt ngày, tối đa 3 khung giờ,
 * nút thêm khung, nút "Mở 24h" riêng ngày đó; dòng Thứ 2 có thêm "Áp dụng
 * cho cả tuần"). Chạm vào một giờ mở `TimeWheelSheet` dùng chung.
 */
export function OpeningHoursEditor({
  value,
  onChange,
}: OpeningHoursEditorProps): React.JSX.Element {
  // Nhớ tuần cụ thể gần nhất để khi tắt "Chưa rõ giờ" không mất dữ liệu đã nhập.
  const lastKnownWeek = useRef<OpeningHours>(value ?? createDefaultWeek());
  useEffect(() => {
    if (value) {
      lastKnownWeek.current = value;
    }
  }, [value]);
  const [editing, setEditing] = useState<EditingTarget | null>(null);

  const isUnknown = value === null;

  function handleUnknownToggle(checked: boolean): void {
    onChange(checked ? null : lastKnownWeek.current);
  }

  function updateDay(day: Weekday, ranges: TimeRange[]): void {
    if (!value) {
      return;
    }
    onChange({ ...value, [day]: ranges });
  }

  function handleOpenAllWeek(): void {
    const week = {} as OpeningHours;
    for (const day of WEEKDAYS) {
      week[day] = [{ ...ALL_DAY_RANGE }];
    }
    onChange(week);
  }

  function handleDayToggle(day: Weekday, checked: boolean): void {
    updateDay(day, checked ? [{ ...DEFAULT_NEW_RANGE }] : []);
  }

  function handleAddRange(day: Weekday): void {
    if (!value || value[day].length >= MAX_RANGES_PER_DAY) {
      return;
    }
    updateDay(day, [...value[day], suggestNextRange(value[day])]);
  }

  function handleRemoveRange(day: Weekday, index: number): void {
    if (!value) {
      return;
    }
    updateDay(
      day,
      value[day].filter((_, i) => i !== index),
    );
  }

  function handleDayAllDay(day: Weekday): void {
    updateDay(day, [{ ...ALL_DAY_RANGE }]);
  }

  function handleApplyToWeek(day: Weekday): void {
    if (!value) {
      return;
    }
    onChange(copyDayToAll(value, day));
  }

  function handleTimeConfirm(hhmm: string): void {
    if (editing && value) {
      const { day, index, field } = editing;
      updateDay(
        day,
        value[day].map((range, i) => (i === index ? { ...range, [field]: hhmm } : range)),
      );
    }
    setEditing(null);
  }

  // Giá trị hiện tại của khung đang được sửa (nếu có), dùng làm `value` ban đầu cho bánh xe giờ.
  let editingValue = FALLBACK_TIME;
  if (editing && value) {
    const range = value[editing.day][editing.index];
    if (range) {
      editingValue = range[editing.field];
    }
  }

  return (
    <div className="wtg-group">
      <p className="wtg-group-title">Giờ mở cửa</p>

      <IonItem lines="none">
        <IonLabel>Chưa rõ giờ</IonLabel>
        <IonToggle
          checked={isUnknown}
          onIonChange={(event) => handleUnknownToggle(event.detail.checked)}
          aria-label="Chưa rõ giờ mở cửa"
        />
      </IonItem>

      {!isUnknown && value && (
        <>
          <IonButton
            className="wtg-tap-target"
            fill="outline"
            size="small"
            onClick={handleOpenAllWeek}
          >
            Mở 24h cả tuần
          </IonButton>

          {WEEKDAYS.map((day) => {
            const ranges = value[day];
            return (
              <div key={day} style={{ marginTop: 16 }}>
                <IonItem lines="none">
                  <IonLabel>{WEEKDAY_LABELS[day]}</IonLabel>
                  <IonToggle
                    checked={ranges.length > 0}
                    onIonChange={(event) => handleDayToggle(day, event.detail.checked)}
                    aria-label={`Mở cửa ${WEEKDAY_LABELS[day]}`}
                  />
                </IonItem>

                {ranges.map((range, index) => (
                  <div
                    key={index}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}
                  >
                    <button
                      type="button"
                      className="wtg-tap-target"
                      aria-label={`Giờ mở cửa khung ${index + 1} ${WEEKDAY_LABELS[day]}`}
                      onClick={() => setEditing({ day, index, field: 'open' })}
                    >
                      <IonIcon icon={timeOutline} aria-hidden="true" /> {range.open}
                    </button>
                    <span aria-hidden="true">–</span>
                    <button
                      type="button"
                      className="wtg-tap-target"
                      aria-label={`Giờ đóng cửa khung ${index + 1} ${WEEKDAY_LABELS[day]}`}
                      onClick={() => setEditing({ day, index, field: 'close' })}
                    >
                      {range.close}
                    </button>
                    <button
                      type="button"
                      className="wtg-tap-target"
                      aria-label={`Xoá khung giờ ${range.open}–${range.close} ${WEEKDAY_LABELS[day]}`}
                      onClick={() => handleRemoveRange(day, index)}
                    >
                      <IonIcon icon={trashOutline} />
                    </button>
                  </div>
                ))}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                  <IonButton
                    className="wtg-tap-target"
                    fill="clear"
                    size="small"
                    disabled={ranges.length >= MAX_RANGES_PER_DAY}
                    onClick={() => handleAddRange(day)}
                  >
                    <IonIcon icon={addOutline} slot="start" aria-hidden="true" />
                    Khung giờ
                  </IonButton>
                  <IonButton
                    className="wtg-tap-target"
                    fill="clear"
                    size="small"
                    onClick={() => handleDayAllDay(day)}
                  >
                    Mở 24h
                  </IonButton>
                  {day === 'mon' && (
                    <IonButton
                      className="wtg-tap-target"
                      fill="clear"
                      size="small"
                      onClick={() => handleApplyToWeek(day)}
                    >
                      Áp dụng cho cả tuần
                    </IonButton>
                  )}
                </div>
              </div>
            );
          })}
        </>
      )}

      <TimeWheelSheet
        key={editing ? `${editing.day}-${editing.index}-${editing.field}` : 'none'}
        isOpen={editing !== null}
        value={editingValue}
        allowEndOfDay={editing?.field === 'close'}
        onConfirm={handleTimeConfirm}
        onDismiss={() => setEditing(null)}
      />
    </div>
  );
}
