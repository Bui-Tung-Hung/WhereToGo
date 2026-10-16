import { pickRandom, type RandomSource } from '../../shared/random/shuffle';
import type { PlaceWithRelations } from '../places/types';

/** Bộ nhớ của thẻ "Hôm nay thử quán này": nhớ quán đã bốc để giữ nguyên trong một phiên. */
export interface DailyPickStore {
  /**
   * Quán đã bốc nếu nó vẫn còn trong `places`; không thì bốc quán mới và nhớ lại.
   * `places` rỗng thì trả `null`.
   */
  pick(places: readonly PlaceWithRelations[], random?: RandomSource): PlaceWithRelations | null;
}

/** Tạo một bộ nhớ bốc quán độc lập (dùng riêng cho test, hoặc store cấp module bên dưới). */
export function createDailyPickStore(): DailyPickStore {
  let pickedId: string | null = null;
  return {
    pick(places, random = Math.random) {
      const remembered = places.find((place) => place.id === pickedId);
      if (remembered) {
        return remembered;
      }
      const picked = pickRandom(places, random) ?? null;
      pickedId = picked?.id ?? null;
      return picked;
    },
  };
}

/** Store cấp module: sống suốt một phiên chạy JS của app (P10 PLAN-UI-1.md). */
const sessionStore = createDailyPickStore();

/**
 * Quán cho thẻ "Hôm nay thử quán này" (U33, M4): bốc ngẫu nhiên trong tất cả quán, giữ nguyên
 * trong cùng một phiên chạy của app; mở lại app sau khi tắt hẳn thì bốc quán khác.
 */
export function getSessionDailyPick(
  places: readonly PlaceWithRelations[],
): PlaceWithRelations | null {
  return sessionStore.pick(places);
}
