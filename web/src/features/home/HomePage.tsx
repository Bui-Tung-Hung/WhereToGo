import {
  IonContent,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  type RefresherCustomEvent,
} from '@ionic/react';
import { useQueryClient } from '@tanstack/react-query';
import {
  addCircleOutline,
  alertCircleOutline,
  cloudOfflineOutline,
  mapOutline,
} from 'ionicons/icons';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toUserMessage } from '../../lib/errors';
import { EmptyState } from '../../shared/components/EmptyState';
import { useOnlineStatus } from '../../shared/hooks/useOnlineStatus';
import { useCategories } from '../categories/categoryQueries';
import {
  countPlacesByCategory,
  recentPhotosForCategory,
  resolvePlaceCategories,
  sortCategoriesForHome,
} from '../categories/categoryRules';
import { PlaceInfoSheet } from '../places/PlaceInfoSheet';
import { usePlaces } from '../places/placeQueries';
import { QUERY_KEYS } from '../places/queryKeys';
import { CategoryCard } from './CategoryCard';
import { getSessionDailyPick } from './dailyPick';
import { DailyPickCard } from './DailyPickCard';
import { HomeCardLayout } from './HomeCardLayout';
import { HomeDock } from './HomeDock';
import { HomeHeader } from './HomeHeader';
import { CLUSTER_PHOTO_LIMIT } from './PhotoCluster';
import { NearbyCard } from './NearbyCard';
import './home.css';

/**
 * Trang chủ (U1–U5, mục 6.3 PLAN-UI-1.md): thẻ "Hôm nay thử quán này", một thẻ cho mỗi nhóm
 * (nhiều địa điểm nhất trước — M2), thẻ Gần tôi; thanh dưới có Tìm kiếm, ＋, Vuốt chọn quán.
 */
export function HomePage(): React.JSX.Element {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();
  const placesQuery = usePlaces();
  const { data: categories = [] } = useCategories();
  const places = placesQuery.data;

  // Giữ id (không giữ object) để bảng luôn thấy bản mới nhất của quán; chỉ về null khi đã đóng hẳn.
  const [sheetPlaceId, setSheetPlaceId] = useState<string | null>(null);
  const sheetPlace = places?.find((place) => place.id === sheetPlaceId) ?? null;

  const dailyPick = useMemo(() => (places ? getSessionDailyPick(places) : null), [places]);

  const homeCategories = useMemo(() => {
    const counts = countPlacesByCategory(places ?? []);
    return sortCategoriesForHome(categories, counts).map((category) => ({
      category,
      count: counts.get(category.id) ?? 0,
      photos: recentPhotosForCategory(places ?? [], category.id, CLUSTER_PHOTO_LIMIT),
    }));
  }, [places, categories]);

  async function handleRefresh(event: RefresherCustomEvent): Promise<void> {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.places }),
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories }),
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tags }),
    ]);
    event.detail.complete();
  }

  function renderContent(): React.JSX.Element {
    if (places === undefined) {
      if (!isOnline) {
        return (
          <EmptyState
            icon={cloudOfflineOutline}
            title="Đang offline"
            message="Chưa có dữ liệu đã lưu trên máy này."
          />
        );
      }
      if (placesQuery.isPending) {
        return (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
            <IonSpinner aria-label="Đang tải" />
          </div>
        );
      }
      return (
        <EmptyState
          icon={alertCircleOutline}
          title="Không tải được dữ liệu"
          message={toUserMessage(placesQuery.error)}
          action={{ label: 'Thử lại', onClick: () => void placesQuery.refetch() }}
        />
      );
    }

    if (places.length === 0) {
      return (
        <EmptyState
          icon={mapOutline}
          title="Chưa có địa điểm nào"
          message="Bắt đầu lưu lại những nơi bạn muốn nhớ."
          action={
            isOnline
              ? { label: 'Thêm địa điểm đầu tiên', onClick: () => navigate('/places/new') }
              : undefined
          }
        />
      );
    }

    return (
      <div className="wtg-home-list">
        {dailyPick && (
          <DailyPickCard
            place={dailyPick}
            categories={resolvePlaceCategories(dailyPick, categories)}
            onOpen={() => setSheetPlaceId(dailyPick.id)}
          />
        )}
        {homeCategories.length === 0 ? (
          <HomeCardLayout
            icon={addCircleOutline}
            label="Chưa có nhóm nào"
            prompt="Tạo nhóm để sắp xếp địa điểm"
            aside={null}
            ariaLabel="Chưa có nhóm nào. Tạo nhóm để sắp xếp địa điểm"
            onOpen={() => navigate('/settings/categories')}
            cascadeIndex={1}
          />
        ) : (
          homeCategories.map(({ category, count, photos }, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              count={count}
              photos={photos}
              cascadeIndex={index + 1}
            />
          ))
        )}
        <NearbyCard cascadeIndex={Math.max(homeCategories.length, 1) + 1} />
      </div>
    );
  }

  return (
    <IonPage className="wtg-theme-home">
      <HomeHeader />
      <IonContent>
        <IonRefresher
          slot="fixed"
          onIonRefresh={(event: RefresherCustomEvent) => void handleRefresh(event)}
        >
          <IonRefresherContent />
        </IonRefresher>
        {renderContent()}
      </IonContent>
      <HomeDock />
      <PlaceInfoSheet place={sheetPlace} onDidDismiss={() => setSheetPlaceId(null)} theme="home" />
    </IonPage>
  );
}
