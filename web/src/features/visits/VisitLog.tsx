import {
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  useIonAlert,
} from '@ionic/react';
import { trashOutline } from 'ionicons/icons';
import { toUserMessage } from '../../lib/errors';
import { useOnlineStatus } from '../../shared/hooks/useOnlineStatus';
import { useDeleteVisit, useVisits } from './visitQueries';

export interface VisitLogProps {
  /** Id của địa điểm đang xem các lần đi. */
  placeId: string;
}

const VISIT_DATE_FORMATTER = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

/** `visited_on` là `'YYYY-MM-DD'`; ghép giờ trưa để `Date` không lệch ngày do múi giờ. */
function formatVisitDate(visitedOn: string): string {
  return VISIT_DATE_FORMATTER.format(new Date(`${visitedOn}T12:00:00`));
}

/**
 * Danh sách các lần đi của một địa điểm (mục 6.6 PLAN.md): mỗi dòng là
 * ngày (`dd/MM/yyyy`) + ghi chú; vuốt để xoá, có xác nhận. Rỗng → "Chưa có
 * lần đi nào".
 */
export function VisitLog({ placeId }: VisitLogProps): React.JSX.Element {
  const { data: visits = [] } = useVisits(placeId);
  const deleteVisit = useDeleteVisit(placeId);
  const [presentAlert] = useIonAlert();
  const isOnline = useOnlineStatus();

  function handleDelete(id: string): void {
    void presentAlert({
      header: 'Xoá lần đi',
      message: 'Bạn có chắc muốn xoá lần đi này?',
      buttons: [
        { text: 'Huỷ', role: 'cancel' },
        {
          text: 'Xoá',
          role: 'destructive',
          handler: () =>
            deleteVisit.mutate(id, {
              onError: (error) =>
                void presentAlert({
                  header: 'Lỗi',
                  message: toUserMessage(error),
                  buttons: ['Đóng'],
                }),
            }),
        },
      ],
    });
  }

  if (visits.length === 0) {
    return <p className="wtg-caption">Chưa có lần đi nào</p>;
  }

  return (
    <IonList>
      {visits.map((visit) => (
        <IonItemSliding key={visit.id} disabled={!isOnline}>
          <IonItem lines="none">
            <IonLabel>
              <p style={{ fontWeight: 600 }}>{formatVisitDate(visit.visitedOn)}</p>
              {visit.note && <p className="wtg-caption">{visit.note}</p>}
            </IonLabel>
          </IonItem>
          {/* D13: offline thì ẩn thao tác vuốt để xoá. */}
          {isOnline && (
            <IonItemOptions side="end">
              <IonItemOption
                color="danger"
                aria-label="Xoá lần đi"
                onClick={() => handleDelete(visit.id)}
              >
                <IonIcon icon={trashOutline} slot="icon-only" aria-hidden="true" />
              </IonItemOption>
            </IonItemOptions>
          )}
        </IonItemSliding>
      ))}
    </IonList>
  );
}
