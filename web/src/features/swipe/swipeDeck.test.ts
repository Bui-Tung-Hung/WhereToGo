import { describe, expect, it } from 'vitest';
import {
  applySwipe,
  createDeck,
  lastEntry,
  remainingCount,
  revertEntry,
  upcomingIds,
} from './swipeDeck';

const IDS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

describe('createDeck', () => {
  it('cùng tập id và cùng seed cho cùng thứ tự, bất kể thứ tự đầu vào', () => {
    const first = createDeck(IDS, 12345);
    const second = createDeck([...IDS].reverse(), 12345);
    expect(second.order).toEqual(first.order);
    expect([...first.order].sort()).toEqual(IDS);
  });

  it('hai seed nguyên khác nhau cho thứ tự khác nhau', () => {
    expect(createDeck(IDS, 1).order).not.toEqual(createDeck(IDS, 2).order);
  });

  it('bắt đầu ở vị trí 0, chưa có lịch sử', () => {
    const deck = createDeck(IDS, 7);
    expect(deck.position).toBe(0);
    expect(deck.history).toEqual([]);
    expect(lastEntry(deck)).toBeNull();
  });
});

describe('applySwipe', () => {
  it('đẩy vị trí qua thẻ vừa vuốt và ghi lịch sử', () => {
    const deck = createDeck(IDS, 7);
    const top = deck.order[0] as string;
    const next = applySwipe(deck, top, 'like', 'event-1');
    expect(next.position).toBe(1);
    expect(lastEntry(next)).toEqual({ placeId: top, direction: 'like', eventId: 'event-1' });
  });

  it('bỏ qua eventId trùng', () => {
    const deck = createDeck(IDS, 7);
    const once = applySwipe(deck, deck.order[0] as string, 'like', 'event-1');
    expect(applySwipe(once, deck.order[1] as string, 'skip', 'event-1')).toBe(once);
  });

  it('bỏ qua placeId không thuộc bộ thẻ', () => {
    const deck = createDeck(IDS, 7);
    expect(applySwipe(deck, 'zzz', 'like', 'event-1')).toBe(deck);
  });
});

describe('revertEntry', () => {
  it('gỡ lượt mới nhất và đưa thẻ đó lên lại trên cùng', () => {
    const deck = createDeck(IDS, 7);
    const first = deck.order[0] as string;
    const second = deck.order[1] as string;
    const swiped = applySwipe(applySwipe(deck, first, 'like', 'e1'), second, 'skip', 'e2');
    const reverted = revertEntry(swiped, 'e2');
    expect(reverted.position).toBe(1);
    expect(reverted.history).toHaveLength(1);
    expect(lastEntry(reverted)?.eventId).toBe('e1');
  });

  it('không làm gì khi eventId không phải lượt mới nhất', () => {
    const deck = createDeck(IDS, 7);
    const swiped = applySwipe(
      applySwipe(deck, deck.order[0] as string, 'like', 'e1'),
      deck.order[1] as string,
      'skip',
      'e2',
    );
    expect(revertEntry(swiped, 'e1')).toBe(swiped);
  });
});

describe('upcomingIds và remainingCount', () => {
  it('bỏ id không còn tồn tại và giới hạn số lượng', () => {
    const deck = createDeck(IDS, 7);
    const removed = deck.order[1] as string;
    const available = new Set(IDS.filter((id) => id !== removed));
    const upcoming = upcomingIds(deck, available, 3);
    expect(upcoming).toHaveLength(3);
    expect(upcoming).not.toContain(removed);
    expect(upcoming[0]).toBe(deck.order[0]);
    expect(remainingCount(deck, available)).toBe(IDS.length - 1);
  });

  it('đếm phần còn lại sau khi vuốt', () => {
    const deck = createDeck(IDS, 7);
    const swiped = applySwipe(deck, deck.order[0] as string, 'skip', 'e1');
    expect(remainingCount(swiped, new Set(IDS))).toBe(IDS.length - 1);
  });
});
