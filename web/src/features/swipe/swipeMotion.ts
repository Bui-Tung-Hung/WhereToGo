import type { SwipeDirection } from './swipeDeck';

/** Kéo quá ngưỡng này (px, theo trục ngang) rồi thả thì tính là một lượt vuốt. */
export const SWIPE_THRESHOLD_PX = 95;
/** Độ xoay của thẻ cho mỗi px kéo ngang. */
export const ROTATION_DEG_PER_PX = 0.08;
/** Kéo được chừng này px thì dấu "HỨNG THÚ"/"BỎ QUA" hiện rõ hẳn. */
export const STAMP_FULL_OPACITY_PX = 100;
/** Thời gian thẻ bay ra khỏi màn hình (khớp `transition` trong `swipe.css`). */
export const FLY_OUT_MS = 450;
/** Hẹn giờ dự phòng khi trình duyệt không bắn `transitionend`. */
export const FLY_OUT_FALLBACK_MS = FLY_OUT_MS + 100;
/** Thời gian thẻ bật về chỗ cũ khi kéo chưa đủ ngưỡng. */
export const SNAP_BACK_MS = 350;
/** Cao hơn cử chỉ vuốt-để-quay-lại của Ionic (100) để kéo thẻ không bị nó giành. */
export const SWIPE_GESTURE_PRIORITY = 110;

/** Kết quả khi thả tay: vuốt phải, vuốt trái, hoặc chưa đủ ngưỡng. */
export type ReleaseOutcome = SwipeDirection | 'cancel';

/** Chuỗi `transform` của thẻ khi đang kéo một đoạn `dx`, `dy`. */
export function cardDragTransform(dx: number, dy: number): string {
  return `translate3d(${dx}px, ${dy}px, 0) rotate(${dx * ROTATION_DEG_PER_PX}deg)`;
}

/** Độ mờ của hai dấu: chỉ dấu đúng hướng kéo hiện lên, rõ dần tới {@link STAMP_FULL_OPACITY_PX}. */
export function stampOpacities(dx: number): { like: number; skip: number } {
  const strength = Math.min(Math.abs(dx) / STAMP_FULL_OPACITY_PX, 1);
  return {
    like: dx > 0 ? strength : 0,
    skip: dx < 0 ? strength : 0,
  };
}

/** Kéo quá {@link SWIPE_THRESHOLD_PX} sang phải là `like`, sang trái là `skip`, còn lại `cancel`. */
export function releaseOutcome(dx: number): ReleaseOutcome {
  if (dx > SWIPE_THRESHOLD_PX) {
    return 'like';
  }
  if (dx < -SWIPE_THRESHOLD_PX) {
    return 'skip';
  }
  return 'cancel';
}

/** Điểm hứng thú cộng thêm cho một lượt vuốt (U14): phải +1, trái −1. */
export function deltaForDirection(direction: SwipeDirection): 1 | -1 {
  return direction === 'like' ? 1 : -1;
}
