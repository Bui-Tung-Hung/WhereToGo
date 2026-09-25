import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactHashRouter } from '@ionic/react-router';
import { Navigate, Route } from 'react-router-dom';
import { AuthProvider } from '../features/auth/AuthProvider';
import { LoginPage } from '../features/auth/LoginPage';
import { RequireAuth } from '../features/auth/RequireAuth';
import { SpikePage } from '../features/spike/SpikePage';

/**
 * Gốc app.
 *
 * Giai đoạn A (khung web + Spike): chỉ có `#/login` và `#/spike` (bọc
 * `RequireAuth`), `/` chuyển về `#/spike`. Bộ điều hướng đầy đủ (3 tab
 * Khám phá/Gần tôi/Cài đặt, mục 6.4 PLAN.md) được thêm ở Giai đoạn C
 * (bước 68), khi đó route `#/spike` cũng bị bỏ.
 */
export function App(): React.JSX.Element {
  return (
    <IonApp>
      <AuthProvider>
        <IonReactHashRouter>
          <IonRouterOutlet>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/spike"
              element={
                <RequireAuth>
                  <SpikePage />
                </RequireAuth>
              }
            />
            <Route path="/" element={<Navigate to="/spike" replace />} />
          </IonRouterOutlet>
        </IonReactHashRouter>
      </AuthProvider>
    </IonApp>
  );
}
