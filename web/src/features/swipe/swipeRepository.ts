import { assertOnline } from '../../lib/onlineGuard';
import { supabase } from '../../lib/supabaseClient';
import { assertNoError } from '../../lib/supabaseResult';

/** Một lượt vuốt cần ghi; `id` do client sinh để Hoàn tác xoá đúng dòng này. */
export interface SwipeEventInput {
  id: string;
  placeId: string;
  /** +1 = Hứng thú (vuốt phải), −1 = Bỏ qua (vuốt trái). */
  delta: 1 | -1;
}

/**
 * Ghi một lượt vuốt vào `swipe_events`; trigger trong DB tự cộng `delta` vào
 * `places.interest_score` (U14).
 *
 * @throws {OfflineError} khi đang offline.
 */
export async function insertSwipeEvent(input: SwipeEventInput): Promise<void> {
  assertOnline();
  await assertNoError(
    supabase
      .from('swipe_events')
      .insert({ id: input.id, place_id: input.placeId, delta: input.delta }),
  );
}

/**
 * Xoá một lượt vuốt (Hoàn tác — U16); trigger trong DB tự trừ lại `delta` khỏi điểm hứng thú.
 *
 * @throws {OfflineError} khi đang offline.
 */
export async function deleteSwipeEvent(id: string): Promise<void> {
  assertOnline();
  await assertNoError(supabase.from('swipe_events').delete().eq('id', id));
}
