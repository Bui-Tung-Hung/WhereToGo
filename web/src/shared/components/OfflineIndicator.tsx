import { IonIcon } from '@ionic/react';
import { cloudOfflineOutline } from 'ionicons/icons';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

/** Biểu tượng nhỏ báo đang offline (U34); khi online không hiện gì. */
export function OfflineIndicator(): React.JSX.Element | null {
  const isOnline = useOnlineStatus();
  if (isOnline) {
    return null;
  }
  return (
    <IonIcon
      icon={cloudOfflineOutline}
      role="img"
      aria-label="Đang offline"
      style={{ fontSize: 20, color: 'var(--wtg-text-muted)' }}
    />
  );
}
