import { IonIcon } from '@ionic/react';
import { chevronUpOutline } from 'ionicons/icons';
import { formatVndRange } from '../../shared/money/vnd';
import type { Category } from '../categories/categoryRepository';
import type { PlaceWithRelations } from '../places/types';

export interface SwipeTeaserProps {
  place: PlaceWithRelations;
  /** Các nhóm của quán, đã sắp (`resolvePlaceCategories`). */
  categories: readonly Category[];
  disabled: boolean;
  /** Mở bảng trượt lên của quán. */
  onOpen: () => void;
}

/** Chip nhấn của dòng đầu: "★ {điểm} · {nhóm đầu}", thiếu phần nào thì bỏ phần đó. */
function teaserChipText(place: PlaceWithRelations, categories: readonly Category[]): string | null {
  const parts = [
    place.rating !== null ? `★ ${place.rating}` : null,
    categories[0]?.name ?? null,
  ].filter((part): part is string => part !== null);
  return parts.length > 0 ? parts.join(' · ') : null;
}

/**
 * Thẻ "xem trước" dưới chồng thẻ (mục 6.5 PLAN-UI-1.md): tóm tắt quán trên cùng; bấm mở bảng
 * trượt lên (M5).
 */
export function SwipeTeaser({
  place,
  categories,
  disabled,
  onOpen,
}: SwipeTeaserProps): React.JSX.Element {
  const chipText = teaserChipText(place, categories);
  const priceText = formatVndRange(place.priceMinVnd, place.priceMaxVnd);
  const line = place.story ?? place.address;
  return (
    <button
      type="button"
      className="wtg-swipe-teaser"
      aria-label={`Xem thông tin nhanh ${place.name}`}
      disabled={disabled}
      onClick={onOpen}
    >
      <span className="wtg-swipe-teaser__main">
        {(chipText || priceText) && (
          <span className="wtg-swipe-teaser__meta">
            {chipText && <span className="wtg-chip wtg-chip--accent">{chipText}</span>}
            {priceText && <span className="wtg-swipe-teaser__price">{priceText}</span>}
          </span>
        )}
        <span className="wtg-swipe-teaser__name">{place.name}</span>
        {line && <span className="wtg-swipe-teaser__line">{line}</span>}
      </span>
      <span className="wtg-swipe-teaser__more" aria-hidden="true">
        <span className="wtg-swipe-teaser__ring">
          <IonIcon icon={chevronUpOutline} />
        </span>
        Thông tin
      </span>
    </button>
  );
}
