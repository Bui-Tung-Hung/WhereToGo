import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { alertCircleOutline, cloudOfflineOutline } from 'ionicons/icons';
import { useMemo, useState } from 'react';
import { toUserMessage } from '../../lib/errors';
import { EmptyState } from '../../shared/components/EmptyState';
import { OfflineBanner } from '../../shared/components/OfflineBanner';
import { useOnlineStatus } from '../../shared/hooks/useOnlineStatus';
import { createRandomSeed } from '../../shared/random/shuffle';
import { AvatarButton } from '../auth/AvatarButton';
import { CategoryFilterBar } from '../categories/CategoryFilterBar';
import { PlaceInfoSheet } from '../places/PlaceInfoSheet';
import { filterPlaces } from '../places/placeFilters';
import { usePlaces } from '../places/placeQueries';
import { TagFilterBar } from '../tags/TagFilterBar';
import { SwipeDeckView } from './SwipeDeckView';
import './swipe.css';

/**
 * Trang vuốt thẻ (U14–U17, mục 6.5 PLAN-UI-1.md): lọc theo nhóm và nhãn, vuốt phải +1 / trái −1
 * điểm hứng thú, sao = Yêu thích. Không có thanh dưới; một lần xem kéo dài tới khi về trang chủ
 * (P35). Không loại quán "Đã đi" (U15).
 */
export function SwipePage(): React.JSX.Element {
  const isOnline = useOnlineStatus();
  const placesQuery = usePlaces();
  const places = placesQuery.data;

  const [seed, setSeed] = useState(() => createRandomSeed());
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [infoPlaceId, setInfoPlaceId] = useState<string | null>(null);

  const placesById = useMemo(
    () => new Map((places ?? []).map((place) => [place.id, place])),
    [places],
  );

  const initialPlaceIds = useMemo(
    () =>
      filterPlaces(
        places ?? [],
        { query: '', tagIds, status: 'all', categoryIds: categoryId ? [categoryId] : [] },
        new Map(),
      ).map((place) => place.id),
    [places, tagIds, categoryId],
  );

  // Đổi seed hoặc bộ lọc = bộ thẻ mới (khoá đổi → SwipeDeckView dựng lại từ đầu).
  const deckKey = `${seed}|${categoryId ?? 'all'}|${[...tagIds].sort().join(',')}`;
  const infoPlace = infoPlaceId ? (placesById.get(infoPlaceId) ?? null) : null;

  function renderDeck(): React.JSX.Element {
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
      if (placesQuery.isError) {
        return (
          <EmptyState
            icon={alertCircleOutline}
            title="Không tải được dữ liệu"
            message={toUserMessage(placesQuery.error)}
            action={{ label: 'Thử lại', onClick: () => void placesQuery.refetch() }}
          />
        );
      }
      return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <IonSpinner aria-label="Đang tải" />
        </div>
      );
    }

    return (
      <SwipeDeckView
        key={deckKey}
        initialPlaceIds={initialPlaceIds}
        seed={seed}
        placesById={placesById}
        hasAnyPlace={places.length > 0}
        isOnline={isOnline}
        onRestart={() => setSeed(createRandomSeed())}
        onOpenInfo={setInfoPlaceId}
      />
    );
  }

  return (
    <IonPage className="wtg-theme-swipe">
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton className="wtg-swipe-back" defaultHref="/home" text="" />
          </IonButtons>
          <IonTitle className="wtg-swipe-title">
            <span className="wtg-swipe-title__main">
              <span className="wtg-swipe-title__dot" aria-hidden="true" />
              Chọn quán
            </span>
            <span className="wtg-swipe-title__sub">Vuốt để khám phá</span>
          </IonTitle>
          <IonButtons slot="end">
            <AvatarButton />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent scrollY={false}>
        <div className="wtg-swipe-layout">
          <div className="wtg-swipe-filters">
            {!isOnline && <OfflineBanner />}
            <CategoryFilterBar selected={categoryId} onChange={setCategoryId} />
            <TagFilterBar selected={tagIds} onChange={setTagIds} />
          </div>
          {renderDeck()}
        </div>
      </IonContent>
      <PlaceInfoSheet
        place={infoPlace}
        onDidDismiss={() => setInfoPlaceId(null)}
        theme="swipe"
      />
    </IonPage>
  );
}
