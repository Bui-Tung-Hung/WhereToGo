import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
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
import { addOutline } from 'ionicons/icons';
import { useMemo, useState } from 'react';
import { toUserMessage } from '../../lib/errors';
import { useOnlineStatus } from '../../shared/hooks/useOnlineStatus';
import { usePlaces } from '../places/placeQueries';
import { resolveCategoryIcon } from './categoryIcons';
import { useCategories, useDeleteCategory } from './categoryQueries';
import type { Category } from './categoryRepository';
import {
  countPlacesByCategory,
  findPlacesOnlyInCategory,
  sortCategoriesByCreation,
} from './categoryRules';
import { CategoryEditorSheet } from './CategoryEditorSheet';

/** Sheet đang mở: tạo mới (`category` null) hoặc sửa một nhóm. */
interface EditorState {
  category: Category | null;
}

/**
 * Quản lý nhóm `#/settings/categories` (mục 6.8 PLAN-UI-1.md): danh sách nhóm kèm số địa điểm
 * và câu gợi ý; bấm để sửa, nút "Thêm" để tạo, vuốt trái để xoá (chặn khi còn địa điểm chỉ
 * thuộc riêng nhóm đó — P18). Thao tác ghi bị ẩn/khoá khi offline (D13).
 */
export function ManageCategoriesPage(): React.JSX.Element {
  const { data: categories = [] } = useCategories();
  const { data: places = [] } = usePlaces();
  const deleteCategory = useDeleteCategory();
  const isOnline = useOnlineStatus();
  const [presentAlert] = useIonAlert();
  const [editor, setEditor] = useState<EditorState | null>(null);

  const sorted = useMemo(() => sortCategoriesByCreation(categories), [categories]);
  const placeCountByCategoryId = useMemo(() => countPlacesByCategory(places), [places]);

  function showError(error: unknown): void {
    void presentAlert({ header: 'Lỗi', message: toUserMessage(error), buttons: ['Đóng'] });
  }

  function handleDelete(category: Category): void {
    const onlyHere = findPlacesOnlyInCategory(places, category.id);
    if (onlyHere.length > 0) {
      void presentAlert({
        header: 'Không xoá được nhóm',
        message: `${onlyHere.length} địa điểm chỉ thuộc nhóm này. Hãy chuyển chúng sang nhóm khác trước.`,
        buttons: ['Đóng'],
      });
      return;
    }
    const count = placeCountByCategoryId.get(category.id) ?? 0;
    void presentAlert({
      header: 'Xoá nhóm',
      message: `Nhóm sẽ bị gỡ khỏi ${count} địa điểm.`,
      buttons: [
        { text: 'Huỷ', role: 'cancel' },
        {
          text: 'Xoá',
          role: 'destructive',
          handler: () => deleteCategory.mutate(category.id, { onError: showError }),
        },
      ],
    });
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/settings" text="Cài đặt" />
          </IonButtons>
          <IonTitle>Quản lý nhóm</IonTitle>
          {isOnline && (
            <IonButtons slot="end">
              <IonButton
                className="wtg-tap-target"
                aria-label="Thêm nhóm"
                onClick={() => setEditor({ category: null })}
              >
                <IonIcon icon={addOutline} slot="icon-only" aria-hidden="true" />
              </IonButton>
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>
      <IonContent className="wtg-page">
        {sorted.length === 0 ? (
          <p className="wtg-caption">Chưa có nhóm nào.</p>
        ) : (
          <IonList>
            {sorted.map((category) => (
              <IonItemSliding key={category.id}>
                <IonItem
                  button={isOnline}
                  className="wtg-tap-target"
                  onClick={isOnline ? () => setEditor({ category }) : undefined}
                >
                  <IonIcon icon={resolveCategoryIcon(category.icon)} slot="start" aria-hidden="true" />
                  <IonLabel>
                    <p>{category.name}</p>
                    <p className="wtg-caption">
                      {placeCountByCategoryId.get(category.id) ?? 0} địa điểm ·{' '}
                      {category.prompt ?? 'Câu gợi ý mặc định'}
                    </p>
                  </IonLabel>
                </IonItem>
                {isOnline && (
                  <IonItemOptions side="end">
                    <IonItemOption color="danger" onClick={() => handleDelete(category)}>
                      Xoá
                    </IonItemOption>
                  </IonItemOptions>
                )}
              </IonItemSliding>
            ))}
          </IonList>
        )}
      </IonContent>
      <CategoryEditorSheet
        isOpen={editor !== null}
        category={editor?.category ?? null}
        categories={categories}
        onDidDismiss={() => setEditor(null)}
      />
    </IonPage>
  );
}
