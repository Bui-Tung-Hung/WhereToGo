import { IonIcon } from '@ionic/react';
import { star, starOutline } from 'ionicons/icons';

/** Các mức sao có thể chọn (1–5). */
const STAR_VALUES = [1, 2, 3, 4, 5] as const;

export interface StarRatingInputProps {
  /** Số sao đang chọn (1–5), hoặc `null` khi chưa đánh giá. */
  value: number | null;
  /** Gọi khi người dùng đổi số sao; `null` khi xoá đánh giá. */
  onChange: (value: number | null) => void;
}

/**
 * Bộ chọn số sao đánh giá (1–5). Mỗi sao là một vùng chạm ≥44×44px với
 * `aria-label` "N sao"; chạm lại đúng sao đang chọn sẽ xoá đánh giá (đưa
 * giá trị về `null`), chạm sao khác thì đổi sang số sao đó (mục 6.5 PLAN.md).
 */
export function StarRatingInput({ value, onChange }: StarRatingInputProps): React.JSX.Element {
  return (
    <div role="radiogroup" aria-label="Đánh giá của bạn">
      {STAR_VALUES.map((starValue) => {
        const isFilled = value !== null && starValue <= value;
        const isSelected = value === starValue;
        return (
          <button
            key={starValue}
            type="button"
            className="wtg-tap-target"
            role="radio"
            aria-checked={isSelected}
            aria-label={`${starValue} sao`}
            onClick={() => onChange(isSelected ? null : starValue)}
          >
            <IonIcon
              icon={isFilled ? star : starOutline}
              color={isFilled ? 'tertiary' : 'medium'}
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
}
