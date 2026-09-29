import {
  IonButton,
  IonButtons,
  IonContent,
  IonDatetime,
  IonFooter,
  IonModal,
  IonTextarea,
  IonToolbar,
  useIonAlert,
  type TextareaCustomEvent,
} from '@ionic/react';
import { useState } from 'react';
import { toUserMessage } from '../../lib/errors';
import { useOnlineStatus } from '../../shared/hooks/useOnlineStatus';
import type { PlaceStatus } from '../places/types';
import { useAddVisit } from './visitQueries';

export interface AddVisitSheetProps {
  placeId: string;
  /** Trạng thái hiện tại của địa điểm — quyết định có tự chuyển sang "Đã đi" hay không (D16). */
  currentStatus: PlaceStatus;
  isOpen: boolean;
  onDismiss: () => void;
}

/** Ghi chú của một lần đi tối đa 500 ký tự (D17 PLAN.md). */
const NOTE_MAX_LENGTH = 500;

/** Hôm nay dạng `'YYYY-MM-DD'` theo giờ địa phương (mặc định và `max` của `IonDatetime`). */
function todayIsoDate(): string {
  const now = new Date();
  const pad = (value: number): string => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Đọc lại `'YYYY-MM-DD'` từ giá trị (chuỗi hoặc mảng chuỗi) mà `IonDatetime` trả về. */
function toIsoDate(value: string | string[] | null | undefined, fallback: string): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw ? raw.slice(0, 10) : fallback;
}

/**
 * Sheet thêm lần đi (mục 6.6 PLAN.md): chọn ngày bằng bánh xe (tối đa hôm
 * nay, mặc định hôm nay) và ghi chú (≤500 ký tự). Nút "Lưu" bị khoá khi
 * offline hoặc đang lưu (D13).
 */
export function AddVisitSheet({
  placeId,
  currentStatus,
  isOpen,
  onDismiss,
}: AddVisitSheetProps): React.JSX.Element {
  const today = todayIsoDate();
  const [visitedOn, setVisitedOn] = useState(today);
  const [note, setNote] = useState('');
  const isOnline = useOnlineStatus();
  const addVisit = useAddVisit(placeId);
  const [presentAlert] = useIonAlert();

  function resetAndDismiss(): void {
    setVisitedOn(today);
    setNote('');
    onDismiss();
  }

  async function handleSave(): Promise<void> {
    try {
      await addVisit.mutateAsync({
        input: { placeId, visitedOn, note: note.trim() === '' ? null : note.trim() },
        currentStatus,
      });
      resetAndDismiss();
    } catch (error) {
      void presentAlert({ header: 'Lỗi', message: toUserMessage(error), buttons: ['Đóng'] });
    }
  }

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={resetAndDismiss}
      breakpoints={[0, 0.75]}
      initialBreakpoint={0.75}
    >
      <IonContent className="wtg-page">
        <IonDatetime
          presentation="date"
          preferWheel
          locale="vi-VN"
          max={today}
          value={visitedOn}
          onIonChange={(event) => setVisitedOn(toIsoDate(event.detail.value, today))}
        />
        <IonTextarea
          label="Ghi chú"
          labelPlacement="stacked"
          autoGrow
          maxlength={NOTE_MAX_LENGTH}
          counter
          value={note}
          onIonInput={(event: TextareaCustomEvent) => setNote(event.detail.value ?? '')}
        />
      </IonContent>
      <IonFooter>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton className="wtg-tap-target" onClick={resetAndDismiss}>
              Huỷ
            </IonButton>
          </IonButtons>
          <IonButtons slot="end">
            <IonButton
              className="wtg-tap-target"
              strong
              disabled={!isOnline || addVisit.isPending}
              onClick={() => void handleSave()}
            >
              Lưu
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonFooter>
    </IonModal>
  );
}
