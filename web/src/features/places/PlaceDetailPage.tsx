import {
  IonBackButton,
  IonBadge,
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonToast,
} from '@ionic/react';
import {
  addOutline,
  alertCircleOutline,
  createOutline,
  navigateOutline,
  star,
  starOutline,
} from 'ionicons/icons';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toUserMessage } from '../../lib/errors';
import { EmptyState } from '../../shared/components/EmptyState';
import { StarRatingView } from '../../shared/components/StarRatingView';
import { StatusChip } from '../../shared/components/StatusChip';
import { OfflineBanner } from '../../shared/components/OfflineBanner';
import { formatVndRange } from '../../shared/money/vnd';
import { useOnlineStatus } from '../../shared/hooks/useOnlineStatus';
import { useCategories } from '../categories/categoryQueries';
import { resolvePlaceCategories } from '../categories/categoryRules';
import { OpeningHoursView } from '../opening-hours/OpeningHoursView';
import { PhotoGallery } from '../photos/PhotoGallery';
import { useTags } from '../tags/tagQueries';
import { AddVisitSheet } from '../visits/AddVisitSheet';
import { VisitLog } from '../visits/VisitLog';
import { buildGoogleMapsLink } from './buildGoogleMapsLink';
import { openMapsLink } from './openMapsLink';
import { usePlace, useSetFavorite } from './placeQueries';
import type { PlaceWithRelations } from './types';
import { usePlaceDistance } from './usePlaceDistance';

const SUCCESS_TOAST_MS = 1500;
const ERROR_TOAST_MS = 2500;

/**
 * Chi tiết một địa điểm (mục 6.6 PLAN.md, mục 6.7 PLAN-UI-1.md): ảnh → tên → trạng thái/sao →
 * nhóm → nhãn → thông tin (địa chỉ/giá/khoảng cách) → giờ mở cửa → câu chuyện → ghi chú → các
 * lần đi; header có nút Yêu thích; thanh dưới cố định gồm "Mở Google Maps" và "Sửa".
 */
export function PlaceDetailPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const placeQuery = usePlace(id ?? '');
  const { data: tags = [] } = useTags();
  const { data: categories = [] } = useCategories();
  const setFavorite = useSetFavorite();
  const [presentToast] = useIonToast();
  const [isAddVisitOpen, setIsAddVisitOpen] = useState(false);

  const tagNameById = useMemo(() => new Map(tags.map((tag) => [tag.id, tag.name])), [tags]);
  const place = placeQuery.data;
  // Khoảng cách chỉ là thông tin phụ: không bật hộp xin quyền vị trí ở trang này.
  const distanceText = usePlaceDistance(place ?? null, true);

  function handleToggleFavorite(current: PlaceWithRelations): void {
    const favorited = current.favoritedAt === null;
    setFavorite.mutate(
      { id: current.id, favorited },
      {
        onSuccess: () =>
          void presentToast({
            message: favorited ? 'Đã thêm vào Yêu thích' : 'Đã bỏ khỏi Yêu thích',
            duration: SUCCESS_TOAST_MS,
          }),
        onError: (error) =>
          void presentToast({
            message: toUserMessage(error),
            duration: ERROR_TOAST_MS,
            color: 'danger',
          }),
      },
    );
  }

  if (placeQuery.isLoading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/home" text="" />
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <p className="wtg-caption">Đang tải…</p>
        </IonContent>
      </IonPage>
    );
  }

  if (!place) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/home" text="" />
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <EmptyState
            icon={alertCircleOutline}
            title="Không tìm thấy địa điểm"
            message="Địa điểm này có thể đã bị xoá."
          />
        </IonContent>
      </IonPage>
    );
  }

  const mapsLink = buildGoogleMapsLink(place);
  const priceText = formatVndRange(place.priceMinVnd, place.priceMaxVnd);
  const isFavorite = place.favoritedAt !== null;
  const placeCategories = resolvePlaceCategories(place, categories);
  const tagNames = place.tagIds
    .map((tagId) => tagNameById.get(tagId))
    .filter((name): name is string => Boolean(name));

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" text="" />
          </IonButtons>
          <IonTitle>{place.name}</IonTitle>
          {isOnline && (
            <IonButtons slot="end">
              <IonButton
                className="wtg-tap-target"
                aria-label={isFavorite ? 'Bỏ khỏi Yêu thích' : 'Thêm vào Yêu thích'}
                onClick={() => handleToggleFavorite(place)}
              >
                <IonIcon
                  slot="icon-only"
                  icon={isFavorite ? star : starOutline}
                  style={{ fontSize: 24 }}
                />
              </IonButton>
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {!isOnline && <OfflineBanner />}
        <div className="wtg-page" style={{ paddingBottom: 96 }}>
          <PhotoGallery photos={place.photos} />

          <h1 className="wtg-display" style={{ marginTop: 16 }}>
            {place.name}
          </h1>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 8,
              flexWrap: 'wrap',
            }}
          >
            <StatusChip status={place.status} />
            <StarRatingView value={place.rating} />
          </div>

          {placeCategories.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {placeCategories.map((category) => (
                <IonBadge key={category.id} color="primary">
                  {category.name}
                </IonBadge>
              ))}
            </div>
          )}

          {tagNames.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {tagNames.map((name) => (
                <IonBadge key={name} color="light">
                  {name}
                </IonBadge>
              ))}
            </div>
          )}

          <div className="wtg-group" style={{ marginTop: 24 }}>
            <p className="wtg-group-title">Thông tin</p>
            {place.address && <p style={{ margin: '0 0 4px' }}>{place.address}</p>}
            {priceText && (
              <p className="wtg-caption" style={{ margin: '0 0 4px' }}>
                {priceText}
              </p>
            )}
            {distanceText && (
              <p className="wtg-caption" style={{ margin: 0 }}>
                Cách bạn {distanceText}
              </p>
            )}
            {!place.address && !priceText && !distanceText && (
              <p className="wtg-caption" style={{ color: 'var(--ion-color-medium)' }}>
                Chưa có thông tin.
              </p>
            )}
          </div>

          <div className="wtg-group">
            <OpeningHoursView hours={place.openingHours} />
          </div>

          <div className="wtg-group">
            <p className="wtg-group-title">Câu chuyện</p>
            <p className="wtg-caption" style={{ whiteSpace: 'pre-line' }}>
              {place.story || 'Chưa có câu chuyện.'}
            </p>
          </div>

          <div className="wtg-group">
            <p className="wtg-group-title">Ghi chú</p>
            <p className="wtg-caption">{place.notes || 'Chưa có ghi chú.'}</p>
          </div>

          <div className="wtg-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p className="wtg-group-title" style={{ margin: 0 }}>
                Các lần đi
              </p>
              {isOnline && (
                <IonButton
                  className="wtg-tap-target"
                  size="small"
                  fill="clear"
                  onClick={() => setIsAddVisitOpen(true)}
                >
                  <IonIcon icon={addOutline} slot="start" aria-hidden="true" />
                  Thêm lần đi
                </IonButton>
              )}
            </div>
            <VisitLog placeId={place.id} />
          </div>
        </div>
      </IonContent>

      <IonFooter>
        <IonToolbar>
          <div
            style={{
              display: 'flex',
              gap: 8,
              padding: '8px 16px',
              paddingBottom: 'calc(8px + env(safe-area-inset-bottom))',
            }}
          >
            {mapsLink && (
              <IonButton
                className="wtg-tap-target"
                expand="block"
                color="tertiary"
                style={{ flex: 1 }}
                onClick={() => openMapsLink(mapsLink)}
              >
                <IonIcon icon={navigateOutline} slot="start" aria-hidden="true" />
                Mở Google Maps
              </IonButton>
            )}
            {isOnline && (
              <IonButton
                className="wtg-tap-target"
                expand="block"
                style={{ flex: 1 }}
                onClick={() => navigate(`/places/${place.id}/edit`)}
              >
                <IonIcon icon={createOutline} slot="start" aria-hidden="true" />
                Sửa
              </IonButton>
            )}
          </div>
        </IonToolbar>
      </IonFooter>

      <AddVisitSheet
        placeId={place.id}
        currentStatus={place.status}
        isOpen={isAddVisitOpen}
        onDismiss={() => setIsAddVisitOpen(false)}
      />
    </IonPage>
  );
}
