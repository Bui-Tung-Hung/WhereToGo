import { IonIcon } from '@ionic/react';
import { star, starOutline } from 'ionicons/icons';

/** Các mức sao hiển thị (1–5). */
const STAR_VALUES = [1, 2, 3, 4, 5] as const;

export interface StarRatingViewProps {
  /** Số sao đánh giá (1–5), hoặc `null` khi chưa đánh giá. */
  value: number | null;
  /** Cỡ hiển thị: `small` cho thẻ danh sách, `medium` (mặc định) cho trang chi tiết. */
  size?: 'small' | 'medium';
}

/**
 * Hiển thị (chỉ đọc) số sao đánh giá của một địa điểm. Không hiển thị gì
 * khi `value` là `null` (mục 6.5 PLAN.md).
 */
export function StarRatingView({
  value,
  size = 'medium',
}: StarRatingViewProps): React.JSX.Element | null {
  if (value === null) {
    return null;
  }

  const fontSize = size === 'small' ? '14px' : '18px';

  return (
    <span
      aria-label={`${value} sao`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}
    >
      {STAR_VALUES.map((starValue) => (
        <IonIcon
          key={starValue}
          icon={starValue <= value ? star : starOutline}
          color={starValue <= value ? 'tertiary' : 'medium'}
          style={{ fontSize }}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}
