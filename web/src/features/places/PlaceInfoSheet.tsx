import { IonContent, IonIcon, IonModal } from '@ionic/react';
import { closeOutline, navigateOutline, starOutline } from 'ionicons/icons';
import { useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '../categories/categoryQueries';
import { resolvePlaceCategories } from '../categories/categoryRules';
import { useTags } from '../tags/tagQueries';
import { buildGoogleMapsLink } from './buildGoogleMapsLink';
import { openMapsLink } from './openMapsLink';
import { PlaceInfoHeader } from './PlaceInfoHeader';
import { PlaceStoryBlock } from './PlaceStoryBlock';
import type { PlaceWithRelations } from './types';
import { usePlaceDistance } from './usePlaceDistance';
import './placeInfoSheet.css';

export interface PlaceInfoSheetProps {
  /** Địa điểm đang xem; `null` = bảng đóng. Nơi gọi chỉ đặt về `null` trong `onDidDismiss`. */
  place: PlaceWithRelations | null;
  /** Gọi khi bảng đã đóng hẳn (vuốt xuống, bấm nền, bấm "Đóng" hoặc "Xem đầy đủ"). */
  onDidDismiss: () => void;
  /** Hệ màu của trang đang mở bảng (lớp `.wtg-theme-*` gắn lên modal). */
  theme: 'home' | 'swipe';
}

/**
 * Bảng trượt lên dùng chung cho trang chủ và trang vuốt thẻ (M5, mục 6.4 PLAN-UI-1.md): thông
 * tin nhanh của một địa điểm, nút "Chỉ đường" (mở Google Maps tại quán — U13) và "Xem đầy đủ"
 * (trang chi tiết). Mốc cuối của sheet là 1 (P17); nội dung cuộn được trong `IonContent`.
 */
export function PlaceInfoSheet({
  place,
  onDidDismiss,
  theme,
}: PlaceInfoSheetProps): React.JSX.Element {
  const modalRef = useRef<HTMLIonModalElement>(null);
  const navigate = useNavigate();
  const { data: categories = [] } = useCategories();
  const { data: tags = [] } = useTags();
  const isOpen = place !== null;
  const distanceText = usePlaceDistance(place, isOpen);

  const placeCategories = useMemo(
    () => (place ? resolvePlaceCategories(place, categories) : []),
    [place, categories],
  );
  const tagNames = useMemo(
    () => (place ? tags.filter((tag) => place.tagIds.includes(tag.id)).map((tag) => tag.name) : []),
    [place, tags],
  );

  async function handleViewFull(placeId: string): Promise<void> {
    await modalRef.current?.dismiss();
    navigate(`/places/${placeId}`);
  }

  const mapsLink = place ? buildGoogleMapsLink(place) : null;

  return (
    <IonModal
      ref={modalRef}
      className={`wtg-theme-${theme} wtg-info-sheet`}
      isOpen={isOpen}
      onDidDismiss={onDidDismiss}
      breakpoints={[0, 0.6, 1]}
      initialBreakpoint={0.6}
      handle
    >
      {place && (
        <IonContent>
          <div className="wtg-info-sheet__body">
            <div className="wtg-info-sheet__top">
              <p className="wtg-info-sheet__label">
                <IonIcon icon={starOutline} aria-hidden="true" />
                Thông tin nhanh
              </p>
              <button
                type="button"
                className="wtg-info-close"
                aria-label="Đóng"
                onClick={() => void modalRef.current?.dismiss()}
              >
                <span>
                  <IonIcon icon={closeOutline} aria-hidden="true" />
                </span>
              </button>
            </div>

            <PlaceInfoHeader
              place={place}
              categories={placeCategories}
              tagNames={tagNames}
              distanceText={distanceText}
            />

            <div className="wtg-info-actions">
              {mapsLink && (
                <button
                  type="button"
                  className="wtg-info-button wtg-info-button--primary"
                  onClick={() => openMapsLink(mapsLink)}
                >
                  <IonIcon icon={navigateOutline} aria-hidden="true" />
                  Chỉ đường
                </button>
              )}
              <button
                type="button"
                className="wtg-info-button"
                onClick={() => void handleViewFull(place.id)}
              >
                Xem đầy đủ
              </button>
            </div>

            <PlaceStoryBlock story={place.story} />
          </div>
        </IonContent>
      )}
    </IonModal>
  );
}
