import {
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTitle,
  IonToolbar,
  type RefresherCustomEvent,
  type SearchbarCustomEvent,
  type SegmentCustomEvent,
  type SelectCustomEvent,
} from '@ionic/react';
import { addOutline, locationOutline, mapOutline, searchOutline } from 'ionicons/icons';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toUserMessage } from '../../lib/errors';
import { EmptyState } from '../../shared/components/EmptyState';
import { OfflineBanner } from '../../shared/components/OfflineBanner';
import { haversineMeters } from '../../shared/geo/distance';
import { useOnlineStatus } from '../../shared/hooks/useOnlineStatus';
import { useCurrentPosition } from '../location/useCurrentPosition';
import { TagFilterBar } from '../tags/TagFilterBar';
import { useTags } from '../tags/tagQueries';
import { PlaceCard } from './PlaceCard';
import { filterPlaces, sortPlaces, type StatusFilter } from './placeFilters';
import { usePlaces } from './placeQueries';

export interface PlaceListPageProps {
  mode: 'explore' | 'nearby';
}

const STATUS_SEGMENTS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'interested', label: 'Hứng thú' },
  { value: 'not_visited', label: 'Chưa đi' },
  { value: 'visited', label: 'Đã đi' },
];

const SEARCH_DEBOUNCE_MS = 200;

/**
 * Danh sách địa điểm, dùng chung cho 2 tab "Khám phá" (`mode="explore"`,
 * sắp theo mới cập nhật/đánh giá) và "Gần tôi" (`mode="nearby"`, sắp theo
 * khoảng cách tới vị trí hiện tại) — mục 6.6 PLAN.md.
 */
export function PlaceListPage({ mode }: PlaceListPageProps): React.JSX.Element {
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const placesQuery = usePlaces();
  const tagsQuery = useTags();
  const places = useMemo(() => placesQuery.data ?? [], [placesQuery.data]);

  const [query, setQuery] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [status, setStatus] = useState<StatusFilter>('all');
  const [sortMode, setSortMode] = useState<'recent' | 'rating'>('recent');

  const {
    position,
    status: locationStatus,
    error: locationError,
    refresh: refreshLocation,
  } = useCurrentPosition({
    enabled: mode === 'nearby',
  });

  const tagNameById = useMemo(
    () => new Map((tagsQuery.data ?? []).map((tag) => [tag.id, tag.name])),
    [tagsQuery.data],
  );

  const filtered = useMemo(
    () => filterPlaces(places, { query, tagIds: selectedTagIds, status }, tagNameById),
    [places, query, selectedTagIds, status, tagNameById],
  );

  const { sorted, withoutCoordsCount } = useMemo(() => {
    if (mode === 'nearby') {
      return position
        ? sortPlaces(filtered, 'distance', position)
        : { sorted: [], withoutCoordsCount: 0 };
    }
    return sortPlaces(filtered, sortMode);
  }, [mode, filtered, position, sortMode]);

  const title = mode === 'explore' ? 'Khám phá' : 'Gần tôi';

  async function handleRefresh(event: RefresherCustomEvent): Promise<void> {
    await Promise.all([placesQuery.refetch(), tagsQuery.refetch()]);
    if (mode === 'nearby') {
      refreshLocation();
    }
    event.detail.complete();
  }

  function renderList(): React.JSX.Element {
    if (mode === 'nearby' && locationStatus === 'loading') {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <IonSpinner aria-label="Đang xác định vị trí" />
        </div>
      );
    }

    if (mode === 'nearby' && locationStatus === 'error') {
      // Chỉ hướng dẫn cấp quyền khi lỗi thật sự là bị từ chối quyền.
      const isPermissionDenied = locationError?.code === 'denied';
      return (
        <EmptyState
          icon={locationOutline}
          title={isPermissionDenied ? 'Chưa có quyền vị trí' : 'Không lấy được vị trí'}
          message={
            isPermissionDenied
              ? 'Vào Cài đặt → Quyền riêng tư & Bảo mật → Dịch vụ định vị → Trang web Safari → Khi dùng để cấp quyền vị trí.'
              : `${toUserMessage(locationError)} Hãy thử lại ở nơi thoáng hơn.`
          }
          action={{ label: 'Thử lại', onClick: refreshLocation }}
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

    if (sorted.length === 0) {
      return (
        <EmptyState
          icon={searchOutline}
          title="Không tìm thấy địa điểm"
          message="Thử đổi từ khoá tìm kiếm hoặc bộ lọc."
        />
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {mode === 'nearby' && withoutCoordsCount > 0 && (
          <p className="wtg-caption" style={{ color: 'var(--ion-color-medium)' }}>
            {withoutCoordsCount} địa điểm chưa có vị trí
          </p>
        )}
        {sorted.map((place) => (
          <PlaceCard
            key={place.id}
            place={place}
            tagNameById={tagNameById}
            distanceMeters={
              mode === 'nearby' && position && place.latitude !== null && place.longitude !== null
                ? haversineMeters(position, {
                    latitude: place.latitude,
                    longitude: place.longitude,
                  })
                : undefined
            }
          />
        ))}
      </div>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{title}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">{title}</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonRefresher
          slot="fixed"
          onIonRefresh={(event: RefresherCustomEvent) => void handleRefresh(event)}
        >
          <IonRefresherContent />
        </IonRefresher>

        {!isOnline && <OfflineBanner />}

        <div className="wtg-page" style={{ paddingBottom: 0 }}>
          <IonSearchbar
            placeholder="Tìm tên, địa chỉ, ghi chú…"
            debounce={SEARCH_DEBOUNCE_MS}
            value={query}
            onIonInput={(event: SearchbarCustomEvent) => setQuery(event.detail.value ?? '')}
          />
          <TagFilterBar selected={selectedTagIds} onChange={setSelectedTagIds} />
          <IonSegment
            value={status}
            onIonChange={(event: SegmentCustomEvent) =>
              setStatus(event.detail.value as StatusFilter)
            }
          >
            {STATUS_SEGMENTS.map((segment) => (
              <IonSegmentButton key={segment.value} value={segment.value}>
                <IonLabel>{segment.label}</IonLabel>
              </IonSegmentButton>
            ))}
          </IonSegment>

          {mode === 'explore' && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '8px 0' }}>
              <IonSelect
                interface="action-sheet"
                aria-label="Sắp xếp"
                value={sortMode}
                onIonChange={(event: SelectCustomEvent) =>
                  setSortMode(event.detail.value as 'recent' | 'rating')
                }
              >
                <IonSelectOption value="recent">Mới cập nhật</IonSelectOption>
                <IonSelectOption value="rating">Đánh giá cao</IonSelectOption>
              </IonSelect>
            </div>
          )}

          <div style={{ marginTop: 16 }}>{renderList()}</div>
        </div>

        {isOnline && (
          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton aria-label="Thêm địa điểm" onClick={() => navigate('/places/new')}>
              <IonIcon icon={addOutline} />
            </IonFabButton>
          </IonFab>
        )}
      </IonContent>
    </IonPage>
  );
}
