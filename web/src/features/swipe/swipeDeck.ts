import { createSeededRandom, shuffle } from '../../shared/random/shuffle';

/** Hướng vuốt: phải = Hứng thú (+1), trái = Bỏ qua (−1). */
export type SwipeDirection = 'like' | 'skip';

/** Một lượt vuốt đã làm trong lần xem này (để Hoàn tác — U16). */
export interface DeckEntry {
  placeId: string;
  direction: SwipeDirection;
  /** Id của dòng `swipe_events`, cũng là khoá chống ghi trùng. */
  eventId: string;
}

/**
 * Trạng thái bộ thẻ của một lần xem (P35): thứ tự cố định từ lúc tạo, vị trí thẻ trên cùng và
 * lịch sử các lượt vuốt (mới nhất ở cuối).
 */
export interface DeckState {
  order: string[];
  position: number;
  history: DeckEntry[];
}

/**
 * Tạo bộ thẻ mới: `placeIds` được sắp tăng dần rồi xáo bằng nguồn ngẫu nhiên có `seed` (P30), nên
 * cùng tập id + cùng seed luôn ra cùng thứ tự bất kể thứ tự đầu vào.
 *
 * @param seed - Số nguyên 32 bit từ `createRandomSeed()`.
 */
export function createDeck(placeIds: readonly string[], seed: number): DeckState {
  const sortedIds = [...placeIds].sort();
  return {
    order: shuffle(sortedIds, createSeededRandom(seed)),
    position: 0,
    history: [],
  };
}

/** Các id chưa vuốt kế tiếp (tối đa `count`), bỏ qua id không còn trong `available` (quán đã bị xoá). */
export function upcomingIds(
  state: DeckState,
  available: ReadonlySet<string>,
  count: number,
): string[] {
  return state.order
    .slice(state.position)
    .filter((id) => available.has(id))
    .slice(0, count);
}

/** Số thẻ chưa vuốt còn lại (chỉ đếm quán còn tồn tại). */
export function remainingCount(state: DeckState, available: ReadonlySet<string>): number {
  return state.order.slice(state.position).filter((id) => available.has(id)).length;
}

/**
 * Ghi một lượt vuốt vào bộ thẻ. Bỏ qua (trả nguyên `state`) nếu `eventId` đã có trong lịch sử
 * hoặc `placeId` không thuộc bộ thẻ.
 */
export function applySwipe(
  state: DeckState,
  placeId: string,
  direction: SwipeDirection,
  eventId: string,
): DeckState {
  const index = state.order.indexOf(placeId);
  if (index === -1 || state.history.some((entry) => entry.eventId === eventId)) {
    return state;
  }
  return {
    order: state.order,
    position: Math.max(state.position, index + 1),
    history: [...state.history, { placeId, direction, eventId }],
  };
}

/**
 * Gỡ lượt vuốt `eventId` nếu nó là lượt mới nhất: thẻ của lượt đó quay lại trên cùng. Không phải
 * lượt mới nhất thì trả nguyên `state`.
 */
export function revertEntry(state: DeckState, eventId: string): DeckState {
  const last = lastEntry(state);
  if (last === null || last.eventId !== eventId) {
    return state;
  }
  return {
    order: state.order,
    position: state.order.indexOf(last.placeId),
    history: state.history.slice(0, -1),
  };
}

/** Lượt vuốt mới nhất (sẽ bị Hoàn tác), hoặc `null` khi chưa vuốt gì. */
export function lastEntry(state: DeckState): DeckEntry | null {
  return state.history[state.history.length - 1] ?? null;
}
