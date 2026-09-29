import { IonIcon } from '@ionic/react';
import { cloudOfflineOutline } from 'ionicons/icons';

/**
 * Thanh mảnh báo đang offline — chỉ xem được dữ liệu đã lưu trong bộ nhớ
 * đệm (mục 6.5, 6.7, D13 PLAN.md). Việc hiển thị hay không do nơi gọi
 * quyết định (thường dựa vào `useOnlineStatus`).
 */
export function OfflineBanner(): React.JSX.Element {
  return (
    <div
      role="status"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 16px',
        background: 'var(--ion-color-light)',
        color: 'var(--ion-color-medium)',
        borderBottom: '1px solid var(--ion-border-color)',
      }}
    >
      <IonIcon icon={cloudOfflineOutline} aria-hidden="true" />
      <span className="wtg-caption">Đang offline — chỉ xem được</span>
    </div>
  );
}
