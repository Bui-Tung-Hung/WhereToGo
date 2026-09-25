import { IonButton, IonContent, IonPage } from '@ionic/react';
import { useState } from 'react';
import { toUserMessage } from '../../lib/errors';
import { logger } from '../../lib/logger';
import { signInWithGoogle } from './authService';

/** Trang đăng nhập — điểm vào duy nhất khi chưa có session (mục 6.6 PLAN.md). */
export function LoginPage(): React.JSX.Element {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  async function handleSignIn(): Promise<void> {
    setErrorMessage(null);
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
      // Thành công thì trình duyệt điều hướng sang Google ngay, không cần
      // tắt isSigningIn ở đây.
    } catch (error) {
      logger.error('sign_in_failed', {});
      setErrorMessage(toUserMessage(error));
      setIsSigningIn(false);
    }
  }

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100%',
            gap: 16,
            textAlign: 'center',
          }}
        >
          <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="" width={96} height={96} />
          <h1 className="wtg-display">WhereToGo</h1>
          <p className="wtg-caption">Kho địa điểm của riêng bạn</p>

          <IonButton
            expand="block"
            color="primary"
            style={{ width: '100%' }}
            disabled={isSigningIn}
            onClick={() => void handleSignIn()}
          >
            Tiếp tục với Google
          </IonButton>

          {errorMessage && (
            <p className="wtg-caption" role="alert" style={{ color: 'var(--ion-color-danger)' }}>
              {errorMessage}
            </p>
          )}

          <p className="wtg-caption">
            App sẽ xin quyền lưu ảnh vào một thư mục riêng trên Google Drive của bạn.
          </p>
        </div>
      </IonContent>
    </IonPage>
  );
}
