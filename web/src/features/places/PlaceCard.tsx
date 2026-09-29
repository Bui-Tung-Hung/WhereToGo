import { IonIcon } from '@ionic/react';
import { imageOutline } from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import { formatDistance } from '../../shared/geo/distance';
import { formatVndRange } from '../../shared/money/vnd';
import { StarRatingView } from '../../shared/components/StarRatingView';
import { StatusChip } from '../../shared/components/StatusChip';
import { AuthedImage } from '../photos/AuthedImage';
import type { PlaceWithRelations } from './types';

/** Số nhãn tối đa hiển thị trực tiếp trên thẻ trước khi gộp thành "+N" (mục 6.6 PLAN.md). */
const MAX_VISIBLE_TAGS = 3;

export interface PlaceCardProps {
  place: PlaceWithRelations;
  /** Tra tên nhãn theo id, để hiển thị tên thay vì id thô. */
  tagNameById: ReadonlyMap<string, string>;
  /** Khoảng cách tới vị trí hiện tại (mét) — chỉ có ở tab "Gần tôi" khi đã có toạ độ. */
  distanceMeters?: number;
}

/** Nối tối đa {@link MAX_VISIBLE_TAGS} tên nhãn, phần dư gộp thành `"+N"`. */
function formatTagNames(tagIds: readonly string[], tagNameById: ReadonlyMap<string, string>): string {
  const names = tagIds.map((id) => tagNameById.get(id)).filter((name): name is string => Boolean(name));
  if (names.length === 0) {
    return '';
  }
  const visible = names.slice(0, MAX_VISIBLE_TAGS);
  const extraCount = names.length - visible.length;
  return extraCount > 0 ? `${visible.join(', ')} +${extraCount}` : visible.join(', ');
}

/**
 * Thẻ địa điểm trong danh sách (mục 6.6 PLAN.md): ảnh đầu tiên 88×88 bên
 * trái, tên/nhãn+giá/sao+trạng thái+khoảng cách bên phải. Chạm vào thẻ mở
 * trang chi tiết.
 */
export function PlaceCard({ place, tagNameById, distanceMeters }: PlaceCardProps): React.JSX.Element {
  const navigate = useNavigate();
  const firstPhoto = place.photos[0];

  function open(): void {
    navigate(`/places/${place.id}`);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      open();
    }
  }

  const tagText = formatTagNames(place.tagIds, tagNameById);
  const priceText = formatVndRange(place.priceMinVnd, place.priceMaxVnd);
  const row2Text = [tagText, priceText].filter(Boolean).join(' · ');

  return (
    <div
      className="wtg-card"
      role="button"
      tabIndex={0}
      aria-label={place.name}
      onClick={open}
      onKeyDown={handleKeyDown}
      style={{ display: 'flex', gap: 12, padding: 12, cursor: 'pointer' }}
    >
      {firstPhoto ? (
        <AuthedImage
          driveFileId={firstPhoto.driveFileId}
          size={400}
          alt=""
          className="wtg-list-thumb"
        />
      ) : (
        <div
          className="wtg-list-thumb"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--ion-color-light)',
          }}
        >
          <IonIcon icon={imageOutline} color="medium" aria-hidden="true" />
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <p
          style={{
            margin: 0,
            fontWeight: 600,
            fontSize: 17,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {place.name}
        </p>
        {row2Text && (
          <p className="wtg-caption" style={{ margin: 0, color: 'var(--ion-color-medium)' }}>
            {row2Text}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <StarRatingView value={place.rating} size="small" />
          <StatusChip status={place.status} />
          {distanceMeters !== undefined && (
            <span className="wtg-caption" style={{ color: 'var(--ion-color-medium)' }}>
              {formatDistance(distanceMeters)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
