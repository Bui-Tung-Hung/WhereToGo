import { IonIcon } from '@ionic/react';
import { locationOutline } from 'ionicons/icons';
import { formatVndRange } from '../../shared/money/vnd';
import { resolveCategoryIcon } from '../categories/categoryIcons';
import type { Category } from '../categories/categoryRepository';
import { isOpenAt, OPEN_STATUS_LABELS } from '../opening-hours/openingHours';
import { AuthedImage } from '../photos/AuthedImage';
import { getCoverPhoto, limitChips } from './placeDisplay';
import type { PlaceWithRelations } from './types';

/** Số chip tối đa (nhóm + nhãn) trong hàng tiêu đề; phần dư gộp thành "+N". */
const MAX_CHIPS = 3;

export interface PlaceInfoHeaderProps {
  place: PlaceWithRelations;
  /** Các nhóm của địa điểm, đã sắp (`resolvePlaceCategories`). */
  categories: readonly Category[];
  /** Tên các nhãn của địa điểm, theo thứ tự danh sách nhãn. */
  tagNames: readonly string[];
  /** Khoảng cách tới vị trí hiện tại (ví dụ "3,4 km"), `null` nếu chưa biết. */
  distanceText: string | null;
}

/**
 * Phần đầu bảng trượt lên (mục 6.4 PLAN-UI-1.md): ảnh bìa, chip nhóm/nhãn, tên, giá (kèm khoảng
 * cách nếu có), địa chỉ và huy hiệu giờ mở cửa.
 */
export function PlaceInfoHeader({
  place,
  categories,
  tagNames,
  distanceText,
}: PlaceInfoHeaderProps): React.JSX.Element {
  const cover = getCoverPhoto(place);
  const categoryNames = categories.map((category) => category.name);
  const chips = limitChips([...categoryNames, ...tagNames], MAX_CHIPS);
  const priceText = formatVndRange(place.priceMinVnd, place.priceMaxVnd);
  const priceLine = [priceText, distanceText ? `cách bạn ${distanceText}` : null]
    .filter(Boolean)
    .join(' · ');
  const openStatus = isOpenAt(place.openingHours, new Date());

  return (
    <div>
      <div className="wtg-info-header">
        <div className="wtg-info-photo">
          {cover ? (
            <AuthedImage driveFileId={cover.driveFileId} size={400} alt={`Ảnh ${place.name}`} />
          ) : (
            <IonIcon icon={resolveCategoryIcon(categories[0]?.icon ?? null)} aria-hidden="true" />
          )}
        </div>
        <div className="wtg-info-header__text">
          {(chips.visible.length > 0 || chips.extraCount > 0) && (
            <div className="wtg-info-chips">
              {chips.visible.map((name, index) => (
                <span
                  key={`${index}-${name}`}
                  className={index < categoryNames.length ? 'wtg-chip wtg-chip--accent' : 'wtg-chip'}
                >
                  {name}
                </span>
              ))}
              {chips.extraCount > 0 && <span className="wtg-chip">+{chips.extraCount}</span>}
            </div>
          )}
          <h2 className="wtg-info-name">{place.name}</h2>
          {priceLine && <p className="wtg-info-price">{priceLine}</p>}
        </div>
      </div>
      <div className="wtg-info-address">
        {place.address ? (
          <p className="wtg-info-address__text">
            <IonIcon icon={locationOutline} aria-hidden="true" />
            <span>{place.address}</span>
          </p>
        ) : (
          <span />
        )}
        <span className={`wtg-open-badge wtg-open-badge--${openStatus}`}>
          {OPEN_STATUS_LABELS[openStatus]}
        </span>
      </div>
    </div>
  );
}
