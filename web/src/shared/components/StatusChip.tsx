import { IonBadge } from '@ionic/react';

/**
 * Trạng thái của một địa điểm. Khai báo cục bộ ở đây vì `StatusChip` là
 * component dùng chung (`shared/`) không được phụ thuộc ngược vào
 * `features/places`; `features/places/types.ts` (bước 58) khai báo lại
 * cùng union chuỗi này làm `PlaceStatus` — hai kiểu tương thích về cấu trúc.
 */
export type PlaceStatus = 'interested' | 'not_visited' | 'visited';

export interface StatusChipProps {
  status: PlaceStatus;
}

/** Nhãn tiếng Việt và màu Ionic tương ứng với từng trạng thái (mục 6.5 PLAN.md). */
const STATUS_CONFIG: Record<PlaceStatus, { label: string; color: string }> = {
  interested: { label: 'Hứng thú', color: 'tertiary' },
  not_visited: { label: 'Chưa đi', color: 'medium' },
  visited: { label: 'Đã đi', color: 'success' },
};

/** Nhãn trạng thái của một địa điểm: Hứng thú / Chưa đi / Đã đi (mục 6.5 PLAN.md). */
export function StatusChip({ status }: StatusChipProps): React.JSX.Element {
  const { label, color } = STATUS_CONFIG[status];
  return <IonBadge color={color}>{label}</IonBadge>;
}
