import { albumsOutline, mapOutline, searchOutline } from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '../../shared/components/EmptyState';

export interface SwipeEmptyStateProps {
  /**
   * `no-places`: user chưa có quán nào; `no-match`: bộ lọc không khớp quán nào;
   * `finished`: đã vuốt hết bộ thẻ.
   */
  kind: 'no-places' | 'no-match' | 'finished';
  isOnline: boolean;
  /** Xáo lại bộ thẻ từ đầu (chỉ dùng ở `finished`). */
  onRestart: () => void;
}

/** Trạng thái rỗng của trang vuốt thẻ, đặt vào chỗ của chồng thẻ (mục 6.5 PLAN-UI-1.md). */
export function SwipeEmptyState({
  kind,
  isOnline,
  onRestart,
}: SwipeEmptyStateProps): React.JSX.Element {
  const navigate = useNavigate();

  function renderState(): React.JSX.Element {
    switch (kind) {
      case 'no-places':
        return (
          <EmptyState
            icon={mapOutline}
            title="Chưa có địa điểm nào"
            message="Bắt đầu lưu lại những nơi bạn muốn nhớ."
            action={
              isOnline
                ? { label: 'Thêm địa điểm', onClick: () => navigate('/places/new') }
                : undefined
            }
          />
        );
      case 'no-match':
        return (
          <EmptyState
            icon={searchOutline}
            title="Không có địa điểm nào khớp bộ lọc"
            message="Thử chọn nhóm hoặc nhãn khác."
          />
        );
      case 'finished':
        return (
          <EmptyState
            icon={albumsOutline}
            title="Đã xem hết"
            message="Bạn đã xem hết các địa điểm trong bộ lọc này."
            action={{ label: 'Xem lại từ đầu', onClick: onRestart }}
          />
        );
    }
  }

  return <div className="wtg-swipe-empty">{renderState()}</div>;
}
