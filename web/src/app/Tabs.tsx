import { IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/react';
import {
  compass,
  compassOutline,
  location,
  locationOutline,
  settings,
  settingsOutline,
} from 'ionicons/icons';
import { Navigate, Route, useLocation } from 'react-router-dom';
import { PlaceListPage } from '../features/places/PlaceListPage';
import { SettingsPage } from '../features/settings/SettingsPage';

/**
 * Bộ điều hướng 3 tab dưới cùng: Khám phá · Gần tôi · Cài đặt (D15, mục 6.4
 * PLAN.md). Icon tab đang chọn dùng kiểu filled, tab chưa chọn dùng kiểu
 * outline (mục 6.3 PLAN.md).
 */
export function Tabs(): React.JSX.Element {
  const location_ = useLocation();

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route path="explore" element={<PlaceListPage mode="explore" />} />
        <Route path="nearby" element={<PlaceListPage mode="nearby" />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="" element={<Navigate to="/tabs/explore" replace />} />
      </IonRouterOutlet>
      <IonTabBar slot="bottom">
        <IonTabButton tab="explore" href="/tabs/explore">
          <IonIcon
            icon={location_.pathname.startsWith('/tabs/explore') ? compass : compassOutline}
            aria-hidden="true"
          />
          <IonLabel>Khám phá</IonLabel>
        </IonTabButton>
        <IonTabButton tab="nearby" href="/tabs/nearby">
          <IonIcon
            icon={location_.pathname.startsWith('/tabs/nearby') ? location : locationOutline}
            aria-hidden="true"
          />
          <IonLabel>Gần tôi</IonLabel>
        </IonTabButton>
        <IonTabButton tab="settings" href="/tabs/settings">
          <IonIcon
            icon={location_.pathname.startsWith('/tabs/settings') ? settings : settingsOutline}
            aria-hidden="true"
          />
          <IonLabel>Cài đặt</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
}
