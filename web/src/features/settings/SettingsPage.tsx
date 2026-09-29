import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonAlert,
  useIonToast,
} from '@ionic/react';
import { chevronForwardOutline, logOutOutline } from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import { toUserMessage } from '../../lib/errors';
import { DriveReauthBanner } from '../auth/AuthProvider';
import { signInWithGoogle, signOut } from '../auth/authService';
import { useAuth } from '../auth/useAuth';
import { clearThumbnails } from '../photos/thumbnailCache';

const TOAST_DURATION_MS = 2000;

/**
 * Trang Cài đặt (mục 6.6 PLAN.md): tài khoản, quản lý dữ liệu (nhãn, ảnh
 * lưu tạm), thông tin ứng dụng, và đăng xuất.
 */
export function SettingsPage(): React.JSX.Element {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();

  async function handleClearThumbnails(): Promise<void> {
    await clearThumbnails();
    void presentToast({ message: 'Đã xoá ảnh đã lưu tạm', duration: TOAST_DURATION_MS });
  }

  function handleSignOut(): void {
    void presentAlert({
      header: 'Đăng xuất',
      message: 'Bạn có chắc muốn đăng xuất?',
      buttons: [
        { text: 'Huỷ', role: 'cancel' },
        {
          text: 'Đăng xuất',
          role: 'destructive',
          handler: () => {
            void (async () => {
              try {
                await signOut();
                navigate('/login', { replace: true });
              } catch (error) {
                void presentAlert({ header: 'Lỗi', message: toUserMessage(error), buttons: ['Đóng'] });
              }
            })();
          },
        },
      ],
    });
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Cài đặt</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Cài đặt</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div className="wtg-page">
          <DriveReauthBanner />

          <div className="wtg-group">
            <p className="wtg-group-title">Tài khoản</p>
            <IonList inset>
              <IonItem lines="none">
                <IonLabel>{user?.email ?? '(không có email)'}</IonLabel>
              </IonItem>
              <IonItem
                lines="none"
                button
                className="wtg-tap-target"
                onClick={() => void signInWithGoogle()}
              >
                <IonLabel>Kết nối lại Google Drive</IonLabel>
              </IonItem>
            </IonList>
          </div>

          <div className="wtg-group">
            <p className="wtg-group-title">Dữ liệu</p>
            <IonList inset>
              <IonItem lines="none" button className="wtg-tap-target" onClick={() => navigate('/settings/tags')}>
                <IonLabel>Quản lý nhãn</IonLabel>
                <IonIcon icon={chevronForwardOutline} slot="end" aria-hidden="true" />
              </IonItem>
              <IonItem
                lines="none"
                button
                className="wtg-tap-target"
                onClick={() => void handleClearThumbnails()}
              >
                <IonLabel>Xoá ảnh đã lưu tạm</IonLabel>
              </IonItem>
            </IonList>
          </div>

          <div className="wtg-group">
            <p className="wtg-group-title">Ứng dụng</p>
            <IonList inset>
              <IonItem lines="none">
                <IonLabel>Phiên bản</IonLabel>
                <IonNote slot="end">{__APP_VERSION__}</IonNote>
              </IonItem>
              <IonItem lines="none">
                <p className="wtg-caption">Dữ liệu offline: chỉ xem</p>
              </IonItem>
            </IonList>
          </div>

          <IonButton
            className="wtg-tap-target"
            expand="block"
            color="danger"
            fill="outline"
            style={{ marginTop: 24 }}
            onClick={handleSignOut}
          >
            <IonIcon icon={logOutOutline} slot="start" aria-hidden="true" />
            Đăng xuất
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
}
