import { IonFooter, IonIcon } from '@ionic/react';
import { addOutline, albumsOutline, searchOutline } from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import { useOnlineStatus } from '../../shared/hooks/useOnlineStatus';

/**
 * Thanh dưới của trang chủ (U5): Tìm kiếm — nút ＋ thêm địa điểm (ẩn khi offline, giữ chỗ trống
 * để hai nút bên không xê dịch) — Vuốt chọn quán.
 */
export function HomeDock(): React.JSX.Element {
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  return (
    <IonFooter>
      <div className="wtg-home-dock">
        <button
          type="button"
          className="wtg-dock-button"
          aria-label="Tìm kiếm"
          onClick={() => navigate('/search')}
        >
          <IonIcon icon={searchOutline} aria-hidden="true" />
        </button>
        {isOnline ? (
          <button
            type="button"
            className="wtg-home-fab wtg-fab-glow"
            aria-label="Thêm địa điểm"
            onClick={() => navigate('/places/new')}
          >
            <IonIcon icon={addOutline} aria-hidden="true" />
          </button>
        ) : (
          <div className="wtg-home-fab-spacer" />
        )}
        <button
          type="button"
          className="wtg-dock-button"
          aria-label="Vuốt chọn quán"
          onClick={() => navigate('/swipe')}
        >
          <IonIcon icon={albumsOutline} aria-hidden="true" />
        </button>
      </div>
    </IonFooter>
  );
}
