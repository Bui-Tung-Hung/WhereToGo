import { IonModal } from '@ionic/react';
import { useRef } from 'react';
import type { Category } from './categoryRepository';
import { CategoryEditorForm } from './CategoryEditorForm';

export interface CategoryEditorSheetProps {
  isOpen: boolean;
  /** Nhóm đang sửa; `null` = tạo nhóm mới. */
  category: Category | null;
  /** Mọi nhóm hiện có, để kiểm trùng tên. */
  categories: readonly Category[];
  /** Gọi khi sheet đã đóng hẳn (kể cả vuốt xuống để đóng). */
  onDidDismiss: () => void;
}

/**
 * Sheet thêm/sửa nhóm (mục 6.8 PLAN-UI-1.md). Nội dung chỉ được mount khi sheet mở, với `key`
 * theo nhóm, nên mỗi lần mở là một form mới (không dùng effect để reset).
 */
export function CategoryEditorSheet({
  isOpen,
  category,
  categories,
  onDidDismiss,
}: CategoryEditorSheetProps): React.JSX.Element {
  const modalRef = useRef<HTMLIonModalElement>(null);

  return (
    <IonModal
      ref={modalRef}
      isOpen={isOpen}
      onDidDismiss={onDidDismiss}
      breakpoints={[0, 1]}
      initialBreakpoint={1}
    >
      {isOpen && (
        <CategoryEditorForm
          key={category?.id ?? 'new'}
          category={category}
          categories={categories}
          onDone={() => void modalRef.current?.dismiss()}
        />
      )}
    </IonModal>
  );
}
