import { IonButton, IonIcon } from '@ionic/react';
import { sparklesOutline } from 'ionicons/icons';
import { resolveCategoryIcon } from '../categories/categoryIcons';
import type { Category } from '../categories/categoryRepository';
import { AuthedImage } from '../photos/AuthedImage';
import { getCoverPhoto } from '../places/placeDisplay';
import type { PlaceWithRelations } from '../places/types';
import { cascadeDelay } from './HomeCardLayout';

export interface DailyPickCardProps {
  place: PlaceWithRelations;
  /** Các nhóm của địa điểm, đã sắp (`resolvePlaceCategories`) — dùng biểu tượng của nhóm đầu. */
  categories: readonly Category[];
  /** Mở bảng trượt lên của địa điểm (M4). */
  onOpen: () => void;
}

/**
 * Thẻ "Hôm nay thử quán này" ở đầu trang chủ (U33, M4). Phần tử tương tác duy nhất là nút "Xem"
 * (thẻ chỉ nhận bấm bằng chuột/chạm, không phải nút lồng nút).
 */
export function DailyPickCard({ place, categories, onOpen }: DailyPickCardProps): React.JSX.Element {
  const cover = getCoverPhoto(place);
  return (
    <div
      className="wtg-home-card wtg-daily-card wtg-cascade"
      style={{ animationDelay: cascadeDelay(0) }}
      onClick={onOpen}
    >
      <p className="wtg-daily-card__label">
        <span className="wtg-daily-card__badge" aria-hidden="true">
          <IonIcon icon={sparklesOutline} />
        </span>
        Hôm nay thử quán này
      </p>
      <p className="wtg-daily-card__name">{place.name}</p>
      <div className="wtg-daily-card__bottom">
        <div className="wtg-daily-card__place">
          {cover ? (
            <AuthedImage
              driveFileId={cover.driveFileId}
              size={400}
              alt=""
              className="wtg-daily-avatar"
            />
          ) : (
            <span className="wtg-daily-avatar" aria-hidden="true">
              <IonIcon icon={resolveCategoryIcon(categories[0]?.icon ?? null)} />
            </span>
          )}
          {place.address && <p className="wtg-daily-card__address">{place.address}</p>}
        </div>
        <IonButton
          className="wtg-daily-button"
          aria-label={`Xem ${place.name}`}
          onClick={(event) => {
            event.stopPropagation();
            onOpen();
          }}
        >
          Xem
        </IonButton>
      </div>
    </div>
  );
}
