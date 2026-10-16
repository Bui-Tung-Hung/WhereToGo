import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactHashRouter } from '@ionic/react-router';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import type { ReactNode } from 'react';
import { Navigate, Route } from 'react-router-dom';
import { AuthProvider } from '../features/auth/AuthProvider';
import { LoginPage } from '../features/auth/LoginPage';
import { RequireAuth } from '../features/auth/RequireAuth';
import { CategoryPlacesPage } from '../features/categories/CategoryPlacesPage';
import { ManageCategoriesPage } from '../features/categories/ManageCategoriesPage';
import { HomePage } from '../features/home/HomePage';
import { PlaceDetailPage } from '../features/places/PlaceDetailPage';
import { PlaceFormPage } from '../features/places/PlaceFormPage';
import { PlaceListPage } from '../features/places/PlaceListPage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { SwipePage } from '../features/swipe/SwipePage';
import { ManageTagsPage } from '../features/tags/ManageTagsPage';
import { createPersister, createQueryClient, registerActiveQueryClient } from './queryClient';

/** Thời gian giữ cache đã persist hợp lệ trước khi bị bỏ qua (7 ngày, mục 6.7 PLAN.md). */
const PERSIST_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

// Tạo một lần duy nhất cho cả vòng đời app (App chỉ được `createRoot().render()` một lần ở main.tsx).
const queryClient = createQueryClient();
registerActiveQueryClient(queryClient);
const persister = createPersister();

/** Bọc một trang cần đăng nhập. */
function authed(element: ReactNode): React.JSX.Element {
  return <RequireAuth>{element}</RequireAuth>;
}

/**
 * Gốc app (mục 6.4, 6.7 PLAN.md; mục 5 PLAN-UI-1.md).
 *
 * `PersistQueryClientProvider` bọc toàn bộ cây, với `buster` là phiên bản
 * app (`__APP_VERSION__`, khai báo ở `vite.config.ts`) — đổi phiên bản sẽ bỏ
 * qua cache cũ đã persist thay vì cố phục hồi dữ liệu có thể không còn khớp
 * hình dạng mới. Route: `#/login`, `#/home` (trang chủ), `#/swipe` (vuốt thẻ),
 * `#/search`, `#/favorites`, `#/nearby`, `#/categories/:id` (danh sách tạm —
 * P9), `#/settings`, `#/settings/tags`, `#/settings/categories`,
 * `#/places/new`, `#/places/:id`, `#/places/:id/edit`. Link cũ `#/tabs/*` và
 * `/` chuyển về `#/home`; hash không khớp route nào chuyển về `/` (không bao
 * giờ ra màn hình trắng).
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
              <Route path="/home" element={authed(<HomePage />)} />
              <Route path="/swipe" element={authed(<SwipePage />)} />
              <Route
                path="/search"
                element={authed(<PlaceListPage mode="explore" title="Tìm kiếm" />)}
              />
              <Route
                path="/favorites"
                element={authed(
                  <PlaceListPage
                    mode="explore"
                    title="Yêu thích"
                    favoritesOnly
                    emptyTitle="Chưa có địa điểm yêu thích"
                    emptyMessage="Bấm ngôi sao ở trang vuốt thẻ hoặc trang chi tiết."
                  />,
                )}
              />
              <Route
                path="/nearby"
                element={authed(<PlaceListPage mode="nearby" title="Gần tôi" />)}
              />
              <Route path="/categories/:id" element={authed(<CategoryPlacesPage />)} />
              <Route path="/settings" element={authed(<SettingsPage />)} />
              <Route path="/settings/tags" element={authed(<ManageTagsPage />)} />
              <Route path="/settings/categories" element={authed(<ManageCategoriesPage />)} />
              <Route path="/places/new" element={authed(<PlaceFormPage />)} />
              <Route path="/places/:id" element={authed(<PlaceDetailPage />)} />
              <Route path="/places/:id/edit" element={authed(<PlaceFormPage />)} />
              <Route path="/tabs/*" element={<Navigate to="/home" replace />} />
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </IonRouterOutlet>
          </IonReactHashRouter>
        </AuthProvider>
      </PersistQueryClientProvider>
    </IonApp>
  );
}
