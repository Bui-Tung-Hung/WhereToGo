import { createGesture, type Gesture } from '@ionic/react';
import { useEffect, useRef, type RefObject } from 'react';
import { SWIPE_GESTURE_PRIORITY } from './swipeMotion';

export interface SwipeGestureOptions {
  /** `false` thì cử chỉ tạm tắt (thẻ không phải trên cùng, đang bận, offline). */
  enabled: boolean;
  /** Gọi liên tục khi đang kéo, với độ dời so với điểm chạm đầu. */
  onMove: (dx: number, dy: number) => void;
  /** Gọi khi thả tay, với độ dời ngang cuối cùng. */
  onRelease: (dx: number) => void;
}

/**
 * Gắn cử chỉ kéo ngang (Ionic `createGesture`) lên `elementRef`. Handler mới nhất luôn được dùng
 * mà không phải tạo lại cử chỉ; `enabled` chỉ bật/tắt cử chỉ đã tạo.
 */
export function useSwipeGesture(
  elementRef: RefObject<HTMLElement | null>,
  { enabled, onMove, onRelease }: SwipeGestureOptions,
): void {
  const handlersRef = useRef({ onMove, onRelease });
  const gestureRef = useRef<Gesture | null>(null);

  useEffect(() => {
    handlersRef.current = { onMove, onRelease };
  });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return undefined;
    }
    const gesture = createGesture({
      el: element,
      gestureName: 'wtg-swipe-card',
      gesturePriority: SWIPE_GESTURE_PRIORITY,
      direction: 'x',
      threshold: 10,
      onMove: (detail) => handlersRef.current.onMove(detail.deltaX, detail.deltaY),
      onEnd: (detail) => handlersRef.current.onRelease(detail.deltaX),
    });
    gestureRef.current = gesture;
    return () => {
      gesture.destroy();
      gestureRef.current = null;
    };
  }, [elementRef]);

  useEffect(() => {
    gestureRef.current?.enable(enabled);
  }, [enabled]);
}
