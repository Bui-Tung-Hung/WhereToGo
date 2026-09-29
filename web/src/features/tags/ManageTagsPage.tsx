import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonAlert,
} from '@ionic/react';
import { useMemo } from 'react';
import { toUserMessage } from '../../lib/errors';
import { normalizeVi } from '../../shared/text/viNormalize';
import { usePlaces } from '../places/placeQueries';
import { useDeleteTag, useRenameTag, useTags } from './tagQueries';

/**
 * Quản lý nhãn (mục 6.6 PLAN.md): danh sách nhãn kèm số địa điểm đang dùng
 * mỗi nhãn; vuốt trái để "Đổi tên" hoặc "Xoá" (có xác nhận).
 */
export function ManageTagsPage(): React.JSX.Element {
  const { data: tags = [] } = useTags();
  const { data: places = [] } = usePlaces();
  const renameTag = useRenameTag();
  const deleteTag = useDeleteTag();
  const [presentAlert] = useIonAlert();

  const placeCountByTagId = useMemo(() => {
    const counts = new Map<string, number>();
    for (const place of places) {
      for (const tagId of place.tagIds) {
        counts.set(tagId, (counts.get(tagId) ?? 0) + 1);
      }
    }
    return counts;
  }, [places]);

  function showError(error: unknown): void {
    void presentAlert({ header: 'Lỗi', message: toUserMessage(error), buttons: ['Đóng'] });
  }

  function handleRename(tagId: string, currentName: string): void {
    void presentAlert({
      header: 'Đổi tên nhãn',
      inputs: [{ name: 'name', type: 'text', value: currentName, attributes: { maxlength: 50 } }],
      buttons: [
        { text: 'Huỷ', role: 'cancel' },
        {
          text: 'Lưu',
          handler: (data: { name?: string }) => {
            const trimmed = (data.name ?? '').trim();
            if (!trimmed) {
              return;
            }
            // Giống TagPicker: không cho trùng tên nhãn khác (so bằng normalizeVi).
            const normalized = normalizeVi(trimmed);
            const isDuplicate = tags.some(
              (tag) => tag.id !== tagId && normalizeVi(tag.name) === normalized,
            );
            if (isDuplicate) {
              void presentAlert({
                header: 'Lỗi',
                message: 'Nhãn này đã tồn tại.',
                buttons: ['Đóng'],
              });
              return;
            }
            renameTag.mutate({ id: tagId, name: trimmed }, { onError: showError });
          },
        },
      ],
    });
  }

  function handleDelete(tagId: string): void {
    const count = placeCountByTagId.get(tagId) ?? 0;
    void presentAlert({
      header: 'Xoá nhãn',
      message: `Nhãn sẽ bị gỡ khỏi ${count} địa điểm.`,
      buttons: [
        { text: 'Huỷ', role: 'cancel' },
        {
          text: 'Xoá',
          role: 'destructive',
          handler: () => deleteTag.mutate(tagId, { onError: showError }),
        },
      ],
    });
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/settings" text="Cài đặt" />
          </IonButtons>
          <IonTitle>Quản lý nhãn</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="wtg-page">
        {tags.length === 0 ? (
          <p className="wtg-caption">Chưa có nhãn nào.</p>
        ) : (
          <IonList>
            {tags.map((tag) => (
              <IonItemSliding key={tag.id}>
                <IonItem>
                  <IonLabel>
                    <p>{tag.name}</p>
                    <p className="wtg-caption">{placeCountByTagId.get(tag.id) ?? 0} địa điểm</p>
                  </IonLabel>
                </IonItem>
                <IonItemOptions side="end">
                  <IonItemOption onClick={() => handleRename(tag.id, tag.name)}>
                    Đổi tên
                  </IonItemOption>
                  <IonItemOption color="danger" onClick={() => handleDelete(tag.id)}>
                    Xoá
                  </IonItemOption>
                </IonItemOptions>
              </IonItemSliding>
            ))}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
}
