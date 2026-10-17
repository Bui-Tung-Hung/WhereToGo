import { IonButton, IonButtons, IonHeader, IonIcon, IonTitle, IonToolbar } from '@ionic/react';
import { heartOutline } from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import { OfflineIndicator } from '../../shared/components/OfflineIndicator';
import { AvatarButton } from '../auth/AvatarButton';

/** Header trang chủ (U2): chữ "WhereToGo" căn trái; bên phải là báo offline, nút Yêu thích, avatar. */
export function HomeHeader(): React.JSX.Element {
  const navigate = useNavigate();
  return (
    <IonHeader className="ion-no-border">
      <IonToolbar>
        <IonTitle className="wtg-home-title">WhereToGo</IonTitle>
        <IonButtons slot="end" className="wtg-home-header-end">
          <OfflineIndicator />
          <IonButton
            className="wtg-home-icon-button"
            aria-label="Yêu thích"
            onClick={() => navigate('/favorites')}
          >
            <IonIcon slot="icon-only" icon={heartOutline} aria-hidden="true" />
          </IonButton>
          <AvatarButton />
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
}
