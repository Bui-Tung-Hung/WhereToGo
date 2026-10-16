import { IonIcon } from '@ionic/react';
import {
  arrowUndoOutline,
  closeOutline,
  heart,
  informationCircleOutline,
  star,
  starOutline,
} from 'ionicons/icons';

export interface SwipeActionsProps {
  canUndo: boolean;
  /** Quán trên cùng đã Yêu thích chưa. */
  isFavorite: boolean;
  busy: boolean;
  isOnline: boolean;
  /** Còn thẻ trên cùng không. */
  hasCard: boolean;
  onUndo: () => void;
  onSkip: () => void;
  onToggleFavorite: () => void;
  onLike: () => void;
  onInfo: () => void;
}

/**
 * Hàng nút dưới chồng thẻ (P34): Hoàn tác — Bỏ qua (−1) — Yêu thích — Hứng thú (+1) — Thông tin.
 * Các nút ghi tắt khi đang bận hoặc offline; nút Thông tin chỉ cần có thẻ.
 */
export function SwipeActions({
  canUndo,
  isFavorite,
  busy,
  isOnline,
  hasCard,
  onUndo,
  onSkip,
  onToggleFavorite,
  onLike,
  onInfo,
}: SwipeActionsProps): React.JSX.Element {
  const writeDisabled = busy || !isOnline || !hasCard;
  return (
    <div className="wtg-swipe-actions">
      <button
        type="button"
        className="wtg-swipe-action wtg-swipe-action--small"
        aria-label="Hoàn tác"
        disabled={busy || !isOnline || !canUndo}
        onClick={onUndo}
      >
        <IonIcon icon={arrowUndoOutline} aria-hidden="true" />
      </button>
      <button
        type="button"
        className="wtg-swipe-action wtg-swipe-action--large wtg-swipe-action--pass"
        aria-label="Bỏ qua, trừ 1 điểm hứng thú"
        disabled={writeDisabled}
        onClick={onSkip}
      >
        <IonIcon icon={closeOutline} aria-hidden="true" />
      </button>
      <button
        type="button"
        className="wtg-swipe-action wtg-swipe-action--small wtg-swipe-action--star"
        aria-label={isFavorite ? 'Bỏ khỏi Yêu thích' : 'Thêm vào Yêu thích'}
        disabled={writeDisabled}
        onClick={onToggleFavorite}
      >
        <IonIcon icon={isFavorite ? star : starOutline} aria-hidden="true" />
      </button>
      <button
        type="button"
        className="wtg-swipe-action wtg-swipe-action--large wtg-swipe-action--like"
        aria-label="Hứng thú, cộng 1 điểm"
        disabled={writeDisabled}
        onClick={onLike}
      >
        <IonIcon icon={heart} aria-hidden="true" />
      </button>
      <button
        type="button"
        className="wtg-swipe-action wtg-swipe-action--small"
        aria-label="Xem thông tin nhanh"
        disabled={!hasCard}
        onClick={onInfo}
      >
        <IonIcon icon={informationCircleOutline} aria-hidden="true" />
      </button>
    </div>
  );
}
