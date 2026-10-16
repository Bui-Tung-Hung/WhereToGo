import { useMutation, useQueryClient } from '@tanstack/react-query';
import { applyPlacePatch, withInterestDelta } from '../places/placeCache';
import { deleteSwipeEvent, insertSwipeEvent } from './swipeRepository';

/** Tham số chung cho `useRecordSwipe` và `useUndoSwipe`. */
export interface SwipeVariables {
  /** Id của dòng `swipe_events` (sinh ở client khi vuốt). */
  eventId: string;
  placeId: string;
  /** Điểm của lượt vuốt: +1 = Hứng thú, −1 = Bỏ qua. */
  delta: 1 | -1;
}

/**
 * Ghi một lượt vuốt với cập nhật lạc quan điểm hứng thú; lỗi thì vá ngược lại. Không tải lại cả
 * danh sách. `networkMode: 'always'` để lỗi offline ném ngay (`OfflineError`).
 */
export function useRecordSwipe() {
  const queryClient = useQueryClient();
  return useMutation<void, unknown, SwipeVariables>({
    networkMode: 'always',
    mutationFn: ({ eventId, placeId, delta }) =>
      insertSwipeEvent({ id: eventId, placeId, delta }),
    onMutate: ({ placeId, delta }) => {
      applyPlacePatch(queryClient, placeId, (place) => withInterestDelta(place, delta));
    },
    onError: (_error, { placeId, delta }) => {
      applyPlacePatch(queryClient, placeId, (place) => withInterestDelta(place, -delta));
    },
  });
}

/**
 * Hoàn tác một lượt vuốt (xoá dòng `swipe_events`) với cập nhật lạc quan −delta; lỗi thì vá
 * lại +delta. `networkMode: 'always'` như {@link useRecordSwipe}.
 */
export function useUndoSwipe() {
  const queryClient = useQueryClient();
  return useMutation<void, unknown, SwipeVariables>({
    networkMode: 'always',
    mutationFn: ({ eventId }) => deleteSwipeEvent(eventId),
    onMutate: ({ placeId, delta }) => {
      applyPlacePatch(queryClient, placeId, (place) => withInterestDelta(place, -delta));
    },
    onError: (_error, { placeId, delta }) => {
      applyPlacePatch(queryClient, placeId, (place) => withInterestDelta(place, delta));
    },
  });
}
