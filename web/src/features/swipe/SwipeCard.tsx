import { IonIcon } from '@ionic/react';
import { locationOutline, pricetagOutline } from 'ionicons/icons';
import { useEffect, useRef, type RefObject, type TransitionEvent } from 'react';
import { formatVndRange } from '../../shared/money/vnd';
import { resolveCategoryIcon } from '../categories/categoryIcons';
import type { Category } from '../categories/categoryRepository';
import { AuthedImage } from '../photos/AuthedImage';
import { getCoverPhoto } from '../places/placeDisplay';
import type { PlaceWithRelations } from '../places/types';
import type { SwipeDirection } from './swipeDeck';
import {
  FLY_OUT_FALLBACK_MS,
  SNAP_BACK_MS,
  cardDragTransform,
  releaseOutcome,
  stampOpacities,
  type ReleaseOutcome,
} from './swipeMotion';
import { useSwipeGesture } from './useSwipeGesture';

/** Số chip nhóm tối đa trên thẻ. */
const MAX_CARD_CHIPS = 2;

/** Gọi `callbackRef.current` đúng một lần cho mỗi lần bay (cờ `endedRef` đặt lại khi bắt đầu bay). */
function finishFlyOutOnce(endedRef: RefObject<boolean>, callbackRef: RefObject<() => void>): void {
  if (endedRef.current) {
    return;
  }
  endedRef.current = true;
  callbackRef.current();
}

export type SwipeCardRole = 'top' | 'second' | 'third' | 'flying';

export interface SwipeCardProps {
  place: PlaceWithRelations;
  /** Các nhóm của quán, đã sắp (`resolvePlaceCategories`). */
  categories: readonly Category[];
  role: SwipeCardRole;
  /** Hướng bay khi `role === 'flying'`. */
  flyDirection: SwipeDirection | null;
  /** Cho kéo hay không (chỉ có tác dụng với thẻ trên cùng). */
  interactive: boolean;
  /** Gọi khi thả tay đã vượt ngưỡng (`like`/`skip`); chưa đủ ngưỡng thì thẻ tự bật về. */
  onRelease: (outcome: ReleaseOutcome) => void;
  /** Gọi đúng một lần khi thẻ đã bay ra khỏi màn hình. */
  onFlyOutEnd: () => void;
}

/**
 * Một thẻ quán trong chồng thẻ (mục 6.5 PLAN-UI-1.md). Khi kéo, vị trí thẻ và độ mờ hai dấu được
 * ghi thẳng vào DOM (không qua state) cho mượt; khi bay ra, lớp CSS lo chuyển động.
 */
export function SwipeCard({
  place,
  categories,
  role,
  flyDirection,
  interactive,
  onRelease,
  onFlyOutEnd,
}: SwipeCardProps): React.JSX.Element {
  const cardRef = useRef<HTMLDivElement>(null);
  const likeStampRef = useRef<HTMLSpanElement>(null);
  const skipStampRef = useRef<HTMLSpanElement>(null);
  const flyEndedRef = useRef(false);
  const onFlyOutEndRef = useRef(onFlyOutEnd);
  const isTop = role === 'top';
  const isFlying = role === 'flying';

  useEffect(() => {
    onFlyOutEndRef.current = onFlyOutEnd;
  });

  function setStampOpacities(like: number, skip: number): void {
    if (likeStampRef.current) {
      likeStampRef.current.style.opacity = String(like);
    }
    if (skipStampRef.current) {
      skipStampRef.current.style.opacity = String(skip);
    }
  }

  useSwipeGesture(cardRef, {
    enabled: isTop && interactive,
    onMove: (dx, dy) => {
      const card = cardRef.current;
      if (!card) {
        return;
      }
      card.style.transition = 'none';
      card.style.transform = cardDragTransform(dx, dy);
      const opacities = stampOpacities(dx);
      setStampOpacities(opacities.like, opacities.skip);
    },
    onRelease: (dx) => {
      const outcome = releaseOutcome(dx);
      if (outcome !== 'cancel') {
        onRelease(outcome);
        return;
      }
      const card = cardRef.current;
      if (card) {
        card.style.transition = `transform ${SNAP_BACK_MS}ms cubic-bezier(0.175, 0.885, 0.32, 1.275)`;
        card.style.transform = '';
      }
      setStampOpacities(0, 0);
    },
  });

  useEffect(() => {
    if (!isFlying) {
      return undefined;
    }
    // Bỏ transform/transition inline của lúc kéo để lớp `--fly-*` bay tiếp từ chỗ đang đứng.
    flyEndedRef.current = false;
    const card = cardRef.current;
    if (card) {
      card.style.transition = '';
      card.style.transform = '';
    }
    if (likeStampRef.current) {
      likeStampRef.current.style.opacity = flyDirection === 'like' ? '1' : '0';
    }
    if (skipStampRef.current) {
      skipStampRef.current.style.opacity = flyDirection === 'skip' ? '1' : '0';
    }
    const fallbackTimer = window.setTimeout(
      () => finishFlyOutOnce(flyEndedRef, onFlyOutEndRef),
      FLY_OUT_FALLBACK_MS,
    );
    return () => window.clearTimeout(fallbackTimer);
  }, [isFlying, flyDirection]);

  function handleTransitionEnd(event: TransitionEvent<HTMLDivElement>): void {
    if (isFlying && event.target === event.currentTarget && event.propertyName === 'transform') {
      finishFlyOutOnce(flyEndedRef, onFlyOutEndRef);
    }
  }

  const cover = getCoverPhoto(place);
  const priceText = formatVndRange(place.priceMinVnd, place.priceMaxVnd);
  const chipCategories = categories.slice(0, MAX_CARD_CHIPS);
  const className = [
    'wtg-swipe-card',
    `wtg-swipe-card--${role}`,
    isFlying && flyDirection ? `wtg-swipe-card--fly-${flyDirection}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={cardRef}
      className={className}
      aria-hidden={isTop ? undefined : 'true'}
      onTransitionEnd={handleTransitionEnd}
    >
      {cover ? (
        <AuthedImage
          driveFileId={cover.driveFileId}
          size={1600}
          alt={isTop ? `Ảnh ${place.name}` : ''}
          className="wtg-swipe-card__photo"
        />
      ) : (
        <div className="wtg-swipe-card__fallback" aria-hidden="true">
          <IonIcon icon={resolveCategoryIcon(categories[0]?.icon ?? null)} />
        </div>
      )}
      <div className="wtg-swipe-card__shade" />
      <span ref={likeStampRef} className="wtg-swipe-stamp wtg-swipe-stamp--like" aria-hidden="true">
        Hứng thú
      </span>
      <span ref={skipStampRef} className="wtg-swipe-stamp wtg-swipe-stamp--skip" aria-hidden="true">
        Bỏ qua
      </span>
      <div className="wtg-swipe-card__info">
        {chipCategories.length > 0 && (
          <div className="wtg-swipe-card__chips">
            {chipCategories.map((category, index) => (
              <span
                key={category.id}
                className={index === 0 ? 'wtg-chip wtg-chip--accent' : 'wtg-chip'}
              >
                {category.name}
              </span>
            ))}
          </div>
        )}
        <p className="wtg-swipe-card__name">{place.name}</p>
        {priceText && (
          <p className="wtg-swipe-card__price">
            <IonIcon icon={pricetagOutline} aria-hidden="true" />
            {priceText}
          </p>
        )}
        {place.address && (
          <p className="wtg-swipe-card__address">
            <IonIcon icon={locationOutline} aria-hidden="true" />
            <span>{place.address}</span>
          </p>
        )}
      </div>
    </div>
  );
}
