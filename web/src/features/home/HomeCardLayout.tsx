import { IonIcon } from '@ionic/react';
import type { ReactNode } from 'react';

/** Độ trễ hiệu ứng xuất hiện của thẻ đầu tiên và bước tăng cho mỗi thẻ sau (mục 6.3). */
const CASCADE_BASE_DELAY_S = 0.05;
const CASCADE_STEP_S = 0.08;

/** `animation-delay` cho thẻ thứ `index` trên trang chủ. */
export function cascadeDelay(index: number): string {
  return `${(CASCADE_BASE_DELAY_S + index * CASCADE_STEP_S).toFixed(2)}s`;
}

export interface HomeCardLayoutProps {
  /** Icon ionicons ở hàng nhãn. */
  icon: string;
  /** Nhãn nhỏ (tên nhóm). */
  label: string;
  /** Câu chữ lớn (câu gợi ý). */
  prompt: string;
  /** Phần bên phải (cụm ảnh, biểu tượng...). */
  aside: ReactNode;
  /** Nhãn cho trình đọc màn hình. */
  ariaLabel: string;
  onOpen: () => void;
  /** Vị trí của thẻ trong danh sách, để tính độ trễ hiệu ứng xuất hiện. */
  cascadeIndex: number;
}

/**
 * Khung thẻ dùng chung của trang chủ (thẻ nhóm, thẻ Gần tôi, thẻ "Chưa có nhóm"): cột trái 7/12
 * gồm nhãn + câu gợi ý, cột phải 5/12; cả thẻ là một nút (Enter/Space như bấm).
 */
export function HomeCardLayout({
  icon,
  label,
  prompt,
  aside,
  ariaLabel,
  onOpen,
  cascadeIndex,
}: HomeCardLayoutProps): React.JSX.Element {
  return (
    <div
      className="wtg-home-card wtg-cascade"
      style={{ animationDelay: cascadeDelay(cascadeIndex) }}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen();
        }
      }}
    >
      <div className="wtg-home-card__main">
        <p className="wtg-home-card__label">
          <IonIcon icon={icon} aria-hidden="true" />
          <span>{label}</span>
        </p>
        <p className="wtg-home-card__prompt">{prompt}</p>
      </div>
      <div className="wtg-home-card__aside">{aside}</div>
    </div>
  );
}
