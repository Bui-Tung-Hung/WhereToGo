import { IonButton, IonIcon } from '@ionic/react';

export interface EmptyStateAction {
  /** Nhãn nút hành động. */
  label: string;
  /** Gọi khi chạm nút hành động. */
  onClick: () => void;
}

export interface EmptyStateProps {
  /** Icon ionicons hiển thị phía trên (ví dụ nhập từ `ionicons/icons`). */
  icon: string;
  /** Tiêu đề ngắn. */
  title: string;
  /** Câu giải thích/hướng dẫn thêm. */
  message: string;
  /** Nút hành động tuỳ chọn (ví dụ "Thêm địa điểm đầu tiên", "Thử lại"). */
  action?: EmptyStateAction;
}

/**
 * Trạng thái rỗng dùng chung: icon + tiêu đề + câu giải thích + nút hành
 * động tuỳ chọn (mục 6.5 PLAN.md, dùng cho danh sách rỗng, lỗi quyền vị
 * trí, v.v.).
 */
export function EmptyState({ icon, title, message, action }: EmptyStateProps): React.JSX.Element {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px' }}>
      <IonIcon icon={icon} color="medium" aria-hidden="true" style={{ fontSize: '48px' }} />
      <h2 className="wtg-heading" style={{ marginTop: 16 }}>
        {title}
      </h2>
      <p className="wtg-caption" style={{ color: 'var(--ion-color-medium)', marginTop: 8 }}>
        {message}
      </p>
      {action && (
        <IonButton className="wtg-tap-target" style={{ marginTop: 16 }} onClick={action.onClick}>
          {action.label}
        </IonButton>
      )}
    </div>
  );
}
