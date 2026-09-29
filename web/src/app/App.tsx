import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactHashRouter } from '@ionic/react-router';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Navigate, Route } from 'react-router-dom';
import { AuthProvider } from '../features/auth/AuthProvider';
import { LoginPage } from '../features/auth/LoginPage';
import { RequireAuth } from '../features/auth/RequireAuth';
import { PlaceDetailPage } from '../features/places/PlaceDetailPage';
import { PlaceFormPage } from '../features/places/PlaceFormPage';
import { ManageTagsPage } from '../features/tags/ManageTagsPage';
import { Tabs } from './Tabs';
import { createPersister, createQueryClient, registerActiveQueryClient } from './queryClient';

/** Thời gian giữ cache đã persist hợp lệ trước khi bị bỏ qua (7 ngày, mục 6.7 PLAN.md). */
const PERSIST_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

// Tạo một lần duy nhất cho cả vòng đời app (App chỉ được `createRoot().render()` một lần ở main.tsx).
const queryClient = createQueryClient();
registerActiveQueryClient(queryClient);
const persister = createPersister();

/**
 * Gốc app (mục 6.4, 6.7 PLAN.md).
 *
 * `PersistQueryClientProvider` bọc toàn bộ cây, với `buster` là phiên bản
 * app (`__APP_VERSION__`, khai báo ở `vite.config.ts`) — đổi phiên bản sẽ bỏ
 * qua cache cũ đã persist thay vì cố phục hồi dữ liệu có thể không còn khớp
 * hình dạng mới. Route đầy đủ theo mục 6.4: `#/login`, `#/tabs/*` (3 tab con,
 * xem `Tabs.tsx`), `#/places/new`, `#/places/:id`, `#/places/:id/edit`,
 * `#/settings/tags`; `/` chuyển về `#/tabs/explore`; hash không khớp route
 * nào chuyển về `/` (không bao giờ ra màn hình trắng). Route `#/spike` của
 * Giai đoạn B đã bị xoá (bước 69).
 */
export function App(): React.JSX.Element {
  return (
    <IonApp>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister, maxAge: PERSIST_MAX_AGE_MS, buster: __APP_VERSION__ }}
      >
        <AuthProvider>
          <IonReactHashRouter>
            <IonRouterOutlet>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/tabs/*"
                element={
                  <RequireAuth>
                    <Tabs />
                  </RequireAuth>
                }
              />
              <Route
                path="/places/new"
                element={
                  <RequireAuth>
                    <PlaceFormPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/places/:id"
                element={
                  <RequireAuth>
                    <PlaceDetailPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/places/:id/edit"
                element={
                  <RequireAuth>
                    <PlaceFormPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/settings/tags"
                element={
                  <RequireAuth>
                    <ManageTagsPage />
                  </RequireAuth>
                }
              />
              <Route path="/" element={<Navigate to="/tabs/explore" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </IonRouterOutlet>
          </IonReactHashRouter>
        </AuthProvider>
      </PersistQueryClientProvider>
    </IonApp>
  );
}
