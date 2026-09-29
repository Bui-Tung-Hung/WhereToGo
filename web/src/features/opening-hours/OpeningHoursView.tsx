import { IonBadge } from '@ionic/react';
import {
  formatRanges,
  isOpenAt,
  WEEKDAYS,
  WEEKDAY_LABELS,
  weekdayOf,
  type OpeningHours,
} from './openingHours';

export interface OpeningHoursViewProps {
  /** `null` nghĩa là "chưa rõ giờ". */
  hours: OpeningHours | null;
}

type OpenStatus = 'open' | 'closed' | 'unknown';

const STATUS_LABEL: Record<OpenStatus, string> = {
  open: 'Đang mở',
  closed: 'Đã đóng',
  unknown: 'Chưa rõ giờ',
};

const STATUS_COLOR: Record<OpenStatus, string> = {
  open: 'success',
  closed: 'danger',
  unknown: 'medium',
};

/**
 * Hiển thị giờ mở cửa (mục 6.6 PLAN.md): huy hiệu trạng thái hiện tại
 * ("Đang mở"/"Đã đóng"/"Chưa rõ giờ") và bảng Thứ 2 → Chủ nhật, ngày hôm
 * nay in đậm. Không hiện bảng khi `hours` là `null`.
 */
export function OpeningHoursView({ hours }: OpeningHoursViewProps): React.JSX.Element {
  const status = isOpenAt(hours, new Date());
  const today = weekdayOf(new Date());

  return (
    <div className="wtg-group">
      <p className="wtg-group-title">Giờ mở cửa</p>
      <IonBadge color={STATUS_COLOR[status]}>{STATUS_LABEL[status]}</IonBadge>

      {hours && (
        <table style={{ width: '100%', marginTop: 8, borderCollapse: 'collapse' }}>
          <tbody>
            {WEEKDAYS.map((day) => {
              const isToday = day === today;
              const label = WEEKDAY_LABELS[day];
              const text = formatRanges(hours[day]);
              return (
                <tr key={day}>
                  <th
                    scope="row"
                    style={{
                      textAlign: 'left',
                      fontWeight: isToday ? 700 : 400,
                      padding: '2px 8px 2px 0',
                    }}
                  >
                    {isToday ? <strong>{label}</strong> : label}
                  </th>
                  <td
                    className="wtg-caption"
                    style={{ fontWeight: isToday ? 700 : 400, padding: '2px 0' }}
                  >
                    {isToday ? <strong>{text}</strong> : text}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
