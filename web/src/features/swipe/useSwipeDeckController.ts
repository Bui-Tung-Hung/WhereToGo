import { useIonToast } from '@ionic/react';
import { useMemo, useState } from 'react';
import { toUserMessage } from '../../lib/errors';
import { usePrefersReducedMotion } from '../../shared/hooks/usePrefersReducedMotion';
import { useSetFavorite } from '../places/placeQueries';
import type { PlaceWithRelations } from '../places/types';
import {
  applySwipe,
  createDeck,
  lastEntry,
  remainingCount,
  revertEntry,
  upcomingIds,
  type SwipeDirection,
} from './swipeDeck';
import { deltaForDirection } from './swipeMotion';
import { useRecordSwipe, useUndoSwipe } from './swipeQueries';

/** Số thẻ dựng sẵn trong chồng (P16). */
const VISIBLE_CARD_COUNT = 3;
const SUCCESS_TOAST_MS = 1500;
const ERROR_TOAST_MS = 2500;

export interface SwipeDeckControllerOptions {
  /** Id các quán của bộ thẻ, lấy một lần khi tạo (đổi bộ lọc thì nơi gọi dựng controller mới). */
  initialPlaceIds: readonly string[];
  /** Seed xáo bộ thẻ (P30). */
  seed: number;
  /** Bản mới nhất của mọi quán; quán không còn ở đây thì bị bỏ khỏi bộ thẻ. */
  placesById: ReadonlyMap<string, PlaceWithRelations>;
  isOnline: boolean;
}

export interface SwipeDeckController {
  /** Tối đa 3 quán kế tiếp, phần tử 0 là thẻ trên cùng (không gồm thẻ đang bay). */
  upcoming: PlaceWithRelations[];
  /** Quán của thẻ đang bay ra, kèm hướng bay. */
  flying: { place: PlaceWithRelations; direction: SwipeDirection } | null;
  remaining: number;
  canUndo: boolean;
  /** Đang bay thẻ hoặc đang ghi/hoàn tác/đổi Yêu thích — mọi thao tác ghi tạm khoá. */
  busy: boolean;
  swipe: (direction: SwipeDirection) => void;
  onFlyOutEnd: () => void;
  undo: () => void;
  toggleFavorite: () => void;
}

/**
 * Điều phối một lần xem của trang vuốt thẻ (P35, mục 4.9 PLAN-UI-1.md): giữ bộ thẻ, thẻ đang bay,
 * lượt đang ghi; ghi lượt vuốt / Hoàn tác / Yêu thích và báo kết quả bằng toast.
 */
export function useSwipeDeckController({
  initialPlaceIds,
  seed,
  placesById,
  isOnline,
}: SwipeDeckControllerOptions): SwipeDeckController {
  const [deck, setDeck] = useState(() => createDeck(initialPlaceIds, seed));
  const [flying, setFlying] = useState<{ placeId: string; direction: SwipeDirection } | null>(
    null,
  );
  const [pendingEventId, setPendingEventId] = useState<string | null>(null);
  const record = useRecordSwipe();
  const undoMutation = useUndoSwipe();
  const favorite = useSetFavorite();
  const [presentToast] = useIonToast();
  const prefersReducedMotion = usePrefersReducedMotion();

  const available = useMemo(() => new Set(placesById.keys()), [placesById]);

  // Bỏ id của thẻ đang bay: nếu ghi lỗi trong lúc bay, thẻ được trả về bộ thẻ nhưng chỉ hiện lại
  // (cùng phần tử DOM, cùng key) sau khi bay xong.
  const upcoming = useMemo(
    () =>
      upcomingIds(deck, available, VISIBLE_CARD_COUNT + 1)
        .filter((id) => id !== flying?.placeId)
        .slice(0, VISIBLE_CARD_COUNT)
        .flatMap((id) => placesById.get(id) ?? []),
    [deck, available, flying, placesById],
  );

  // Quán đang bay bị xoá giữa chừng thì coi như đã bay xong, để trang không kẹt ở trạng thái bận.
  const flyingPlace = flying ? placesById.get(flying.placeId) : undefined;
  const flyingCard =
    flying && flyingPlace ? { place: flyingPlace, direction: flying.direction } : null;
  const busy =
    flyingCard !== null ||
    pendingEventId !== null ||
    undoMutation.isPending ||
    favorite.isPending;
  const top = upcoming[0];

  function showToast(message: string, isError = false): void {
    void presentToast({
      message,
      position: 'top',
      duration: isError ? ERROR_TOAST_MS : SUCCESS_TOAST_MS,
      color: isError ? 'danger' : undefined,
    });
  }

  function swipe(direction: SwipeDirection): void {
    if (busy || !isOnline || !top) {
      return;
    }
    const eventId = crypto.randomUUID();
    const delta = deltaForDirection(direction);
    setDeck((state) => applySwipe(state, top.id, direction, eventId));
    if (!prefersReducedMotion) {
      setFlying({ placeId: top.id, direction });
    }
    setPendingEventId(eventId);
    record.mutate(
      { eventId, placeId: top.id, delta },
      {
        onSuccess: () => showToast(delta > 0 ? '+1 điểm hứng thú' : '−1 điểm hứng thú'),
        onError: (error) => {
          setDeck((state) => revertEntry(state, eventId));
          showToast(toUserMessage(error), true);
        },
        onSettled: () => setPendingEventId(null),
      },
    );
  }

  function onFlyOutEnd(): void {
    setFlying(null);
  }

  function undo(): void {
    if (busy || !isOnline) {
      return;
    }
    const entry = lastEntry(deck);
    if (!entry) {
      showToast('Không còn gì để hoàn tác');
      return;
    }
    undoMutation.mutate(
      {
        eventId: entry.eventId,
        placeId: entry.placeId,
        delta: deltaForDirection(entry.direction),
      },
      {
        onSuccess: () => {
          setDeck((state) => revertEntry(state, entry.eventId));
          showToast('Đã hoàn tác');
        },
        onError: (error) => showToast(toUserMessage(error), true),
      },
    );
  }

  function toggleFavorite(): void {
    if (busy || !isOnline || !top) {
      return;
    }
    const favorited = top.favoritedAt === null;
    favorite.mutate(
      { id: top.id, favorited },
      {
        onSuccess: () =>
          showToast(favorited ? 'Đã thêm vào Yêu thích' : 'Đã bỏ khỏi Yêu thích'),
        onError: (error) => showToast(toUserMessage(error), true),
      },
    );
  }

  return {
    upcoming,
    flying: flyingCard,
    remaining: remainingCount(deck, available),
    canUndo: lastEntry(deck) !== null,
    busy,
    swipe,
    onFlyOutEnd,
    undo,
    toggleFavorite,
  };
}
