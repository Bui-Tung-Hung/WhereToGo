import { useCategories } from '../categories/categoryQueries';
import { resolvePlaceCategories } from '../categories/categoryRules';
import type { PlaceWithRelations } from '../places/types';
import { SwipeActions } from './SwipeActions';
import { SwipeCard, type SwipeCardRole } from './SwipeCard';
import { SwipeEmptyState } from './SwipeEmptyState';
import { SwipeTeaser } from './SwipeTeaser';
import { useSwipeDeckController } from './useSwipeDeckController';

/** Vai của thẻ theo vị trí trong `upcoming` (0 = trên cùng). */
const STACK_ROLES: readonly SwipeCardRole[] = ['top', 'second', 'third'];

export interface SwipeDeckViewProps {
  /** Id các quán khớp bộ lọc lúc mở bộ thẻ (nơi gọi đổi `key` để tạo bộ thẻ mới). */
  initialPlaceIds: readonly string[];
  seed: number;
  placesById: ReadonlyMap<string, PlaceWithRelations>;
  /** User có quán nào không (phân biệt "chưa có quán" với "không khớp bộ lọc"). */
  hasAnyPlace: boolean;
  isOnline: boolean;
  /** Xáo lại bộ thẻ bằng seed mới. */
  onRestart: () => void;
  /** Mở bảng trượt lên của một quán. */
  onOpenInfo: (placeId: string) => void;
}

/**
 * Một bộ thẻ (một lần xem — P35): dòng "Còn N địa điểm", chồng thẻ, thẻ xem trước, hàng nút
 * (mục 6.5 PLAN-UI-1.md).
 */
export function SwipeDeckView({
  initialPlaceIds,
  seed,
  placesById,
  hasAnyPlace,
  isOnline,
  onRestart,
  onOpenInfo,
}: SwipeDeckViewProps): React.JSX.Element {
  const controller = useSwipeDeckController({ initialPlaceIds, seed, placesById, isOnline });
  const { data: categories = [] } = useCategories();

  if (!hasAnyPlace) {
    return <SwipeEmptyState kind="no-places" isOnline={isOnline} onRestart={onRestart} />;
  }
  if (initialPlaceIds.length === 0) {
    return <SwipeEmptyState kind="no-match" isOnline={isOnline} onRestart={onRestart} />;
  }

  const { upcoming, flying, remaining, canUndo, busy } = controller;
  const top = upcoming[0] ?? null;
  const isFinished = top === null && flying === null;
  const interactive = isOnline && !busy;

  // Thẻ dưới vẽ trước; thẻ đang bay vẽ cuối. Cùng một danh sách, `key` = id quán, để thẻ đang
  // kéo trở thành thẻ bay mà vẫn là phần tử DOM cũ.
  const stack = [
    ...upcoming.map((place, index) => ({ place, role: STACK_ROLES[index] ?? 'third' })).reverse(),
    ...(flying ? [{ place: flying.place, role: 'flying' as const }] : []),
  ];

  return (
    <div className="wtg-swipe-deck-view">
      <p className="wtg-swipe-remaining" aria-live="polite">
        Còn {remaining} địa điểm
      </p>
      {isFinished ? (
        <SwipeEmptyState kind="finished" isOnline={isOnline} onRestart={onRestart} />
      ) : (
        <div className="wtg-swipe-stack">
          {stack.map(({ place, role }) => (
            <SwipeCard
              key={place.id}
              place={place}
              categories={resolvePlaceCategories(place, categories)}
              role={role}
              flyDirection={role === 'flying' ? (flying?.direction ?? null) : null}
              interactive={interactive}
              onRelease={(outcome) => {
                if (outcome !== 'cancel') {
                  controller.swipe(outcome);
                }
              }}
              onFlyOutEnd={controller.onFlyOutEnd}
            />
          ))}
        </div>
      )}
      {top && (
        <SwipeTeaser
          place={top}
          categories={resolvePlaceCategories(top, categories)}
          disabled={busy}
          onOpen={() => onOpenInfo(top.id)}
        />
      )}
      <SwipeActions
        canUndo={canUndo}
        isFavorite={top?.favoritedAt != null}
        busy={busy}
        isOnline={isOnline}
        hasCard={top !== null}
        onUndo={controller.undo}
        onSkip={() => controller.swipe('skip')}
        onToggleFavorite={controller.toggleFavorite}
        onLike={() => controller.swipe('like')}
        onInfo={() => {
          if (top) {
            onOpenInfo(top.id);
          }
        }}
      />
    </div>
  );
}
