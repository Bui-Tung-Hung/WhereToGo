import {
  IonButton,
  IonButtons,
  IonContent,
  IonDatetime,
  IonHeader,
  IonModal,
  IonToolbar,
} from '@ionic/react';
import { useState } from 'react';

export interface TimeWheelSheetProps {
  isOpen: boolean;
  /** Giờ ban đầu, dạng `'HH:MM'` (hoặc `'24:00'` khi `allowEndOfDay`). */
  value: string;
  /** Hiện thêm nút "Hết ngày (24:00)" — dùng cho giờ đóng cửa. */
  allowEndOfDay?: boolean;
  onConfirm: (value: string) => void;
  onDismiss: () => void;
}

/** Ngày giả cố định để ghép thành chuỗi ISO datetime cho `IonDatetime` (chỉ phần giờ được dùng). */
const PLACEHOLDER_DATE = '1970-01-01';
const FALLBACK_TIME = '08:00';
/** `IonDatetime` không biểu diễn được 24:00; khi sửa một giá trị "hết ngày", bánh xe hiện gần cuối ngày nhất. */
const END_OF_DAY_WHEEL_TIME = '23:55';
const MINUTE_VALUES = '0,5,10,15,20,25,30,35,40,45,50,55';

/** Ghép `'HH:MM'` thành chuỗi ISO datetime hợp lệ để làm `value` cho `IonDatetime`. */
function hhmmToIsoDatetime(hhmm: string): string {
  const time = hhmm === '24:00' ? END_OF_DAY_WHEEL_TIME : hhmm;
  return `${PLACEHOLDER_DATE}T${time}:00`;
}

/** Đọc lại `'HH:MM'` từ chuỗi ISO datetime mà `IonDatetime` trả về qua `onIonChange`. */
function isoDatetimeToHhmm(iso: string): string {
  const match = /T(\d{2}:\d{2})/.exec(iso);
  return match?.[1] ?? FALLBACK_TIME;
}

/**
 * Bánh xe chọn giờ dùng chung cho giờ mở/đóng cửa (mục 6.6 PLAN.md).
 *
 * `IonModal` dạng sheet chứa `IonDatetime presentation="time"` (bước phút
 * 5, hệ 24h, ngôn ngữ vi-VN). KHÔNG dùng `IonDatetimeButton` (có bug đã
 * biết). Giá trị của `IonDatetime` là chuỗi ISO datetime; việc đổi qua lại
 * với `'HH:MM'` chỉ nằm trong hai hàm thuần ở trên, tách khỏi state UI.
 *
 * Component này không tự đồng bộ lại `isoValue` khi `value` đổi trong khi
 * đang mở — nơi gọi (`OpeningHoursEditor`) đặt `key` theo khung đang sửa để
 * buộc tạo lại instance (và khởi tạo lại state) mỗi khi đổi mục tiêu sửa.
 */
export function TimeWheelSheet({
  isOpen,
  value,
  allowEndOfDay = false,
  onConfirm,
  onDismiss,
}: TimeWheelSheetProps): React.JSX.Element {
  const [initialIsoValue] = useState(() => hhmmToIsoDatetime(value || FALLBACK_TIME));
  const [isoValue, setIsoValue] = useState(initialIsoValue);

  function handleConfirm(): void {
    // Bánh xe chỉ hiện 23:55 thay cho 24:00; bấm "Xong" mà không xoay thì giữ nguyên 24:00.
    if (value === '24:00' && isoValue === initialIsoValue) {
      onConfirm('24:00');
      return;
    }
    onConfirm(isoDatetimeToHhmm(isoValue));
  }

  function handleEndOfDay(): void {
    onConfirm('24:00');
  }

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onDismiss}
      breakpoints={[0, 0.5]}
      initialBreakpoint={0.5}
    >
      {/* Nút đặt ở đầu sheet: footer của sheet modal nằm dưới phần bị che ở breakpoint 0.5. */}
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton className="wtg-tap-target" onClick={onDismiss}>
              Huỷ
            </IonButton>
          </IonButtons>
          <IonButtons slot="end">
            {allowEndOfDay && (
              <IonButton className="wtg-tap-target" onClick={handleEndOfDay}>
                Hết ngày (24:00)
              </IonButton>
            )}
            <IonButton className="wtg-tap-target" strong onClick={handleConfirm}>
              Xong
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonDatetime
          presentation="time"
          hourCycle="h23"
          minuteValues={MINUTE_VALUES}
          locale="vi-VN"
          value={isoValue}
          onIonChange={(event) => {
            const nextValue = event.detail.value;
            if (typeof nextValue === 'string') {
              setIsoValue(nextValue);
            }
          }}
        />
      </IonContent>
    </IonModal>
  );
}
